import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Call Center PDAM - Logbook & Ticketing',
  description: 'Aplikasi Logbook dan Ticketing Call Center Perumda Air Minum Amerta Dayan Gunung',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CC PDAM',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B4F8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#F5F7FA] text-[#1A202C]">
        {children}
      </body>
    </html>
  )
}
