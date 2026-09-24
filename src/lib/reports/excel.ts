import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export interface ReportSummary {
  totalInteraksi: number
  perChannel: Array<{ channel: string; jumlah: number }>
  perKategori: Array<{ nama: string; jumlah: number }>
  topKategori: Array<{ nama: string; jumlah: number }>
  topDesa: Array<{ nama: string; kecamatan: string; jumlah: number }>
  selesaiEdukasi: number
  eskalasiPelayanan: number
  eskalasiCabang: number
  statusSelesai: number
  statusBerjalan: number
  perHandling: Array<{
    nama: string
    jumlah: number
    selesai: number
    berjalan: number
    rataHari: number
  }>
}

export interface TicketRow {
  ticket_number: string
  timestamp: string
  customer_id_input: string | null
  kecamatan: string
  desa: string
  customer_name: string
  alamat_detail: string | null
  customer_phone: string | null
  channel: string
  jenis_interaksi: string
  kategori: string
  detail: string | null
  tujuan: string
  status: string
  updated_at: string
  screenshot_path: string | null
}

const HEADER_COLOR = 'DBEAFE' // biru muda
const PRIMARY_COLOR = '1B4F8A'

function safeFormat(dateVal: any, pattern: string, fallback = '-'): string {
  if (!dateVal) return fallback
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return fallback
    return format(d, pattern, { locale: id })
  } catch {
    return fallback
  }
}

export async function generateExcel(
  tickets: TicketRow[],
  startDate: string,
  endDate: string,
  summary: ReportSummary,
  adminName = 'Admin Call Center'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Aplikasi Logbook Call Center PDAM'
  workbook.created = new Date()

  const startFormatted = safeFormat(startDate, 'd MMM yyyy', startDate)
  const endFormatted = safeFormat(endDate, 'd MMM yyyy', endDate)
  const periodLabel = `${startFormatted} s/d ${endFormatted}`
  const exportDate = safeFormat(new Date(), 'dd MMM yyyy', '')

  // =========================================================
  // SHEET 1: Kop & Ringkasan
  // =========================================================
  const sheet1 = workbook.addWorksheet('Kop & Ringkasan')
  sheet1.columns = [
    { width: 35 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
  ]

  // Kop
  const kopRows = [
    ['PERUMDA AIR MINUM AMERTA DAYAN GUNUNG'],
    ['LAPORAN REKAPITULASI INTERAKSI & PENGADUAN PELANGGAN'],
    ['CALL CENTER'],
    [''],
    ['Periode Laporan', `: ${periodLabel}`],
    ['Tanggal Dicetak', `: ${exportDate}`],
    [''],
  ]

  kopRows.forEach((row, i) => {
    const r = sheet1.addRow(row)
    if (i < 3) {
      r.font = { bold: true, size: i === 0 ? 13 : 12, color: { argb: PRIMARY_COLOR } }
      sheet1.mergeCells(`A${r.number}:D${r.number}`)
      r.alignment = { horizontal: 'center' }
    }
  })

  // Ringkasan tabel
  const summaryTitle = sheet1.addRow(['RINGKASAN'])
  summaryTitle.font = { bold: true, size: 11 }
  sheet1.mergeCells(`A${summaryTitle.number}:B${summaryTitle.number}`)

  const summaryHeader = sheet1.addRow(['Metrik', 'Jumlah'])
  summaryHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.font = { bold: true }
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    }
  })

  const summaryData = [
    ['Total Interaksi Masuk', summary.totalInteraksi],
    ['Status: Selesai', summary.statusSelesai],
    ['Status: Masih Berjalan', summary.statusBerjalan],
    ['Selesai di Edukasi (Tanpa Eskalasi)', summary.selesaiEdukasi],
    ['Eskalasi ke Bidang Pelayanan', summary.eskalasiPelayanan],
    ['Eskalasi ke Kantor Cabang', summary.eskalasiCabang],
  ]

  summaryData.forEach(([label, value]) => {
    const row = sheet1.addRow([label, value])
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      }
    })
  })

  sheet1.addRow([])

  // Per Channel
  const chTitle = sheet1.addRow(['Per Channel'])
  chTitle.font = { bold: true }
  const chHeader = sheet1.addRow(['Channel', 'Jumlah'])
  chHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  summary.perChannel.forEach(({ channel, jumlah }) => {
    const r = sheet1.addRow([channel, jumlah])
    r.eachCell((c) => { c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } })
  })

  sheet1.addRow([])

  // Top 5 Kategori
  const topKatTitle = sheet1.addRow(['Top 5 Kategori Aduan'])
  topKatTitle.font = { bold: true }
  const topKatHeader = sheet1.addRow(['No', 'Kategori', 'Jumlah'])
  topKatHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  summary.topKategori.forEach(({ nama, jumlah }, i) => {
    const r = sheet1.addRow([i + 1, nama, jumlah])
    r.eachCell((c) => { c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } })
  })

  sheet1.addRow([])

  // Top 5 Desa
  const topDesaTitle = sheet1.addRow(['Top 5 Desa Komplain'])
  topDesaTitle.font = { bold: true }
  const topDesaHeader = sheet1.addRow(['No', 'Desa', 'Kecamatan', 'Jumlah'])
  topDesaHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  summary.topDesa.forEach(({ nama, kecamatan, jumlah }, i) => {
    const r = sheet1.addRow([i + 1, nama, kecamatan, jumlah])
    r.eachCell((c) => { c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } })
  })

  sheet1.addRow([])
  sheet1.addRow([])

  // Blok tanda tangan
  sheet1.addRow(['Dibuat oleh,', 'Diperiksa oleh,', 'Disetujui oleh,'])
  sheet1.addRow([''])
  sheet1.addRow([''])
  sheet1.addRow([''])
  sheet1.addRow([`( ${adminName} )`, '( Manager )', '( Direktur )'])
  sheet1.addRow([`Nama: ${adminName}`, 'Nama: _______________', 'Nama: _______________'])
  sheet1.addRow(['Tanggal: ___________', 'Tanggal: ___________', 'Tanggal: ___________'])

  // =========================================================
  // SHEET 2: Data Rinci
  // =========================================================
  const sheet2 = workbook.addWorksheet('Data Rinci')
  const headers2 = [
    'No', 'Nomor Tiket', 'Tanggal & Waktu', 'ID Pelanggan',
    'Kecamatan', 'Desa', 'Nama Pelanggan', 'Alamat',
    'No. HP', 'Channel', 'Jenis Interaksi', 'Kategori',
    'Detail', 'Tujuan Penanganan', 'Status',
    'Tanggal Status Diubah', 'Ada Screenshot?'
  ]

  sheet2.columns = headers2.map((h) => ({ header: h, width: h.length + 4 }))

  const headerRow2 = sheet2.getRow(1)
  headerRow2.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    cell.alignment = { wrapText: true }
  })

  tickets.forEach((t, idx) => {
    const r = sheet2.addRow([
      idx + 1,
      t.ticket_number,
      safeFormat(t.timestamp, 'dd/MM/yyyy HH:mm'),
      t.customer_id_input ?? '-',
      t.kecamatan || '-',
      t.desa || '-',
      t.customer_name,
      t.alamat_detail ?? '-',
      t.customer_phone ?? '-',
      t.channel,
      t.jenis_interaksi,
      t.kategori,
      t.detail ?? '-',
      t.tujuan,
      t.status,
      safeFormat(t.updated_at || t.timestamp, 'dd/MM/yyyy HH:mm'),
      t.screenshot_path ? 'Ya' : 'Tidak',
    ])
    r.eachCell((c) => {
      c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
  })

  // =========================================================
  // SHEET 3: Rekap per Tujuan Penanganan
  // =========================================================
  const sheet3 = workbook.addWorksheet('Rekap per Tujuan Penanganan')
  const headers3 = [
    'Tujuan Penanganan', 'Jumlah Tiket',
    'Jumlah Sudah Selesai', 'Jumlah Masih Berjalan',
    'Rata-rata Lama Penanganan (hari)'
  ]

  sheet3.columns = headers3.map((h) => ({ header: h, width: Math.max(h.length + 4, 20) }))

  const headerRow3 = sheet3.getRow(1)
  headerRow3.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.font = { bold: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    cell.alignment = { wrapText: true }
  })

  summary.perHandling.forEach(({ nama, jumlah, selesai, berjalan, rataHari }) => {
    const r = sheet3.addRow([nama, jumlah, selesai, berjalan, rataHari.toFixed(1)])
    r.eachCell((c) => {
      c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
