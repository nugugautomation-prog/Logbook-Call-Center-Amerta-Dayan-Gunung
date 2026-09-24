export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          username: string
          password_hash: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      interaction_types: {
        Row: {
          id: string
          nama: string
          urutan: number
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          nama: string
          jenis_interaksi_id: string | null
          urutan: number
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          jenis_interaksi_id?: string | null
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          jenis_interaksi_id?: string | null
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      handling_types: {
        Row: {
          id: string
          nama: string
          otomatis_selesai: boolean
          urutan: number
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          otomatis_selesai?: boolean
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          otomatis_selesai?: boolean
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          id: string
          kode_kecamatan: string
          nama_kecamatan: string
          urutan: number
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode_kecamatan: string
          nama_kecamatan: string
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode_kecamatan?: string
          nama_kecamatan?: string
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          id: string
          kecamatan_id: string
          kode_desa: string
          nama_desa: string
          urutan: number
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kecamatan_id: string
          kode_desa: string
          nama_desa: string
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kecamatan_id?: string
          kode_desa?: string
          nama_desa?: string
          urutan?: number
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_master: {
        Row: {
          id: string
          customer_id: string
          kecamatan_id: string | null
          desa_id: string | null
          nama: string
          alamat_detail: string | null
          golongan_pelanggan: string | null
          no_hp: string | null
          koordinat_asli: string | null
          latitude: number | null
          longitude: number | null
          import_batch_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          kecamatan_id?: string | null
          desa_id?: string | null
          nama: string
          alamat_detail?: string | null
          golongan_pelanggan?: string | null
          no_hp?: string | null
          koordinat_asli?: string | null
          latitude?: number | null
          longitude?: number | null
          import_batch_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          kecamatan_id?: string | null
          desa_id?: string | null
          nama?: string
          alamat_detail?: string | null
          golongan_pelanggan?: string | null
          no_hp?: string | null
          koordinat_asli?: string | null
          latitude?: number | null
          longitude?: number | null
          import_batch_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          id: string
          nama_file: string
          tanggal_upload: string
          jumlah_baris_terbaca: number
          jumlah_baris_valid: number
          jumlah_baris_error: number
          status: 'Menunggu Verifikasi' | 'Diterapkan' | 'Dibatalkan'
          catatan_error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama_file: string
          tanggal_upload?: string
          jumlah_baris_terbaca?: number
          jumlah_baris_valid?: number
          jumlah_baris_error?: number
          status?: 'Menunggu Verifikasi' | 'Diterapkan' | 'Dibatalkan'
          catatan_error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama_file?: string
          tanggal_upload?: string
          jumlah_baris_terbaca?: number
          jumlah_baris_valid?: number
          jumlah_baris_error?: number
          status?: 'Menunggu Verifikasi' | 'Diterapkan' | 'Dibatalkan'
          catatan_error?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          ticket_number: string
          timestamp: string
          customer_id_input: string | null
          customer_ref_id: string | null
          kecamatan_id: string | null
          desa_id: string | null
          customer_name: string
          alamat_detail: string | null
          customer_phone: string | null
          latitude: number | null
          longitude: number | null
          channel: 'WhatsApp' | 'Instagram' | 'Facebook' | 'TikTok' | 'Telepon'
          jenis_interaksi_id: string
          category_id: string
          detail: string | null
          status: 'Berjalan' | 'Selesai'
          handling_type_id: string
          screenshot_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_number?: string
          timestamp: string
          customer_id_input?: string | null
          customer_ref_id?: string | null
          kecamatan_id?: string | null
          desa_id?: string | null
          customer_name: string
          alamat_detail?: string | null
          customer_phone?: string | null
          latitude?: number | null
          longitude?: number | null
          channel: 'WhatsApp' | 'Instagram' | 'Facebook' | 'TikTok' | 'Telepon'
          jenis_interaksi_id: string
          category_id: string
          detail?: string | null
          status?: 'Berjalan' | 'Selesai'
          handling_type_id: string
          screenshot_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string
          timestamp?: string
          customer_id_input?: string | null
          customer_ref_id?: string | null
          kecamatan_id?: string | null
          desa_id?: string | null
          customer_name?: string
          alamat_detail?: string | null
          customer_phone?: string | null
          latitude?: number | null
          longitude?: number | null
          channel?: 'WhatsApp' | 'Instagram' | 'Facebook' | 'TikTok' | 'Telepon'
          jenis_interaksi_id?: string
          category_id?: string
          detail?: string | null
          status?: 'Berjalan' | 'Selesai'
          handling_type_id?: string
          screenshot_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_status_history: {
        Row: {
          id: string
          ticket_id: string
          status_sebelumnya: string | null
          status_baru: string
          catatan: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          status_sebelumnya?: string | null
          status_baru: string
          catatan?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          status_sebelumnya?: string | null
          status_baru?: string
          catatan?: string | null
          changed_at?: string
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          id: string
          periode: string
          jumlah_baris: number
          file_name: string | null
          status_kirim: 'Berhasil' | 'Gagal' | null
          dikirim_ke: string | null
          created_at: string
        }
        Insert: {
          id?: string
          periode: string
          jumlah_baris?: number
          file_name?: string | null
          status_kirim?: 'Berhasil' | 'Gagal' | null
          dikirim_ke?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          periode?: string
          jumlah_baris?: number
          file_name?: string | null
          status_kirim?: 'Berhasil' | 'Gagal' | null
          dikirim_ke?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Ticket = Tables<'tickets'>
export type TicketInsert = InsertTables<'tickets'>
export type InteractionType = Tables<'interaction_types'>
export type Category = Tables<'categories'>
export type HandlingType = Tables<'handling_types'>
export type District = Tables<'districts'>
export type Village = Tables<'villages'>
export type CustomerMaster = Tables<'customer_master'>
export type ImportBatch = Tables<'import_batches'>
export type BackupLog = Tables<'backup_logs'>
export type TicketStatusHistory = Tables<'ticket_status_history'>

export type Channel = Ticket['channel']
export type TicketStatus = Ticket['status']
