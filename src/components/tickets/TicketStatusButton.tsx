'use client'

import { useState } from 'react'
import { updateTicketStatus } from '@/lib/tickets/update-actions'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TicketStatusButtonProps {
  ticketId: string
  isSelesai: boolean
}

export function TicketStatusButton({ ticketId, isSelesai }: TicketStatusButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  if (isSelesai) {
    return (
      <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
        <Check size={14} aria-hidden="true" /> Terkunci (Selesai)
      </span>
    )
  }

  async function handleSelesaikan() {
    setLoading(true)
    setError(null)
    try {
      const res = await updateTicketStatus(ticketId, 'Selesai')
      if (!res.success) {
        setError(res.error || 'Gagal mengubah status')
      } else {
        setShowConfirm(false)
        router.refresh()
      }
    } catch {
      setError('Terjadi kendala saat memperbarui status.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </span>
      )}

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D] active:bg-[#166534] min-h-[36px] flex items-center gap-1.5 transition-colors"
        >
          <Check size={14} aria-hidden="true" />
          Selesaikan Tiket
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] p-2 rounded-lg text-xs">
          <span className="text-[#92400E]">Kunci status ke Selesai?</span>
          <button
            type="button"
            disabled={loading}
            onClick={handleSelesaikan}
            className="px-2.5 py-1 bg-[#16A34A] text-white font-semibold rounded hover:bg-[#15803D] disabled:opacity-50 min-h-[32px] flex items-center gap-1"
          >
            {loading && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
            Ya, Selesai
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowConfirm(false)}
            className="px-2 py-1 bg-white text-[#475569] font-medium rounded border border-[#CBD5E1] hover:bg-[#F8FAFC] min-h-[32px]"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  )
}
