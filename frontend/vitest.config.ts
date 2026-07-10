import { defineConfig, configDefaults } from 'vitest/config'

// Vitest runs the frontend unit tests only. Playwright end-to-end specs live in
// e2e/ and are run separately via "npm run test:e2e" (playwright test), so they
// are excluded here to avoid Vitest trying to execute Playwright's test() API.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: [
      ...configDefaults.exclude,
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
})
