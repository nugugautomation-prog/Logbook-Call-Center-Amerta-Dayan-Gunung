import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@pdam.example.com'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Tickets still in 'Berjalan' status and created > 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: tickets, error: fetchErr } = await supabase
      .from('tickets')
      .select('ticket_number, customer_name, channel, created_at')
      .eq('status', 'Berjalan')
      .lte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: true })

    if (fetchErr) {
      throw fetchErr
    }

    const count = tickets?.length ?? 0
    if (count === 0 || !resendApiKey) {
      return new Response(JSON.stringify({ message: 'No hanging tickets or no API key', count }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const ticketListStr = tickets
      .map(
        (t) =>
          `- ${t.ticket_number}: ${t.customer_name} (${t.channel}) - dibuat sejak ${t.created_at.slice(0, 10)}`
      )
      .join('\n')

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PDAM Call Center <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[Pengingat Mingguan] Ada ${count} Tiket Belum Selesai (> 7 Hari)`,
        text: `Halo Admin Call Center,\n\nTerdapat ${count} tiket yang masih berstatus "Berjalan" selama lebih dari 7 hari:\n\n${ticketListStr}\n\nSilakan periksa dan eskalasi atau konfirmasi penyelesaian tiket tersebut di aplikasi.`,
      }),
    })

    return new Response(JSON.stringify({ success: true, count }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
