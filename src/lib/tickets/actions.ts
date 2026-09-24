'use server'
import { createClient } from '@/lib/supabase/server'
import { ticketSchema, type TicketFormData, type TicketCreateResult } from './schema'
import { revalidatePath } from 'next/cache'

import { isDummySupabase } from '@/lib/supabase/is-dummy'
import { DEMO_TICKETS } from './demo-store'

export async function createTicket(
  data: TicketFormData
): Promise<TicketCreateResult> {
  const parsed = ticketSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  if (isDummySupabase()) {
    const isSelesai = parsed.data.handlingTypeId === '1'
    const status = isSelesai ? 'Selesai' : 'Berjalan'
    const ticketNumber = `TKT-2026-${String(DEMO_TICKETS.length + 1).padStart(4, '0')}`
    const id = `demo-${Date.now()}`

    const INTERACTION_MAP: Record<string, string> = {
      '1': 'Komplain',
      '2': 'Pertanyaan/Informasi',
      '3': 'Lapor Gangguan/Kerusakan',
      '4': 'Konten Sosmed',
      '5': 'Lainnya',
    }
    const CATEGORY_MAP: Record<string, string> = {
      '1': 'Tagihan Tidak Sesuai',
      '2': 'Harga Naik',
      '3': 'Cara Daftar',
      '4': 'Cara Bayar Online',
      '5': 'Lapor Gangguan',
      '6': 'Pipa Bocor',
      '7': 'Air Keruh / Kotor',
      '8': 'Meteran Rusak',
    }
    const HANDLING_MAP: Record<string, string> = {
      '1': 'Selesai di Call Center',
      '2': 'Diteruskan ke Unit Terkait',
      '3': 'Perlu Kunjungan Lapangan',
    }

    DEMO_TICKETS.unshift({
      id,
      ticket_number: ticketNumber,
      timestamp: parsed.data.timestamp,
      customer_id_input: parsed.data.customerIdInput ?? null,
      customer_name: parsed.data.customerName,
      customer_phone: parsed.data.customerPhone ?? null,
      alamat_detail: parsed.data.alamatDetail ?? null,
      channel: parsed.data.channel,
      status,
      created_at: new Date().toISOString(),
      detail: parsed.data.detail ?? null,
      screenshot_path: parsed.data.screenshotPath ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      jenis_interaksi: {
        id: parsed.data.jenisInteraksiId,
        nama: INTERACTION_MAP[parsed.data.jenisInteraksiId] || parsed.data.jenisInteraksiId,
      },
      kategori: {
        id: parsed.data.categoryId,
        nama: CATEGORY_MAP[parsed.data.categoryId] || parsed.data.categoryId,
      },
      tujuan: {
        id: parsed.data.handlingTypeId,
        nama: HANDLING_MAP[parsed.data.handlingTypeId] || parsed.data.handlingTypeId,
        otomatis_selesai: isSelesai,
      },
      riwayat: [
        {
          id: `h-${Date.now()}`,
          status_sebelumnya: null,
          status_baru: status,
          catatan: 'Tiket dibuat',
          changed_at: new Date().toISOString(),
        },
      ],
    })

    revalidatePath('/tiket')
    revalidatePath('/dashboard')
    return { ticketNumber }
  }

  const supabase = createClient()

  // Determine status from handling_type (BR-004)
  const { data: handlingType, error: htError } = await supabase
    .from('handling_types')
    .select('otomatis_selesai')
    .eq('id', parsed.data.handlingTypeId)
    .single()

  if (htError || !handlingType) {
    return { error: { _root: ['Tujuan penanganan tidak valid'] } }
  }

  const status = handlingType.otomatis_selesai ? 'Selesai' : 'Berjalan'

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      timestamp: parsed.data.timestamp,
      customer_id_input: parsed.data.customerIdInput ?? null,
      customer_ref_id: parsed.data.customerRefId ?? null,
      kecamatan_id: parsed.data.kecamatanId ?? null,
      desa_id: parsed.data.desaId ?? null,
      customer_name: parsed.data.customerName,
      alamat_detail: parsed.data.alamatDetail ?? null,
      customer_phone: parsed.data.customerPhone ?? null,
      channel: parsed.data.channel,
      jenis_interaksi_id: parsed.data.jenisInteraksiId,
      category_id: parsed.data.categoryId,
      detail: parsed.data.detail ?? null,
      handling_type_id: parsed.data.handlingTypeId,
      status,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      screenshot_path: parsed.data.screenshotPath ?? null,
    })
    .select('ticket_number, id')
    .single()

  if (error || !ticket) {
    console.error('createTicket error:', error)
    return { error: { _root: ['Gagal menyimpan tiket. Silakan coba lagi.'] } }
  }

  // Record initial status in history (trigger also handles updates, but we record creation)
  await supabase.from('ticket_status_history').insert({
    ticket_id: ticket.id,
    status_sebelumnya: null,
    status_baru: status,
    catatan: 'Tiket dibuat',
  })

  revalidatePath('/tiket')
  revalidatePath('/dashboard')

  return { ticketNumber: ticket.ticket_number }
}

export async function getTickets(params?: {
  status?: 'Berjalan' | 'Selesai'
  kategori?: string
  kecamatan?: string
  desa?: string
  search?: string
  limit?: number
  offset?: number
}) {
  if (isDummySupabase()) {
    let list = [...DEMO_TICKETS]
    if (params?.status) {
      list = list.filter((t) => t.status === params.status)
    }
    if (params?.kategori) {
      const kat = params.kategori.toLowerCase()
      list = list.filter((t) => t.kategori?.nama?.toLowerCase().includes(kat))
    }
    if (params?.kecamatan) {
      const kec = params.kecamatan.toLowerCase()
      list = list.filter((t) => t.kecamatan?.nama_kecamatan?.toLowerCase().includes(kec))
    }
    if (params?.desa) {
      const des = params.desa.toLowerCase()
      list = list.filter((t) => t.desa?.nama_desa?.toLowerCase().includes(des))
    }
    if (params?.search) {
      const s = params.search.toLowerCase()
      list = list.filter(
        (t) =>
          t.customer_name.toLowerCase().includes(s) ||
          t.ticket_number.toLowerCase().includes(s) ||
          (t.customer_id_input && t.customer_id_input.includes(s)) ||
          (t.customer_phone && t.customer_phone.includes(s))
      )
    }
    return { data: list, error: null }
  }

  const supabase = createClient()

  let query = supabase
    .from('tickets')
    .select(
      `
      id, ticket_number, timestamp, customer_id_input, customer_name, customer_phone,
      channel, status, created_at, screenshot_path,
      kecamatan:districts(nama_kecamatan),
      desa:villages(nama_desa),
      kategori:categories(nama),
      jenis_interaksi:interaction_types(nama),
      tujuan:handling_types(nama)
    `
    )
    .order('created_at', { ascending: false })

  if (params?.status) {
    query = query.eq('status', params.status)
  }
  if (params?.search) {
    const s = params.search.trim().replace(/[,()]/g, '')
    if (s) {
      query = query.or(`customer_name.ilike.%${s}%,ticket_number.ilike.%${s}%,customer_id_input.ilike.%${s}%,customer_phone.ilike.%${s}%`)
    }
  }
  if (params?.limit) {
    query = query.limit(params.limit)
  }
  if (params?.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit ?? 20) - 1
    )
  }

  const { data, error } = await query
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function getTicketById(id: string) {
  if (isDummySupabase()) {
    const found = DEMO_TICKETS.find((t) => t.id === id || t.ticket_number === id)
    if (!found) {
      return { data: null, error: 'Tiket tidak ditemukan' }
    }
    return { data: found, error: null }
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('tickets')
    .select(
      `
      *,
      kecamatan:districts(id, nama_kecamatan),
      desa:villages(id, nama_desa),
      kategori:categories(id, nama),
      jenis_interaksi:interaction_types(id, nama),
      tujuan:handling_types(id, nama, otomatis_selesai),
      riwayat:ticket_status_history(id, status_sebelumnya, status_baru, catatan, changed_at)
    `
    )
    .eq('id', id)
    .single()

  return { data, error }
}

