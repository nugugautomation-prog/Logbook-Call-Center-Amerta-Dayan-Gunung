'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth/actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await signIn({ error: null }, formData)
      if (res?.error) {
        setError(res.error)
        setIsPending(false)
      } else if (res?.success) {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Terjadi kendala saat memproses login.')
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#1B4F8A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 text-[#1B4F8A]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">
            Call Center PDAM
          </h1>
          <p className="text-sm text-blue-200 mt-1">
            Amerta Dayan Gunung
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-base font-semibold text-[#1A202C] mb-6">
            Masuk ke Aplikasi
          </h2>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1A202C] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                inputMode="email"
                disabled={isPending}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9] focus-visible:border-[#2E7FD9] disabled:bg-[#F5F7FA]"
                placeholder="admin@pdam.id"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1A202C] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                disabled={isPending}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9] focus-visible:border-[#2E7FD9] disabled:bg-[#F5F7FA]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1B4F8A] text-white rounded-lg py-3 text-sm font-semibold min-h-[44px] hover:bg-[#16407A] active:bg-[#12325F] transition-colors mt-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-blue-300 mt-6">
          Logbook & Ticketing Call Center
        </p>
      </div>
    </div>
  )
}
