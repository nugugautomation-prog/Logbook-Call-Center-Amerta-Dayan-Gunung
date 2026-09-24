# PROJECT CONTEXT: Aplikasi Logbook & Ticketing Call Center PDAM

## 1. Project Overview
Aplikasi web *logbook/ticketing* ringan mandiri yang dirancang khusus untuk Admin Call Center Perumda Air Minum Amerta Dayan Gunung (Lombok Utara). Aplikasi ini dibuat untuk mendokumentasikan, mengkategorikan, dan merekapitulasi seluruh interaksi dan keluhan pelanggan dari berbagai saluran komunikasi guna memenuhi kebutuhan audit BPK serta mempermudah pembuatan laporan harian, mingguan, dan bulanan.

## 2. Business Problem
- Data interaksi dan komplain pelanggan tercecer di berbagai platform chat (WhatsApp, Instagram, Facebook, TikTok) dan telepon.
- Kesulitan dalam menyajikan rekapitulasi cepat saat dilakukan audit oleh BPK.
- Proses rekapitulasi manual menggunakan rumus Excel yang rumit, rentan salah, dan memakan waktu banyak.

## 3. Project Objectives
- Menyediakan sistem pencatatan interaksi dan komplain pelanggan yang terpusat dan terstruktur.
- Otomatisasi rekapitulasi data berdasarkan kategori, *channel*, dan status penanganan tanpa perlu rumus Excel manual.
- Menyediakan Dashboard KPI/Analitik interaktif untuk melihat ringkasan performa layanan **dan pola aduan** (kategori terbanyak, wilayah paling sering komplain, tren waktu, pelanggan berulang) secara cepat, sebagai bahan pertimbangan manajemen.
- Menghasilkan *export* laporan Excel formal yang siap dicetak dan ditandatangani oleh Admin, Manager, dan Direktur.
- Memiliki fitur pengingat (*reminder*) mingguan untuk tiket yang masih menggantung.

## 4. Target User
- **Single User (Admin Call Center / Gugun):** Memiliki akses penuh untuk melakukan input data, *edit*, manajemen status, melihat *dashboard*, dan mengunduh laporan. 
- *Catatan:* Manager dan Direktur tidak memiliki akun login khusus, melainkan menerima hasil cetak fisik laporan bertanda tangan.

## 5. Business Workflow & Rules
1. **Penerimaan Layanan:** Admin melayani pelanggan via WA, IG, FB, TikTok, atau Telepon.
2. **Pencatatan:** Setelah selesai, admin membuka aplikasi dan mengisi form logbook.
3. **Eskalasi (Opsional):** Jika butuh penanganan teknis, aduan diteruskan (*forward*) ke bidang pelayanan, dan status di aplikasi diubah.
4. **Validasi & Keamanan Data (Audit BPK):**
   - Nomor tiket digenerate otomatis dan unik per tahun/bulan.
   - Nomor kontak wajib berupa angka.
   - Data yang sudah berstatus **"Selesai"** dikunci/tidak boleh dihapus sembarangan demi keamanan audit BPK.

## 6. Data Structure (Fields)
- **Nomor Tiket:** Otomatis (Unik)
- **Tanggal & Waktu:** Format YYYY-MM-DD HH:MM (Wajib)
- **ID Pelanggan:** 9 digit angka (2 kode kecamatan + 2 kode desa + 5 kode unik), atau cukup 4 digit pertama jika ID lengkap tidak diketahui
- **Kecamatan / Desa:** Otomatis termapping dari ID Pelanggan (master data dikelola di Pengaturan)
- **Nama Pelanggan & Alamat:** Auto-terisi jika ID Pelanggan (9 digit) cocok, atau diketik manual jika hanya 4 digit
- **Nomor Kontak / HP:** Auto-terisi dari Data Pelanggan Master (jika tersedia), tetap bisa diedit manual per tiket
- **Koordinat (Latitude & Longitude):** Auto-terisi hanya jika ID Pelanggan lengkap (9 digit) cocok; kosong jika hanya 4 digit
- **Channel Komunikasi:** Pilihan (WhatsApp / Instagram / Facebook / TikTok / Telepon)
- **Jenis Interaksi:** Pilihan dari master data yang dapat dikelola admin di menu Pengaturan
- **Kategori:** Pilihan dari master data yang dapat dikelola admin di menu Pengaturan
- **Detail:** Teks (Opsional)
- **Tujuan Penanganan:** Pilihan dari master data yang dapat dikelola admin (default: Selesai di Edukasi, Eskalasi ke Bidang Pelayanan, Eskalasi ke Kantor Cabang, Lainnya)
- **Status:** Otomatis mengikuti Tujuan Penanganan (Berjalan / Selesai)
- **File Screenshot:** Berkas gambar (Tidak wajib, dengan batasan ukuran/kompresi otomatis).

## 7. Outputs & Deliverables
- **Dashboard KPI/Analitik:** Statistik total aduan, **Top Kategori Aduan**, **Top Wilayah Komplain (dengan drill-down kategori per desa)**, **tren harian/mingguan**, **rasio & durasi per Tujuan Penanganan**, **daftar Pelanggan Berulang (≥3 tiket/30 hari)**, **Aging Report (tiket menggantung terlama)**, dan **tabel silang Channel × Kategori**.
- **Reminder Mingguan:** Pemberitahuan otomatis untuk tiket yang masih berstatus "Berjalan".
- **Export Excel:** Format laporan 3-sheet (Kop & Ringkasan, Data Rinci, Rekap per Tujuan Penanganan) siap cetak untuk tanda tangan — urutan kiri ke kanan: Admin (pembuat laporan), Manager, Direktur — lihat `Report_Format.md`.
- **Backup Otomatis:** Ekspor CSV terjadwal (harian & mingguan) dikirim ke email admin.
- **Menu Pengaturan:** Admin dapat menambah/mengedit/menonaktifkan pilihan Jenis Interaksi, Kategori, Tujuan Penanganan, Kecamatan, dan Desa kapan saja tanpa perlu ubah kode aplikasi.
- **Impor Data Pelanggan Bulanan:** Admin mengunggah file Excel (ID, Nama, No. HP, Alamat Detail, Koordinat, Golongan Pelanggan) dari aplikasi billing pihak ketiga di awal bulan, sistem memverifikasi lewat pratinjau (termasuk mapping kecamatan/desa) sebelum diterapkan, lalu data tersebut jadi sumber autofill di form tiket.
- **[Next Plan]** Peta sebaran titik komplain berbasis koordinat — ditunda ke tahap pengembangan berikutnya.

## 8. Technical Architecture & Constraints
- **Platform:** Web-based Application (PWA).
- **Deployment & Hosting:** **Satu (1) database cloud (Supabase) sebagai satu-satunya sumber data**, dengan aplikasi di-deploy ke satu platform hosting (Vercel/Render), agar dapat diakses secara fleksibel dari kantor maupun dari rumah secara *real-time* melalui URL yang sama — bukan dua sistem terpisah yang saling sinkron.
- **Offline / Edge Case Handling:** Mekanisme *Offline-First Caching* (penyimpanan sementara di browser via IndexedDB) apabila jaringan internet di kantor mengalami gangguan, yang akan otomatis sinkron ke Supabase saat koneksi pulih.
- **Storage Constraint:** Pembatasan ukuran file *screenshot* (kompresi otomatis) agar kapasitas penyimpanan server gratis tetap terjaga.
- **Backup:** Ekspor CSV otomatis terjadwal (harian & mingguan) dikirim ke email admin sebagai mitigasi risiko data hilang di layanan gratis.

## 9. Out of Scope
- Integrasi API resmi WhatsApp yang berbayar (input murni manual).
- Integrasi API langsung ke aplikasi billing/akunting pihak ketiga (admin tidak memiliki akses API, hanya akses unduh file Excel manual bulanan — lihat Modul Impor Data Pelanggan).
- Sistem *multi-user* atau hak akses login khusus untuk atasan/direksi.
- Fitur *auto-reply* / bot balasan otomatis.
- **[BARU] Peta sebaran titik komplain** — data koordinat sudah tersedia di struktur data, namun visualisasi peta ditunda ke tahap pengembangan berikutnya (*next plan*).
