'use client'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createTicket } from '@/lib/tickets/actions'
import { ticketSchema, type TicketFormData, type Channel } from '@/lib/tickets/schema'
import type { CustomerLookupResult } from '@/lib/customers/lookup'
import { CustomerIdInput } from './CustomerIdInput'
import { ChannelPicker } from './ChannelPicker'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { compressImage } from '@/lib/image/compress'
import { ImagePlus, X, Eye } from 'lucide-react'

interface MasterData {
  id: string
  nama: string
}

interface TicketFormProps {
  interactionTypes: MasterData[]
  categories: MasterData[]
  handlingTypes: MasterData[]
}

interface FormErrors {
  [key: string]: string | undefined
}

export function TicketForm({
  interactionTypes,
  categories,
  handlingTypes,
}: TicketFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successTicket, setSuccessTicket] = useState<string | null>(null)

  // Form state
  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm")
  const [timestamp, setTimestamp] = useState(now)
  const [customerIdInput, setCustomerIdInput] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [alamatDetail, setAlamatDetail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [jenisInteraksiId, setJenisInteraksiId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [handlingTypeId, setHandlingTypeId] = useState('')
  const [detail, setDetail] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [desaId, setDesaId] = useState('')
  const [customerRefId, setCustomerRefId] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [nameAutoFilled, setNameAutoFilled] = useState(false)

  // Screenshot state
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleLookupResult = useCallback((result: CustomerLookupResult) => {
    if (result.type === 'full' && result.customer) {
      setCustomerName(result.customer.nama)
      setAlamatDetail(result.customer.alamat)
      setCustomerPhone(result.customer.noHp)
      setLatitude(result.customer.latitude ?? undefined)
      setLongitude(result.customer.longitude ?? undefined)
      setKecamatanId(result.kecamatan?.id ?? '')
      setDesaId(result.desa?.id ?? '')
      setCustomerRefId(result.customer.id)
      setNameAutoFilled(true)
    } else if (result.type === 'partial') {
      setKecamatanId(result.kecamatan?.id ?? '')
      setDesaId(result.desa?.id ?? '')
      setLatitude(undefined)
      setLongitude(undefined)
      setCustomerRefId('')
      setNameAutoFilled(false)
    } else {
      setKecamatanId('')
      setDesaId('')
      setLatitude(undefined)
      setLongitude(undefined)
      setCustomerRefId('')
      setNameAutoFilled(false)
    }
  }, [])

  async function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    try {
      // Kompres gambar otomatis (maks 1.8MB - 2MB NFR-003)
      const compressed = await compressImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
        setIsCompressing(false)
      }
      reader.readAsDataURL(compressed)
    } catch (err) {
      console.error('Failed reading/compressing screenshot:', err)
      setIsCompressing(false)
    }
  }

  function handleRemoveScreenshot() {
    setScreenshotPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    const formData: TicketFormData = {
      timestamp,
      customerIdInput: customerIdInput || undefined,
      customerName,
      alamatDetail: alamatDetail || undefined,
      customerPhone: customerPhone || undefined,
      channel: channel as Channel,
      jenisInteraksiId,
      categoryId,
      handlingTypeId,
      detail: detail || undefined,
      kecamatanId: kecamatanId || undefined,
      desaId: desaId || undefined,
      customerRefId: customerRefId || undefined,
      latitude,
      longitude,
      screenshotPath: screenshotPreview || undefined,
    }

    // Client-side validation
    const parsed = ticketSchema.safeParse(formData)
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = (msgs as string[])[0]
      }
      setErrors(fieldErrors)
      const firstErrKey = Object.keys(fieldErrors)[0]
      if (firstErrKey) {
        document.getElementById(firstErrKey)?.focus()
      }
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createTicket(formData)
      if (result.error) {
        const fieldErrors: FormErrors = {}
        for (const [key, msgs] of Object.entries(result.error)) {
          if (key === '_root') {
            setSubmitError((msgs as string[])[0])
          } else {
            fieldErrors[key] = (msgs as string[])[0]
          }
        }
        setErrors(fieldErrors)
      } else if (result.ticketNumber) {
        setSuccessTicket(result.ticketNumber)
        setTimeout(() => router.push('/tiket'), 2000)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successTicket) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#16A34A]"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#1A202C] mb-1">
          Tiket Berhasil Dibuat
        </h2>
        <p className="text-[#718096] text-sm mb-3">Nomor tiket:</p>
        <p className="text-xl font-bold text-[#1B4F8A]">{successTicket}</p>
        <p className="text-xs text-[#718096] mt-4">Mengalihkan ke daftar tiket...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {submitError && (
        <div role="alert" className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
          {submitError}
        </div>
      )}

      {/* Tanggal & Waktu */}
      <div className="flex flex-col gap-1">
        <label htmlFor="timestamp" className="text-sm font-medium text-[#1A202C]">
          Tanggal & Waktu <span className="text-[#DC2626]">*</span>
        </label>
        <input
          id="timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          className={`w-full border rounded-lg px-3 py-2.5 text-sm min-h-[44px]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9]
            ${errors.timestamp ? 'border-[#DC2626]' : 'border-[#E2E8F0]'}
          `}
        />
        {errors.timestamp && (
          <p className="text-xs text-[#DC2626]" role="alert">{errors.timestamp}</p>
        )}
      </div>

      {/* Customer ID autofill */}
      <CustomerIdInput
        onLookupResult={(result, rawId) => {
          setCustomerIdInput(rawId)
          handleLookupResult(result)
        }}
        error={errors.customerIdInput}
      />

      {/* Nama Pelanggan */}
      <Input
        id="customerName"
        label="Nama Pelanggan"
        required
        value={customerName}
        onChange={(e) => {
          setCustomerName(e.target.value)
          setNameAutoFilled(false)
        }}
        error={errors.customerName}
        hint={nameAutoFilled ? 'Terisi otomatis dari data master (dapat diedit)' : undefined}
        placeholder="Masukkan nama pelanggan"
      />

      {/* Alamat */}
      <Input
        id="alamatDetail"
        label="Alamat"
        value={alamatDetail}
        onChange={(e) => setAlamatDetail(e.target.value)}
        placeholder="Alamat pelanggan (opsional)"
      />

      {/* Nomor Kontak */}
      <Input
        id="customerPhone"
        label="Nomor Kontak"
        type="tel"
        inputMode="numeric"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
        error={errors.customerPhone}
        placeholder="Contoh: 081234567890"
        hint="Hanya angka (BR-001)"
      />

      {/* Kanal Komunikasi */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[#1A202C]">
          Kanal Komunikasi <span className="text-[#DC2626]">*</span>
        </p>
        <ChannelPicker
          value={channel}
          onChange={(ch) => {
            setChannel(ch)
            setErrors((prev) => ({ ...prev, channel: undefined }))
          }}
          error={errors.channel}
        />
      </div>

      {/* Jenis Interaksi */}
      <Select
        id="jenisInteraksiId"
        label="Jenis Interaksi"
        required
        value={jenisInteraksiId}
        onChange={(e) => {
          setJenisInteraksiId(e.target.value)
          setErrors((prev) => ({ ...prev, jenisInteraksiId: undefined }))
        }}
        options={interactionTypes.map((it) => ({
          value: it.id,
          label: it.nama,
        }))}
        placeholder="Pilih jenis interaksi"
        error={errors.jenisInteraksiId}
      />

      {/* Kategori */}
      <Select
        id="categoryId"
        label="Kategori"
        required
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value)
          setErrors((prev) => ({ ...prev, categoryId: undefined }))
        }}
        options={categories.map((c) => ({ value: c.id, label: c.nama }))}
        placeholder="Pilih kategori"
        error={errors.categoryId}
      />

      {/* Tujuan Penanganan */}
      <Select
        id="handlingTypeId"
        label="Tujuan Penanganan"
        required
        value={handlingTypeId}
        onChange={(e) => {
          setHandlingTypeId(e.target.value)
          setErrors((prev) => ({ ...prev, handlingTypeId: undefined }))
        }}
        options={handlingTypes.map((h) => ({ value: h.id, label: h.nama }))}
        placeholder="Pilih tujuan penanganan"
        error={errors.handlingTypeId}
      />

      {/* Detail */}
      <Textarea
        id="detail"
        label="Detail Komplain"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Deskripsi detail (opsional)"
        rows={3}
      />

      {/* Upload Bukti / Screenshot Chat */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#1A202C]">
          Bukti Screenshot Chat
          <span className="ml-1 text-xs text-[#718096] font-normal">(opsional)</span>
        </label>

        {screenshotPreview ? (
          <div className="relative border rounded-xl p-3 bg-[#F8FAFC] border-[#E2E8F0] flex items-center gap-3">
            <img
              src={screenshotPreview}
              alt="Screenshot chat pelanggan"
              className="w-20 h-20 object-cover rounded-lg border border-[#CBD5E1]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1A202C] truncate">
                Foto / Screenshot Terpilih
              </p>
              <p className="text-[11px] text-[#718096] mt-0.5">
                Otomatis dikompresi (siap disimpan)
              </p>
              <button
                type="button"
                onClick={handleRemoveScreenshot}
                className="mt-2 text-xs text-[#DC2626] hover:underline flex items-center gap-1 min-h-[36px]"
              >
                <X size={14} aria-hidden="true" />
                Hapus Foto
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 text-center cursor-pointer hover:border-[#1B4F8A] transition-colors bg-white min-h-[44px] flex flex-col items-center justify-center gap-1.5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScreenshotChange}
            />
            <div className="p-2 bg-[#EFF6FF] text-[#1B4F8A] rounded-full">
              <ImagePlus size={20} aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-[#1A202C]">
              {isCompressing ? 'Mengompres foto...' : 'Unggah Screenshot Chat'}
            </p>
            <p className="text-xs text-[#718096]">
              Kamera atau Galeri (Maksimal 2MB, otomatis dikompresi)
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2 pb-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
        >
          Simpan Tiket
        </Button>
      </div>
    </form>
  )
}
