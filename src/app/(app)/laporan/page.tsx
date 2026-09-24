'use client'
import { useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'

type Preset = 'today' | 'week' | 'month' | 'custom'

function getPresetDates(preset: Preset): { start: string; end: string } {
  const today = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

  switch (preset) {
    case 'today':
      return { start: fmt(today), end: fmt(today) }
    case 'week': {
      const mon = startOfWeek(today, { weekStartsOn: 1 })
      return { start: fmt(mon), end: fmt(endOfWeek(today, { weekStartsOn: 1 })) }
    }
    case 'month':
      return { start: fmt(startOfMonth(today)), end: fmt(endOfMonth(today)) }
    case 'custom':
      return { start: fmt(subDays(today, 30)), end: fmt(today) }
  }
}

export default function LaporanPage() {
  const [preset, setPreset] = useState<Preset>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    const { start, end } =
      preset === 'custom'
        ? { start: customStart, end: customEnd }
        : getPresetDates(preset)

    if (!start || !end) {
      setError('Pilih rentang tanggal terlebih dahulu')
      return
    }

    setError(null)
    setDownloading(true)

    try {
      const url = `/api/laporan/export?start=${start}&end=${end}`
      const resp = await fetch(url)

      if (!resp.ok) {
        throw new Error('Gagal mengunduh laporan')
      }

      const blob = await resp.blob()
      const blobUrl = URL.createObjectURL(blob)

      // Trigger download — works on mobile Safari & Firefox Android via blob
      const a = document.createElement('a')
      a.href = blobUrl
      a.download =
        resp.headers
          .get('Content-Disposition')
          ?.match(/filename="([^"]+)"/)?.[1] ??
        `Rekap-CallCenter-${start}_${end}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError('Gagal mengunduh laporan. Silakan coba lagi.')
    } finally {
      setDownloading(false)
    }
  }

  const presets: Array<{ value: Preset; label: string }> = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'custom', label: 'Kustom' },
  ]

  return (
    <AppShell title="Laporan Excel">
      <div className="flex flex-col gap-5">
        {/* Info card */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
          <p className="text-sm font-medium text-[#1B4F8A] mb-1">Format Laporan</p>
          <ul className="text-sm text-[#1A202C] space-y-0.5 list-disc list-inside">
            <li>Sheet 1: Kop & Ringkasan</li>
            <li>Sheet 2: Data Rinci semua tiket</li>
            <li>Sheet 3: Rekap per Tujuan Penanganan</li>
          </ul>
          <p className="text-xs text-[#718096] mt-2">Siap cetak dan ditandatangani</p>
        </div>

        {/* Period selection */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <p className="text-sm font-semibold text-[#1A202C] mb-3">Pilih Periode</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border min-h-[44px] transition-colors ${
                  preset === p.value
                    ? 'bg-[#1B4F8A] text-white border-[#1B4F8A]'
                    : 'bg-white text-[#718096] border-[#E2E8F0] hover:border-[#1B4F8A]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-[#1A202C] mb-1 block">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1A202C] mb-1 block">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  min={customStart}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Download button */}
        <Button
          onClick={handleDownload}
          loading={downloading}
          fullWidth
          size="lg"
        >
          <Download size={18} aria-hidden="true" />
          Unduh Laporan Excel
        </Button>

        <p className="text-xs text-[#718096] text-center">
          File akan terunduh otomatis ke perangkat Anda
        </p>
      </div>
    </AppShell>
  )
}
