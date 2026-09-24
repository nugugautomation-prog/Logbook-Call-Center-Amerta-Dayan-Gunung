import { test, expect } from '@playwright/test'

test.describe('1. Authentication, Permission & Logout Journeys', () => {
  test('Journey 1: Permission - Redirects unauthenticated access from protected routes to login', async ({ page }) => {
    // Attempt accessing protected routes directly
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/)

    await page.goto('/tiket')
    await expect(page).toHaveURL(/.*login/)

    await page.goto('/laporan')
    await expect(page).toHaveURL(/.*login/)

    await page.goto('/pengaturan')
    await expect(page).toHaveURL(/.*login/)
  })

  test('Journey 2: Important Error Flow - Rejects invalid login credentials with clear alert', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'wrong@pdam.id')
    await page.fill('#password', 'wrongpassword')
    await page.click('button[type="submit"]')

    const errorAlert = page.locator('div[role="alert"]:not(#__next-route-announcer__)')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText(/Mode demo lokal|Email atau password salah/i)
    await expect(page).toHaveURL(/.*login/)
  })

  test('Journey 3: Authentication - Successful login redirects to dashboard and sets session', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'admin@pdam.id')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard KPI')

    // Visiting login while authenticated redirects back to dashboard
    await page.goto('/login')
    await page.waitForURL('**/dashboard')
  })

  test('Journey 11: Logout - Admin signs out from Pengaturan and session is cleared', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    await page.fill('#email', 'admin@pdam.id')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // 2. Navigate to Pengaturan
    await page.goto('/pengaturan')
    await expect(page.locator('h1')).toContainText('Pengaturan Master Data')

    // 3. Click Logout
    const logoutBtn = page.locator('#btn-sign-out')
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()

    // 4. Verify redirected to login
    await page.waitForURL('**/login')
    await expect(page.locator('#email')).toBeVisible()

    // 5. Verify cannot access protected route after logout
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/)
  })
})
