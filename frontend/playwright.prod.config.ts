import { defineConfig, devices } from '@playwright/test'

// Dedicated Playwright config for the PRODUCTION end-to-end run.
//
// It is fully separate from the local `playwright.config.ts` (which targets
// http://localhost:5173) and lives in its own test directory (./e2e-prod), so
// running it never affects the existing local smoke tests and vice versa.
//
// The production frontend base URL is provided through an environment variable
// so nothing is hard-coded for a single deployment:
//
//   E2E_BASE_URL=https://training-management-frontend-lime.vercel.app
//
// The backend URL is already baked into the deployed frontend bundle, but the
// teardown step also needs to talk to the API directly. That URL is overridable
// with E2E_API_BASE_URL and defaults to the known Render backend.
const BASE_URL =
  process.env.E2E_BASE_URL ??
  'https://training-management-frontend-lime.vercel.app'

export default defineConfig({
  testDir: './e2e-prod',
  // The Render Free backend can cold-start slowly, and this is one long
  // cross-role flow, so allow the whole test plenty of time.
  timeout: 300_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: 'test-results-prod',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-prod', open: 'never' }],
    ['json', { outputFile: 'test-results-prod/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    // Give normal UI actions and navigations room; the very first login has an
    // explicit 120s wait inside the test for the Render wake-up.
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    // Capture evidence only when something fails.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
