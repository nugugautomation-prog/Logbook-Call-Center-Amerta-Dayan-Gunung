'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signIn(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error?: string | null; success?: boolean }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi' }
  }

  // 1. Mode Pengujian Lokal / Offline Demo — hanya aktif saat URL tidak diisi atau dummy
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (supabaseUrl.includes('dummy-pdam-project') || !supabaseUrl) {
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'admin@pdam.id'
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'admin123'

    if (email === testEmail && password === testPassword) {
      // Simpan cookie sesi demo
      cookies().set('pdam_demo_auth', 'authenticated', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 hari
      })
      return { success: true }
    }

    return {
      error: `Mode demo lokal: gunakan email "${testEmail}" dan password "${testPassword}"`,
    }
  }

  // 2. Kredensial Supabase Asli (Production / Live Cloud)
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('DEBUG SUPABASE AUTH ERROR:', error)
      return { error: `[Error Sistem]: ${error.message}. (Cek copy-paste kunci/URL di Vercel!)` }
    }
  } catch (err) {
    return { error: 'Gagal menghubungi server autentikasi.' }
  }

  return { success: true }
}

export async function signOut(): Promise<{ success: boolean }> {
  cookies().delete('pdam_demo_auth')
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore error if in dummy/demo mode
  }
  return { success: true }
}

export async function getSession() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (supabaseUrl.includes('dummy-pdam-project') || !supabaseUrl) {
    const isDemoAuth = cookies().get('pdam_demo_auth')?.value === 'authenticated'
    if (isDemoAuth) {
      return { user: { email: 'admin@pdam.id', role: 'admin' } }
    }
  }

  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch {
    return null
  }
}
