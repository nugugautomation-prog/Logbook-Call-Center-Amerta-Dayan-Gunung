import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { MasterDataList } from '@/components/settings/MasterDataList'
import { MASTER_WILAYAH_PDAM } from '@/lib/constants/master-wilayah'
import Link from 'next/link'
import { UploadCloud, ShieldCheck, MapPin } from 'lucide-react'
import { MasterDataStatusBanner } from '@/components/settings/MasterDataStatusBanner'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { isDummySupabase } from '@/lib/supabase/is-dummy'
import { getSession } from '@/lib/auth/actions'

export const dynamic = 'force-dynamic'

export default async function PengaturanPage() {
  const session = await getSession()
  const userEmail = session?.user?.email || 'admin@pdam.id'
  let interactionTypes: any[] = []
  let categories: any[] = []
  let handlingTypes: any[] = []
  let districts: any[] = []
  let villages: any[] = []

  if (!isDummySupabase()) {
    try {
      const supabase = createClient()
      const [
        { data: it },
        { data: cat },
        { data: ht },
        { data: dist },
        { data: vil },
      ] = await Promise.all([
        supabase.from('interaction_types').select('*').order('urutan'),
        supabase.from('categories').select('*').order('urutan'),
        supabase.from('handling_types').select('*').order('urutan'),
        supabase.from('districts').select('*').order('kode_kecamatan'),
        supabase.from('villages').select('*, districts(nama_kecamatan)').order('kode_desa'),
      ])

      interactionTypes = it || []
      categories = cat || []
      handlingTypes = ht || []
      districts = dist || []
      villages = vil || []
    } catch (err) {
      console.warn('Could not load master data from supabase:', err)
    }
  }

  // Fallback defaults jika tabel masih kosong di mode lokal/dev
  if (interactionTypes.length === 0) {
    interactionTypes = [
      { id: '1', nama: 'Komplain', aktif: true, urutan: 1 },
      { id: '2', nama: 'Pertanyaan/Informasi', aktif: true, urutan: 2 },
      { id: '3', nama: 'Lapor Gangguan/Kerusakan', aktif: true, urutan: 3 },
      { id: '4', nama: 'Konten Sosmed', aktif: true, urutan: 4 },
      { id: '5', nama: 'Lainnya', aktif: true, urutan: 5 },
    ]
  }

  if (categories.length === 0) {
    categories = [
      { id: '1', nama: 'Tagihan Tidak Sesuai', aktif: true, urutan: 1 },
      { id: '2', nama: 'Harga Naik', aktif: true, urutan: 2 },
      { id: '3', nama: 'Cara Daftar', aktif: true, urutan: 3 },
      { id: '4', nama: 'Cara Bayar Online', aktif: true, urutan: 4 },
      { id: '5', nama: 'Lapor Gangguan', aktif: true, urutan: 5 },
      { id: '6', nama: 'Status Pengaduan', aktif: true, urutan: 6 },
      { id: '7', nama: 'Lain-lain', aktif: true, urutan: 7 },
    ]
  }

  if (handlingTypes.length === 0) {
    handlingTypes = [
      { id: '1', nama: 'Selesai di Edukasi (Tanpa Eskalasi)', aktif: true, otomatis_selesai: true, urutan: 1 },
      { id: '2', nama: 'Eskalasi ke Bidang Pelayanan', aktif: true, otomatis_selesai: false, urutan: 2 },
      { id: '3', nama: 'Eskalasi ke Kantor Cabang', aktif: true, otomatis_selesai: false, urutan: 3 },
      { id: '4', nama: 'Lainnya', aktif: true, otomatis_selesai: false, urutan: 4 },
    ]
  }

  // Fallback Master Wilayah bawaan dari Master Wilayah.xlsx
  if (districts.length === 0) {
    districts = MASTER_WILAYAH_PDAM.map((k) => ({
      id: `dist-${k.kode_kecamatan}`,
      kode_kecamatan: k.kode_kecamatan,
      nama_kecamatan: k.nama_kecamatan,
      aktif: true,
    }))
  }

  if (villages.length === 0) {
    villages = []
    MASTER_WILAYAH_PDAM.forEach((k) => {
      k.desa.forEach((d) => {
        villages.push({
          id: `vil-${k.kode_kecamatan}-${d.kode_desa}`,
          kode_desa: d.kode_desa,
          nama_desa: d.nama_desa,
          districts: { nama_kecamatan: k.nama_kecamatan },
          aktif: true,
        })
      })
    })
  }

  return (
    <AppShell title="Pengaturan Master Data">
      <div className="space-y-6">
        {/* Banner Status Master Data Aktif */}
        <MasterDataStatusBanner />

        {/* Quick action banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/pengaturan/import-wilayah"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#1B4F8A] transition-all"
          >
            <div className="p-2.5 bg-[#EFF6FF] text-[#1B4F8A] rounded-lg">
              <MapPin size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A202C]">Impor Master Wilayah</p>
              <p className="text-xs text-[#718096]">Unggah Excel Master Wilayah.xlsx</p>
            </div>
          </Link>

          <Link
            href="/pengaturan/import-pelanggan"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#2E7FD9] transition-all"
          >
            <div className="p-2.5 bg-[#EFF6FF] text-[#1B4F8A] rounded-lg">
              <UploadCloud size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A202C]">Impor Data Pelanggan</p>
              <p className="text-xs text-[#718096]">Unggah Excel Master Pelanggan.xlsx</p>
            </div>
          </Link>

          <Link
            href="/pengaturan/backup"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#16A34A] transition-all"
          >
            <div className="p-2.5 bg-[#F0FDF4] text-[#16A34A] rounded-lg">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A202C]">Backup Data</p>
              <p className="text-xs text-[#718096]">Riwayat CSV email & trigger</p>
            </div>
          </Link>
        </div>

        {/* Master lists */}
        <MasterDataList
          title="1. Jenis Interaksi"
          table="interaction_types"
          items={
            interactionTypes.map((i) => ({
              id: i.id,
              nama: i.nama,
              aktif: i.aktif,
              urutan: i.urutan,
            }))
          }
        />

        <MasterDataList
          title="2. Kategori Komplain / Pengaduan"
          table="categories"
          items={
            categories.map((c) => ({
              id: c.id,
              nama: c.nama,
              aktif: c.aktif,
              urutan: c.urutan,
            }))
          }
        />

        <MasterDataList
          title="3. Tujuan Penanganan (Selesai di Edukasi / Eskalasi)"
          table="handling_types"
          hasAutoFinish={true}
          items={
            handlingTypes.map((h) => ({
              id: h.id,
              nama: h.nama,
              aktif: h.aktif,
              urutan: h.urutan,
              otomatis_selesai: h.otomatis_selesai,
            }))
          }
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#718096]">
              Master Kecamatan resmi dicover PDAM Amerta Dayan Gunung
            </span>
            <Link
              href="/pengaturan/import-wilayah"
              className="text-xs font-semibold text-[#1B4F8A] hover:underline"
            >
              + Impor dari Excel
            </Link>
          </div>
          <MasterDataList
            title="4. Master Data Kecamatan (5 Cabang Resmi)"
            table="districts"
            extraFieldLabel="Kode Kecamatan (2 Digit)"
            extraFieldName="kode_kecamatan"
            items={
              districts.map((d) => ({
                id: d.id,
                nama: d.nama_kecamatan,
                aktif: d.aktif,
                kode: d.kode_kecamatan,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#718096]">
              Master Desa resmi (31 Desa di 5 Kecamatan)
            </span>
            <Link
              href="/pengaturan/import-wilayah"
              className="text-xs font-semibold text-[#1B4F8A] hover:underline"
            >
              + Impor dari Excel
            </Link>
          </div>
          <MasterDataList
            title="5. Master Data Desa (31 Desa Resmi)"
            table="villages"
            extraFieldLabel="Kode Desa (2 Digit)"
            extraFieldName="kode_desa"
            items={
              villages.map((v) => ({
                id: v.id,
                nama: `${v.nama_desa} (${v.districts?.nama_kecamatan || 'Kecamatan'})`,
                aktif: v.aktif,
                kode: v.kode_desa,
              }))
            }
          />
        </div>

        {/* Akun & Sesi Logout */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-[#1A202C]">Akun & Sesi Admin</h2>
            <p className="text-xs text-[#718096]">
              Masuk sebagai: <strong className="text-[#1A202C]">{userEmail}</strong>
            </p>
            <SignOutButton />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
