import { AppShell } from '@/components/layout/AppShell'
import { getTicketById } from '@/lib/tickets/actions'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Phone, User, Tag, HelpCircle, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'

import { TicketStatusButton } from '@/components/tickets/TicketStatusButton'

interface TicketDetailPageProps {
  params: {
    id: string
  }
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { data: ticket, error } = await getTicketById(params.id)

  if (error || !ticket) {
    notFound()
  }

  const isSelesai = ticket.status === 'Selesai'

  return (
    <AppShell
      title={`Tiket ${ticket.ticket_number}`}
      action={
        <Link
          href="/tiket"
          className="text-xs flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-lg"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Kembali
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#718096]">Status Tiket (BR-002)</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-base font-bold text-[#1A202C]">
                {ticket.status}
              </p>
              <Badge variant={isSelesai ? 'success' : 'warning'}>
                {ticket.status}
              </Badge>
            </div>
          </div>
          <TicketStatusButton ticketId={ticket.id} isSelesai={isSelesai} />
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1A202C] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
            <User size={16} className="text-[#1B4F8A]" aria-hidden="true" />
            Informasi Pelanggan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[#718096]">Nama Pelanggan</p>
              <p className="font-semibold text-[#1A202C] mt-0.5">{ticket.customer_name}</p>
            </div>

            <div>
              <p className="text-[#718096]">ID Pelanggan</p>
              <p className="font-mono text-[#1A202C] mt-0.5">{ticket.customer_id_input || '-'}</p>
            </div>

            <div>
              <p className="text-[#718096]">Nomor Kontak</p>
              <p className="font-medium text-[#1A202C] mt-0.5 flex items-center gap-1">
                <Phone size={12} className="text-[#718096]" aria-hidden="true" />
                {ticket.customer_phone || '-'}
              </p>
            </div>

            <div>
              <p className="text-[#718096]">Kanal Komunikasi</p>
              <p className="font-medium text-[#1A202C] mt-0.5">{ticket.channel}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[#718096]">Alamat & Wilayah</p>
              <p className="text-[#1A202C] mt-0.5 flex items-start gap-1">
                <MapPin size={14} className="text-[#718096] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {ticket.alamat_detail || '-'}{' '}
                  {ticket.kecamatan?.nama_kecamatan ? `(Kec. ${ticket.kecamatan.nama_kecamatan}` : ''}
                  {ticket.desa?.nama_desa ? `, Desa ${ticket.desa.nama_desa})` : ticket.kecamatan?.nama_kecamatan ? ')' : ''}
                </span>
              </p>
              {ticket.latitude && ticket.longitude && (
                <p className="text-[#718096] font-mono text-[11px] mt-1 pl-4">
                  Titik Koordinat: {ticket.latitude}, {ticket.longitude}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Complaint / Interaction details */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1A202C] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
            <Tag size={16} className="text-[#1B4F8A]" aria-hidden="true" />
            Detail Interaksi & Penanganan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[#718096]">Jenis Interaksi</p>
              <p className="font-medium text-[#1A202C] mt-0.5">{ticket.jenis_interaksi?.nama || '-'}</p>
            </div>

            <div>
              <p className="text-[#718096]">Kategori Aduan</p>
              <p className="font-medium text-[#1A202C] mt-0.5">{ticket.kategori?.nama || '-'}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[#718096]">Tujuan Penanganan (Eskalasi)</p>
              <p className="font-medium text-[#1A202C] mt-0.5">{ticket.tujuan?.nama || '-'}</p>
            </div>

            {ticket.detail && (
              <div className="sm:col-span-2 bg-[#F5F7FA] p-3 rounded-lg border border-[#E2E8F0]">
                <p className="text-[#718096] mb-1 font-medium">Uraian Masalah / Catatan:</p>
                <p className="text-[#1A202C] whitespace-pre-wrap">{ticket.detail}</p>
              </div>
            )}

            <div>
              <p className="text-[#718096]">Waktu Lapor</p>
              <p className="font-medium text-[#1A202C] mt-0.5 flex items-center gap-1">
                <Clock size={12} className="text-[#718096]" aria-hidden="true" />
                {format(new Date(ticket.timestamp), 'dd MMMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>

            {ticket.screenshot_path && (
              <div className="sm:col-span-2 pt-2 border-t border-[#E2E8F0]">
                <p className="text-[#718096] mb-2 font-medium">Bukti Screenshot Chat:</p>
                <div className="max-w-md rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#F8FAFC] p-2">
                  <img
                    src={ticket.screenshot_path}
                    alt="Screenshot chat"
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit trail / Riwayat Status (BR-006 & ADT-001) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1A202C] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-[#16A34A]" aria-hidden="true" />
            Riwayat Status & Audit Trail BPK (ADT-001)
          </h2>

          <div className="space-y-2">
            {(ticket.riwayat || []).length === 0 ? (
              <p className="text-xs text-[#718096]">Tidak ada perubahan status tambahan.</p>
            ) : (
              ticket.riwayat.map((r: { id: string; status_sebelumnya: string | null; status_baru: string; changed_at: string; catatan: string | null }) => (
                <div key={r.id} className="text-xs p-2.5 bg-[#F5F7FA] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[#1A202C]">
                      {r.status_sebelumnya ? `${r.status_sebelumnya} ➔ ${r.status_baru}` : `Dibuat (${r.status_baru})`}
                    </span>
                    {r.catatan && <p className="text-[#718096] mt-0.5">{r.catatan}</p>}
                  </div>
                  <span className="text-[11px] text-[#718096] font-mono">
                    {format(new Date(r.changed_at), 'dd/MM/yy HH:mm')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
