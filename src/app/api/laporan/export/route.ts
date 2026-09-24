import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExcel, type TicketRow, type ReportSummary } from '@/lib/reports/excel'
import { format } from 'date-fns'

import { isDummySupabase } from '@/lib/supabase/is-dummy'
import { DEMO_TICKETS } from '@/lib/tickets/demo-store'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const isDemo = isDummySupabase()

    if (!isDemo) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { searchParams } = request.nextUrl
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Parameter start dan end diperlukan' }, { status: 400 })
    }

    let tickets: any[] = []

    if (isDemo) {
      tickets = DEMO_TICKETS
    } else {
      const supabase = createClient()
      let startISO: string
      let endISO: string
      try {
        startISO = new Date(startDate).toISOString()
        endISO = new Date(endDate + 'T23:59:59').toISOString()
      } catch {
        startISO = startDate
        endISO = endDate
      }

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        ticket_number, timestamp, customer_id_input,
        customer_name, alamat_detail, customer_phone, channel,
        detail, status, updated_at, screenshot_path,
        kecamatan:districts(nama_kecamatan),
        desa:villages(nama_desa),
        jenis_interaksi:interaction_types(nama),
        kategori:categories(nama),
        tujuan:handling_types(nama)
      `)
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .order('timestamp', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
    }
    tickets = data || []
  }

  const getJoined = (val: any, field: string) => {
    if (!val) return '-'
    if (Array.isArray(val) && val.length > 0) return val[0][field] || '-'
    if (typeof val === 'object' && val[field]) return val[field]
    return '-'
  }

  const rows: TicketRow[] = (tickets ?? []).map((t: any) => ({
    ticket_number: t.ticket_number,
    timestamp: t.timestamp,
    customer_id_input: t.customer_id_input,
    kecamatan: getJoined(t.kecamatan, 'nama_kecamatan'),
    desa: getJoined(t.desa, 'nama_desa'),
    customer_name: t.customer_name,
    alamat_detail: t.alamat_detail,
    customer_phone: t.customer_phone,
    channel: t.channel,
    jenis_interaksi: getJoined(t.jenis_interaksi, 'nama'),
    kategori: getJoined(t.kategori, 'nama'),
    detail: t.detail,
    tujuan: getJoined(t.tujuan, 'nama'),
    status: t.status,
    updated_at: t.updated_at || t.timestamp || new Date().toISOString(),
    screenshot_path: t.screenshot_path,
  }))

  // Build summary from rows
  const total = rows.length
  const statusSelesai = rows.filter((r) => r.status === 'Selesai').length
  const statusBerjalan = rows.filter((r) => r.status === 'Berjalan').length

  const channelMap: Record<string, number> = {}
  const kategoriMap: Record<string, number> = {}
  const tujuanMap: Record<string, { jumlah: number; selesai: number; berjalan: number }> = {}
  const desaMap: Record<string, { nama: string; kecamatan: string; jumlah: number }> = {}

  rows.forEach((r) => {
    channelMap[r.channel] = (channelMap[r.channel] ?? 0) + 1
    kategoriMap[r.kategori] = (kategoriMap[r.kategori] ?? 0) + 1
    if (!tujuanMap[r.tujuan]) tujuanMap[r.tujuan] = { jumlah: 0, selesai: 0, berjalan: 0 }
    tujuanMap[r.tujuan].jumlah++
    if (r.status === 'Selesai') tujuanMap[r.tujuan].selesai++
    else tujuanMap[r.tujuan].berjalan++
    if (r.desa !== '-') {
      const key = r.desa
      if (!desaMap[key]) desaMap[key] = { nama: r.desa, kecamatan: r.kecamatan, jumlah: 0 }
      desaMap[key].jumlah++
    }
  })

  const topKategori = Object.entries(kategoriMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nama, jumlah]) => ({ nama, jumlah }))

  const topDesa = Object.values(desaMap)
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5)

  const summary: ReportSummary = {
    totalInteraksi: total,
    perChannel: Object.entries(channelMap).map(([channel, jumlah]) => ({ channel, jumlah })),
    perKategori: Object.entries(kategoriMap).map(([nama, jumlah]) => ({ nama, jumlah })),
    topKategori,
    topDesa,
    selesaiEdukasi: tujuanMap['Selesai di Edukasi (Tanpa Eskalasi)']?.jumlah ?? 0,
    eskalasiPelayanan: tujuanMap['Eskalasi ke Bidang Pelayanan']?.jumlah ?? 0,
    eskalasiCabang: tujuanMap['Eskalasi ke Kantor Cabang']?.jumlah ?? 0,
    statusSelesai,
    statusBerjalan,
    perHandling: Object.entries(tujuanMap).map(([nama, v]) => ({
      nama,
      jumlah: v.jumlah,
      selesai: v.selesai,
      berjalan: v.berjalan,
      rataHari: 0, // TODO: calculate from status history
    })),
  }

  const buffer = await generateExcel(rows, startDate, endDate, summary)

  const periodLabel = `${startDate}_${endDate}`
  const exportDateStr = format(new Date(), 'yyyy-MM-dd')
  const fileName = `Rekap-CallCenter-${periodLabel}_${exportDateStr}.xlsx`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length.toString(),
    },
  })
  } catch (err) {
    console.error('Export Excel error:', err)
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses laporan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
