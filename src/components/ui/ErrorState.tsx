interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-4 text-center"
    >
      <div
        className="w-10 h-10 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3"
        aria-hidden="true"
      >
        <svg
          className="w-5 h-5 text-[#DC2626]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-[#DC2626] font-medium mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2.5 bg-[#DC2626] text-white rounded-md text-sm font-medium min-h-[44px] hover:bg-[#B91C1C] active:bg-[#991B1B] transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  )
}
