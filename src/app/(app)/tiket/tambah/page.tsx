import { AppShell } from '@/components/layout/AppShell'
import { TicketForm } from '@/components/tickets/TicketForm'
import { createClient } from '@/lib/supabase/server'

import { isDummySupabase } from '@/lib/supabase/is-dummy'

const DEFAULT_INTERACTIONS = [
  { id: '1', nama: 'Komplain' },
  { id: '2', nama: 'Pertanyaan/Informasi' },
  { id: '3', nama: 'Lapor Gangguan/Kerusakan' },
  { id: '4', nama: 'Konten Sosmed' },
  { id: '5', nama: 'Lainnya' },
]

const DEFAULT_CATEGORIES = [
  { id: '1', nama: 'Tagihan Tidak Sesuai' },
  { id: '2', nama: 'Harga Naik' },
  { id: '3', nama: 'Cara Daftar' },
  { id: '4', nama: 'Cara Bayar Online' },
  { id: '5', nama: 'Lapor Gangguan' },
  { id: '6', nama: 'Pipa Bocor' },
  { id: '7', nama: 'Air Keruh / Kotor' },
  { id: '8', nama: 'Meteran Rusak' },
]

const DEFAULT_HANDLING_TYPES = [
  { id: '1', nama: 'Selesai di Call Center' },
  { id: '2', nama: 'Diteruskan ke Unit Terkait' },
  { id: '3', nama: 'Perlu Kunjungan Lapangan' },
]

export default async function TambahTiketPage() {
  if (isDummySupabase()) {
    return (
      <AppShell title="Tambah Tiket">
        <TicketForm
          interactionTypes={DEFAULT_INTERACTIONS}
          categories={DEFAULT_CATEGORIES}
          handlingTypes={DEFAULT_HANDLING_TYPES}
        />
      </AppShell>
    )
  }

  try {
    const supabase = createClient()

    const [
      { data: interactionTypes },
      { data: categories },
      { data: handlingTypes },
    ] = await Promise.all([
      supabase
        .from('interaction_types')
        .select('id, nama')
        .eq('aktif', true)
        .order('urutan'),
      supabase
        .from('categories')
        .select('id, nama')
        .eq('aktif', true)
        .order('urutan'),
      supabase
        .from('handling_types')
        .select('id, nama')
        .eq('aktif', true)
        .order('urutan'),
    ])

    return (
      <AppShell title="Tambah Tiket">
        <TicketForm
          interactionTypes={interactionTypes ?? DEFAULT_INTERACTIONS}
          categories={categories ?? DEFAULT_CATEGORIES}
          handlingTypes={handlingTypes ?? DEFAULT_HANDLING_TYPES}
        />
      </AppShell>
    )
  } catch {
    return (
      <AppShell title="Tambah Tiket">
        <TicketForm
          interactionTypes={DEFAULT_INTERACTIONS}
          categories={DEFAULT_CATEGORIES}
          handlingTypes={DEFAULT_HANDLING_TYPES}
        />
      </AppShell>
    )
  }
}

