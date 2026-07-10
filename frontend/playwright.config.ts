import { defineConfig, devices } from '@playwright/test'

// Small E2E smoke test config. It uses the already-running dev server at
// http://localhost:5173 and does not start or manage any server itself.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    // Only capture a screenshot if a test fails; no tracing/video.
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
