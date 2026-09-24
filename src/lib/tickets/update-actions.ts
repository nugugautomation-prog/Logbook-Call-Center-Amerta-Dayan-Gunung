'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { isDummySupabase } from '@/lib/supabase/is-dummy'
import { DEMO_TICKETS } from './demo-store'

export async function updateTicketStatus(
  ticketId: string,
  newStatus: 'Selesai'
): Promise<{ success: boolean; error?: string }> {
  if (isDummySupabase()) {
    const ticket = DEMO_TICKETS.find((t) => t.id === ticketId || t.ticket_number === ticketId)
    if (!ticket) {
      return { success: false, error: 'Tiket tidak ditemukan' }
    }
    if (ticket.status === 'Selesai') {
      return {
        success: false,
        error: 'Tiket sudah selesai dan tidak dapat diubah',
      }
    }
    const oldStatus = ticket.status
    ticket.status = newStatus
    ticket.riwayat = ticket.riwayat || []
    ticket.riwayat.push({
      id: `h-${Date.now()}`,
      status_sebelumnya: oldStatus,
      status_baru: newStatus,
      catatan: 'Status diperbarui ke Selesai',
      changed_at: new Date().toISOString(),
    })
    revalidatePath('/tiket')
    revalidatePath(`/tiket/${ticketId}`)
    revalidatePath('/dashboard')
    return { success: true }
  }

  const supabase = createClient()

  // Fetch current ticket status
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', ticketId)
    .single()

  if (fetchError || !ticket) {
    return { success: false, error: 'Tiket tidak ditemukan' }
  }

  // BR-002: data Selesai dikunci — tidak bisa revert
  if (ticket.status === 'Selesai') {
    return {
      success: false,
      error: 'Tiket sudah selesai dan tidak dapat diubah',
    }
  }

  const { error } = await supabase
    .from('tickets')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .eq('status', 'Berjalan') // Double-check race condition protection

  if (error) {
    return { success: false, error: 'Gagal mengubah status tiket' }
  }

  revalidatePath('/tiket')
  revalidatePath(`/tiket/${ticketId}`)
  revalidatePath('/dashboard')

  return { success: true }
}
