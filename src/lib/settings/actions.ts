'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { isDummySupabase } from '@/lib/supabase/is-dummy'

type MasterTable =
  | 'interaction_types'
  | 'categories'
  | 'handling_types'
  | 'districts'
  | 'villages'

const TABLE_TICKET_COLUMN: Partial<Record<MasterTable, string>> = {
  interaction_types: 'jenis_interaksi_id',
  categories: 'category_id',
  handling_types: 'handling_type_id',
  districts: 'kecamatan_id',
  villages: 'desa_id',
}

export async function addMasterItem(
  table: MasterTable,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  if (isDummySupabase()) {
    revalidatePath('/pengaturan')
    return { success: true }
  }

  const supabase = createClient()

  const { error } = await supabase.from(table).insert(data)
  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/pengaturan')
  return { success: true }
}

export async function updateMasterItem(
  table: MasterTable,
  id: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  if (isDummySupabase()) {
    revalidatePath('/pengaturan')
    return { success: true }
  }

  const supabase = createClient()

  const { error } = await supabase
    .from(table)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/pengaturan')
  return { success: true }
}

export async function deleteOrDeactivateMasterItem(
  table: MasterTable,
  id: string
): Promise<{ success: boolean; action: 'deleted' | 'deactivated'; error?: string }> {
  if (isDummySupabase()) {
    revalidatePath('/pengaturan')
    return { success: true, action: 'deactivated' }
  }

  const supabase = createClient()

  // Check if item is used in tickets (BR-009)
  const ticketColumn = TABLE_TICKET_COLUMN[table]
  let isUsed = false

  if (ticketColumn) {
    const { count } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq(ticketColumn, id)

    isUsed = (count ?? 0) > 0
  }

  // Also check customer_master for districts/villages
  if (!isUsed && table === 'districts') {
    const { count } = await supabase
      .from('customer_master')
      .select('id', { count: 'exact', head: true })
      .eq('kecamatan_id', id)
    isUsed = (count ?? 0) > 0
  }

  if (!isUsed && table === 'villages') {
    const { count } = await supabase
      .from('customer_master')
      .select('id', { count: 'exact', head: true })
      .eq('desa_id', id)
    isUsed = (count ?? 0) > 0
  }

  if (isUsed) {
    // Soft delete: nonaktifkan saja (BR-009)
    const { error } = await supabase
      .from(table)
      .update({ aktif: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { success: false, action: 'deactivated', error: error.message }
    revalidatePath('/pengaturan')
    return { success: true, action: 'deactivated' }
  } else {
    // Hard delete: belum pernah dipakai
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return { success: false, action: 'deleted', error: error.message }
    revalidatePath('/pengaturan')
    return { success: true, action: 'deleted' }
  }
}

export async function toggleMasterItemActive(
  table: MasterTable,
  id: string,
  aktif: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isDummySupabase()) {
    revalidatePath('/pengaturan')
    return { success: true }
  }

  const supabase = createClient()
  const { error } = await supabase
    .from(table)
    .update({ aktif, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/pengaturan')
  return { success: true }
}
