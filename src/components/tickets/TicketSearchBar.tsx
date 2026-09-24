'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

export function TicketSearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get('search') ?? ''
  const [query, setQuery] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  // Sinkronisasi bila URL searchParams berubah dari luar
  useEffect(() => {
    setQuery(currentSearch)
  }, [currentSearch])

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = term.trim()

    if (trimmed) {
      params.set('search', trimmed)
    } else {
      params.delete('search')
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSearch(query)
  }

  function handleClear() {
    setQuery('')
    handleSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-[#718096]">
          {isPending ? (
            <Loader2 size={18} className="animate-spin text-[#1B4F8A]" aria-hidden="true" />
          ) : (
            <Search size={18} aria-hidden="true" />
          )}
        </div>

        <input
          id="ticket-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch(query)
            }
          }}
          placeholder="Cari ID Pelanggan (contoh: 01010001), Nama, No. Tiket..."
          aria-label="Cari tiket berdasarkan ID Pelanggan, Nama, atau Nomor Tiket"
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#1A202C] placeholder:text-[#94A3B8] min-h-[44px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-[#1B4F8A]"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-[#94A3B8] hover:text-[#475569] rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Hapus pencarian"
              title="Hapus pencarian"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            className="px-3 py-1.5 bg-[#1B4F8A] hover:bg-[#153e6d] text-white text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center justify-center"
          >
            Cari
          </button>
        </div>
      </div>
    </form>
  )
}
