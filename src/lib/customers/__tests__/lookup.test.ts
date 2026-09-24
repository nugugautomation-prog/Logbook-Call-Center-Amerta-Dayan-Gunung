import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupCustomer } from '../lookup'

const mockMaybeSingle = vi.fn()

const createQueryBuilder = () => {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: mockMaybeSingle,
  }
  return builder
}

const mockSupabase = {
  from: vi.fn(() => createQueryBuilder()),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

describe('lookupCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns not_found for less than 4 digits', async () => {
    const result = await lookupCustomer('12')
    expect(result.type).toBe('not_found')
  })

  it('returns not_found when district not found', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null })
    const result = await lookupCustomer('0102')
    expect(result.type).toBe('not_found')
  })

  it('returns partial match for 4-digit input with valid district and village', async () => {
    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: 'dist-1', nama_kecamatan: 'Tanjung' } })
      .mockResolvedValueOnce({ data: { id: 'vil-1', nama_desa: 'Sokong' } })

    const result = await lookupCustomer('0102')
    expect(result.type).toBe('partial')
    expect(result.kecamatan?.nama).toBe('Tanjung')
    expect(result.desa?.nama).toBe('Sokong')
    expect(result.customer).toBeUndefined()
  })

  it('returns full match for 9-digit input matching customer_master', async () => {
    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: 'dist-1', nama_kecamatan: 'Tanjung' } })
      .mockResolvedValueOnce({ data: { id: 'vil-1', nama_desa: 'Sokong' } })
      .mockResolvedValueOnce({
        data: {
          id: 'cust-1',
          nama: 'Budi Santoso',
          alamat_detail: 'Dusun Karang Anyar',
          no_hp: '08123456789',
          golongan_pelanggan: 'Rumah Tangga',
          latitude: -8.35,
          longitude: 116.15,
        },
      })

    const result = await lookupCustomer('010200123')
    expect(result.type).toBe('full')
    expect(result.kecamatan?.nama).toBe('Tanjung')
    expect(result.desa?.nama).toBe('Sokong')
    expect(result.customer?.nama).toBe('Budi Santoso')
    expect(result.customer?.latitude).toBe(-8.35)
  })
})
