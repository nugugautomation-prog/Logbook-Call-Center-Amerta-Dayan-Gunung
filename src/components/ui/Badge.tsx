import { clsx } from 'clsx'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  error: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  info: 'bg-[#EFF6FF] text-[#1B4F8A] border-[#BFDBFE]',
  default: 'bg-[#F5F7FA] text-[#718096] border-[#E2E8F0]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
