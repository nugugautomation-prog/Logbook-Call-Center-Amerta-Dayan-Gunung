'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  getDashboardSummary,
  getTopWilayah,
  getRekapKecamatan,
  getAgingReport,
  getPelangganBerulang,
  getTrendHarian,
  getPeriodDates,
  type Period,
} from '@/lib/dashboard/queries'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { WeeklyReminderBanner } from '@/components/dashboard/WeeklyReminderBanner'

type DashboardData = {
  summary: Awaited<ReturnType<typeof getDashboardSummary>>
  topWilayah: Awaited<ReturnType<typeof getTopWilayah>>
  rekapKecamatan: Awaited<ReturnType<typeof getRekapKecamatan>>
  aging: Awaited<ReturnType<typeof getAgingReport>>
  berulang: Awaited<ReturnType<typeof getPelangganBerulang>>
  tren: Awaited<ReturnType<typeof getTrendHarian>>
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hari Ini',
  week: 'Minggu Ini',
  month: 'Bulan Ini',
  custom: 'Kustom',
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function loadData(p: Period) {
    setLoading(true)
    setError(false)
    try {
      const { start, end } = getPeriodDates(p)
      const [summary, topWilayah, rekapKecamatan, aging, berulang, tren] = await Promise.all([
        getDashboardSummary(start, end),
        getTopWilayah(start, end),
        getRekapKecamatan(start, end),
        getAgingReport(),
        getPelangganBerulang(),
        getTrendHarian(start, end),
      ])
      setData({ summary, topWilayah, rekapKecamatan, aging, berulang, tren })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(period)
  }, [period])

  const hangingTicketsCount = data?.aging?.filter((t) => t.hariMenggantung >= 7).length || 0

  return (
    <AppShell title="Dashboard KPI">
      {/* Weekly Reminder Banner */}
      <WeeklyReminderBanner hangingCount={hangingTicketsCount} />

      {/* Period filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border min-h-[44px] transition-colors ${
              period === p
                ? 'bg-[#1B4F8A] text-white border-[#1B4F8A]'
                : 'bg-white text-[#718096] border-[#E2E8F0] hover:border-[#1B4F8A]'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Memuat data dashboard..." />
      ) : error ? (
        <ErrorState
          message="Gagal memuat data dashboard"
          onRetry={() => loadData(period)}
        />
      ) : !data ? (
        <EmptyState message="Belum ada data untuk periode ini" />
      ) : (
        <div className="flex flex-col gap-4">
          {/* KPI Cards */}
          {data.summary && (
            <section aria-label="Ringkasan KPI">
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Total Tiket" value={data.summary.total} color="#1B4F8A" href="/tiket" />
                <KpiCard label="Masih Berjalan" value={data.summary.berjalan} color="#D97706" href="/tiket?status=Berjalan" />
                <KpiCard label="Selesai" value={data.summary.selesai} color="#16A34A" href="/tiket?status=Selesai" />
                <KpiCard
                  label="Tingkat Selesai"
                  value={
                    data.summary.total > 0
                      ? Math.round((data.summary.selesai / data.summary.total) * 100) + '%'
                      : '-'
                  }
                  color="#2E7FD9"
                  href="/tiket?status=Selesai"
                />
              </div>
            </section>
          )}

          {/* Tren Harian */}
          <section aria-label="Tren Tiket Harian" className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-semibold text-[#1A202C] mb-3">Tren Harian</h2>
            {data.tren.length === 0 ? (
              <EmptyState message="Belum ada data tren" />
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.tren} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis
                      dataKey="tanggal"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v: number) => [v, 'Tiket']}
                      labelFormatter={(l: string) => format(new Date(l), 'd MMM', { locale: id })}
                    />
                    <Line
                      type="monotone"
                      dataKey="jumlah"
                      stroke="#1B4F8A"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Top Kategori */}
          {data.summary && (
            <section aria-label="Top Kategori Aduan" className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <h2 className="text-sm font-semibold text-[#1A202C] mb-3">Top Kategori Aduan</h2>
              {data.summary.topKategori.length === 0 ? (
                <EmptyState message="Belum ada data kategori" />
              ) : (
                <div className="flex flex-col gap-2">
                  {data.summary.topKategori.map((k, i) => (
                    <Link
                      key={k.nama}
                      href={`/tiket?kategori=${encodeURIComponent(k.nama)}`}
                      className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-lg hover:bg-blue-50/60 transition-colors group cursor-pointer"
                    >
                      <span className="text-sm font-bold text-[#718096] w-5 text-right group-hover:text-[#1B4F8A]">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-[#1A202C] group-hover:text-[#1B4F8A] transition-colors">{k.nama}</span>
                          <span className="text-sm font-semibold text-[#1B4F8A] flex items-center gap-1">
                            {k.jumlah} <span className="text-[10px] text-[#718096] font-normal">&rarr;</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#F5F7FA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1B4F8A] rounded-full transition-all"
                            style={{
                              width: `${Math.round(
                                (k.jumlah / data.summary!.topKategori[0].jumlah) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Rekap 5 Cabang Pelayanan PDAM (Sesuai Master Wilayah) */}
          <section aria-label="Rekap Cabang Pelayanan PDAM" className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-semibold text-[#1A202C] mb-1">
              Cakupan Wilayah Pelayanan PDAM
            </h2>
            <p className="text-xs text-[#718096] mb-3">
              Distribusi tiket di 5 Cabang / Kecamatan (Master Wilayah)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(data.rekapKecamatan || []).map((c) => (
                <Link
                  key={c.nama}
                  href={`/tiket?kecamatan=${encodeURIComponent(c.nama)}`}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between hover:border-[#1B4F8A] hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-[#1A202C] group-hover:text-[#1B4F8A]">
                    Kec. {c.nama}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[#718096]">Aduan:</span>
                    <span className="text-xs font-bold text-[#1B4F8A]">
                      {c.jumlah} tiket &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Top Wilayah */}
          <section aria-label="Top Wilayah Komplain" className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-semibold text-[#1A202C] mb-3">Top Wilayah Komplain (Desa)</h2>
            {data.topWilayah.length === 0 ? (
              <EmptyState message="Belum ada data wilayah" />
            ) : (
              <div className="flex flex-col gap-1">
                {data.topWilayah.slice(0, 5).map((w, i) => (
                  <Link
                    key={w.desaId}
                    href={`/tiket?desa=${encodeURIComponent(w.nama)}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg border-b border-[#F5F7FA] last:border-0 hover:bg-blue-50/60 transition-colors group cursor-pointer"
                  >
                    <div>
                      <span className="text-sm font-medium text-[#1A202C] group-hover:text-[#1B4F8A] transition-colors">{i + 1}. {w.nama}</span>
                      <p className="text-xs text-[#718096]">{w.kecamatan}</p>
                    </div>
                    <Badge variant="info">{w.jumlah} tiket &rarr;</Badge>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Aging Report */}
          <section id="aging-report" aria-label="Aging Report - Tiket Menggantung" className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-semibold text-[#1A202C] mb-3">
              Aging Report
              <span className="ml-1 text-xs font-normal text-[#718096]">(tiket Berjalan terlama)</span>
            </h2>
            {data.aging.length === 0 ? (
              <EmptyState message="Tidak ada tiket yang menggantung" />
            ) : (
              <div className="flex flex-col gap-1">
                {data.aging.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tiket/${t.id}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg border-b border-[#F5F7FA] last:border-0 hover:bg-amber-50/60 transition-colors group cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-mono text-[#1B4F8A] group-hover:underline">{t.ticket_number}</p>
                      <p className="text-xs text-[#718096]">{t.customer_name}</p>
                    </div>
                    <Badge variant={t.hariMenggantung >= 7 ? 'error' : 'warning'}>
                      {t.hariMenggantung} hari &rarr;
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Pelanggan Berulang */}
          <section aria-label="Pelanggan Berulang" className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-semibold text-[#1A202C] mb-1">Pelanggan Berulang</h2>
            <p className="text-xs text-[#718096] mb-3">3+ tiket dalam 30 hari terakhir</p>
            {data.berulang.length === 0 ? (
              <EmptyState message="Belum ada pelanggan berulang" />
            ) : (
              <div className="flex flex-col gap-1">
                {data.berulang.map((p) => (
                  <Link
                    key={p.customerId}
                    href={`/tiket?search=${encodeURIComponent(p.nama)}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg border-b border-[#F5F7FA] last:border-0 hover:bg-amber-50/60 transition-colors group cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1A202C] group-hover:text-[#1B4F8A] transition-colors">{p.nama}</p>
                      <p className="text-xs text-[#718096] font-mono">{p.customerId}</p>
                    </div>
                    <Badge variant="warning">{p.jumlah}x &rarr;</Badge>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}

function KpiCard({
  label,
  value,
  color,
  href,
}: {
  label: string
  value: number | string
  color: string
  href?: string
}) {
  const content = (
    <div
      className={`bg-white rounded-xl border border-[#E2E8F0] p-4 transition-all ${
        href ? 'hover:border-[#1B4F8A] hover:shadow-xs cursor-pointer' : ''
      }`}
    >
      <p className="text-xs text-[#718096] font-medium mb-1 flex items-center justify-between">
        <span>{label}</span>
        {href && <span className="text-[10px] text-[#2E7FD9]">&rarr;</span>}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
