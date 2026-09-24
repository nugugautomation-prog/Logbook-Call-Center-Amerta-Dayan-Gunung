-- =====================================================
-- Migration 001: Initial Schema
-- Aplikasi Logbook & Ticketing Call Center PDAM
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Admins (Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. Interaction Types (Jenis Interaksi)
-- =====================================================
CREATE TABLE IF NOT EXISTS interaction_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. Categories (Kategori)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  jenis_interaksi_id UUID REFERENCES interaction_types(id) ON DELETE SET NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 4. Handling Types (Tujuan Penanganan)
-- =====================================================
CREATE TABLE IF NOT EXISTS handling_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  otomatis_selesai BOOLEAN DEFAULT false,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 5. Districts (Kecamatan)
-- =====================================================
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_kecamatan VARCHAR(2) UNIQUE NOT NULL,
  nama_kecamatan VARCHAR(100) NOT NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. Villages (Desa)
-- =====================================================
CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kecamatan_id UUID NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
  kode_desa VARCHAR(2) NOT NULL,
  nama_desa VARCHAR(100) NOT NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (kecamatan_id, kode_desa)
);

-- =====================================================
-- 7. Import Batches (harus sebelum customer_master)
-- =====================================================
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_file VARCHAR(255) NOT NULL,
  tanggal_upload TIMESTAMPTZ NOT NULL DEFAULT now(),
  jumlah_baris_terbaca INTEGER DEFAULT 0,
  jumlah_baris_valid INTEGER DEFAULT 0,
  jumlah_baris_error INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Menunggu Verifikasi'
    CHECK (status IN ('Menunggu Verifikasi', 'Diterapkan', 'Dibatalkan')),
  catatan_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 8. Customer Master
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id VARCHAR(9) UNIQUE NOT NULL,
  kecamatan_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  desa_id UUID REFERENCES villages(id) ON DELETE SET NULL,
  nama VARCHAR(255) NOT NULL,
  alamat_detail TEXT,
  golongan_pelanggan VARCHAR(50),
  no_hp VARCHAR(20),
  koordinat_asli VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 9. Tickets
-- =====================================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL,
  customer_id_input VARCHAR(9),
  customer_ref_id UUID REFERENCES customer_master(id) ON DELETE SET NULL,
  kecamatan_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  desa_id UUID REFERENCES villages(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  alamat_detail TEXT,
  customer_phone VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  channel VARCHAR(20) NOT NULL
    CHECK (channel IN ('WhatsApp','Instagram','Facebook','TikTok','Telepon')),
  jenis_interaksi_id UUID NOT NULL REFERENCES interaction_types(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  detail TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'Berjalan'
    CHECK (status IN ('Berjalan','Selesai')),
  handling_type_id UUID NOT NULL REFERENCES handling_types(id),
  screenshot_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 10. Ticket Status History
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status_sebelumnya VARCHAR(10),
  status_baru VARCHAR(10) NOT NULL,
  catatan TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 11. Backup Logs
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  periode VARCHAR(100) NOT NULL,
  jumlah_baris INTEGER DEFAULT 0,
  file_name VARCHAR(255),
  status_kirim VARCHAR(10) CHECK (status_kirim IN ('Berhasil','Gagal')),
  dikirim_ke VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Trigger: Auto-record status history on ticket update
-- =====================================================
CREATE OR REPLACE FUNCTION record_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_status_history (ticket_id, status_sebelumnya, status_baru)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ticket_status_audit ON tickets;
CREATE TRIGGER ticket_status_audit
  AFTER UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION record_status_change();

-- =====================================================
-- Function: Generate ticket number with monthly reset
-- Format: TIK-CC-[YYMM]-[XXXX]
-- =====================================================
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  v_yymm TEXT;
  v_seq INTEGER;
  v_last_ticket TEXT;
  v_last_yymm TEXT;
BEGIN
  v_yymm := TO_CHAR(NOW() AT TIME ZONE 'Asia/Makassar', 'YYMM');

  -- Get the latest ticket number to detect month rollover
  SELECT ticket_number INTO v_last_ticket
  FROM tickets
  WHERE ticket_number != ''
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_ticket IS NOT NULL THEN
    v_last_yymm := SUBSTRING(v_last_ticket FROM 8 FOR 4);
  ELSE
    v_last_yymm := '';
  END IF;

  -- Get max sequence for current month, or start at 0 if new month
  IF v_last_yymm = v_yymm THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 13 FOR 4) AS INTEGER)), 0)
    INTO v_seq
    FROM tickets
    WHERE ticket_number LIKE 'TIK-CC-' || v_yymm || '-%';
  ELSE
    v_seq := 0;
  END IF;

  v_seq := v_seq + 1;
  NEW.ticket_number := 'TIK-CC-' || v_yymm || '-' || LPAD(v_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number ON tickets;
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number = '' OR NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id_input);
CREATE INDEX IF NOT EXISTS idx_tickets_kecamatan ON tickets(kecamatan_id);
CREATE INDEX IF NOT EXISTS idx_tickets_desa ON tickets(desa_id);
CREATE INDEX IF NOT EXISTS idx_customer_master_customer_id ON customer_master(customer_id);
CREATE INDEX IF NOT EXISTS idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
