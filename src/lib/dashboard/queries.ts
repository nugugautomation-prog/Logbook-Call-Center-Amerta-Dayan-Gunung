import { createClient } from '@/lib/supabase/client'
import { MASTER_WILAYAH_PDAM } from '@/lib/constants/master-wilayah'
import { isDummySupabase } from '@/lib/supabase/is-dummy'

export type Period = 'today' | 'week' | 'month' | 'custom'

// Supabase join relations can return an array or single object depending on cardinality.
// This helper normalises both shapes into a string value.
function getJoinedName(
  val: Record<string, unknown> | Record<string, unknown>[] | null | undefined,
  field: string,
  fallback = '-'
): string {
  if (!val) return fallback
  if (Array.isArray(val) && val.length > 0) return (val[0][field] as string) || fallback
  if (typeof val === 'object' && !Array.isArray(val) && val[field]) return val[field] as string
  return fallback
}

export function getPeriodDates(period: Period, customStart?: string, customEnd?: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'today': {
      const start = today.toISOString()
      const end = new Date(today.getTime() + 86400000 - 1).toISOString()
      return { start, end }
    }
    case 'week': {
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      return { start: monday.toISOString(), end: sunday.toISOString() }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()
      return { start, end }
    }
    case 'custom':
      return {
        start: customStart ? new Date(customStart).toISOString() : today.toISOString(),
        end: customEnd ? new Date(customEnd + 'T23:59:59').toISOString() : today.toISOString(),
      }
  }
}

export async function getDashboardSummary(start: string, end: string) {
  if (isDummySupabase()) {
    return {
      total: 124,
      berjalan: 18,
      selesai: 106,
      perChannel: [
        { channel: 'WhatsApp', jumlah: 68 },
        { channel: 'Telepon', jumlah: 24 },
        { channel: 'Instagram', jumlah: 16 },
        { channel: 'Facebook', jumlah: 12 },
        { channel: 'TikTok', jumlah: 4 },
      ],
      topKategori: [
        { nama: 'Tagihan Tidak Sesuai', jumlah: 42 },
        { nama: 'Lapor Gangguan', jumlah: 35 },
        { nama: 'Harga Naik', jumlah: 21 },
        { nama: 'Cara Bayar Online', jumlah: 14 },
        { nama: 'Status Pengaduan', jumlah: 12 },
      ],
    }
  }

  try {
    const supabase = createClient()
    const { data: tickets } = await supabase
      .from('tickets')
      .select(`
        id, status, channel, handling_type_id, created_at, updated_at,
        customer_id_input,
        kategori:categories(nama),
        tujuan:handling_types(nama)
      `)
      .gte('created_at', start)
      .lte('created_at', end)

    if (!tickets || tickets.length === 0) {
      return {
        total: 0,
        berjalan: 0,
        selesai: 0,
        perChannel: [],
        topKategori: [],
      }
    }

    const total = tickets.length
    const berjalan = tickets.filter((t: any) => t.status === 'Berjalan').length
    const selesai = tickets.filter((t: any) => t.status === 'Selesai').length

    const channelMap: Record<string, number> = {}
    tickets.forEach((t: any) => {
      channelMap[t.channel] = (channelMap[t.channel] ?? 0) + 1
    })

    const kategoriMap: Record<string, number> = {}
    tickets.forEach((t: any) => {
      const nama = getJoinedName(t.kategori, 'nama', 'Lainnya')
      kategoriMap[nama] = (kategoriMap[nama] ?? 0) + 1
    })

    const topKategori = Object.entries(kategoriMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nama, jumlah]) => ({ nama, jumlah }))

    return {
      total,
      berjalan,
      selesai,
      perChannel: Object.entries(channelMap).map(([channel, jumlah]) => ({ channel, jumlah })),
      topKategori,
    }
  } catch {
    return {
      total: 0,
      berjalan: 0,
      selesai: 0,
      perChannel: [],
      topKategori: [],
    }
  }
}

export async function getTopWilayah(start: string, end: string) {
  if (isDummySupabase()) {
    return [
      { desaId: '01', nama: 'Sokong', kecamatan: 'Tanjung', jumlah: 28 },
      { desaId: '02', nama: 'Tanjung', kecamatan: 'Tanjung', jumlah: 24 },
      { desaId: '03', nama: 'Pemenang Timur', kecamatan: 'Pemenang', jumlah: 19 },
      { desaId: '04', nama: 'Gondang', kecamatan: 'Gangga', jumlah: 15 },
      { desaId: '05', nama: 'Kayangan', kecamatan: 'Kayangan', jumlah: 12 },
    ]
  }

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('tickets')
      .select(`
        desa_id,
        kecamatan:districts(nama_kecamatan),
        desa:villages(nama_desa)
      `)
      .gte('created_at', start)
      .lte('created_at', end)
      .not('desa_id', 'is', null)

    if (!data) return []

    const wilayahMap: Record<string, { desaId: string; nama: string; kecamatan: string; jumlah: number }> = {}
    data.forEach((t: any) => {
      if (!t.desa_id) return
      const key = t.desa_id
      const desaNama = getJoinedName(t.desa, 'nama_desa')
      const kecNama = getJoinedName(t.kecamatan, 'nama_kecamatan')
      if (!wilayahMap[key]) {
        wilayahMap[key] = { desaId: key, nama: desaNama, kecamatan: kecNama, jumlah: 0 }
      }
      wilayahMap[key].jumlah++
    })

    return Object.values(wilayahMap).sort((a, b) => b.jumlah - a.jumlah).slice(0, 10)
  } catch {
    return []
  }
}

export async function getRekapKecamatan(start: string, end: string) {
  if (isDummySupabase()) {
    return [
      { nama: 'Tanjung', jumlah: 52 },
      { nama: 'Pemenang', jumlah: 27 },
      { nama: 'Gangga', jumlah: 22 },
      { nama: 'Kayangan', jumlah: 15 },
      { nama: 'Bayan', jumlah: 8 },
    ]
  }

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('tickets')
      .select(`
        kecamatan:districts(nama_kecamatan, kode_kecamatan)
      `)
      .gte('created_at', start)
      .lte('created_at', end)

    const cabangMap: Record<string, number> = {
      Tanjung: 0,
      Pemenang: 0,
      Bayan: 0,
      Kayangan: 0,
      Gangga: 0,
    }

    ;(data || []).forEach((t: any) => {
      const kecNama = getJoinedName(t.kecamatan, 'nama_kecamatan', '')
      if (kecNama && cabangMap[kecNama] !== undefined) {
        cabangMap[kecNama]++
      }
    })

    return Object.entries(cabangMap).map(([nama, jumlah]) => ({
      nama,
      jumlah,
    }))
  } catch {
    return []
  }
}

export async function getAgingReport() {
  if (isDummySupabase()) {
    return [
      {
        id: '1',
        ticket_number: 'TIK-CC-2609-0004',
        customer_name: 'Budi Santoso',
        created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
        channel: 'WhatsApp',
        hariMenggantung: 9,
      },
      {
        id: '2',
        ticket_number: 'TIK-CC-2609-0008',
        customer_name: 'Siti Rahmawati',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        channel: 'Telepon',
        hariMenggantung: 4,
      },
    ]
  }

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('tickets')
      .select(`
        id, ticket_number, customer_name, created_at, channel,
        tujuan:handling_types(nama)
      `)
      .eq('status', 'Berjalan')
      .order('created_at', { ascending: true })
      .limit(20)

    if (!data) return []

    const now = new Date()
    return data.map((t: any) => ({
      ...t,
      hariMenggantung: Math.floor(
        (now.getTime() - new Date(t.created_at).getTime()) / 86400000
      ),
    }))
  } catch {
    return []
  }
}

export async function getPelangganBerulang() {
  if (isDummySupabase()) {
    return [
      { customerId: '010100001', nama: 'ABDUL MUID', jumlah: 4 },
      { customerId: '010100009', nama: 'ARIP RAHMAN', jumlah: 3 },
    ]
  }

  try {
    const supabase = createClient()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

    const { data } = await supabase
      .from('tickets')
      .select('customer_id_input, customer_name')
      .gte('created_at', thirtyDaysAgo)
      .not('customer_id_input', 'is', null)

    if (!data) return []

    const map: Record<string, { customerId: string; nama: string; jumlah: number }> = {}
    data.forEach((t: any) => {
      const id = t.customer_id_input!
      if (!map[id]) map[id] = { customerId: id, nama: t.customer_name, jumlah: 0 }
      map[id].jumlah++
    })

    return Object.values(map)
      .filter((p) => p.jumlah >= 3)
      .sort((a, b) => b.jumlah - a.jumlah)
  } catch {
    return []
  }
}

export async function getTrendHarian(start: string, end: string) {
  if (isDummySupabase()) {
    const days: Array<{ tanggal: string; jumlah: number }> = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000)
      days.push({
        tanggal: d.toISOString().slice(0, 10),
        jumlah: Math.floor(Math.random() * 10) + 12,
      })
    }
    return days
  }

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('tickets')
      .select('created_at')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at')

    if (!data) return []

    const dayMap: Record<string, number> = {}
    data.forEach((t: any) => {
      const day = t.created_at.slice(0, 10)
      dayMap[day] = (dayMap[day] ?? 0) + 1
    })

    return Object.entries(dayMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tanggal, jumlah]) => ({ tanggal, jumlah }))
  } catch {
    return []
  }
}
