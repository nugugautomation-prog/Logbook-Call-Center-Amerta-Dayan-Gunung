import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@pdam.example.com'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch tickets created in the last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: tickets, error: fetchErr } = await supabase
      .from('tickets')
      .select('ticket_number, timestamp, customer_name, customer_phone, channel, status')
      .gte('created_at', yesterday)

    if (fetchErr) {
      throw fetchErr
    }

    const count = tickets?.length ?? 0
    const todayStr = new Date().toISOString().slice(0, 10)
    const fileName = `backup-harian-${todayStr}.csv`

    const headers = ['Nomor Tiket', 'Timestamp', 'Nama', 'No HP', 'Kanal', 'Status']
    const csvRows = (tickets || []).map((t) => [
      t.ticket_number,
      t.timestamp,
      `"${(t.customer_name || '').replace(/"/g, '""')}"`,
      t.customer_phone || '',
      t.channel,
      t.status,
    ])
    const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n')

    let isSuccess = true
    if (resendApiKey) {
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PDAM Call Center <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `[Otomatis] Backup Harian Logbook PDAM - ${todayStr}`,
          text: `Halo Admin, terlampir backup data tiket harian sebanyak ${count} tiket.`,
          attachments: [
            {
              filename: fileName,
              content: btoa(csvContent),
            },
          ],
        }),
      })

      isSuccess = emailResp.ok
    }

    // Record log
    await supabase.from('backup_logs').insert({
      periode: `Harian - ${todayStr}`,
      jumlah_baris: count,
      file_name: fileName,
      status_kirim: isSuccess ? 'Berhasil' : 'Gagal',
      dikirim_ke: adminEmail,
    })

    return new Response(JSON.stringify({ success: isSuccess, count }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
