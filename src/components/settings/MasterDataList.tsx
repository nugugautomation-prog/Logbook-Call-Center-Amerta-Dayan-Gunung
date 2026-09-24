'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, PowerOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  addMasterItem,
  updateMasterItem,
  deleteOrDeactivateMasterItem,
  toggleMasterItemActive,
} from '@/lib/settings/actions'

interface MasterItem {
  id: string
  nama: string
  aktif: boolean
  urutan?: number
  otomatis_selesai?: boolean
  kode?: string
}

interface MasterDataListProps {
  title: string
  table: 'interaction_types' | 'categories' | 'handling_types' | 'districts' | 'villages'
  items: MasterItem[]
  hasAutoFinish?: boolean
  extraFieldLabel?: string
  extraFieldName?: string
}

export function MasterDataList({
  title,
  table,
  items: initialItems,
  hasAutoFinish = false,
  extraFieldLabel,
  extraFieldName,
}: MasterDataListProps) {
  const [items, setItems] = useState<MasterItem[]>(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [extraValue, setExtraValue] = useState('')
  const [otomatisSelesai, setOtomatisSelesai] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function resetForm() {
    setNama('')
    setExtraValue('')
    setOtomatisSelesai(false)
    setIsAdding(false)
    setEditingId(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!nama.trim()) return

    setLoading(true)
    setFeedback(null)

    const payload: Record<string, unknown> = {
      nama: nama.trim(),
    }

    if (hasAutoFinish) {
      payload.otomatis_selesai = otomatisSelesai
    }
    if (extraFieldName && extraValue.trim()) {
      payload[extraFieldName] = extraValue.trim()
    }

    try {
      if (editingId) {
        const res = await updateMasterItem(table, editingId, payload)
        if (res.success) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? { ...item, nama: nama.trim(), otomatis_selesai: otomatisSelesai, kode: extraValue.trim() }
                : item
            )
          )
          setFeedback({ type: 'success', message: 'Berhasil memperbarui data.' })
          resetForm()
        } else {
          setFeedback({ type: 'error', message: res.error || 'Gagal memperbarui data.' })
        }
      } else {
        const res = await addMasterItem(table, payload)
        if (res.success) {
          setFeedback({ type: 'success', message: 'Data baru berhasil ditambahkan.' })
          // Refresh list locally or via revalidate
          window.location.reload()
        } else {
          setFeedback({ type: 'error', message: res.error || 'Gagal menambahkan data.' })
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const res = await toggleMasterItemActive(table, id, !currentStatus)
    if (res.success) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, aktif: !currentStatus } : item))
      )
    } else {
      setFeedback({ type: 'error', message: 'Gagal mengubah status aktif.' })
    }
  }

  async function handleDeleteOrDeactivate(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus atau menonaktifkan item ini?')) return

    const res = await deleteOrDeactivateMasterItem(table, id)
    if (res.success) {
      if (res.action === 'deleted') {
        setItems((prev) => prev.filter((item) => item.id !== id))
        setFeedback({ type: 'success', message: 'Item berhasil dihapus permanen.' })
      } else {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, aktif: false } : item))
        )
        setFeedback({
          type: 'success',
          message: 'Item sedang digunakan pada data tiket/pelanggan, sehingga otomatis dialihkan menjadi Nonaktif (Soft Delete).',
        })
      }
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal memproses penghapusan.' })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h2 className="text-base font-semibold text-[#1A202C]">{title}</h2>
        {!isAdding && !editingId && (
          <Button
            size="sm"
            onClick={() => {
              resetForm()
              setIsAdding(true)
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Tambah
          </Button>
        )}
      </div>

      {feedback && (
        <div
          role="alert"
          className={`p-3 rounded-lg text-sm ${
            feedback.type === 'success'
              ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]'
              : 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="bg-[#F5F7FA] p-3 rounded-lg space-y-3 border border-[#E2E8F0]">
          <Input
            label="Nama Item"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            placeholder="Masukkan nama"
          />

          {extraFieldName && (
            <Input
              label={extraFieldLabel || 'Kode'}
              value={extraValue}
              onChange={(e) => setExtraValue(e.target.value)}
              placeholder="Contoh: 01"
            />
          )}

          {hasAutoFinish && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={otomatisSelesai}
                onChange={(e) => setOtomatisSelesai(e.target.checked)}
                className="w-4 h-4 text-[#1B4F8A] rounded focus:ring-[#2E7FD9]"
              />
              <span className="text-sm text-[#1A202C]">
                Otomatis Selesaikan Tiket saat opsi ini dipilih (tanpa eskalasi)
              </span>
            </label>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={resetForm} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              <Check size={16} aria-hidden="true" />
              Simpan
            </Button>
          </div>
        </form>
      )}

      <div className="divide-y divide-[#E2E8F0]">
        {items.length === 0 ? (
          <p className="text-sm text-[#718096] py-4 text-center">Belum ada data tersedia.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#1A202C] truncate">{item.nama}</span>
                  {item.otomatis_selesai && (
                    <span className="text-xs bg-[#EFF6FF] text-[#1B4F8A] px-2 py-0.5 rounded border border-[#BFDBFE]">
                      Otomatis Selesai
                    </span>
                  )}
                  {item.kode && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                      {item.kode}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <Badge variant={item.aktif ? 'success' : 'default'}>
                    {item.aktif ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, item.aktif)}
                  title={item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#718096] hover:text-[#1B4F8A] rounded-lg transition-colors"
                >
                  <PowerOff size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id)
                    setNama(item.nama)
                    setOtomatisSelesai(item.otomatis_selesai || false)
                    setExtraValue(item.kode || '')
                    setIsAdding(false)
                  }}
                  title="Edit item"
                  className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#718096] hover:text-[#2E7FD9] rounded-lg transition-colors"
                >
                  <Edit2 size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOrDeactivate(item.id)}
                  title="Hapus / Nonaktifkan"
                  className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#718096] hover:text-[#DC2626] rounded-lg transition-colors"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
