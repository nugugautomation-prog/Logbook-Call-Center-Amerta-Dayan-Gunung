interface SpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
}

export function Spinner({ label = 'Memuat...', size = 'md' }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className="flex justify-center py-8">
      <div
        className={`${sizeMap[size]} rounded-full border-[#E2E8F0] border-t-[#1B4F8A] animate-spin`}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
