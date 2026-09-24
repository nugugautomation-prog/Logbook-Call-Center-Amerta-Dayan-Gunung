import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ChannelPicker } from '../ChannelPicker'

describe('ChannelPicker', () => {
  it('renders all 5 channels and triggers onChange on click', () => {
    const handleChange = vi.fn()
    render(<ChannelPicker value="" onChange={handleChange} />)

    const whatsappBtn = screen.getByRole('button', { name: 'WhatsApp' })
    expect(whatsappBtn).toBeInTheDocument()

    fireEvent.click(whatsappBtn)
    expect(handleChange).toHaveBeenCalledWith('WhatsApp')
  })

  it('marks selected channel as active (aria-pressed)', () => {
    render(<ChannelPicker value="Instagram" onChange={() => {}} />)
    const igBtn = screen.getByRole('button', { name: 'Instagram' })
    expect(igBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
