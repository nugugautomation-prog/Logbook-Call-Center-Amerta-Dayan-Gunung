import { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.fill('#email', 'admin@pdam.id')
  await page.fill('#password', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
}
