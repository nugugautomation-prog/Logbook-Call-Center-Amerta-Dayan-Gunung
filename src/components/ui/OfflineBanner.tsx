'use client'
import { useEffect, useState } from 'react'
import { syncPendingTickets } from '@/lib/offline/sync'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsOffline(!navigator.onLine)

    const handleOnline = async () => {
      setIsOffline(false)
      setSyncing(true)
      const result = await syncPendingTickets()
      setSyncing(false)
      if (result.synced > 0) {
        setSyncResult(result)
        setTimeout(() => setSyncResult(null), 5000)
      }
    }

    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline && !syncing && !syncResult) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-14 inset-x-0 z-50 px-4 py-2.5 text-sm text-center font-medium transition-colors ${
        isOffline
          ? 'bg-[#D97706] text-white'
          : 'bg-[#16A34A] text-white'
      }`}
    >
      {isOffline && 'Offline - Data tersimpan lokal, akan sinkron saat online'}
      {syncing && 'Menyinkronkan data...'}
      {syncResult && !syncing && `${syncResult.synced} tiket berhasil disinkronkan`}
    </div>
  )
}
