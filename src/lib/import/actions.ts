'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ImportCustomerInput {
  customerId: string
  nama: string
  alamatDetail: string
  noHp: string
  golongan: string
  koordinatAsli: string
  latitude: number | null
  longitude: number | null
  kecamatanId: string | null
  desaId: string | null
}

export async function applyCustomerImportBatch(
  fileName: string,
  totalRows: number,
  validRows: ImportCustomerInput[],
  errorRowsCount: number,
  errorSummary?: string
): Promise<{ success: boolean; batchId?: string; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  // Fallback demo lokal jika database cloud belum dikonfigurasi
  if (supabaseUrl.includes('dummy-pdam-project') || !supabaseUrl) {
    revalidatePath('/pengaturan/import-pelanggan')
    revalidatePath('/tiket/tambah')
    return {
      success: true,
      batchId: `batch-local-${Date.now()}`,
    }
  }

  const supabase = createClient()

  try {
    // 1. Create import batch record
    const { data: batch, error: batchError } = await supabase
      .from('import_batches')
      .insert({
        nama_file: fileName,
        jumlah_baris_terbaca: totalRows,
        jumlah_baris_valid: validRows.length,
        jumlah_baris_error: errorRowsCount,
        status: 'Diterapkan',
        catatan_error: errorSummary || null,
      })
      .select('id')
      .single()

    if (batchError || !batch) {
      return { success: false, error: 'Gagal membuat batch impor di database.' }
    }

    // 2. Upsert valid customers in chunks of 100
    const chunkSize = 100
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize)
      const records = chunk.map((c) => ({
        customer_id: c.customerId,
        nama: c.nama,
        alamat_detail: c.alamatDetail || null,
        no_hp: c.noHp || null,
        golongan_pelanggan: c.golongan || null,
        koordinat_asli: c.koordinatAsli || null,
        latitude: c.latitude,
        longitude: c.longitude,
        kecamatan_id: c.kecamatanId,
        desa_id: c.desaId,
        import_batch_id: batch.id,
        updated_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await supabase
        .from('customer_master')
        .upsert(records, { onConflict: 'customer_id' })

      if (upsertError) {
        console.error('Error during customer upsert chunk:', upsertError)
        return { success: false, error: 'Gagal menyimpan data pelanggan ke database.' }
      }
    }

    revalidatePath('/pengaturan/import-pelanggan')
    revalidatePath('/tiket/tambah')
    return { success: true, batchId: batch.id }
  } catch (err: unknown) {
    console.error('Exception applying customer import:', err)
    return {
      success: false,
      error: 'Terjadi kendala saat menghubungkan ke database server.',
    }
  }
}
