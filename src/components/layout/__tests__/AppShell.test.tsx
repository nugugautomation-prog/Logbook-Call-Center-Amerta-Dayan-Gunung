import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppShell } from '../AppShell'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

describe('AppShell', () => {
  it('renders children and bottom navigation', () => {
    render(
      <AppShell title="Test Shell">
        <div>Konten Halaman</div>
      </AppShell>
    )

    expect(screen.getByText('Konten Halaman')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /navigasi utama/i })).toBeInTheDocument()
  })
})
