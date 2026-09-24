import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  as?: 'div' | 'article' | 'section'
}

export function Card({ children, className, onClick, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={clsx(
        'bg-white rounded-xl border border-[#E2E8F0] shadow-sm',
        onClick && 'cursor-pointer hover:border-[#2E7FD9] hover:shadow-md transition-all active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-4 py-3 border-b border-[#E2E8F0]', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-4 py-3', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-4 py-3 border-t border-[#E2E8F0]', className)}>
      {children}
    </div>
  )
}
