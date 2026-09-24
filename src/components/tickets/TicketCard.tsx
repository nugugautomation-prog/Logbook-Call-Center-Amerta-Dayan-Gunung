'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { updateTicketStatus } from '@/lib/tickets/update-actions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Image, X, Check } from 'lucide-react'

interface TicketCardProps {
  ticket: {
    id: string
    ticket_number: string
    timestamp: string
    customer_id_input?: string | null
    customer_name: string
    customer_phone: string | null
    channel: string
    status: 'Berjalan' | 'Selesai'
    created_at: string
    screenshot_path?: string | null
    kecamatan?: { nama_kecamatan: string } | null
    desa?: { nama_desa: string } | null
    kategori?: { nama: string } | null
    tujuan?: { nama: string } | null
  }
  onStatusUpdated?: () => void
}

export function TicketCard({ ticket, onStatusUpdated }: TicketCardProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState(ticket.status)
  const [showImageModal, setShowImageModal] = useState(false)

  const isSelesai = localStatus === 'Selesai'

  async function handleMarkSelesai() {
    setIsUpdating(true)
    setError(null)
    try {
      const result = await updateTicketStatus(ticket.id, 'Selesai')
      if (result.success) {
        setLocalStatus('Selesai')
        setShowConfirm(false)
        onStatusUpdated?.()
        router.refresh()
      } else {
        setError(result.error || 'Gagal mengubah status tiket')
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kendala saat memperbarui status')
    } finally {
      setIsUpdating(false)
    }
  }

  const wilayah = [ticket.kecamatan?.nama_kecamatan, ticket.desa?.nama_desa]
    .filter(Boolean)
    .join(' / ')

  return (
    <>
      <article className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
          <Link
            href={`/tiket/${ticket.id}`}
            className="font-mono text-sm font-semibold text-[#1B4F8A] hover:underline"
          >
            {ticket.ticket_number}
          </Link>
          <Badge variant={isSelesai ? 'success' : 'warning'}>
            {localStatus}
          </Badge>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-[#1A202C]">{ticket.customer_name}</p>
                {ticket.customer_id_input && (
                  <span className="font-mono text-xs bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] px-1.5 py-0.5 rounded font-medium">
                    ID: {ticket.customer_id_input}
                  </span>
                )}
              </div>
              {ticket.customer_phone && (
                <p className="text-sm text-[#718096]">{ticket.customer_phone}</p>
              )}
            </div>

            {ticket.screenshot_path && (
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="shrink-0 group relative rounded-lg overflow-hidden border border-[#CBD5E1] p-0.5 hover:border-[#1B4F8A] transition-colors"
                title="Lihat screenshot chat"
              >
                <img
                  src={ticket.screenshot_path}
                  alt="Bukti chat"
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                  <Image size={14} aria-hidden="true" />
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#EFF6FF] text-[#1B4F8A] border border-[#BFDBFE]">
              {ticket.channel}
            </span>
            {ticket.kategori && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#F5F7FA] text-[#718096] border border-[#E2E8F0]">
                {ticket.kategori.nama}
              </span>
            )}
          </div>

          {wilayah && (
            <p className="text-xs text-[#718096] flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {wilayah}
            </p>
          )}

          <p className="text-xs text-[#718096]">
            {format(new Date(ticket.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })}
          </p>
        </div>

        {/* Action */}
        {!isSelesai ? (
          <div className="px-4 py-3 border-t border-[#E2E8F0]">
            {!showConfirm ? (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  setError(null)
                  setShowConfirm(true)
                }}
              >
                Tandai Selesai
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                {error && (
                  <div
                    role="alert"
                    className="p-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626] text-center"
                  >
                    {error}
                  </div>
                )}
                <p className="text-xs text-[#718096] text-center">
                  Yakin tandai tiket ini sebagai Selesai? Tindakan tidak dapat dibalik.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setError(null)
                      setShowConfirm(false)
                    }}
                    disabled={isUpdating}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={isUpdating}
                    onClick={handleMarkSelesai}
                    className="!bg-[#16A34A] hover:!bg-[#15803D]"
                  >
                    Ya, Selesai
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5 text-[#16A34A] font-medium">
              <Check size={14} className="stroke-[2.5]" aria-hidden="true" />
              Selesai (Terkunci BR-002)
            </span>
            <Link
              href={`/tiket/${ticket.id}`}
              className="text-[#1B4F8A] hover:underline font-semibold"
            >
              Lihat Detail &rarr;
            </Link>
          </div>
        )}
      </article>

      {/* Modal Lightbox Screenshot */}
      {showImageModal && ticket.screenshot_path && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#1A202C]">
                Bukti Screenshot Chat — {ticket.ticket_number}
              </p>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="p-2 max-h-[75vh] overflow-auto flex justify-center">
              <img
                src={ticket.screenshot_path}
                alt="Screenshot chat ukuran penuh"
                className="max-w-full h-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
