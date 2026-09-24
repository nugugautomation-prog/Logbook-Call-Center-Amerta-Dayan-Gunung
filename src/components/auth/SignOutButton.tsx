'use client'

import { useState } from 'react'
import { signOut } from '@/lib/auth/actions'
import { LogOut, Loader2 } from 'lucide-react'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      await signOut()
      window.location.href = '/login'
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      id="btn-sign-out"
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] font-semibold text-sm rounded-xl min-h-[48px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
      aria-label="Keluar dari akun admin"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut size={16} aria-hidden="true" />
      )}
      <span>{loading ? 'Sedang keluar...' : 'Keluar dari Aplikasi'}</span>
    </button>
  )
}
