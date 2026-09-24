import { describe, it, expect } from 'vitest'
import { ticketSchema } from '../schema'

describe('ticketSchema', () => {
  it('validates a valid ticket payload', () => {
    const valid = {
      timestamp: '2026-09-24T10:00',
      customerName: 'Ahmad Dahlan',
      channel: 'WhatsApp',
      customerPhone: '081234567890',
      jenisInteraksiId: '11111111-1111-1111-1111-111111111111',
      categoryId: '22222222-2222-2222-2222-222222222222',
      handlingTypeId: '33333333-3333-3333-3333-333333333333',
    }

    const res = ticketSchema.safeParse(valid)
    expect(res.success).toBe(true)
  })

  it('fails if customerPhone contains alphabets (BR-001)', () => {
    const invalidPhone = {
      timestamp: '2026-09-24T10:00',
      customerName: 'Ahmad Dahlan',
      channel: 'WhatsApp',
      customerPhone: '081234ABC',
      jenisInteraksiId: '11111111-1111-1111-1111-111111111111',
      categoryId: '22222222-2222-2222-2222-222222222222',
      handlingTypeId: '33333333-3333-3333-3333-333333333333',
    }

    const res = ticketSchema.safeParse(invalidPhone)
    expect(res.success).toBe(false)
  })

  it('validates ticket payload with short string IDs (demo/seed mode)', () => {
    const demoPayload = {
      timestamp: '2026-09-24T10:00',
      customerName: 'Siti Aminah',
      channel: 'Instagram',
      customerPhone: '085234567890',
      jenisInteraksiId: '1',
      categoryId: '2',
      handlingTypeId: '3',
    }

    const res = ticketSchema.safeParse(demoPayload)
    expect(res.success).toBe(true)
  })

  it('fails if required fields are missing', () => {
    const missing = {
      timestamp: '',
      customerName: '',
      channel: 'WhatsApp',
    }

    const res = ticketSchema.safeParse(missing)
    expect(res.success).toBe(false)
  })
})
