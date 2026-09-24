import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('4. Reporting & Backup Operations Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Journey 10: Core Process - Excel Report generation with 3-sheet format and download trigger', async ({ page }) => {
    await page.goto('/laporan')
    await expect(page.locator('h1')).toContainText('Laporan Excel')

    // 1. Verify 3-sheet format information card
    await expect(page.locator('text=Sheet 1: Kop & Ringkasan')).toBeVisible()
    await expect(page.locator('text=Sheet 2: Data Rinci')).toBeVisible()
    await expect(page.locator('text=Sheet 3: Rekap per Tujuan Penanganan')).toBeVisible()

    // 2. Select "Bulan Ini" preset
    await page.click('button:has-text("Bulan Ini")')

    // 3. Trigger download and verify .xlsx file is generated
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Unduh Laporan Excel")')
    const download = await downloadPromise

    const filename = download.suggestedFilename()
    expect(filename).toMatch(/Rekap-CallCenter-.*\.xlsx$/)
  })

  test('Core Process: Backup & Master Data Status - Trigger manual backup and verify logs', async ({ page }) => {
    await page.goto('/pengaturan/backup')
    await expect(page.locator('h1')).toContainText('Riwayat & Backup Data')

    // 1. Click Manual Backup button
    const backupBtn = page.locator('button:has-text("Backup Manual Sekarang")')
    await expect(backupBtn).toBeVisible()
    await backupBtn.click()

    // 2. Verify success notification appears
    const alert = page.locator('div[role="alert"]:not(#__next-route-announcer__)')
    await expect(alert).toBeVisible({ timeout: 10000 })
    await expect(alert).toContainText(/Backup.*berhasil/i)

    // 3. Verify Master Data status banner in Pengaturan
    await page.goto('/pengaturan')
    await expect(page.locator('h1')).toContainText('Pengaturan Master Data')
    await expect(page.locator('text=Master Data Wilayah PDAM')).toBeVisible()
  })
})
