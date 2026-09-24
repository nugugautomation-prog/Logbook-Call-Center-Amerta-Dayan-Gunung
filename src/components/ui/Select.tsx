'use client'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className, ...props }, ref) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[#1A202C]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-describedby={errorId}
          aria-invalid={error ? 'true' : undefined}
          className={clsx(
            'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-[#1A202C] min-h-[44px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9] focus-visible:border-[#2E7FD9]',
            'disabled:bg-[#F5F7FA] disabled:text-[#718096]',
            error
              ? 'border-[#DC2626] focus-visible:ring-[#DC2626]'
              : 'border-[#E2E8F0]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">
              -- {placeholder} --
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-xs text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
