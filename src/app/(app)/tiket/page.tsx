import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { getTickets } from '@/lib/tickets/actions'
import { TicketCard } from '@/components/tickets/TicketCard'
import { TicketSearchBar } from '@/components/tickets/TicketSearchBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Plus, X, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TiketPageProps {
  searchParams?: {
    status?: 'Berjalan' | 'Selesai'
    kategori?: string
    kecamatan?: string
    desa?: string
    search?: string
  }
}

export default async function TiketPage({ searchParams }: TiketPageProps) {
  const { data: tickets, error } = await getTickets({
    limit: 50,
    status: searchParams?.status,
    kategori: searchParams?.kategori,
    kecamatan: searchParams?.kecamatan,
    desa: searchParams?.desa,
    search: searchParams?.search,
  })

  const hasFilter = Boolean(
    searchParams?.status ||
      searchParams?.kategori ||
      searchParams?.kecamatan ||
      searchParams?.desa ||
      searchParams?.search
  )

  const filterDescription = [
    searchParams?.status && `Status: ${searchParams.status}`,
    searchParams?.kategori && `Kategori: ${searchParams.kategori}`,
    searchParams?.kecamatan && `Kecamatan: ${searchParams.kecamatan}`,
    searchParams?.desa && `Desa: ${searchParams.desa}`,
    searchParams?.search && `Pencarian: "${searchParams.search}"`,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <AppShell
      title="Daftar Tiket"
      action={
        <Link
          href="/tiket/tambah"
          className="flex items-center gap-1.5 bg-white text-[#1B4F8A] px-3 py-1.5 rounded-lg text-sm font-semibold min-h-[36px] hover:bg-blue-50"
        >
          <Plus size={16} aria-hidden="true" />
          Tambah
        </Link>
      }
    >
      {/* Search Input Bar */}
      <TicketSearchBar />

      {/* Active Filter Bar */}
      {hasFilter && (
        <div className="mb-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#1E40AF]">
            <Filter size={14} className="shrink-0" aria-hidden="true" />
            <span>
              Filter aktif: <strong>{filterDescription}</strong> ({tickets?.length ?? 0} tiket)
            </span>
          </div>
          <Link
            href="/tiket"
            className="flex items-center gap-1 text-[#DC2626] font-semibold hover:underline shrink-0 bg-white px-2 py-1 rounded-md border border-[#FECACA]"
          >
            <X size={12} aria-hidden="true" />
            Hapus Filter
          </Link>
        </div>
      )}

      {error ? (
        <div role="alert" className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
          Gagal memuat tiket. Silakan muat ulang halaman.
        </div>
      ) : tickets && tickets.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket as unknown as Parameters<typeof TicketCard>[0]['ticket']}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          message={hasFilter ? 'Tidak ada tiket yang sesuai filter' : 'Belum ada tiket'}
          description={
            hasFilter
              ? 'Coba hapus filter di atas untuk melihat seluruh tiket'
              : 'Ketuk tombol Tambah di atas untuk mencatat interaksi pelanggan baru'
          }
          action={
            hasFilter ? (
              <Link href="/tiket">
                <Button variant="secondary">Hapus Filter</Button>
              </Link>
            ) : (
              <Link href="/tiket/tambah">
                <Button>
                  <Plus size={16} aria-hidden="true" />
                  Buat Tiket Pertama
                </Button>
              </Link>
            )
          }
        />
      )}
    </AppShell>
  )
}
