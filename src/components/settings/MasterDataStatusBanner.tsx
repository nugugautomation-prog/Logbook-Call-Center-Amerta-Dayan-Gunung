'use client'

import { useState, useEffect } from 'react'
import { getMasterMeta, type MasterMeta } from '@/lib/offline/customer-db'
import { FileSpreadsheet, MapPin, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

export function MasterDataStatusBanner() {
  const [pelangganMeta, setPelangganMeta] = useState<MasterMeta | null>(null)
  const [wilayahMeta, setWilayahMeta] = useState<MasterMeta | null>(null)

  useEffect(() => {
    async function loadMeta() {
      const p = await getMasterMeta('pelanggan')
      const w = await getMasterMeta('wilayah')
      setPelangganMeta(p)
      setWilayahMeta(w)
    }
    loadMeta()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
      {/* Status Master Pelanggan */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1B4F8A] flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#718096] font-medium">Master Data Pelanggan</p>
              <h3 className="text-sm font-bold text-[#1A202C]">
                {pelangganMeta ? pelangganMeta.fileName : 'Master Pelanggan.xlsx (Bawaan)'}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
            <CheckCircle2 size={12} aria-hidden="true" /> Aktif
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {pelangganMeta
              ? format(new Date(pelangganMeta.uploadedAt), 'dd MMM yyyy, HH:mm', { locale: id })
              : 'Data bawaan tersinkron'}
          </span>
          <span className="font-semibold text-[#1B4F8A]">
            {pelangganMeta ? `${pelangganMeta.count.toLocaleString('id-ID')} Pelanggan` : '23.679 Pelanggan'}
          </span>
        </div>

        <div className="mt-2 text-right">
          <Link
            href="/pengaturan/import-pelanggan"
            className="text-xs text-[#2E7FD9] hover:underline font-medium inline-flex items-center"
          >
            Perbarui / Impor Ulang Excel &rarr;
          </Link>
        </div>
      </div>

      {/* Status Master Wilayah */}
      <div className="bg-white rounded-xl border border-[#CBD5E1] p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
              <MapPin size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#718096] font-medium">Master Data Wilayah PDAM</p>
              <h3 className="text-sm font-bold text-[#1A202C]">
                {wilayahMeta ? wilayahMeta.fileName : 'Master Wilayah.xlsx (5 Cabang)'}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
            <CheckCircle2 size={12} aria-hidden="true" /> Aktif
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {wilayahMeta
              ? format(new Date(wilayahMeta.uploadedAt), 'dd MMM yyyy, HH:mm', { locale: id })
              : '5 Kecamatan & 31 Desa Resmi'}
          </span>
          <span className="font-semibold text-[#16A34A]">
            5 Cabang Terlayani
          </span>
        </div>

        <div className="mt-2 text-right">
          <Link
            href="/pengaturan/import-wilayah"
            className="text-xs text-[#2E7FD9] hover:underline font-medium inline-flex items-center"
          >
            Sinkronkan Wilayah &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
