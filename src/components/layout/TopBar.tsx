interface TopBarProps {
  title?: string
  action?: React.ReactNode
  showBack?: boolean
}

export function TopBar({ title, action }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#1B4F8A] text-white shadow-sm">
      <div className="flex h-14 items-center justify-between px-4 max-w-2xl mx-auto">
        <h1 className="text-base font-semibold truncate">
          {title ?? 'Call Center PDAM'}
        </h1>
        {action && (
          <div className="flex items-center gap-2 flex-shrink-0">{action}</div>
        )}
      </div>
    </header>
  )
}
