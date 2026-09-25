'use client'
import { useState, useCallback, useRef } from 'react'
import { lookupCustomer, type CustomerLookupResult } from '@/lib/customers/lookup'
import { Spinner } from '@/components/ui/Spinner'

interface CustomerIdInputProps {
  onLookupResult: (result: CustomerLookupResult, rawId: string) => void
  error?: string
}

export function CustomerIdInput({ onLookupResult, error }: CustomerIdInputProps) {
  const [value, setValue] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [lookupResult, setLookupResult] = useState<CustomerLookupResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
      setValue(raw)

      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (raw.length >= 4) {
        setIsLooking(true)
        debounceRef.current = setTimeout(async () => {
          const result = await lookupCustomer(raw)
          setLookupResult(result)
          setIsLooking(false)
          onLookupResult(result, raw)
        }, 400)
      } else {
        setLookupResult(null)
        onLookupResult({ type: 'not_found' }, raw)
      }
    },
    [onLookupResult]
  )

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="customer-id-input" className="text-sm font-medium text-[#1A202C]">
        ID Pelanggan
        <span className="ml-1 text-xs text-[#718096] font-normal">(opsional)</span>
      </label>
      <div className="relative">
        <input
          id="customer-id-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          maxLength={9}
          placeholder="4 digit (kec+desa) atau 9 digit lengkap"
          aria-describedby="customer-id-hint customer-id-result"
          aria-invalid={error ? 'true' : undefined}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm min-h-[44px] pr-10
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9]
            ${error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'}
          `}
        />
        {isLooking && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 rounded-full border-2 border-[#E2E8F0] border-t-[#1B4F8A] animate-spin" />
          </div>
        )}
      </div>

      <p id="customer-id-hint" className="text-xs text-[#718096]">
        Ketik 4 digit untuk mapping kecamatan/desa, atau 9 digit untuk autofill data pelanggan
      </p>

      {/* Lookup result feedback */}
      {lookupResult && lookupResult.type !== 'not_found' && (
        <div
          id="customer-id-result"
          role="status"
          aria-live="polite"
          className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] p-3 text-sm"
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-[#16A34A]">
                {lookupResult.type === 'full'
                  ? 'Data pelanggan ditemukan'
                  : 'Wilayah dikenali'}
              </p>
              <p className="text-[#1A202C] mt-0.5">
                {lookupResult.kecamatan?.nama} / {lookupResult.desa?.nama}
              </p>
              {lookupResult.type === 'full' && lookupResult.customer && (
                <p className="text-[#718096]">
                  {lookupResult.customer.nama}
                </p>
              )}
              {lookupResult.type === 'partial' && (
                <p className="text-[#718096] text-xs mt-0.5">
                  Nama pelanggan wajib diisi manual
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-[#DC2626]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
