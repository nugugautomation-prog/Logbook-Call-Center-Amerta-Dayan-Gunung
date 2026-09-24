import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/client'
import { MASTER_WILAYAH_PDAM } from '@/lib/constants/master-wilayah'

export interface ParsedCustomerRow {
  rowIndex: number
  customerId: string
  nama: string
  alamatDetail: string
  noHp: string
  golongan: string
  koordinatAsli: string
  latitude: number | null
  longitude: number | null
  kecamatanId: string | null
  desaId: string | null
  kecamatanNama?: string
  desaNama?: string
  isValid: boolean
  errorReason?: string
}

export interface ParseResult {
  totalRows: number
  validCount: number
  errorCount: number
  rows: ParsedCustomerRow[]
}

export function parseCoordinates(raw: string | null | undefined): {
  latitude: number | null
  longitude: number | null
} {
  if (!raw) return { latitude: null, longitude: null }

  // Normalise string, format expected: "-8.12345, 116.12345" or "-8.12345; 116.12345"
  const clean = String(raw).trim().replace(/\s+/g, '')
  const separator = clean.includes(',') ? ',' : clean.includes(';') ? ';' : null

  if (!separator) return { latitude: null, longitude: null }

  const parts = clean.split(separator)
  if (parts.length !== 2) return { latitude: null, longitude: null }

  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])

  if (isNaN(lat) || isNaN(lng)) return { latitude: null, longitude: null }

  return { latitude: lat, longitude: lng }
}

export async function parseCustomerExcel(file: File | Blob | Buffer): Promise<ParseResult> {
  let arrayBuffer: any
  if (Buffer.isBuffer(file)) {
    arrayBuffer = file
  } else if (typeof file.arrayBuffer === 'function') {
    arrayBuffer = await file.arrayBuffer()
  } else {
    arrayBuffer = Buffer.from(await (file as any).text())
  }
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).')
  }

  // 1. Fetch database master wilayah, if available
  let districtMap = new Map<string, { id: string; nama: string }>()
  let villageMap = new Map<string, { id: string; nama: string }>()

  try {
    const supabase = createClient()
    const [{ data: districts }, { data: villages }] = await Promise.all([
      supabase.from('districts').select('id, kode_kecamatan, nama_kecamatan').eq('aktif', true),
      supabase.from('villages').select('id, kecamatan_id, kode_desa, nama_desa').eq('aktif', true),
    ])

    if (districts && districts.length > 0) {
      districts.forEach((d) => districtMap.set(d.kode_kecamatan, { id: d.id, nama: d.nama_kecamatan }))
    }

    if (villages && villages.length > 0) {
      villages.forEach((v) => {
        villageMap.set(`${v.kecamatan_id}_${v.kode_desa}`, { id: v.id, nama: v.nama_desa })
      })
    }
  } catch (err) {
    console.warn('Could not fetch districts/villages from Supabase, using standard constant:', err)
  }

  // 2. Fallback: Jika database belum di-seed, gunakan MASTER_WILAYAH_PDAM (sesuai Master Wilayah.xlsx)
  if (districtMap.size === 0) {
    MASTER_WILAYAH_PDAM.forEach((dist) => {
      const mockDistId = `dist-${dist.kode_kecamatan}`
      districtMap.set(dist.kode_kecamatan, { id: mockDistId, nama: dist.nama_kecamatan })
      dist.desa.forEach((vil) => {
        villageMap.set(`${mockDistId}_${vil.kode_desa}`, {
          id: `vil-${dist.kode_kecamatan}-${vil.kode_desa}`,
          nama: vil.nama_desa,
        })
      })
    })
  }

  // 3. Deteksi mapping kolom dari header row 1
  const headerRow = worksheet.getRow(1)
  let colIndexId = 1
  let colIndexNama = 2
  let colIndexAlamat = 3
  let colIndexGolongan = 4
  let colIndexLokasi = 8
  let colIndexNoHp = 9

  headerRow.eachCell((cell, colNumber) => {
    const headerText = String(cell.value || '').toLowerCase().trim()
    if (headerText.includes('id') && headerText.includes('pelanggan')) colIndexId = colNumber
    else if (headerText === 'nama') colIndexNama = colNumber
    else if (headerText.includes('alamat')) colIndexAlamat = colNumber
    else if (headerText.includes('jenis') || headerText.includes('golongan')) colIndexGolongan = colNumber
    else if (headerText.includes('lokasi') || headerText.includes('koordinat')) colIndexLokasi = colNumber
    else if (headerText.includes('hp') || headerText.includes('telp') || headerText.includes('kontak')) colIndexNoHp = colNumber
  })

  const rows: ParsedCustomerRow[] = []
  let validCount = 0
  let errorCount = 0

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // skip header

    // Ambil nilai dan bersihkan non-breaking space (\u00A0) serta whitespace
    const customerIdRaw = String(row.getCell(colIndexId).value ?? '').replace(/\u00a0/g, ' ').trim()
    const nama = String(row.getCell(colIndexNama).value ?? '').trim()
    const alamatDetail = String(row.getCell(colIndexAlamat).value ?? '').trim()
    const golongan = String(row.getCell(colIndexGolongan).value ?? '').trim()
    const koordinatAsli = String(row.getCell(colIndexLokasi).value ?? '').trim()
    const noHp = String(row.getCell(colIndexNoHp).value ?? '').trim()

    if (!customerIdRaw && !nama) return // baris kosong di akhir

    // Ekstrak hanya digit untuk ID Pelanggan (9 digit: 2 kec + 2 desa + 5 unik)
    const customerId = customerIdRaw.replace(/\D/g, '')
    let isValid = true
    let errorReason = ''

    // 1. Validasi 9 digit angka
    if (customerId.length !== 9) {
      isValid = false
      errorReason = `ID Pelanggan harus 9 digit angka (ditemukan: "${customerIdRaw}")`
    }

    if (!nama && isValid) {
      isValid = false
      errorReason = 'Nama pelanggan kosong'
    }

    // 2. Validasi Kecamatan & Desa (BR-015)
    let kecamatanId: string | null = null
    let desaId: string | null = null
    let kecamatanNama = ''
    let desaNama = ''

    if (isValid) {
      const kodeKec = customerId.substring(0, 2)
      const kodeDes = customerId.substring(2, 4)

      const dist = districtMap.get(kodeKec)
      if (!dist) {
        isValid = false
        errorReason = `Kode Kecamatan "${kodeKec}" belum terdaftar di Master Kecamatan.`
      } else {
        kecamatanId = dist.id
        kecamatanNama = dist.nama

        const vil = villageMap.get(`${dist.id}_${kodeDes}`)
        if (!vil) {
          isValid = false
          errorReason = `Kode Desa "${kodeDes}" belum terdaftar di Kecamatan ${dist.nama}.`
        } else {
          desaId = vil.id
          desaNama = vil.nama
        }
      }
    }

    // 3. Pisahkan koordinat latitude & longitude otomatis (BR-013)
    const { latitude, longitude } = parseCoordinates(koordinatAsli)

    if (isValid) {
      validCount++
    } else {
      errorCount++
    }

    rows.push({
      rowIndex: rowNumber,
      customerId,
      nama,
      alamatDetail,
      noHp,
      golongan,
      koordinatAsli,
      latitude,
      longitude,
      kecamatanId,
      desaId,
      kecamatanNama,
      desaNama,
      isValid,
      errorReason,
    })
  })

  return {
    totalRows: rows.length,
    validCount,
    errorCount,
    rows,
  }
}
