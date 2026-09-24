'use client'

import { AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface WeeklyReminderBannerProps {
  hangingCount: number
}

export function WeeklyReminderBanner({ hangingCount }: WeeklyReminderBannerProps) {
  if (hangingCount <= 0) return null

  return (
    <div
      role="alert"
      className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-[#92400E] shadow-sm mb-4"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 bg-[#FEF3C7] text-[#D97706] rounded-lg shrink-0">
          <AlertTriangle size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-[#78350F]">
            Pengingat Mingguan: {hangingCount} Tiket Menggantung
          </p>
          <p className="text-[#92400E] mt-0.5">
            Terdapat tiket berstatus Berjalan lebih dari 7 hari yang memerlukan tindak lanjut.
          </p>
        </div>
      </div>
      <a
        href="#aging-report"
        className="shrink-0 p-2 text-[#D97706] hover:text-[#92400E] font-medium flex items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center"
      >
        Lihat <ChevronRight size={14} aria-hidden="true" />
      </a>
    </div>
  )
}
