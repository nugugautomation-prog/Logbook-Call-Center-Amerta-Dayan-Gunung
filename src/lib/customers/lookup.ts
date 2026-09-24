import { createClient } from '@/lib/supabase/client'
import { MASTER_WILAYAH_PDAM } from '@/lib/constants/master-wilayah'
import { isDummySupabase } from '@/lib/supabase/is-dummy'
import { getCustomerByIdFromDB } from '@/lib/offline/customer-db'

export interface CustomerLookupResult {
  type: 'full' | 'partial' | 'not_found'
  kecamatan?: { id: string; nama: string }
  desa?: { id: string; nama: string }
  customer?: {
    id: string
    nama: string
    alamat: string
    noHp: string
    golongan: string
    latitude: number | null
    longitude: number | null
  }
}

export async function lookupCustomer(input: string): Promise<CustomerLookupResult> {
  const digits = input.replace(/\D/g, '')

  if (digits.length < 4) {
    return { type: 'not_found' }
  }

  const kodeKecamatan = digits.slice(0, 2)
  const kodeDesa = digits.slice(2, 4)

  const supabase = createClient()
  let district: any = null
  let village: any = null
  let querySucceeded = false

  if (!isDummySupabase()) {
    try {
      const { data: d } = await supabase
        .from('districts')
        .select('id, nama_kecamatan')
        .eq('kode_kecamatan', kodeKecamatan)
        .eq('aktif', true)
        .maybeSingle()

      district = d
      querySucceeded = true

      if (district) {
        const { data: v } = await supabase
          .from('villages')
          .select('id, nama_desa')
          .eq('kecamatan_id', district.id)
          .eq('kode_desa', kodeDesa)
          .eq('aktif', true)
          .maybeSingle()

        village = v
      }
    } catch {
      querySucceeded = false
    }
  }

  let districtNama = ''
  let districtId = `dist-${kodeKecamatan}`
  let desaNama = ''
  let desaId = `vil-${kodeKecamatan}-${kodeDesa}`

  if (querySucceeded) {
    if (!district || !village) {
      return { type: 'not_found' }
    }
    districtNama = district.nama_kecamatan
    districtId = district.id
    desaNama = village.nama_desa
    desaId = village.id
  } else {
    // Fallback jika query ke database gagal (misal koneksi offline/dummy)
    const foundDist = MASTER_WILAYAH_PDAM.find((d) => d.kode_kecamatan === kodeKecamatan)
    if (foundDist) {
      districtNama = foundDist.nama_kecamatan
      const foundVil = foundDist.desa.find((v) => v.kode_desa === kodeDesa)
      if (foundVil) {
        desaNama = foundVil.nama_desa
      }
    }
    if (!districtNama || !desaNama) {
      return { type: 'not_found' }
    }
  }

  const baseResult = {
    kecamatan: { id: districtId, nama: districtNama },
    desa: { id: desaId, nama: desaNama },
  }

  // Only attempt full customer lookup if 8 or 9 digits provided (BR-014)
  if (digits.length < 8) {
    return { type: 'partial', ...baseResult }
  }

  // 1. Cek IndexedDB (dapat menampung seluruh 23.679 data pelanggan)
  if (typeof window !== 'undefined') {
    try {
      const stored = await getCustomerByIdFromDB(digits)
      if (stored) {
        return {
          type: 'full',
          ...baseResult,
          customer: {
            id: stored.customerId,
            nama: stored.nama,
            alamat: stored.alamatDetail || '',
            noHp: stored.noHp || '',
            golongan: stored.golongan || '',
            latitude: stored.latitude,
            longitude: stored.longitude,
          },
        }
      }
    } catch {
      // fallback ke localStorage
    }

    // 2. Cek cache lokal browser jika ada
    try {
      const cachedStr = localStorage.getItem('pdam_cached_customers')
      if (cachedStr) {
        const cached = JSON.parse(cachedStr)
        if (cached[digits]) {
          const c = cached[digits]
          return {
            type: 'full',
            ...baseResult,
            customer: {
              id: `cust-${digits}`,
              nama: c.nama,
              alamat: c.alamat || '',
              noHp: c.noHp || '',
              golongan: c.golongan || '',
              latitude: c.latitude,
              longitude: c.longitude,
            },
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  if (!isDummySupabase()) {
    try {
      const { data: customer } = await supabase
        .from('customer_master')
        .select(`
          id, nama, alamat_detail, no_hp, golongan_pelanggan,
          latitude, longitude
        `)
        .eq('customer_id', digits)
        .maybeSingle()

      if (customer) {
        return {
          type: 'full',
          ...baseResult,
          customer: {
            id: customer.id,
            nama: customer.nama,
            alamat: customer.alamat_detail ?? '',
            noHp: customer.no_hp ?? '',
            golongan: customer.golongan_pelanggan ?? '',
            latitude: customer.latitude,
            longitude: customer.longitude,
          },
        }
      }
    } catch {
      // Return partial
    }
  }

  return { type: 'partial', ...baseResult }
}
