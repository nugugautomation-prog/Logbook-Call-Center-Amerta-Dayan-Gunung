-- =====================================================
-- Migration 003: Seed Master Data Awal
-- =====================================================

-- Jenis Interaksi defaults
INSERT INTO interaction_types (nama, urutan) VALUES
  ('Komplain', 1),
  ('Pertanyaan/Informasi', 2),
  ('Lapor Gangguan/Kerusakan', 3),
  ('Konten Sosmed', 4),
  ('Lainnya', 5)
ON CONFLICT (nama) DO NOTHING;

-- Kategori defaults
INSERT INTO categories (nama, urutan) VALUES
  ('Tagihan Tidak Sesuai', 1),
  ('Harga Naik', 2),
  ('Cara Daftar', 3),
  ('Cara Bayar Online', 4),
  ('Lapor Gangguan', 5),
  ('Status Pengaduan', 6),
  ('Lain-lain', 7)
ON CONFLICT (nama) DO NOTHING;

-- Tujuan Penanganan defaults
INSERT INTO handling_types (nama, otomatis_selesai, urutan) VALUES
  ('Selesai di Edukasi (Tanpa Eskalasi)', true, 1),
  ('Eskalasi ke Bidang Pelayanan', false, 2),
  ('Eskalasi ke Kantor Cabang', false, 3),
  ('Lainnya', false, 4)
ON CONFLICT (nama) DO NOTHING;

-- Master Kecamatan dari Master Wilayah.xlsx
INSERT INTO districts (kode_kecamatan, nama_kecamatan, urutan) VALUES
  ('01', 'Tanjung', 1),
  ('02', 'Pemenang', 2),
  ('03', 'Bayan', 3),
  ('04', 'Kayangan', 4),
  ('05', 'Gangga', 5)
ON CONFLICT (kode_kecamatan) DO UPDATE SET nama_kecamatan = EXCLUDED.nama_kecamatan;

-- Master Desa dari Master Wilayah.xlsx
-- 01. Tanjung
INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '01', 'Sokong', 1 FROM districts WHERE kode_kecamatan = '01'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '02', 'Tanjung', 2 FROM districts WHERE kode_kecamatan = '01'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '03', 'Jenggala & Sama Guna', 3 FROM districts WHERE kode_kecamatan = '01'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '04', 'Tegal Maja', 4 FROM districts WHERE kode_kecamatan = '01'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '05', 'Sigar Penjalin', 5 FROM districts WHERE kode_kecamatan = '01'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '06', 'Medana', 6 FROM districts WHERE kode_kecamatan = '01'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

-- 02. Pemenang
INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '01', 'Pemenang Timur', 1 FROM districts WHERE kode_kecamatan = '02'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '02', 'Pemenang Barat', 2 FROM districts WHERE kode_kecamatan = '02'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '03', 'Malaka', 3 FROM districts WHERE kode_kecamatan = '02'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '04', 'Gili Air', 4 FROM districts WHERE kode_kecamatan = '02'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

-- 03. Bayan
INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '01', 'Kr. Bajo', 1 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '03', 'Anyar', 2 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '04', 'Loloan', 3 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '05', 'Tumpang Sari', 4 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '06', 'Sambi'' Elen', 5 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '07', 'Senaru', 6 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '08', 'Sukadana', 7 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '09', 'Akar-Akar', 8 FROM districts WHERE kode_kecamatan = '03'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

-- 04. Kayangan
INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '01', 'Kayangan', 1 FROM districts WHERE kode_kecamatan = '04'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '02', 'Dangiang', 2 FROM districts WHERE kode_kecamatan = '04'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '03', 'Sesait', 3 FROM districts WHERE kode_kecamatan = '04'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '04', 'Santong', 4 FROM districts WHERE kode_kecamatan = '04'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '05', 'Pendua', 5 FROM districts WHERE kode_kecamatan = '04'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '06', 'Gumantar', 6 FROM districts WHERE kode_kecamatan = '04'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

-- 05. Gangga
INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '01', 'Gondang', 1 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '02', 'Bentek', 2 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '03', 'Segara Katon', 3 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '04', 'Sambi'' Bangkol', 4 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '05', 'Rempek', 5 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '06', 'Rempek Darusalam', 6 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;

INSERT INTO villages (kecamatan_id, kode_desa, nama_desa, urutan)
SELECT id, '07', 'Genggelang', 7 FROM districts WHERE kode_kecamatan = '05'
ON CONFLICT (kecamatan_id, kode_desa) DO UPDATE SET nama_desa = EXCLUDED.nama_desa;
