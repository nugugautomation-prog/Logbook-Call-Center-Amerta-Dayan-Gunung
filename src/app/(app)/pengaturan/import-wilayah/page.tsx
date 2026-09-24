'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { parseWilayahExcel, type ParseWilayahResult } from '@/lib/import/wilayah-parser'
import { applyWilayahImport, syncDefaultWilayah } from '@/lib/settings/wilayah-actions'
import { saveWilayahMeta, getMasterMeta, type MasterMeta } from '@/lib/offline/customer-db'
import { UploadCloud, CheckCircle, MapPin, ArrowRight, ArrowLeft, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

export default function ImportWilayahPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [parseResult, setParseResult] = useState<ParseWilayahResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [currentMeta, setCurrentMeta] = useState<MasterMeta | null>(null)

  useEffect(() => {
    getMasterMeta('wilayah').then(setCurrentMeta)
  }, [successMsg])

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setParseError(null)
    setParseResult(null)
    setSuccessMsg(null)
    setIsParsing(true)

    try {
      const res = await parseWilayahExcel(selected)
      setParseResult(res)
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Gagal membaca file Excel wilayah.')
    } finally {
      setIsParsing(false)
    }
  }

  async function handleApply() {
    if (!parseResult) return
    setIsApplying(true)
    setParseError(null)

    try {
      const res = await applyWilayahImport(parseResult.kecamatanList, parseResult.desaList)
      if (res.success) {
        await saveWilayahMeta(file ? file.name : 'Master Wilayah.xlsx', parseResult.kecamatanList.length + parseResult.desaList.length)
        setSuccessMsg(res.message || 'Data wilayah berhasil diterapkan ke sistem.')
      } else {
        setParseError(res.error || 'Gagal menerapkan data wilayah.')
      }
    } catch {
      setParseError('Terjadi kegagalan saat menyimpan data ke database.')
    } finally {
      setIsApplying(false)
    }
  }

  async function handleQuickSync() {
    setIsApplying(true)
    setParseError(null)
    try {
      const res = await syncDefaultWilayah()
      if (res.success) {
        await saveWilayahMeta('Master Wilayah.xlsx (5 Cabang Resmi PDAM)', 36)
        setSuccessMsg(res.message || '5 Kecamatan dan 31 Desa resmi PDAM berhasil disinkronkan!')
      } else {
        setParseError('Gagal menyinkronkan data wilayah bawaan.')
      }
    } catch {
      setParseError('Terjadi kesalahan saat memproses data.')
    } finally {
      setIsApplying(false)
    }
  }

  function handleReset() {
    setFile(null)
    setParseResult(null)
    setParseError(null)
    setSuccessMsg(null)
  }

  return (
    <AppShell title="Impor Master Wilayah (Excel)">
      <div className="space-y-4">
        {/* Banner Status Data Master Wilayah Saat Ini */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A] text-white flex items-center justify-center shrink-0">
              <MapPin size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#15803D]">
                Data Master Wilayah Saat Ini:
              </p>
              <h3 className="text-sm font-bold text-[#14532D]">
                {currentMeta ? currentMeta.fileName : 'Master Wilayah.xlsx (5 Cabang Resmi PDAM)'}
              </h3>
              <p className="text-[11px] text-[#166534] flex items-center gap-1 mt-0.5">
                <Clock size={11} aria-hidden="true" />
                {currentMeta
                  ? `Diterapkan pada ${format(new Date(currentMeta.uploadedAt), 'dd MMMM yyyy, HH:mm', { locale: id })}`
                  : '5 Cabang / Kecamatan & 31 Desa aktif'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#15803D] border border-[#86EFAC] shrink-0">
            5 Cabang Aktif
          </span>
        </div>

        {/* Tombol Sinkronisasi Cepat Bawaan */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#1B4F8A]">
              Gunakan Master Wilayah Bawaan PDAM
            </p>
            <p className="text-xs text-[#718096] mt-0.5">
              Langsung isi 5 Kecamatan (Tanjung, Pemenang, Bayan, Kayangan, Gangga) & 31 Desa sesuai Master Wilayah.xlsx
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleQuickSync}
            loading={isApplying}
            disabled={isApplying || Boolean(successMsg)}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Sinkronkan Langsung
          </Button>
        </div>

        {successMsg ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1A202C]">
                Data Wilayah Berhasil Disimpan
              </h2>
              <p className="text-xs text-[#718096] mt-1">{successMsg}</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="secondary" onClick={handleReset}>
                Impor File Lain
              </Button>
              <Link href="/pengaturan">
                <Button>Lihat di Pengaturan</Button>
              </Link>
            </div>
          </div>
        ) : parseResult && file ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                <p className="text-xs text-[#718096]">Kecamatan Terdeteksi</p>
                <p className="text-xl font-bold text-[#1B4F8A]">
                  {parseResult.kecamatanList.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                <p className="text-xs text-[#718096]">Desa Terdeteksi</p>
                <p className="text-xl font-bold text-[#16A34A]">
                  {parseResult.desaList.length}
                </p>
              </div>
            </div>

            {parseError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#DC2626]">
                {parseError}
              </div>
            )}

            {/* List Preview */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#1A202C] mb-2 pb-1 border-b">
                Daftar Wilayah yang Akan Diterapkan:
              </p>
              {parseResult.desaList.map((d) => (
                <div key={`${d.kode_kecamatan}_${d.kode_desa}`} className="py-2 text-xs flex justify-between">
                  <div>
                    <span className="font-semibold text-[#1A202C]">{d.nama_desa}</span>
                    <p className="text-[#718096]">Kec. {d.nama_kecamatan} (Kode: {d.kode_kecamatan})</p>
                  </div>
                  <span className="font-mono text-[#1B4F8A] bg-[#EFF6FF] px-2 py-0.5 rounded text-[11px] h-fit">
                    Desa {d.kode_desa}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleReset} disabled={isApplying}>
                <ArrowLeft size={16} aria-hidden="true" />
                Batal
              </Button>
              <Button fullWidth onClick={handleApply} loading={isApplying}>
                Terapkan ke Database
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#EFF6FF] text-[#1B4F8A] rounded-xl">
                <MapPin size={24} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1A202C]">Unggah Master Wilayah Excel</h2>
                <p className="text-xs text-[#718096]">
                  File Excel (.xlsx) daftar kecamatan dan desa resmi PDAM
                </p>
              </div>
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
                {isParsing ? 'Sedang membaca file wilayah...' : 'Pilih atau Tarik File Master Wilayah.xlsx ke Sini'}
              </p>
              <p className="text-xs text-[#718096] mt-1">Mendukung format kolom Kecamatan & Desa</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
