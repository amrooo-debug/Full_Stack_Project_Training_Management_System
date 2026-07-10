import { test, expect, type Page } from '@playwright/test'

// Fuller E2E flows that create data with unique "E2E" names and always clean
// it up (try/finally), so no test data is left in the app. Only items whose
// name/title/email starts with "E2E" are ever deleted.

async function login(page: Page, email: string, password: string, heading: string) {
  await page.goto('/login')
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
}

// Delete a course/user/lesson/task list item identified by unique text.
// Guarded so cleanup is safe even if the item was never created.
async function deleteItemIfPresent(page: Page, text: string) {
  const item = page.locator('li.course-item', { hasText: text })
  if ((await item.count()) > 0) {
    await item.first().getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.locator('li.course-item', { hasText: text })).toHaveCount(0)
  }
}

async function deleteEnrollmentIfPresent(page: Page, courseTitle: string) {
  const item = page.locator('li.course-item', { hasText: `Course: ${courseTitle}` })
  if ((await item.count()) > 0) {
    await item.first().getByRole('button', { name: 'Delete Enrollment' }).click()
    await expect(item).toHaveCount(0)
  }
}

test('admin flow: create then clean up course, trainee user, and enrollment', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept()) // accept window.confirm on delete

  const ts = Date.now()
  const courseTitle = `E2E Course ${ts}`
  const userName = `E2E User ${ts}`
  const userEmail = `e2e.user.${ts}@test.com`

  await login(page, 'admin@test.com', '123456', 'Admin Dashboard')

  try {
    // Create course
    const courseForm = page.locator('form.course-form', {
      has: page.getByRole('button', { name: 'Create Course' }),
    })
    await courseForm.getByPlaceholder('e.g. Intro to React').fill(courseTitle)
    await courseForm.getByPlaceholder('What is this course about?').fill('E2E temporary course')
    await courseForm.getByRole('button', { name: 'Create Course' }).click()
    await expect(page.locator('li.course-item', { hasText: courseTitle })).toBeVisible({ timeout: 15_000 })

    // Create trainee user
    const userForm = page.locator('form.course-form', {
      has: page.getByRole('button', { name: 'Create User' }),
    })
    await userForm.getByPlaceholder('e.g. Jane Trainer').fill(userName)
    await userForm.getByPlaceholder('jane@example.com').fill(userEmail)
    await userForm.getByPlaceholder('Set an initial password').fill('123456')
    await userForm.locator('select').selectOption('TRAINEE')
    await userForm.getByRole('button', { name: 'Create User' }).click()
    await expect(page.locator('li.course-item', { hasText: userEmail })).toBeVisible({ timeout: 15_000 })

    // Create enrollment linking the new trainee to the new course
    const enrollForm = page.locator('form.course-form', {
      has: page.getByRole('button', { name: 'Create Enrollment' }),
    })
    const traineeSelect = enrollForm.locator('select').nth(0)
    const courseSelect = enrollForm.locator('select').nth(1)
    const traineeValue = await traineeSelect.locator('option', { hasText: userName }).first().getAttribute('value')
    const courseValue = await courseSelect.locator('option', { hasText: courseTitle }).first().getAttribute('value')
    expect(traineeValue).toBeTruthy()
    expect(courseValue).toBeTruthy()
    await traineeSelect.selectOption(traineeValue as string)
    await courseSelect.selectOption(courseValue as string)
    await enrollForm.getByRole('button', { name: 'Create Enrollment' }).click()
    await expect(page.getByText(`Course: ${courseTitle}`)).toBeVisible({ timeout: 15_000 })
  } finally {
    // Reverse-order cleanup: enrollment -> user -> course
    await deleteEnrollmentIfPresent(page, courseTitle)
    await deleteItemIfPresent(page, userEmail)
    await deleteItemIfPresent(page, courseTitle)
  }

  // Confirm nothing E2E is left behind
  await expect(page.getByText(userEmail)).toHaveCount(0)
  await expect(page.locator('li.course-item', { hasText: courseTitle })).toHaveCount(0)
})

test('trainer flow: create then clean up a lesson and a task', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())

  const ts = Date.now()
  const lessonTitle = `E2E Lesson ${ts}`
  const taskTitle = `E2E Task ${ts}`

  await login(page, 'login.trainer@test.com', '123456', 'Trainer Dashboard')

  // Select the first existing course (read-only selection)
  await page.getByRole('button', { name: 'Select Course' }).first().click()
  await expect(page.getByRole('heading', { name: 'Lessons' })).toBeVisible()

  try {
    // Create lesson
    const lessonForm = page.locator('form.course-form', {
      has: page.getByRole('button', { name: 'Create Lesson' }),
    })
    await lessonForm.getByPlaceholder('e.g. Components and Props').fill(lessonTitle)
    await lessonForm.getByPlaceholder('What does this lesson cover?').fill('E2E temporary lesson')
    await lessonForm.getByRole('button', { name: 'Create Lesson' }).click()
    await expect(page.locator('li.course-item', { hasText: lessonTitle })).toBeVisible({ timeout: 15_000 })

    // Create task
    const taskForm = page.locator('form.course-form', {
      has: page.getByRole('button', { name: 'Create Task' }),
    })
    await taskForm.getByPlaceholder('e.g. Build a login page').fill(taskTitle)
    await taskForm.getByPlaceholder('What should the trainee do?').fill('E2E temporary task')
    await taskForm.getByRole('button', { name: 'Create Task' }).click()
    await expect(page.locator('li.course-item', { hasText: taskTitle })).toBeVisible({ timeout: 15_000 })
  } finally {
    // Reverse-order cleanup: task -> lesson (they are independent)
    await deleteItemIfPresent(page, taskTitle)
    await deleteItemIfPresent(page, lessonTitle)
  }

  await expect(page.locator('li.course-item', { hasText: taskTitle })).toHaveCount(0)
  await expect(page.locator('li.course-item', { hasText: lessonTitle })).toHaveCount(0)
})

test('trainee flow: open a course (read-only, no submission writes)', async ({ page }) => {
  // NOTE: submission write tests are intentionally skipped. The Trainee (and
  // Trainer) dashboards expose no "delete submission" control, so a submission
  // created here could not be cleaned up through the UI, and editing an existing
  // submission would change real data. So this flow stays strictly read-only.
  await login(page, 'login.trainee@test.com', '123456', 'Trainee Dashboard')

  await page.getByRole('button', { name: 'Select Course' }).first().click()

  // Selecting a course loads its lessons and tasks (read-only).
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
})
