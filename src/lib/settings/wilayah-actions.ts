'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MASTER_WILAYAH_PDAM } from '@/lib/constants/master-wilayah'
import type { ParsedKecamatan, ParsedDesa } from '@/lib/import/wilayah-parser'

export async function applyWilayahImport(
  kecamatanList: ParsedKecamatan[],
  desaList: ParsedDesa[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  // Fallback demo lokal jika belum terhubung ke Supabase Cloud
  if (supabaseUrl.includes('dummy-pdam-project') || !supabaseUrl) {
    revalidatePath('/pengaturan')
    return {
      success: true,
      message: `Berhasil memproses ${kecamatanList.length} Kecamatan dan ${desaList.length} Desa (Mode Lokal).`,
    }
  }

  const supabase = createClient()

  try {
    // 1. Upsert Kecamatan
    for (const k of kecamatanList) {
      await supabase
        .from('districts')
        .upsert(
          {
            kode_kecamatan: k.kode_kecamatan,
            nama_kecamatan: k.nama_kecamatan,
            aktif: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'kode_kecamatan' }
        )
    }

    // 2. Ambil district mapping
    const { data: districts } = await supabase
      .from('districts')
      .select('id, kode_kecamatan')

    const distMap = new Map<string, string>()
    districts?.forEach((d) => distMap.set(d.kode_kecamatan, d.id))

    // 3. Upsert Desa
    for (const d of desaList) {
      const distId = distMap.get(d.kode_kecamatan)
      if (distId) {
        await supabase
          .from('villages')
          .upsert(
            {
              kecamatan_id: distId,
              kode_desa: d.kode_desa,
              nama_desa: d.nama_desa,
              aktif: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'kecamatan_id,kode_desa' }
          )
      }
    }

    revalidatePath('/pengaturan')
    return {
      success: true,
      message: `Berhasil mengimpor ${kecamatanList.length} Kecamatan dan ${desaList.length} Desa ke database.`,
    }
  } catch (err: unknown) {
    console.error('Error importing wilayah:', err)
    return {
      success: false,
      error: 'Terjadi kegagalan saat menyimpan data wilayah ke database.',
    }
  }
}

export async function syncDefaultWilayah(): Promise<{ success: boolean; message?: string }> {
  const kecamatanList: ParsedKecamatan[] = MASTER_WILAYAH_PDAM.map((k) => ({
    kode_kecamatan: k.kode_kecamatan,
    nama_kecamatan: k.nama_kecamatan,
  }))

  const desaList: ParsedDesa[] = []
  MASTER_WILAYAH_PDAM.forEach((k) => {
    k.desa.forEach((d) => {
      desaList.push({
        kode_kecamatan: k.kode_kecamatan,
        kode_desa: d.kode_desa,
        nama_desa: d.nama_desa,
        nama_kecamatan: k.nama_kecamatan,
      })
    })
  })

  return applyWilayahImport(kecamatanList, desaList)
}
