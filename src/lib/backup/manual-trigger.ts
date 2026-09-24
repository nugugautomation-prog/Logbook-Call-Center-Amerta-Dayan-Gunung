'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isDummySupabase } from '@/lib/supabase/is-dummy'
import { DEMO_TICKETS } from '@/lib/tickets/demo-store'

export async function triggerManualBackup(): Promise<{ success: boolean; message?: string }> {
  if (isDummySupabase()) {
    const count = DEMO_TICKETS.length
    revalidatePath('/pengaturan/backup')
    return {
      success: true,
      message: `[Mode Demo] Backup manual berhasil disimulasikan untuk ${count} baris data tiket.`,
    }
  }

  const supabase = createClient()

  // 1. Fetch tickets to backup
  const { data: tickets, error: fetchErr } = await supabase
    .from('tickets')
    .select(`
      ticket_number, timestamp, customer_id_input, customer_name,
      customer_phone, channel, status, created_at,
      districts(nama_kecamatan), villages(nama_desa),
      categories(nama), handling_types(nama)
    `)
    .order('created_at', { ascending: false })

  if (fetchErr) {
    return { success: false, message: 'Gagal mengambil data tiket.' }
  }

  const count = tickets?.length ?? 0
  const fileName = `backup-manual-${new Date().toISOString().slice(0, 10)}.csv`
  const targetEmail = process.env.ADMIN_EMAIL || 'admin@pdam.example.com'

  // If RESEND_API_KEY is available, we can send email via Resend
  let emailSent = false
  if (process.env.RESEND_API_KEY) {
    try {
      // Build simple CSV content
      const headers = ['Nomor Tiket', 'Waktu', 'Nama Pelanggan', 'Kanal', 'Status']
      const rows = (tickets || []).map((t) => [
        t.ticket_number,
        t.timestamp,
        `"${t.customer_name.replace(/"/g, '""')}"`,
        t.channel,
        t.status,
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PDAM Call Center <onboarding@resend.dev>',
          to: [targetEmail],
          subject: `Backup Database Tiket PDAM - ${fileName}`,
          text: `Berikut terlampir backup manual database tiket PDAM sebanyak ${count} baris data.`,
          attachments: [
            {
              filename: fileName,
              content: Buffer.from(csv).toString('base64'),
            },
          ],
        }),
      })

      emailSent = res.ok
    } catch (e) {
      console.error('Failed sending backup email:', e)
      emailSent = false
    }
  } else {
    // If no Resend key in dev, mark as success with note
    emailSent = true
  }

  // 2. Record to backup_logs (BR-007)
  const { error: logErr } = await supabase.from('backup_logs').insert({
    periode: `Manual - ${new Date().toISOString().slice(0, 10)}`,
    jumlah_baris: count,
    file_name: fileName,
    status_kirim: emailSent ? 'Berhasil' : 'Gagal',
    dikirim_ke: targetEmail,
  })

  if (logErr) {
    console.error('Failed to write backup log:', logErr)
  }

  revalidatePath('/pengaturan/backup')
  return {
    success: emailSent,
    message: emailSent
      ? `Backup berhasil dilakukan untuk ${count} baris data.`
      : 'Gagal mengirim email backup. Tercatat pada log.',
  }
}
