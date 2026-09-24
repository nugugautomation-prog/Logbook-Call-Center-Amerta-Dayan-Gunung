import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('2. Navigation & Dashboard Analytics Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Journey 4: Navigation - Bottom navigation seamlessly switches between core modules', async ({ page }) => {
    // 1. Initially on Dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard KPI')

    // 2. Navigate to Tiket
    await page.click('nav[aria-label="Navigasi utama"] a[href="/tiket"]')
    await page.waitForURL('**/tiket')
    await expect(page.locator('h1')).toContainText('Daftar Tiket')

    // 3. Navigate to Laporan
    await page.click('nav[aria-label="Navigasi utama"] a[href="/laporan"]')
    await page.waitForURL('**/laporan')
    await expect(page.locator('h1')).toContainText('Laporan Excel')

    // 4. Navigate to Pengaturan
    await page.click('nav[aria-label="Navigasi utama"] a[href="/pengaturan"]')
    await page.waitForURL('**/pengaturan')
    await expect(page.locator('h1')).toContainText('Pengaturan Master Data')

    // 5. Navigate back to Dashboard
    await page.click('nav[aria-label="Navigasi utama"] a[href="/dashboard"]')
    await page.waitForURL('**/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard KPI')
  })

  test('Journey 9: Core Process - Dashboard KPI widgets render with period filters and drill-down links', async ({ page }) => {
    await page.goto('/dashboard')

    // 1. Verify period filter buttons exist
    const periodButtons = page.locator('button:has-text("Hari Ini"), button:has-text("Minggu Ini"), button:has-text("Bulan Ini")')
    await expect(periodButtons.first()).toBeVisible()

    // 2. Click "Hari Ini" and verify filter changes
    await page.click('button:has-text("Hari Ini")')
    await expect(page.locator('section[aria-label="Ringkasan KPI"]')).toBeVisible()

    // 3. Click "Bulan Ini"
    await page.click('button:has-text("Bulan Ini")')
    await expect(page.locator('section[aria-label="Ringkasan KPI"]')).toBeVisible()

    // 4. Verify drilldown clickable links
    const totalTiketCard = page.locator('a[href="/tiket"]').first()
    await expect(totalTiketCard).toBeVisible()

    // Click Top Kategori drilldown if available
    const topKatLink = page.locator('section[aria-label="Top Kategori Aduan"] a[href*="/tiket?kategori="]').first()
    if (await topKatLink.isVisible()) {
      await topKatLink.click()
      await page.waitForURL(/.*tiket\?kategori=.*/)
      await expect(page.locator('h1')).toContainText('Daftar Tiket')
    }
  })
})
