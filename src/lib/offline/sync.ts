import { getPendingTickets, deletePendingTicket } from './queue'
import { createClient } from '@/lib/supabase/client'
import type { TicketFormData } from '@/lib/tickets/schema'

import { isDummySupabase } from '@/lib/supabase/is-dummy'

export interface SyncResult {
  synced: number
  failed: number
}

export async function syncPendingTickets(): Promise<SyncResult> {
  if (typeof window === 'undefined') return { synced: 0, failed: 0 }
  if (isDummySupabase()) return { synced: 0, failed: 0 }

  const pending = await getPendingTickets()
  if (pending.length === 0) return { synced: 0, failed: 0 }

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const item of pending) {
    const { localId, enqueuedAt, ...ticketData } = item

    // Determine status from handling type
    const { data: handlingType } = await supabase
      .from('handling_types')
      .select('otomatis_selesai')
      .eq('id', (ticketData as TicketFormData).handlingTypeId)
      .single()

    const status = handlingType?.otomatis_selesai ? 'Selesai' : 'Berjalan'
    const fd = ticketData as TicketFormData

    const { error } = await supabase.from('tickets').insert({
      timestamp: fd.timestamp,
      customer_id_input: fd.customerIdInput ?? null,
      customer_ref_id: fd.customerRefId ?? null,
      kecamatan_id: fd.kecamatanId ?? null,
      desa_id: fd.desaId ?? null,
      customer_name: fd.customerName,
      alamat_detail: fd.alamatDetail ?? null,
      customer_phone: fd.customerPhone ?? null,
      channel: fd.channel,
      jenis_interaksi_id: fd.jenisInteraksiId,
      category_id: fd.categoryId,
      detail: fd.detail ?? null,
      handling_type_id: fd.handlingTypeId,
      status,
      latitude: fd.latitude ?? null,
      longitude: fd.longitude ?? null,
    })

    if (!error) {
      if (localId !== undefined) await deletePendingTicket(localId as number)
      synced++
    } else {
      failed++
    }
  }

  return { synced, failed }
}
