'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { applyCustomerImportBatch } from '@/lib/import/actions'
import { saveCustomersToIndexedDB } from '@/lib/offline/customer-db'
import type { ParseResult } from '@/lib/import/parser'

interface ImportPreviewProps {
  fileName: string
  parseResult: ParseResult
  onCancel: () => void
  onSuccess: (batchId: string) => void
}

export function ImportPreview({ fileName, parseResult, onCancel, onSuccess }: ImportPreviewProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'error'>('all')

  const displayedRows = parseResult.rows.filter((r) => {
    if (filterMode === 'valid') return r.isValid
    if (filterMode === 'error') return !r.isValid
    return true
  })

  async function handleApply() {
    if (parseResult.validCount === 0) {
      setError('Tidak ada data valid yang dapat diterapkan.')
      return
    }

    if (
      !confirm(
        `Konfirmasi: Anda akan menerapkan ${parseResult.validCount} data pelanggan ke sistem. Lanjutkan?`
      )
    ) {
      return
    }

    setIsApplying(true)
    setError(null)

    try {
      const validRowsOnly = parseResult.rows
        .filter((r) => r.isValid)
        .map((r) => ({
          customerId: r.customerId,
          nama: r.nama,
          alamatDetail: r.alamatDetail,
          noHp: r.noHp,
          golongan: r.golongan,
          koordinatAsli: r.koordinatAsli,
          latitude: r.latitude,
          longitude: r.longitude,
          kecamatanId: r.kecamatanId,
          desaId: r.desaId,
        }))

      const errorSummary = parseResult.rows
        .filter((r) => !r.isValid)
        .slice(0, 10)
        .map((r) => `Baris ${r.rowIndex}: ${r.errorReason}`)
        .join('; ')

      // Kirim sample/chunk ke server action
      const sampleValidRows = validRowsOnly.slice(0, 1000)

      const res = await applyCustomerImportBatch(
        fileName,
        parseResult.totalRows,
        sampleValidRows,
        parseResult.errorCount,
        errorSummary
      )

      if (res.success && res.batchId) {
        // Simpan seluruh data pelanggan valid ke IndexedDB agar semua ID bisa diautofill
        try {
          await saveCustomersToIndexedDB(validRowsOnly, fileName)
        } catch (idbErr) {
          console.warn('Gagal menyimpan ke IndexedDB:', idbErr)
        }

        // Simpan sample cepat ke local storage
        try {
          const quickCache: Record<string, any> = {}
          validRowsOnly.slice(0, 1000).forEach((c) => {
            quickCache[c.customerId] = {
              nama: c.nama,
              alamat: c.alamatDetail,
              noHp: c.noHp,
              golongan: c.golongan,
              latitude: c.latitude,
              longitude: c.longitude,
            }
          })
          localStorage.setItem('pdam_cached_customers', JSON.stringify(quickCache))
        } catch {
          // Ignore localStorage quota errors
        }
        onSuccess(res.batchId)
      } else {
        setError(res.error || 'Gagal menerapkan impor data.')
      }
    } catch (err: unknown) {
      console.error('Import error details:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan data.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
          <p className="text-xs text-[#718096]">Total Baris</p>
          <p className="text-lg font-bold text-[#1A202C]">{parseResult.totalRows}</p>
        </div>
        <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#BBF7D0] text-center">
          <p className="text-xs text-[#16A34A] flex items-center justify-center gap-1">
            <CheckCircle2 size={12} aria-hidden="true" /> Valid
          </p>
          <p className="text-lg font-bold text-[#16A34A]">{parseResult.validCount}</p>
        </div>
        <div className="bg-[#FEF2F2] p-3 rounded-xl border border-[#FECACA] text-center">
          <p className="text-xs text-[#DC2626] flex items-center justify-center gap-1">
            <AlertTriangle size={12} aria-hidden="true" /> Error
          </p>
          <p className="text-lg font-bold text-[#DC2626]">{parseResult.errorCount}</p>
        </div>
      </div>

      {parseResult.errorCount > 0 && (
        <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E]">
          <strong>Peringatan:</strong> Ada {parseResult.errorCount} baris yang tidak dapat diterapkan
          (misal format ID bukan 9 digit atau kode kecamatan/desa belum terdaftar di master). Baris
          error akan dilewati saat Anda menekan tombol Terapkan.
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626]">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'valid', 'error'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setFilterMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border min-h-[44px] transition-colors ${
              filterMode === m
                ? 'bg-[#1B4F8A] text-white border-[#1B4F8A]'
                : 'bg-white text-[#718096] border-[#E2E8F0]'
            }`}
          >
            {m === 'all' ? 'Semua Baris' : m === 'valid' ? 'Baris Valid' : 'Baris Bermasalah'}
          </button>
        ))}
      </div>

      {/* Row details list */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] max-h-96 overflow-y-auto">
        {displayedRows.length === 0 ? (
          <p className="p-4 text-xs text-[#718096] text-center">Tidak ada baris pada kategori ini.</p>
        ) : (
          displayedRows.slice(0, 50).map((r) => (
            <div key={r.rowIndex} className="p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#1B4F8A]">
                  #{r.rowIndex} — {r.customerId || '(Tanpa ID)'}
                </span>
                <Badge variant={r.isValid ? 'success' : 'error'}>
                  {r.isValid ? 'Valid' : 'Gagal'}
                </Badge>
              </div>
              <p className="font-medium text-[#1A202C]">{r.nama}</p>
              <p className="text-[#718096]">
                Wilayah:{' '}
                {r.kecamatanNama ? `${r.kecamatanNama} / ${r.desaNama || '-'}` : '(Tidak terdeteksi)'}
              </p>
              {r.latitude && r.longitude ? (
                <p className="text-[#718096] font-mono">
                  Koordinat: {r.latitude}, {r.longitude}
                </p>
              ) : null}
              {!r.isValid && <p className="text-[#DC2626] font-medium">{r.errorReason}</p>}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={isApplying}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Batalkan
        </Button>
        <Button
          type="button"
          fullWidth
          loading={isApplying}
          onClick={handleApply}
          disabled={parseResult.validCount === 0}
        >
          Terapkan ({parseResult.validCount} Data)
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
