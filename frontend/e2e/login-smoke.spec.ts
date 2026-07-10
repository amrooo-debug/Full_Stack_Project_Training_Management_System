import { test, expect, type Page } from '@playwright/test'

// Read-only smoke test: opens the app and checks that each of the three roles
// can log in and log out. It never creates, edits, or deletes any data.

const accounts = [
  { role: 'Admin', email: 'admin@test.com', password: '123456', heading: 'Admin Dashboard' },
  { role: 'Trainer', email: 'login.trainer@test.com', password: '123456', heading: 'Trainer Dashboard' },
  { role: 'Trainee', email: 'login.trainee@test.com', password: '123456', heading: 'Trainee Dashboard' },
]

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

test('login page opens', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
})

test('each role can log in and log out', async ({ page }) => {
  for (const account of accounts) {
    await login(page, account.email, account.password)

    // The dashboard title (an <h1>) confirms the correct role landed.
    await expect(page.getByRole('heading', { name: account.heading })).toBeVisible()

    await page.getByRole('button', { name: 'Logout' }).click()

    // Back on the login page after logout.
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  }
})
