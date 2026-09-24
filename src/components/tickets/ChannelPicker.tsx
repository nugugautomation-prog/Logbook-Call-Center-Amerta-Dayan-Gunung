import { clsx } from 'clsx'
import type { Channel } from '@/lib/tickets/schema'

const CHANNELS: Channel[] = [
  'WhatsApp',
  'Instagram',
  'Facebook',
  'TikTok',
  'Telepon',
]

const CHANNEL_COLORS: Record<Channel, string> = {
  WhatsApp: 'border-[#25D366] text-[#128C7E] bg-[#F0FFF4]',
  Instagram: 'border-[#E1306C] text-[#C13584] bg-[#FFF0F5]',
  Facebook: 'border-[#1877F2] text-[#1877F2] bg-[#EFF6FF]',
  TikTok: 'border-[#010101] text-[#010101] bg-[#F9F9F9]',
  Telepon: 'border-[#718096] text-[#4A5568] bg-[#F5F7FA]',
}

const CHANNEL_COLORS_ACTIVE: Record<Channel, string> = {
  WhatsApp: 'bg-[#25D366] text-white border-[#25D366]',
  Instagram: 'bg-[#E1306C] text-white border-[#E1306C]',
  Facebook: 'bg-[#1877F2] text-white border-[#1877F2]',
  TikTok: 'bg-[#010101] text-white border-[#010101]',
  Telepon: 'bg-[#718096] text-white border-[#718096]',
}

interface ChannelPickerProps {
  value: Channel | ''
  onChange: (v: Channel) => void
  error?: string
}

export function ChannelPicker({ value, onChange, error }: ChannelPickerProps) {
  return (
    <div>
      <div
        role="group"
        aria-label="Kanal Komunikasi"
        className="flex flex-wrap gap-2"
      >
        {CHANNELS.map((ch) => {
          const isActive = value === ch
          return (
            <button
              key={ch}
              type="button"
              onClick={() => onChange(ch)}
              aria-pressed={isActive}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium border-2 min-h-[44px] transition-colors',
                isActive ? CHANNEL_COLORS_ACTIVE[ch] : CHANNEL_COLORS[ch]
              )}
            >
              {ch}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="text-xs text-[#DC2626] mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
