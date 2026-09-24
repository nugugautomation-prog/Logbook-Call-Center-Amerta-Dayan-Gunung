'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList,
  LayoutDashboard,
  FileText,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/tiket', label: 'Tiket', icon: ClipboardList },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/laporan', label: 'Laporan', icon: FileText },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#E2E8F0] safe-area-inset-bottom"
    >
      <ul className="flex h-16 items-center justify-around px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 w-full min-h-[56px] px-1 rounded-lg text-xs font-medium transition-colors',
                  active
                    ? 'text-[#1B4F8A]'
                    : 'text-[#718096] hover:text-[#1B4F8A] active:bg-[#F5F7FA]',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={22}
                  aria-hidden="true"
                  strokeWidth={active ? 2.5 : 1.75}
                  className={active ? 'text-[#1B4F8A]' : 'text-[#718096]'}
                />
                <span className={active ? 'font-semibold' : ''}>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
