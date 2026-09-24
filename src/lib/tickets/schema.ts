import { z } from 'zod'

export const CHANNELS = [
  'WhatsApp',
  'Instagram',
  'Facebook',
  'TikTok',
  'Telepon',
] as const

export type Channel = (typeof CHANNELS)[number]

export const ticketSchema = z.object({
  timestamp: z.string().min(1, 'Tanggal & waktu wajib diisi'),
  customerIdInput: z.string().optional(),
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi'),
  alamatDetail: z.string().optional(),
  customerPhone: z
    .string()
    .regex(/^\d*$/, 'Nomor kontak harus berupa angka saja')
    .optional(),
  channel: z.enum(CHANNELS, {
    errorMap: () => ({ message: 'Pilih kanal komunikasi' }),
  }),
  jenisInteraksiId: z.string().min(1, 'Jenis interaksi wajib dipilih'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  handlingTypeId: z.string().min(1, 'Tujuan penanganan wajib dipilih'),
  detail: z.string().optional(),
  kecamatanId: z.string().optional(),
  desaId: z.string().optional(),
  customerRefId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  screenshotPath: z.string().optional(),
})

export type TicketFormData = z.infer<typeof ticketSchema>

export interface TicketCreateResult {
  ticketNumber?: string
  error?: Record<string, string[]>
}
