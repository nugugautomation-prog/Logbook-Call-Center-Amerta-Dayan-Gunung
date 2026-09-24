import ExcelJS from 'exceljs'

export interface ParsedKecamatan {
  kode_kecamatan: string
  nama_kecamatan: string
}

export interface ParsedDesa {
  kode_kecamatan: string
  kode_desa: string
  nama_desa: string
  nama_kecamatan: string
}

export interface ParseWilayahResult {
  totalRows: number
  kecamatanList: ParsedKecamatan[]
  desaList: ParsedDesa[]
}

export async function parseWilayahExcel(file: File | Blob | Buffer): Promise<ParseWilayahResult> {
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
    throw new Error('File Excel tidak memiliki lembar kerja.')
  }

  const kecamatanMap = new Map<string, string>()
  const desaMap = new Map<string, ParsedDesa>()
  let totalRows = 0

  worksheet.eachRow((row, rowNumber) => {
    // Cari baris header
    if (rowNumber === 1 && String(row.getCell(1).value || '').toLowerCase().includes('kode')) return

    const col1 = String(row.getCell(1).value ?? '').trim()
    const col2 = String(row.getCell(2).value ?? '').trim()
    const col3 = String(row.getCell(3).value ?? '').trim()
    const col4 = String(row.getCell(4).value ?? '').trim()

    // Lewati baris header jika ada kata "Kode"
    if (col1.toLowerCase().includes('kode') || col2.toLowerCase().includes('cabang')) return
    if (!col1 && !col2) return

    totalRows++

    // Normalisasi 2 digit kode kecamatan
    const kodeKec = col1.padStart(2, '0')
    const namaKec = col2 || `Kecamatan ${kodeKec}`
    kecamatanMap.set(kodeKec, namaKec)

    // Kode desa (jika 4 digit misal 0101, ambil 2 digit belakang: 01)
    let kodeDesa = col3.replace(/\D/g, '')
    if (kodeDesa.length === 4) {
      kodeDesa = kodeDesa.substring(2, 4)
    } else if (kodeDesa.length > 0) {
      kodeDesa = kodeDesa.padStart(2, '0')
    }

    const namaDesa = col4 || `Desa ${kodeDesa}`
    if (kodeDesa) {
      const key = `${kodeKec}_${kodeDesa}`
      desaMap.set(key, {
        kode_kecamatan: kodeKec,
        kode_desa: kodeDesa,
        nama_desa: namaDesa,
        nama_kecamatan: namaKec,
      })
    }
  })

  const kecamatanList = Array.from(kecamatanMap.entries()).map(([kode, nama]) => ({
    kode_kecamatan: kode,
    nama_kecamatan: nama,
  }))

  const desaList = Array.from(desaMap.values())

  return {
    totalRows,
    kecamatanList,
    desaList,
  }
}
