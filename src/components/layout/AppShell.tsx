import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
}

export function AppShell({ children, title, action }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#F5F7FA] flex flex-col">
      <TopBar title={title} action={action} />
      <main className="flex-1 px-4 pt-4 pb-20 max-w-2xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
