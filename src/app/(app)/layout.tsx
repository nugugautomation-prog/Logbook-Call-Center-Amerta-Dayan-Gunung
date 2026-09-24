import { AppShell } from '@/components/layout/AppShell'
import { OfflineBanner } from '@/components/ui/OfflineBanner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  )
}
