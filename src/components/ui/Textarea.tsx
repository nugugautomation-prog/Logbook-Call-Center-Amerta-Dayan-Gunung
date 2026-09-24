import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2)}`
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1A202C]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-describedby={errorId}
          aria-invalid={error ? 'true' : undefined}
          className={clsx(
            'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-[#1A202C] min-h-[100px]',
            'placeholder:text-[#718096] resize-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9] focus-visible:border-[#2E7FD9]',
            'disabled:bg-[#F5F7FA] disabled:text-[#718096]',
            error
              ? 'border-[#DC2626] focus-visible:ring-[#DC2626]'
              : 'border-[#E2E8F0]',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-[#718096]">{hint}</p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
