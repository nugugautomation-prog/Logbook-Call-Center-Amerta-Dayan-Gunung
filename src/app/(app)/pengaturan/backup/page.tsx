'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { triggerManualBackup } from '@/lib/backup/manual-trigger'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, HardDriveDownload, AlertCircle } from 'lucide-react'
import type { BackupLog } from '@/types/database'

export default function BackupPage() {
  const [logs, setLogs] = useState<BackupLog[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchLogs() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      setLogs((data as BackupLog[]) || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  async function handleBackup() {
    setTriggering(true)
    setMsg(null)
    try {
      const res = await triggerManualBackup()
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Backup selesai.' })
        fetchLogs()
      } else {
        setMsg({ type: 'error', text: res.message || 'Backup gagal.' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kegagalan sistem saat backup.' })
    } finally {
      setTriggering(false)
    }
  }

  return (
    <AppShell title="Riwayat & Backup Data">
      <div className="space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F0FDF4] text-[#16A34A] rounded-xl">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1A202C]">Perlindungan Data (BR-007)</h2>
              <p className="text-xs text-[#718096]">
                Backup otomatis berjalan harian (23:00) dan mingguan (Senin) via CSV ke email admin.
              </p>
            </div>
          </div>

          <Button fullWidth onClick={handleBackup} loading={triggering}>
            <HardDriveDownload size={16} aria-hidden="true" />
            Backup Manual Sekarang
          </Button>
        </div>

        {msg && (
          <div
            role="alert"
            className={`p-3 rounded-lg text-xs ${
              msg.type === 'success'
                ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]'
                : 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* History table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#1A202C]">Riwayat Log Backup</h3>
          </div>

          {loading ? (
            <Spinner label="Memuat riwayat backup..." />
          ) : logs.length === 0 ? (
            <p className="p-6 text-xs text-[#718096] text-center">Belum ada riwayat backup tercatat.</p>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#1A202C]">{log.periode}</p>
                    <p className="text-[#718096] font-mono mt-0.5">
                      {log.file_name} • {log.jumlah_baris} baris data
                    </p>
                    {log.dikirim_ke && (
                      <p className="text-[#718096] text-[11px] mt-0.5">
                        Tujuan: {log.dikirim_ke}
                      </p>
                    )}
                  </div>
                  <div>
                    <Badge variant={log.status_kirim === 'Berhasil' ? 'success' : 'error'}>
                      {log.status_kirim || 'Proses'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
