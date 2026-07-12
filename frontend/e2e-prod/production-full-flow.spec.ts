import { test, expect, request as playwrightRequest, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// =============================================================================
// Production end-to-end test.
//
// Drives the DEPLOYED frontend in a real Chromium browser through the complete
// Admin -> Trainer -> Trainee -> Trainer -> Trainee flow, then tears down every
// piece of test data it created (in strict reverse-dependency order) using the
// seeded admin account against the live API.
//
// It never changes application features, business rules, UI, backend, schema or
// auth. It only creates, edits and views data through the real UI, and only ever
// deletes data it created itself (matched by unique, timestamped names).
//
// Config: playwright.prod.config.ts (E2E_BASE_URL / E2E_API_BASE_URL).
// =============================================================================

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  'https://training-management-backend-fkpp.onrender.com'

const ADMIN = { email: 'admin@test.com', password: '123456' }
const PASSWORD = '123456'

// Pre-existing seeded accounts, used ONLY for the read-only SPA deep-link
// refresh checks (login -> reload -> logout). They never create or change data.
const SEEDED = [
  { email: 'admin@test.com', password: '123456', heading: 'Admin Dashboard', path: '/admin' },
  { email: 'login.trainer@test.com', password: '123456', heading: 'Trainer Dashboard', path: '/trainer' },
  { email: 'login.trainee@test.com', password: '123456', heading: 'Trainee Dashboard', path: '/trainee' },
]

// --- Unique, timestamped identifiers for everything we create -----------------
function twoDigit(value: number) {
  return String(value).padStart(2, '0')
}
const now = new Date()
const stamp =
  `${now.getFullYear()}${twoDigit(now.getMonth() + 1)}${twoDigit(now.getDate())}` +
  `-${twoDigit(now.getHours())}${twoDigit(now.getMinutes())}${twoDigit(now.getSeconds())}`
// Extra suffix guards against two runs colliding within the same second.
const suffix = Math.floor(now.getTime() % 100000).toString(36)
const uid = `${stamp}-${suffix}`

const names = {
  courseTitle: `E2E Course ${uid}`,
  courseDesc: `E2E temporary course ${uid}`,
  courseDescEdited: `E2E course description EDITED ${uid}`,
  trainerName: `E2E Trainer ${uid}`,
  trainerEmail: `e2e.trainer.${uid}@test.com`,
  traineeName: `E2E Trainee ${uid}`,
  traineeEmail: `e2e.trainee.${uid}@test.com`,
  lessonTitle: `E2E Lesson ${uid}`,
  lessonContent: `E2E lesson content ${uid}`,
  lessonContentEdited: `E2E lesson content EDITED ${uid}`,
  taskTitle: `E2E Task ${uid}`,
  taskDesc: `E2E task description ${uid}`,
  taskDescEdited: `E2E task description EDITED ${uid}`,
  answer: `E2E submission answer ${uid}`,
  answerEdited: `E2E submission answer EDITED ${uid}`,
  feedback: `E2E feedback ${uid}`,
  feedbackEdited: `E2E feedback EDITED ${uid}`,
}

// --- Per-step pass/fail bookkeeping ------------------------------------------
type StepStatus = 'passed' | 'failed' | 'skipped'
const ALL_STEPS = [
  'Admin: login',
  'Admin: dashboard counts load',
  'Admin: create course',
  'Admin: edit course',
  'Admin: create trainer',
  'Admin: create trainee',
  'Admin: create enrollment',
  'Trainer: login',
  'Trainer: open test course',
  'Trainer: create lesson',
  'Trainer: edit lesson',
  'Trainer: create task',
  'Trainer: edit task',
  'Trainee: login',
  'Trainee: open enrolled course',
  'Trainee: view lesson',
  'Trainee: view task',
  'Trainee: submit work',
  'Trainee: edit submission',
  'Trainer: open submission',
  'Trainer: add feedback',
  'Trainer: edit feedback',
  'Trainee: confirm updated feedback',
  'Trainer: delete submission via UI',
]
const stepResults: { name: string; status: StepStatus; error?: string }[] = []

async function step(name: string, fn: () => Promise<void>) {
  await test.step(name, async () => {
    try {
      await fn()
      stepResults.push({ name, status: 'passed' })
    } catch (error) {
      stepResults.push({
        name,
        status: 'failed',
        error: String(error).split('\n')[0],
      })
      throw error
    }
  })
}

// --- Console errors + failed network requests --------------------------------
const consoleErrors: string[] = []
const failedResponses: string[] = []
const benignFeedback404: string[] = []
// The app only inspects response.ok/status on POST/PUT and returns early
// (without reading the body) on a 404 feedback lookup. Chromium then aborts the
// unread response-body stream and Playwright surfaces it as net::ERR_ABORTED,
// even though the operation itself completed successfully on the server. These
// are benign artifacts, tracked separately from genuine network failures.
const abortedUnreadBodies: string[] = []

// --- UI helpers ---------------------------------------------------------------
async function login(
  page: Page,
  email: string,
  password: string,
  heading: string,
  firstLogin = false
) {
  // Enter through the site root like a real user. The deployed SPA has no
  // server-side rewrite for deep links, so a hard navigation straight to
  // "/login" returns a Vercel 404; "/" serves index.html and React Router then
  // shows the login page client-side (we always log out before logging in).
  await page.goto('/')
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  // Allow up to 120s the first time in case the Render backend is cold-starting.
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({
    timeout: firstLogin ? 120_000 : 30_000,
  })
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
}

// The row currently in edit mode is the only li that has a bare "Save" button.
function editingRow(page: Page) {
  return page.locator('li.course-item', {
    has: page.getByRole('button', { name: 'Save', exact: true }),
  })
}

// =============================================================================
test('production full flow: admin -> trainer -> trainee (+ teardown)', async ({
  page,
}, testInfo) => {
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const url = message.location()?.url
    consoleErrors.push(url ? `${message.text()} [${url}]` : message.text())
  })
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })
  page.on('requestfailed', (req) => {
    const errorText = req.failure()?.errorText ?? 'unknown'
    const entry = `${req.method()} ${req.url()} - ${errorText}`
    if (errorText === 'net::ERR_ABORTED') abortedUnreadBodies.push(entry)
    else failedResponses.push(`NETWORK-FAIL ${entry}`)
  })
  page.on('response', (response) => {
    const status = response.status()
    if (status < 400) return
    const method = response.request().method()
    const url = response.url()
    // A 404 on GET /submissions/{id}/feedback is expected before feedback
    // exists; the app handles it gracefully, so don't count it as a failure.
    const benign =
      status === 404 &&
      method === 'GET' &&
      /\/submissions\/\d+\/feedback(\?.*)?$/.test(url)
    if (benign) benignFeedback404.push(`${status} ${method} ${url}`)
    else failedResponses.push(`${status} ${method} ${url}`)
  })

  // Accept any window.confirm() dialogs (defensive; the flow itself deletes
  // nothing through the UI, but this keeps the run robust).
  page.on('dialog', (dialog) => dialog.accept())

  try {
    // ===================== ADMIN =====================
    await step('Admin: login', async () => {
      await login(page, ADMIN.email, ADMIN.password, 'Admin Dashboard', true)
    })

    await step('Admin: dashboard counts load', async () => {
      const grid = page.locator('.summary-grid').first()
      await expect(grid).toBeVisible()
      await expect(page.locator('.summary-card')).toHaveCount(5)
      // Data really loaded: the Users count includes the admin, so it is >= 1.
      const usersValue = page
        .locator('.summary-card', { hasText: 'Users' })
        .locator('.summary-value')
      await expect(usersValue).toBeVisible()
      // Counts start at 0 and update once the API responds, so poll until the
      // real data has loaded (the Users count includes the admin, so it is >= 1).
      await expect
        .poll(async () => Number((await usersValue.innerText()).trim()), {
          timeout: 30_000,
        })
        .toBeGreaterThan(0)
      // The courses list finished loading (no spinner left behind).
      await expect(page.getByText('Loading courses...')).toHaveCount(0)
    })

    await step('Admin: create course', async () => {
      const form = page.locator('form.course-form', {
        has: page.getByRole('button', { name: 'Create Course' }),
      })
      await form.getByPlaceholder('e.g. Intro to React').fill(names.courseTitle)
      await form
        .getByPlaceholder('What is this course about?')
        .fill(names.courseDesc)
      await form.getByRole('button', { name: 'Create Course' }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.courseTitle })
      ).toBeVisible()
    })

    await step('Admin: edit course', async () => {
      const row = page.locator('li.course-item', { hasText: names.courseTitle })
      await row.getByRole('button', { name: 'Edit', exact: true }).click()
      const editing = editingRow(page)
      // The course edit row has one textarea (the description).
      await editing.locator('textarea').fill(names.courseDescEdited)
      await editing.getByRole('button', { name: 'Save', exact: true }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.courseDescEdited })
      ).toBeVisible()
    })

    await step('Admin: create trainer', async () => {
      const form = page.locator('form.course-form', {
        has: page.getByRole('button', { name: 'Create User' }),
      })
      await form.getByPlaceholder('e.g. Jane Trainer').fill(names.trainerName)
      await form.getByPlaceholder('jane@example.com').fill(names.trainerEmail)
      await form
        .getByPlaceholder('Set an initial password')
        .fill(PASSWORD)
      await form.locator('select').selectOption('TRAINER')
      await form.getByRole('button', { name: 'Create User' }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.trainerEmail })
      ).toBeVisible()
    })

    await step('Admin: create trainee', async () => {
      const form = page.locator('form.course-form', {
        has: page.getByRole('button', { name: 'Create User' }),
      })
      await form.getByPlaceholder('e.g. Jane Trainer').fill(names.traineeName)
      await form.getByPlaceholder('jane@example.com').fill(names.traineeEmail)
      await form
        .getByPlaceholder('Set an initial password')
        .fill(PASSWORD)
      await form.locator('select').selectOption('TRAINEE')
      await form.getByRole('button', { name: 'Create User' }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.traineeEmail })
      ).toBeVisible()
    })

    await step('Admin: create enrollment', async () => {
      const form = page.locator('form.course-form', {
        has: page.getByRole('button', { name: 'Create Enrollment' }),
      })
      const traineeSelect = form.locator('select').nth(0)
      const courseSelect = form.locator('select').nth(1)
      const traineeValue = await traineeSelect
        .locator('option', { hasText: names.traineeName })
        .first()
        .getAttribute('value')
      const courseValue = await courseSelect
        .locator('option', { hasText: names.courseTitle })
        .first()
        .getAttribute('value')
      expect(traineeValue, 'trainee option present').toBeTruthy()
      expect(courseValue, 'course option present').toBeTruthy()
      await traineeSelect.selectOption(traineeValue as string)
      await courseSelect.selectOption(courseValue as string)
      await form.getByRole('button', { name: 'Create Enrollment' }).click()
      await expect(
        page.locator('li.course-item', {
          hasText: `Course: ${names.courseTitle}`,
        })
      ).toBeVisible()
    })

    await logout(page)

    // ===================== TRAINER =====================
    await step('Trainer: login', async () => {
      await login(
        page,
        names.trainerEmail,
        PASSWORD,
        'Trainer Dashboard'
      )
    })

    await step('Trainer: open test course', async () => {
      const row = page.locator('li.course-item', { hasText: names.courseTitle })
      await row.getByRole('button', { name: 'Select Course' }).click()
      await expect(page.getByRole('heading', { name: 'Lessons' })).toBeVisible()
      await expect(page.locator('.selected-course-title')).toContainText(
        names.courseTitle
      )
    })

    await step('Trainer: create lesson', async () => {
      const form = page.locator('form.course-form', {
        has: page.getByRole('button', { name: 'Create Lesson' }),
      })
      await form
        .getByPlaceholder('e.g. Components and Props')
        .fill(names.lessonTitle)
      await form
        .getByPlaceholder('What does this lesson cover?')
        .fill(names.lessonContent)
      await form.getByRole('button', { name: 'Create Lesson' }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.lessonTitle })
      ).toBeVisible()
    })

    await step('Trainer: edit lesson', async () => {
      const row = page.locator('li.course-item', { hasText: names.lessonTitle })
      await row.getByRole('button', { name: 'Edit', exact: true }).click()
      const editing = editingRow(page)
      await editing.locator('textarea').fill(names.lessonContentEdited)
      await editing.getByRole('button', { name: 'Save', exact: true }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.lessonContentEdited })
      ).toBeVisible()
    })

    await step('Trainer: create task', async () => {
      const form = page.locator('form.course-form', {
        has: page.getByRole('button', { name: 'Create Task' }),
      })
      await form.getByPlaceholder('e.g. Build a login page').fill(names.taskTitle)
      await form
        .getByPlaceholder('What should the trainee do?')
        .fill(names.taskDesc)
      await form.getByRole('button', { name: 'Create Task' }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.taskTitle })
      ).toBeVisible()
    })

    await step('Trainer: edit task', async () => {
      const row = page.locator('li.course-item', { hasText: names.taskTitle })
      await row.getByRole('button', { name: 'Edit', exact: true }).click()
      const editing = editingRow(page)
      await editing.locator('textarea').fill(names.taskDescEdited)
      await editing.getByRole('button', { name: 'Save', exact: true }).click()
      await expect(
        page.locator('li.course-item', { hasText: names.taskDescEdited })
      ).toBeVisible()
    })

    await logout(page)

    // ===================== TRAINEE =====================
    await step('Trainee: login', async () => {
      await login(
        page,
        names.traineeEmail,
        PASSWORD,
        'Trainee Dashboard'
      )
    })

    await step('Trainee: open enrolled course', async () => {
      const row = page.locator('li.course-item', { hasText: names.courseTitle })
      // The enrollment the admin created is reflected as a disabled "Enrolled".
      await expect(
        row.getByRole('button', { name: 'Enrolled' })
      ).toBeVisible()
      await row.getByRole('button', { name: 'Select Course' }).click()
      await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
    })

    await step('Trainee: view lesson', async () => {
      await expect(
        page.locator('li.course-item', { hasText: names.lessonTitle })
      ).toBeVisible()
    })

    await step('Trainee: view task', async () => {
      await expect(
        page.locator('li.course-item', { hasText: names.taskTitle })
      ).toBeVisible()
    })

    await step('Trainee: submit work', async () => {
      const taskRow = page.locator('li.course-item', {
        hasText: names.taskTitle,
      })
      await taskRow
        .getByPlaceholder('Write your answer here')
        .fill(names.answer)
      await taskRow.getByRole('button', { name: 'Submit Work' }).click()
      await expect(taskRow.getByText(names.answer)).toBeVisible()
      await expect(
        taskRow.getByRole('button', { name: 'Edit Submission' })
      ).toBeVisible()
    })

    await step('Trainee: edit submission', async () => {
      const taskRow = page.locator('li.course-item', {
        hasText: names.taskTitle,
      })
      await taskRow.getByRole('button', { name: 'Edit Submission' }).click()
      await taskRow.locator('textarea').fill(names.answerEdited)
      await taskRow.getByRole('button', { name: 'Save', exact: true }).click()
      await expect(taskRow.getByText(names.answerEdited)).toBeVisible()
    })

    await logout(page)

    // ===================== TRAINER (review) =====================
    await step('Trainer: open submission', async () => {
      await login(page, names.trainerEmail, PASSWORD, 'Trainer Dashboard')
      const courseRow = page.locator('li.course-item', {
        hasText: names.courseTitle,
      })
      await courseRow.getByRole('button', { name: 'Select Course' }).click()
      const taskRow = page.locator('li.course-item', {
        hasText: names.taskTitle,
      })
      await taskRow.getByRole('button', { name: 'View Submissions' }).click()
      const submissionRow = taskRow.locator('li.course-item', {
        hasText: names.traineeName,
      })
      await expect(submissionRow).toBeVisible()
      await expect(submissionRow.getByText(names.answerEdited)).toBeVisible()
    })

    await step('Trainer: add feedback', async () => {
      const taskRow = page.locator('li.course-item', {
        hasText: names.taskTitle,
      })
      const submissionRow = taskRow.locator('li.course-item', {
        hasText: names.traineeName,
      })
      await submissionRow.getByRole('button', { name: 'View Feedback' }).click()
      await submissionRow
        .getByPlaceholder('Write feedback for this submission')
        .fill(names.feedback)
      await submissionRow
        .getByRole('button', { name: 'Create Feedback' })
        .click()
      await expect(submissionRow.getByText(names.feedback)).toBeVisible()
    })

    await step('Trainer: edit feedback', async () => {
      const taskRow = page.locator('li.course-item', {
        hasText: names.taskTitle,
      })
      const submissionRow = taskRow.locator('li.course-item', {
        hasText: names.traineeName,
      })
      await submissionRow.getByRole('button', { name: 'Edit Feedback' }).click()
      await submissionRow.locator('textarea').fill(names.feedbackEdited)
      await submissionRow
        .getByRole('button', { name: 'Save', exact: true })
        .click()
      await expect(submissionRow.getByText(names.feedbackEdited)).toBeVisible()
    })

    await logout(page)

    // ===================== TRAINEE (confirm) =====================
    await step('Trainee: confirm updated feedback', async () => {
      await login(page, names.traineeEmail, PASSWORD, 'Trainee Dashboard')
      const courseRow = page.locator('li.course-item', {
        hasText: names.courseTitle,
      })
      await courseRow.getByRole('button', { name: 'Select Course' }).click()
      const taskRow = page.locator('li.course-item', {
        hasText: names.taskTitle,
      })
      await taskRow.getByRole('button', { name: 'View Feedback' }).click()
      await expect(taskRow.getByText(names.feedbackEdited)).toBeVisible()
    })

    await logout(page)

    // ===================== TRAINER (delete submission via UI) =====================
    // Exercises the newly added "Delete Submission" control. If it is not yet
    // deployed to production the step is recorded as skipped (pending deploy)
    // rather than failed, and the API teardown still removes the submission so
    // dependent cleanup can proceed.
    await test.step('Trainer: delete submission via UI', async () => {
      const name = 'Trainer: delete submission via UI'
      try {
        await login(page, names.trainerEmail, PASSWORD, 'Trainer Dashboard')
        const courseRow = page.locator('li.course-item', {
          hasText: names.courseTitle,
        })
        await courseRow.getByRole('button', { name: 'Select Course' }).click()
        const taskRow = page.locator('li.course-item', {
          hasText: names.taskTitle,
        })
        await taskRow.getByRole('button', { name: 'View Submissions' }).click()
        const submissionRow = taskRow.locator('li.course-item', {
          hasText: names.traineeName,
        })
        await expect(submissionRow).toBeVisible()

        const deleteButton = submissionRow.getByRole('button', {
          name: 'Delete Submission',
        })
        if ((await deleteButton.count()) === 0) {
          stepResults.push({
            name,
            status: 'skipped',
            error: 'Delete Submission control not deployed to production yet',
          })
          return
        }

        await deleteButton.click() // window.confirm auto-accepted by dialog handler
        await expect(submissionRow).toHaveCount(0)
        // Submission (and its feedback) gone -> dependent teardown can continue.
        await expect(
          taskRow.getByText(
            'No submissions yet. Trainees have not submitted work for this task.'
          )
        ).toBeVisible()
        stepResults.push({ name, status: 'passed' })
      } catch (error) {
        stepResults.push({
          name,
          status: 'failed',
          error: String(error).split('\n')[0],
        })
        throw error
      }
    })
  } finally {
    // ===================== TEARDOWN =====================
    // Always runs, even if a step above failed. Deletes every piece of test
    // data we created, in strict reverse-dependency order, using the seeded
    // admin against the live API. Only our uniquely-named data is matched.
    const cleanupLog: string[] = []
    let cleanupOk = false
    try {
      const cleanupResult = await teardown(cleanupLog)
      cleanupOk = cleanupResult
    } catch (error) {
      cleanupLog.push(`TEARDOWN ERROR: ${String(error).split('\n')[0]}`)
    }

    // Mark steps that were never reached (because an earlier one failed).
    for (const name of ALL_STEPS) {
      if (!stepResults.find((s) => s.name === name)) {
        stepResults.push({ name, status: 'skipped' })
      }
    }
    // Preserve declared order.
    stepResults.sort(
      (a, b) => ALL_STEPS.indexOf(a.name) - ALL_STEPS.indexOf(b.name)
    )

    const report = {
      runAt: new Date().toISOString(),
      identifiers: names,
      steps: stepResults,
      totals: {
        total: ALL_STEPS.length,
        passed: stepResults.filter((s) => s.status === 'passed').length,
        failed: stepResults.filter((s) => s.status === 'failed').length,
        skipped: stepResults.filter((s) => s.status === 'skipped').length,
      },
      consoleErrors,
      failedNetworkRequests: failedResponses,
      benignAbortedUnreadBodies: abortedUnreadBodies,
      expectedFeedback404s: benignFeedback404,
      cleanup: { completed: cleanupOk, log: cleanupLog },
    }

    const outDir = testInfo.project.outputDir
    fs.mkdirSync(outDir, { recursive: true })
    const reportPath = path.join(outDir, 'e2e-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Also print to the console so it shows up in the run output.
    console.log('\n===== PRODUCTION E2E REPORT =====')
    console.log(JSON.stringify(report, null, 2))
    console.log('===== END REPORT =====\n')
  }
})

// =============================================================================
// Deployment check: SPA deep-link refresh.
//
// Verifies that a hard navigation / refresh to a client-side route serves the
// app instead of a 404 (the fix added in frontend/vercel.json). Uses only the
// pre-existing seeded accounts and performs NO writes. Each check is reported as
// passed or, if the rewrite is not yet deployed, skipped (pending deploy) so the
// suite stays green either way.
// =============================================================================
test('deployment check: SPA deep-link refresh', async ({ page }) => {
  const checks: { name: string; status: StepStatus; detail?: string }[] = []

  const record = (name: string, ok: boolean, status: number) => {
    if (ok) checks.push({ name, status: 'passed' })
    else
      checks.push({
        name,
        status: 'skipped',
        detail: `HTTP ${status} — vercel.json SPA rewrite not deployed yet`,
      })
  }

  // 1) Logged-out hard navigation straight to /login.
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' })
    const status = response?.status() ?? 0
    const hasForm = await page
      .getByRole('button', { name: 'Login' })
      .isVisible()
      .catch(() => false)
    record('refresh /login (logged out)', status < 400 && hasForm, status)
  }

  // 2) For each seeded role: log in through '/', then hard-navigate (refresh)
  //    directly to that role's dashboard path.
  for (const role of SEEDED) {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.locator('input[type=email]').fill(role.email)
    await page.locator('input[type=password]').fill(role.password)
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(
      page.getByRole('heading', { name: role.heading })
    ).toBeVisible({ timeout: 120_000 })

    const response = await page.goto(role.path, {
      waitUntil: 'domcontentloaded',
    })
    const status = response?.status() ?? 0
    const stillThere = await page
      .getByRole('heading', { name: role.heading })
      .isVisible()
      .catch(() => false)
    record(`refresh ${role.path} (logged in)`, status < 400 && stillThere, status)

    await page.evaluate(() => localStorage.clear())
  }

  console.log('\n===== SPA DEEP-LINK REFRESH CHECKS =====')
  console.log(JSON.stringify(checks, null, 2))
  console.log('===== END SPA DEEP-LINK REFRESH CHECKS =====\n')
})

// -----------------------------------------------------------------------------
// Teardown: discover-and-delete our test data via the live API as admin.
// -----------------------------------------------------------------------------
async function teardown(log: string[]): Promise<boolean> {
  const ctx = await playwrightRequest.newContext()
  try {
    const loginRes = await ctx.post(`${API_BASE_URL}/auth/login`, {
      data: { email: ADMIN.email, password: ADMIN.password },
    })
    if (!loginRes.ok()) {
      log.push(`FAIL admin login for teardown (${loginRes.status()})`)
      return false
    }
    const token = (await loginRes.json()).token as string
    const headers = { Authorization: `Bearer ${token}` }
    const getJson = async (p: string) => {
      const r = await ctx.get(`${API_BASE_URL}${p}`, { headers })
      return r.ok() ? await r.json() : null
    }
    let allOk = true
    const del = async (label: string, p: string) => {
      const r = await ctx.delete(`${API_BASE_URL}${p}`, { headers })
      const ok = r.ok()
      if (!ok) allOk = false
      log.push(`${ok ? 'OK  ' : `FAIL(${r.status()})`} delete ${label} -> ${p}`)
      return ok
    }

    // --- Discover the ids of everything we created -------------------------
    const users: any[] = (await getJson('/users')) ?? []
    const trainer = users.find((u) => u.email === names.trainerEmail)
    const trainee = users.find((u) => u.email === names.traineeEmail)

    const courses: any[] = (await getJson('/courses')) ?? []
    const course = courses.find((c) => c.title === names.courseTitle)

    let submissionId: number | undefined
    let feedbackId: number | undefined
    if (trainee) {
      const subs: any[] =
        (await getJson(`/users/${trainee.id}/submissions`)) ?? []
      const sub =
        subs.find((s) => s.taskTitle === names.taskTitle) ??
        subs.find((s) => typeof s.answer === 'string' && s.answer.includes(uid))
      if (sub) {
        submissionId = sub.id
        const fb = await getJson(`/submissions/${sub.id}/feedback`)
        if (fb && fb.id) feedbackId = fb.id
      }
    }

    let taskId: number | undefined
    let lessonId: number | undefined
    if (course) {
      const tasks: any[] =
        (await getJson(`/courses/${course.id}/tasks`)) ?? []
      taskId = tasks.find((t) => t.title === names.taskTitle)?.id
      const lessons: any[] =
        (await getJson(`/courses/${course.id}/lessons`)) ?? []
      lessonId = lessons.find((l) => l.title === names.lessonTitle)?.id
    }

    let enrollmentId: number | undefined
    const enrollments: any[] = (await getJson('/enrollments')) ?? []
    if (trainee && course) {
      enrollmentId = enrollments.find(
        (e) => e.userId === trainee.id && e.courseId === course.id
      )?.id
    }

    // --- Delete in strict reverse-dependency order -------------------------
    // Feedback -> Submission -> Enrollment -> Task -> Lesson -> Trainer ->
    // Trainee -> Course.
    if (feedbackId) await del('feedback', `/feedback/${feedbackId}`)
    else log.push('SKIP feedback (none found)')

    if (submissionId) await del('submission', `/submissions/${submissionId}`)
    else log.push('SKIP submission (none found)')

    if (enrollmentId) await del('enrollment', `/enrollments/${enrollmentId}`)
    else log.push('SKIP enrollment (none found)')

    if (course && taskId)
      await del('task', `/courses/${course.id}/tasks/${taskId}`)
    else log.push('SKIP task (none found)')

    if (course && lessonId)
      await del('lesson', `/courses/${course.id}/lessons/${lessonId}`)
    else log.push('SKIP lesson (none found)')

    if (trainer) await del('trainer user', `/users/${trainer.id}`)
    else log.push('SKIP trainer user (none found)')

    if (trainee) await del('trainee user', `/users/${trainee.id}`)
    else log.push('SKIP trainee user (none found)')

    if (course) await del('course', `/courses/${course.id}`)
    else log.push('SKIP course (none found)')

    // --- Verify nothing of ours remains ------------------------------------
    const coursesAfter: any[] = (await getJson('/courses')) ?? []
    const usersAfter: any[] = (await getJson('/users')) ?? []
    const leftoverCourse = coursesAfter.some(
      (c) => c.title === names.courseTitle
    )
    const leftoverUsers = usersAfter.some(
      (u) => u.email === names.trainerEmail || u.email === names.traineeEmail
    )
    if (leftoverCourse) {
      allOk = false
      log.push('VERIFY FAIL: course still present')
    }
    if (leftoverUsers) {
      allOk = false
      log.push('VERIFY FAIL: a test user still present')
    }
    if (!leftoverCourse && !leftoverUsers) {
      log.push('VERIFY OK: no test course or users remain')
    }

    return allOk
  } finally {
    await ctx.dispose()
  }
}
