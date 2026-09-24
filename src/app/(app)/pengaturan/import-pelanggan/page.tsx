'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ImportPreview } from '@/components/import/ImportPreview'
import { parseCustomerExcel, type ParseResult } from '@/lib/import/parser'
import { getMasterMeta, type MasterMeta } from '@/lib/offline/customer-db'
import { UploadCloud, CheckCircle, FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

export default function ImportPelangganPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [successBatchId, setSuccessBatchId] = useState<string | null>(null)
  const [currentMeta, setCurrentMeta] = useState<MasterMeta | null>(null)

  useEffect(() => {
    getMasterMeta('pelanggan').then(setCurrentMeta)
  }, [successBatchId])

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setParseError(null)
    setParseResult(null)
    setIsParsing(true)

    try {
      const res = await parseCustomerExcel(selected)
      setParseResult(res)
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Gagal memproses file Excel.')
    } finally {
      setIsParsing(false)
    }
  }

  function handleReset() {
    setFile(null)
    setParseResult(null)
    setParseError(null)
    setSuccessBatchId(null)
  }

  return (
    <AppShell title="Impor Data Pelanggan">
      <div className="space-y-4">
        {/* Banner Status Data Master yang Sedang Digunakan */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A] text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#15803D]">
                Data Master Pelanggan Saat Ini:
              </p>
              <h3 className="text-sm font-bold text-[#14532D]">
                {currentMeta ? currentMeta.fileName : 'Master Pelanggan.xlsx (Bawaan)'}
              </h3>
              <p className="text-[11px] text-[#166534] flex items-center gap-1 mt-0.5">
                <Clock size={11} aria-hidden="true" />
                {currentMeta
                  ? `Diterapkan pada ${format(new Date(currentMeta.uploadedAt), 'dd MMMM yyyy, HH:mm', { locale: id })}`
                  : '23.679 pelanggan aktif siap digunakan'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#15803D] border border-[#86EFAC] shrink-0">
            {currentMeta ? `${currentMeta.count.toLocaleString('id-ID')} Data` : '23.679 Data'}
          </span>
        </div>
        {successBatchId ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1A202C]">
                Data Pelanggan Berhasil Diterapkan
              </h2>
              <p className="text-xs text-[#718096] mt-1">
                Data master pelanggan telah diperbarui dan langsung siap digunakan untuk autofill tiket.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="secondary" onClick={handleReset}>
                Impor File Lain
              </Button>
              <Link href="/tiket/tambah">
                <Button>Input Tiket Sekarang</Button>
              </Link>
            </div>
          </div>
        ) : parseResult && file ? (
          <ImportPreview
            fileName={file.name}
            parseResult={parseResult}
            onCancel={handleReset}
            onSuccess={(batchId) => setSuccessBatchId(batchId)}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#EFF6FF] text-[#1B4F8A] rounded-xl">
                <FileSpreadsheet size={24} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1A202C]">Unggah Data Pelanggan Bulanan</h2>
                <p className="text-xs text-[#718096]">
                  File Excel (.xlsx) dari aplikasi billing pihak ketiga
                </p>
              </div>
            </div>

            <div className="bg-[#F5F7FA] p-3 rounded-lg text-xs text-[#4A5568] space-y-1">
              <p className="font-medium text-[#1A202C]">Format Kolom Excel yang Diharapkan:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-[#718096]">
                <li>Kolom A: ID Pelanggan (9 digit: 2 digit kec + 2 digit desa + 5 unik)</li>
                <li>Kolom B: Nama Pelanggan</li>
                <li>Kolom C: No. HP</li>
                <li>Kolom D: Alamat Detail</li>
                <li>Kolom E: Koordinat (contoh: -8.12345, 116.12345)</li>
                <li>Kolom F: Golongan Pelanggan (contoh: Rumah Tangga, Niaga)</li>
              </ol>
            </div>

            {parseError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626]">
                {parseError}
              </div>
            )}

            <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-8 text-center hover:border-[#1B4F8A] transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelected}
                disabled={isParsing}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud size={32} className="mx-auto text-[#718096] mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-[#1A202C]">
                {isParsing ? 'Sedang membaca dan memverifikasi...' : 'Pilih atau Tarik File Excel ke Sini'}
              </p>
              <p className="text-xs text-[#718096] mt-1">Maksimal ukuran file 10 MB</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
