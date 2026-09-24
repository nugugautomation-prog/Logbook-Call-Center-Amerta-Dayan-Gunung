import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('3. Ticketing Lifecycle: Validation, Create, Read, Update & Locking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Journey 5: Important Validation - Rejects empty required fields and enforces numeric contact (BR-001)', async ({ page }) => {
    await page.goto('/tiket/tambah')
    await expect(page.locator('h1')).toContainText('Tambah Tiket')

    // 1. Submit empty form
    await page.click('button[type="submit"]')

    // 2. Verify validation errors for required fields
    await expect(page.locator('text=Nama pelanggan wajib diisi')).toBeVisible()
    await expect(page.locator('text=Pilih kanal komunikasi')).toBeVisible()
    await expect(page.locator('text=Jenis interaksi wajib dipilih')).toBeVisible()
    await expect(page.locator('text=Kategori wajib dipilih')).toBeVisible()
    await expect(page.locator('text=Tujuan penanganan wajib dipilih')).toBeVisible()

    // 3. Verify BR-001: Phone field only accepts digits
    const phoneInput = page.locator('#customerPhone')
    await phoneInput.fill('0812ABC890')
    const phoneValue = await phoneInput.inputValue()
    expect(phoneValue).not.toContain('ABC')
  })

  test('Journey 6 & 7: Create & Read - Autofill customer, create ticket, search, and view detail', async ({ page }) => {
    await page.goto('/tiket/tambah')

    // 1. Test 4-digit ID Pelanggan lookup (FR-017)
    await page.fill('#customer-id-input', '0101')
    await expect(page.locator('text=Wilayah dikenali').first()).toBeVisible({ timeout: 5000 })

    // 2. Fill Ticket details
    const uniqueCustomerName = `Pelanggan Test E2E ${Date.now().toString().slice(-4)}`
    await page.fill('#customerName', uniqueCustomerName)
    await page.fill('#customerPhone', '081234567899')
    await page.fill('#alamatDetail', 'Jl. Flamboyan No. 42, Dusun Tanjung')

    // Select Channel: WhatsApp
    await page.click('button:has-text("WhatsApp")')

    // Select Dropdowns
    await page.selectOption('#jenisInteraksiId', { index: 1 }) // Komplain
    await page.selectOption('#categoryId', { index: 1 }) // Tagihan Tidak Sesuai
    await page.selectOption('#handlingTypeId', { value: '2' }) // Diteruskan ke Unit Terkait (Berjalan)

    await page.fill('#detail', 'Komplain lonjakan tarif air dari Playwright automated test.')

    // 3. Submit
    await page.click('button[type="submit"]')

    // 4. Verify creation success banner or redirect to /tiket
    await expect(
      page.locator('text=Tiket Berhasil Dibuat').or(page.locator('h1:has-text("Daftar Tiket")'))
    ).toBeVisible({ timeout: 10000 })

    // 5. Navigate to /tiket if still on success splash
    if (page.url().includes('/tambah')) {
      await page.waitForURL('**/tiket', { timeout: 8000 })
    }

    // 6. Journey 7 (Read): Search for newly created ticket
    await page.fill('#ticket-search', uniqueCustomerName)
    await page.click('button:has-text("Cari")')

    // Verify card is found
    const ticketCard = page.locator(`article:has-text("${uniqueCustomerName}")`)
    await expect(ticketCard).toBeVisible()

    // 7. Click to open Ticket Detail
    const detailLink = ticketCard.locator('a[href*="/tiket/"]').first()
    await detailLink.click()
    await page.waitForURL(/\/tiket\/.+/)

    // Verify detail page content
    await expect(page.locator('h1')).toContainText(/Tiket TKT|Tiket demo|Tiket TIK/)
    await expect(page.locator(`text=${uniqueCustomerName}`)).toBeVisible()
    await expect(page.locator('text=WhatsApp')).toBeVisible()
    await expect(page.locator('text=Informasi Pelanggan')).toBeVisible()
    await expect(page.locator('text=Detail Interaksi & Penanganan')).toBeVisible()
  })

  test('Journey 8: Update & Locking - Two-step status update to Selesai and lock enforcement (BR-002)', async ({ page }) => {
    await page.goto('/tiket')

    // Find any ticket with "Tandai Selesai" button
    const initialCard = page.locator('article').filter({ has: page.locator('button:has-text("Tandai Selesai")') }).first()
    await expect(initialCard).toBeVisible()

    // Capture ticket number to bind selector across state transitions
    const ticketNumber = (await initialCard.locator('a[href*="/tiket/"]').first().textContent())?.trim() || ''
    expect(ticketNumber).not.toBe('')

    const targetCard = page.locator(`article:has(a:has-text("${ticketNumber}"))`)

    // 1. Click initial "Tandai Selesai"
    await targetCard.locator('button:has-text("Tandai Selesai")').click()

    // 2. Verify confirmation dialog appears
    await expect(targetCard.locator('text=Yakin tandai tiket ini sebagai Selesai?')).toBeVisible()
    const confirmBtn = targetCard.locator('button:has-text("Ya, Selesai")')
    await expect(confirmBtn).toBeVisible()

    // 3. Click "Ya, Selesai"
    await confirmBtn.click()

    // 4. Verify BR-002: Ticket status updates to Selesai and becomes locked
    await expect(targetCard.locator('text=Selesai (Terkunci BR-002)')).toBeVisible({ timeout: 5000 })
    await expect(targetCard.locator('button:has-text("Tandai Selesai")')).not.toBeVisible()
  })
})
