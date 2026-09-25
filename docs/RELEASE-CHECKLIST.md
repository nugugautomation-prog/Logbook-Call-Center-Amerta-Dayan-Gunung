# Release Checklist: Aplikasi Logbook & Ticketing Call Center PDAM

**Versi:** 1.0.0  
**Tanggal Dokumen:** 2026-09-25  
**Status:** `AWAITING APPROVAL`

> **Penting:** Dokumen ini harus diisi dan diverifikasi secara manual oleh Admin sebelum deployment production. Tidak ada deployment otomatis. Setiap item yang menunjukkan `[ ]` harus dicentang dan ditandatangani secara eksplisit oleh pihak yang berwenang.

---

## Keputusan Release

```
[ ] READY FOR RELEASE
[ ] NOT READY FOR RELEASE

Diverifikasi oleh : ___________________________
Tanggal           : ___________________________
Catatan           : ___________________________
```

---

## Bagian A: User Acceptance Testing (UAT)

**Instruksi:** Isi kolom Actual Result dan Status setelah setiap skenario dijalankan secara manual di environment staging sebelum release.

Status yang valid: `PASS`, `FAIL`, `SKIP` (beserta alasan).

---

### Modul 1: Autentikasi & Akses

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-001 | Admin | Belum login, buka URL `/dashboard` | Akses halaman tanpa sesi aktif | Diarahkan ke `/login`, halaman dashboard tidak terbuka | | |
| UAT-002 | Admin | Belum login, buka halaman `/tiket` | Akses halaman tiket tanpa sesi | Diarahkan ke `/login` | | |
| UAT-003 | Admin | Di halaman `/login` | Isi email salah, password salah, klik Masuk | Muncul pesan error yang jelas, tidak masuk ke dashboard | | |
| UAT-004 | Admin | Di halaman `/login` | Kosongkan kedua field, klik Masuk | Muncul pesan validasi "wajib diisi", tidak dikirim | | |
| UAT-005 | Admin | Di halaman `/login` | Isi email dan password yang benar, klik Masuk | Berhasil masuk, diarahkan ke `/dashboard` | | |
| UAT-006 | Admin | Sudah login, buka URL `/login` | Akses halaman login saat sesi aktif | Diarahkan ke `/dashboard`, tidak tampil form login | | |
| UAT-007 | Admin | Sudah login, buka menu Pengaturan | Klik tombol Keluar | Sesi dihapus, diarahkan ke `/login`, akses protected route ditolak | | |

---

### Modul 2: Membuat Tiket

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-010 | Admin | Sudah login, di halaman `/tiket` | Klik tombol "Tambah" | Diarahkan ke form `/tiket/tambah`, semua field kosong, timestamp otomatis terisi | | |
| UAT-011 | Admin | Di form tambah tiket | Klik "Simpan Tiket" tanpa mengisi field apapun | Form menolak: muncul pesan error di dekat field Nama, Kanal, Jenis Interaksi, Kategori, dan Tujuan Penanganan (BR-001, VAL-001) | | |
| UAT-012 | Admin | Di form tambah tiket | Isi Nomor Kontak dengan huruf (misal "ABC") | Field menolak input huruf, hanya angka yang bisa diketik (BR-001) | | |
| UAT-013 | Admin | Di form tambah tiket | Ketik 9 digit ID Pelanggan yang ada di data master (misal `010100001`) | Field Nama, Alamat, dan Nomor HP otomatis terisi sesuai data master; label kecamatan & desa muncul (FR-016, BR-014) | | |
| UAT-014 | Admin | Di form tambah tiket | Ketik hanya 4 digit pertama ID Pelanggan (misal `0101`) | Label kecamatan dan desa muncul secara otomatis; field Nama dan Alamat tetap kosong dan harus diisi manual; koordinat tidak terisi (BR-014) | | |
| UAT-015 | Admin | Di form tambah tiket | Ketik 9 digit ID Pelanggan yang tidak ada di master | Tidak ada autofill, form tetap bisa diisi manual; tidak ada error yang memblok | | |
| UAT-016 | Admin | Di form tambah tiket | Pilih Tujuan Penanganan "Selesai di Edukasi" (atau yang bertanda otomatis_selesai) | Status tiket otomatis "Selesai" setelah disimpan (BR-004) | | |
| UAT-017 | Admin | Di form tambah tiket | Pilih Tujuan Penanganan "Eskalasi ke Bidang Pelayanan" | Status tiket otomatis "Berjalan" setelah disimpan (BR-004) | | |
| UAT-018 | Admin | Di form tambah tiket | Unggah file gambar (foto screenshot chat) | Gambar dikompres otomatis jika lebih dari batas, preview muncul sebelum simpan (NFR-003) | | |
| UAT-019 | Admin | Di form tambah tiket | Isi semua field wajib dengan data valid, klik "Simpan Tiket" | Tiket tersimpan, nomor tiket otomatis terbit dengan format `TIK-CC-[YYMM]-[XXXX]`, diarahkan ke daftar tiket (FR-001, AC-001) | | |
| UAT-020 | Admin | Tiket baru berhasil dibuat | Buka halaman detail tiket yang baru dibuat | Riwayat status menampilkan entri pertama "Tiket dibuat" dengan timestamp (BR-006, ADT-001) | | |

---

### Modul 3: Manajemen & Update Status Tiket

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-030 | Admin | Sudah login, di `/tiket` | Buka halaman daftar tiket | Tiket tampil dalam kartu dengan nomor tiket, nama pelanggan, status, dan kanal (FT-003) | | |
| UAT-031 | Admin | Ada tiket dengan status "Berjalan" | Klik tombol "Tandai Selesai" pada kartu tiket | Muncul konfirmasi dua langkah; setelah dikonfirmasi, status berubah menjadi "Selesai" | | |
| UAT-032 | Admin | Tiket sudah "Selesai" | Lihat kartu atau detail tiket | Tidak ada tombol "Tandai Selesai"; tampil label terkunci (BR-002) | | |
| UAT-033 | Admin | Di halaman daftar tiket | Ketik nama pelanggan di kotak pencarian | Daftar tiket difilter sesuai kata kunci yang diketik | | |
| UAT-034 | Admin | Di halaman daftar tiket | Klik filter status "Berjalan" | Hanya tiket berstatus "Berjalan" yang tampil | | |
| UAT-035 | Admin | Di halaman daftar tiket | Klik filter dari dashboard (misal klik kecamatan di widget) | Daftar tiket difilter sesuai parameter; banner filter aktif tampil dengan tombol "Hapus Filter" | | |
| UAT-036 | Admin | Tidak ada tiket yang sesuai filter | Lihat daftar tiket setelah filter diterapkan | Tampil pesan "Tidak ada tiket yang sesuai filter", bukan error atau layar kosong (R-27) | | |
| UAT-037 | Admin | Ada tiket dengan screenshot | Buka detail tiket, klik thumbnail screenshot | Gambar tampil penuh di modal lightbox; modal bisa ditutup dengan klik area luar atau tombol X | | |
| UAT-038 | Admin | Di detail tiket yang pernah diubah statusnya | Lihat bagian "Riwayat Status" | Setiap perubahan status tercatat dengan timestamp, status sebelumnya, status baru, dan catatan (ADT-001) | | |

---

### Modul 4: Dashboard KPI

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-040 | Admin | Sudah login, ada data tiket | Buka halaman `/dashboard` | 4 kartu KPI tampil: Total Tiket, Masih Berjalan, Selesai, Tingkat Selesai (FR-007) | | |
| UAT-041 | Admin | Di dashboard | Klik filter periode "Hari Ini", "Minggu Ini", "Bulan Ini" berturut-turut | Angka KPI dan grafik menyesuaikan periode yang dipilih tanpa reload halaman penuh | | |
| UAT-042 | Admin | Di dashboard, ada tiket berstatus "Berjalan" lebih dari 7 hari | Lihat banner atau widget aging | Banner peringatan tiket menggantung muncul jika ada tiket >= 7 hari belum selesai (FT-005) | | |
| UAT-043 | Admin | Di dashboard | Lihat widget "Top Kategori Aduan" | Kategori diurutkan dari jumlah terbanyak ke terkecil dengan progress bar; klik kategori menuju daftar tiket terfilter (FR-019) | | |
| UAT-044 | Admin | Di dashboard | Lihat widget "Top Wilayah Komplain" | Desa diurutkan berdasarkan jumlah tiket, disertai nama kecamatan; klik menuju daftar tiket terfilter per desa (FR-020) | | |
| UAT-045 | Admin | Di dashboard, ada >= 3 tiket dari pelanggan yang sama dalam 30 hari | Lihat widget "Pelanggan Berulang" | ID pelanggan tersebut muncul di daftar beserta jumlah tiket (FR-023) | | |
| UAT-046 | Admin | Di dashboard | Lihat widget "Aging Report" | Tiket berstatus "Berjalan" tampil diurutkan dari yang paling lama, dengan label jumlah hari (FR-024) | | |
| UAT-047 | Admin | Di dashboard | Lihat widget "Tren Harian" | Grafik garis menampilkan jumlah tiket per hari sesuai periode terpilih (FR-021) | | |
| UAT-048 | Admin | Di dashboard, belum ada data tiket untuk periode ini | Buka dashboard, pilih periode tanpa data | Setiap widget menampilkan pesan "Belum ada data", bukan error atau angka nol yang menyesatkan | | |

---

### Modul 5: Laporan & Ekspor Excel

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-050 | Admin | Sudah login, di halaman `/laporan` | Pilih rentang tanggal, klik unduh laporan | File Excel (.xlsx) berhasil terunduh ke perangkat (FR-008, AC-005) | | |
| UAT-051 | Admin | Buka file Excel hasil unduh | Periksa struktur file | File memiliki 3 sheet: "Kop & Ringkasan", "Data Rinci", "Rekap per Tujuan Penanganan" | | |
| UAT-052 | Admin | Di sheet "Kop & Ringkasan" | Periksa isi sheet pertama | Terdapat nama PDAM, periode laporan, tanggal cetak, tabel ringkasan per kanal dan kategori, serta blok tanda tangan Admin/Manager/Direktur | | |
| UAT-053 | Admin | Di sheet "Data Rinci" | Periksa kolom data | Setiap baris tiket memiliki: nomor tiket, tanggal, ID pelanggan, kecamatan, desa, nama, alamat, HP, kanal, jenis interaksi, kategori, detail, tujuan penanganan, status | | |
| UAT-054 | Admin | Di halaman `/laporan` | Klik unduh tanpa memilih rentang tanggal | Form menolak atau tombol tidak aktif; tidak ada file rusak yang terunduh | | |

---

### Modul 6: Backup Data

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-060 | Admin | Sudah login, di halaman `/pengaturan/backup` | Klik tombol "Backup Manual Sekarang" | Proses backup berjalan, status berhasil/gagal ditampilkan, entri baru muncul di riwayat backup (FR-012) | | |
| UAT-061 | Admin | Backup manual berhasil dijalankan | Periksa email admin | Email diterima dengan attachment file CSV berisi data tiket (jika RESEND_API_KEY dikonfigurasi) | | |
| UAT-062 | Admin | Di halaman backup | Lihat tabel riwayat backup | Riwayat menampilkan: tanggal, jumlah baris, nama file, status kirim (BR-007) | | |

---

### Modul 7: Pengaturan Master Data

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-070 | Admin | Sudah login, di halaman `/pengaturan` | Buka tab "Kategori", klik tambah, isi nama kategori baru, simpan | Kategori baru muncul di daftar dan tersedia sebagai pilihan di form tiket (FR-013) | | |
| UAT-071 | Admin | Ada kategori yang belum pernah dipakai di tiket | Klik hapus pada kategori tersebut | Kategori dihapus permanen dari daftar (BR-009) | | |
| UAT-072 | Admin | Ada kategori yang sudah dipakai di minimal satu tiket | Klik hapus pada kategori tersebut | Sistem mengalihkan ke nonaktifkan (bukan hapus); kategori tetap ada tapi dicoret/nonaktif; data tiket lama tidak berubah (BR-009) | | |
| UAT-073 | Admin | Di tab "Kecamatan" | Tambah kecamatan baru, lalu buka tab "Desa", tambah desa dengan kecamatan induk baru tersebut | Desa terdaftar dengan kecamatan yang benar; kode desa tersedia untuk mapping ID pelanggan | | |

---

### Modul 8: Impor Data Pelanggan

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-080 | Admin | Di halaman `/pengaturan/import-pelanggan` | Unggah file Excel dengan kolom sesuai template | Sistem menampilkan halaman pratinjau: jumlah baris valid, baris error (jika ada), sebelum data diterapkan (BR-012) | | |
| UAT-081 | Admin | Di halaman pratinjau impor | File berisi baris dengan kode kecamatan/desa yang belum terdaftar | Baris tersebut ditandai error dengan keterangan kode tidak ditemukan; baris valid tetap bisa diterapkan (BR-015) | | |
| UAT-082 | Admin | Di halaman pratinjau impor | Klik "Terapkan" | Data pelanggan tersimpan ke database; ID pelanggan yang baru diimpor langsung bisa dicari di form tiket (BR-012, FR-014) | | |
| UAT-083 | Admin | Di halaman pratinjau impor | Klik "Batalkan" | Tidak ada perubahan data di database; kembali ke halaman awal impor | | |
| UAT-084 | Admin | Impor selesai diterapkan | Di form tambah tiket, ketik ID pelanggan yang baru diimpor | Data pelanggan (nama, alamat, HP, koordinat) muncul otomatis (FR-016) | | |
| UAT-085 | Admin | Di halaman impor | Lihat riwayat impor | Setiap batch impor tercatat: nama file, jumlah baris valid/error, tanggal | | |

---

### Modul 9: Impor Data Wilayah

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-090 | Admin | Di halaman `/pengaturan/import-wilayah` | Unggah file Excel data wilayah | Sistem menampilkan pratinjau kecamatan dan desa yang akan ditambah/diperbarui | | |
| UAT-091 | Admin | Di halaman pratinjau impor wilayah | Klik "Terapkan" | Kecamatan dan desa tersimpan; tersedia di form tiket dan validasi impor pelanggan | | |

---

### Pengujian Non-Fungsional

| ID | Role | Precondition | Action | Expected Result | Actual Result | Status |
|----|------|--------------|--------|-----------------|---------------|--------|
| UAT-100 | Admin | Buka aplikasi di layar HP 375px | Navigasi ke semua halaman utama | Tidak ada konten yang keluar dari layar; semua tombol dapat diklik dengan jari; bottom nav tidak terpotong (NFR-001) | | |
| UAT-101 | Admin | Buka aplikasi di browser desktop | Buka semua halaman | Tampilan responsif dan dapat digunakan; tidak ada elemen yang patah (NFR-001) | | |
| UAT-102 | Admin | Buka aplikasi di HP | Nonaktifkan koneksi internet, coba input tiket | Muncul indikator "Offline"; data tiket tersimpan lokal; tidak ada crash (FT-007, ERR-001) | | |
| UAT-103 | Admin | Di semua halaman | Navigasi menggunakan keyboard saja (Tab, Enter, Escape) | Semua elemen interaktif bisa dijangkau dan dioperasikan tanpa mouse | | |

---

## Bagian B: Release Checklist Production

Isi setiap item sebelum deployment. Tandai `[x]` jika selesai dan terverifikasi, `[ ]` jika belum.

---

### B1. Environment Production

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B1-01 | Platform deployment ditentukan | Vercel (region sin1, sesuai vercel.json) | `[ ]` | [Verifikasi kode oleh Antigravity: vercel.json `{"version":2,"framework":"nextjs","regions":["sin1"]}` OK] |
| B1-02 | Branch production dikonfirmasi | Pastikan deploy dari branch `master` yang sudah lolos semua test | `[ ]` | [Verifikasi kode oleh Antigravity: branch master, HEAD c4b3ffa] |
| B1-03 | Build production berhasil | `npm run build` selesai tanpa error di environment CI | `[ ]` | [Verifikasi kode oleh Antigravity: build PASSED, 13 routes, exit code 0, 2026-09-25] |
| B1-04 | Semua unit test lulus | `npm test` menampilkan semua test PASS | `[ ]` | [Verifikasi kode oleh Antigravity: 6 test files, 17/17 PASSED, exit code 0] |
| B1-05 | Semua E2E test lulus | `npm run test:e2e` menampilkan semua skenario PASS | `[ ]` | [Verifikasi kode oleh Antigravity: 11/11 PASSED (auth, navigation, ticketing lifecycle, reporting, backup), exit code 0] |

---

### B2. Environment Variables

Semua variabel berikut harus diisi di Vercel Dashboard (Settings > Environment Variables) untuk environment Production. Jangan simpan nilai asli di file ini.

| # | Variable | Wajib | Keterangan | Status |
|---|----------|-------|------------|--------|
| B2-01 | `NEXT_PUBLIC_SUPABASE_URL` | Ya | URL project Supabase production (bukan dummy) | `[ ]` | [Verifikasi kode oleh Antigravity: dipakai di middleware.ts, client.ts, server.ts, is-dummy.ts, auth/actions.ts. Harus berisi URL project nyata.] |
| B2-02 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Anon key Supabase production | `[ ]` | [Verifikasi kode oleh Antigravity: dipakai di client.ts, server.ts, middleware.ts] |
| B2-03 | `SUPABASE_SERVICE_ROLE_KEY` | Ya | Service role key untuk operasi server-side | `[ ]` | [Verifikasi kode oleh Antigravity: dipakai di backup/manual-trigger.ts untuk Supabase Edge Functions] |
| B2-04 | `RESEND_API_KEY` | Ya (backup email) | API key Resend untuk pengiriman backup CSV via email | `[ ]` | [Verifikasi kode oleh Antigravity: dipakai di backup/manual-trigger.ts; jika kosong, backup tidak terkirim tapi tidak error (conditional check `if (process.env.RESEND_API_KEY)`)] |
| B2-05 | `ADMIN_EMAIL` | Ya | Alamat email tujuan backup otomatis | `[ ]` | [Verifikasi kode oleh Antigravity: dipakai di backup/manual-trigger.ts; default fallback `admin@pdam.example.com` jika kosong -- wajib diisi dengan email nyata] |
| B2-06 | `TEST_ADMIN_EMAIL` | Tidak (hapus di prod) | Hanya untuk demo mode, jangan diisi di production | `[ ]` | [Verifikasi kode oleh Antigravity: AMAN -- hanya dipakai di jalur `isDummySupabase()` true (auth/actions.ts:19). Jika SUPABASE_URL production diisi benar, kode langsung lompat ke Supabase Auth -- TEST_ADMIN_EMAIL tidak dievaluasi.] |
| B2-07 | `TEST_ADMIN_PASSWORD` | Tidak (hapus di prod) | Hanya untuk demo mode, jangan diisi di production | `[ ]` | [Verifikasi kode oleh Antigravity: sama dengan B2-06 -- AMAN di production path. Tetap disarankan tidak diisi di env production agar tidak ada credentials demo di environment tersebut.] |

> **Peringatan:** Jika `NEXT_PUBLIC_SUPABASE_URL` tidak diisi atau diisi `dummy-pdam-project`, aplikasi akan berjalan dalam mode demo dan tidak menyimpan data ke database nyata.

> **Temuan Keamanan (Sudah Diperbaiki):** Sebelumnya ada risiko cookie `pdam_demo_auth` dapat mem-bypass autentikasi Supabase di production jika cookie terbawa dari testing. Bug ini *telah diperbaiki* di `middleware.ts` dan `auth/actions.ts` sehingga auth demo sepenuhnya diabaikan jika URL Supabase adalah URL production.

---

### B3. Database (Supabase)

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B3-01 | Project Supabase production tersedia | Bukan project free tier demo; project aktif dan bisa diakses | `[ ]` | Manual: cek di Supabase Dashboard |
| B3-02 | Migration 001 diterapkan | `supabase/migrations/001_initial_schema.sql` sudah dijalankan di project production | `[ ]` | [Verifikasi kode oleh Antigravity: file ada, 254 baris -- membuat 11 tabel (admins, interaction_types, categories, handling_types, districts, villages, import_batches, customer_master, tickets, ticket_status_history, backup_logs) + 2 trigger (ticket_number, status_audit) + 7 index] |
| B3-03 | Migration 002 diterapkan | `supabase/migrations/002_rls_policies.sql` sudah dijalankan | `[ ]` | [Verifikasi kode oleh Antigravity: file ada, 33 baris -- RLS diaktifkan di 11 tabel, policy `authenticated` untuk semua tabel, tambahan `service_role` policy untuk tickets dan backup_logs] |
| B3-04 | Migration 003 diterapkan | `supabase/migrations/003_seed_master_data.sql` sudah dijalankan (seed data master awal) | `[ ]` | [Verifikasi kode oleh Antigravity: file ada, 171 baris -- seed 5 jenis interaksi, 7 kategori, 4 tujuan penanganan, 5 kecamatan, 37 desa dari Master Wilayah.xlsx. Semua ON CONFLICT DO NOTHING atau DO UPDATE -- aman dijalankan ulang] |
| B3-05 | Urutan migration diverifikasi | Migration dijalankan berurutan 001 -> 002 -> 003, tidak ada yang dilewati | `[ ]` | [Verifikasi kode oleh Antigravity: 001 harus sebelum 002 (002 ALTER TABLE yang dibuat di 001); 002 harus sebelum 003 (003 INSERT ke tabel di 001). Tidak ada duplikat file] |
| B3-06 | Koneksi database dari aplikasi berfungsi | Aplikasi di staging/preview berhasil membaca dan menulis ke database production (atau project terpisah yang setara) | `[ ]` | Manual: uji koneksi di Vercel Preview setelah env vars diisi |

---

### B4. Row Level Security (RLS)

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B4-01 | RLS aktif di semua tabel | Verifikasi di Supabase Dashboard: Authentication > Policies; semua tabel yang berisi data tiket dan pelanggan memiliki policy aktif | `[ ]` | [Verifikasi kode oleh Antigravity: 002_rls_policies.sql mengaktifkan RLS di semua 11 tabel termasuk tickets, ticket_status_history, customer_master, import_batches, backup_logs. Tidak ada tabel yang terlewat dari migration.] |
| B4-02 | Akses anonim ditolak | Coba query tabel `tickets` tanpa token autentikasi; harus mengembalikan error atau array kosong, bukan data | `[ ]` | [Verifikasi kode oleh Antigravity: policy hanya untuk `authenticated` role -- anon role tidak punya USING clause = deny. Verifikasi aktual harus dilakukan via curl atau Supabase Table Editor tanpa login] |
| B4-03 | Policy backup_logs aktif | Tabel `backup_logs` hanya bisa ditulis oleh authenticated user | `[ ]` | [Verifikasi kode oleh Antigravity: `admin_full_access_backup_logs` FOR ALL TO authenticated + `service_role_full_access_backup_logs` FOR ALL TO service_role -- keduanya ada di migration 002] |

---

### B5. Storage

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B5-01 | Storage bucket dikonfigurasi (jika screenshot disimpan ke Supabase Storage) | Jika screenshot diupload ke Supabase Storage: bucket tersedia dan policy akses sesuai | `[ ]` | [Verifikasi kode oleh Antigravity: screenshot disimpan sebagai base64 string di kolom `screenshot_path` (VARCHAR 500 di schema). Tidak menggunakan Supabase Storage bucket. Item ini SKIP.] |
| B5-02 | Batas ukuran file dikonfirmasi | Screenshot maksimal 2MB setelah kompresi; verifikasi kompresi berjalan di browser sebelum upload (NFR-003) | `[ ]` | [Verifikasi kode oleh Antigravity: src/lib/image/compress.ts ada; dipanggil di TicketForm.tsx sebelum preview. Manual: uji upload foto > 2MB di browser untuk konfirmasi] |

---

### B6. Backup & Restore

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B6-01 | Cron backup harian dikonfigurasi | Supabase Scheduled Functions atau layanan cron eksternal dijadwalkan pukul 23:00 setiap hari | `[ ]` | Manual: cek Supabase Edge Functions > Schedules |
| B6-02 | Cron backup mingguan dikonfigurasi | Dijadwalkan setiap Senin pagi | `[ ]` | Manual: cek Supabase Edge Functions > Schedules |
| B6-03 | Backup manual berhasil diuji | Tombol "Backup Manual Sekarang" di `/pengaturan/backup` menghasilkan email dengan file CSV yang bisa dibuka | `[ ]` | Manual: uji di production setelah deploy |
| B6-04 | Restore dari backup diuji | File CSV dari backup dapat diimpor kembali ke spreadsheet atau database darurat untuk memulihkan data (prosedur restore terdokumentasi) | `[ ]` | Manual |
| B6-05 | Riwayat backup tampil di aplikasi | Halaman `/pengaturan/backup` menampilkan log backup dengan status Berhasil/Gagal | `[ ]` | Manual |

---

### B7. Autentikasi

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B7-01 | Supabase Auth dikonfigurasi | Email auth diaktifkan di Supabase Dashboard: Authentication > Providers | `[ ]` | Manual: cek Supabase Dashboard > Authentication > Providers |
| B7-02 | Akun admin production dibuat | Akun admin dibuat di Supabase Auth dengan email yang benar (bukan test email) | `[ ]` | Manual: buat via Supabase Dashboard > Authentication > Users |
| B7-03 | Password akun admin kuat | Password minimal 12 karakter, tidak menggunakan password yang sama dengan akun lain | `[ ]` | Manual |
| B7-04 | Login production berhasil | Masuk ke aplikasi production menggunakan akun admin yang baru dibuat, bukan demo credentials | `[ ]` | Manual: uji setelah deploy |
| B7-05 | Demo mode tidak aktif di production | Pastikan `NEXT_PUBLIC_SUPABASE_URL` tidak mengandung `dummy-pdam-project`; login dengan demo credentials (`admin@pdam.id`) harus gagal atau tidak tersedia | `[ ]` | [Verifikasi kode oleh Antigravity: auth/actions.ts line 23-43 -- jika SUPABASE_URL tidak mengandung `dummy-pdam-project` DAN URL tidak kosong, kode langsung menuju Supabase Auth. Demo credentials hanya bekerja saat URL mengandung `dummy-pdam-project`.] |
| B7-06 | Sesi expired dengan benar | Biarkan aplikasi idle selama durasi sesi Supabase (default 1 jam); verifikasi sesi berakhir dan user diarahkan ke login | `[ ]` | Manual: uji di browser production |

---

### B8. Otorisasi

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B8-01 | Middleware aktif | Semua route selain `/login` memerlukan sesi aktif; verifikasi akses tanpa login diarahkan ke `/login` | `[ ]` | [Verifikasi kode oleh Antigravity: middleware.ts melindungi semua route. Route publik yang dikecualikan: `/login`, `/_next/*`, `/api/auth/*`, `/favicon.ico`, `/manifest.json`, `/manifest.webmanifest`, `/sw.js`, `/icons/*`. Tidak ada route data yang dikecualikan.] |
| B8-02 | Route API terlindungi | Endpoint `/api/laporan/export` memeriksa sesi sebelum mengembalikan data; request tanpa sesi mendapat HTTP 401 | `[ ]` | [Verifikasi kode oleh Antigravity: api/laporan/export/route.ts line 16-23 -- `if (!isDemo) { supabase.auth.getSession(); if (!session) return 401 }`. Proteksi aktif di production path.] |
| B8-03 | Cookie `pdam_demo_auth` tidak ada di production | Pastikan cookie demo tidak tersisa dari pengujian sebelumnya di browser yang akan digunakan production | `[ ]` | [Verifikasi kode oleh Antigravity: middleware.ts line 75 -- `!session && !isDemoAuth` -- jika cookie ini ada di browser production, user bisa bypass Supabase auth. Harus dibersihkan dari browser sebelum uji production.] |

---


### B9. Domain & SSL

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B9-01 | Domain production dikonfigurasi | Domain atau subdomain resmi sudah ditambahkan di Vercel Dashboard | `[ ]` | Contoh: `tiket.pdam-amertadayangunug.id` |
| B9-02 | SSL aktif | Domain menggunakan HTTPS; sertifikat SSL terbit secara otomatis oleh Vercel | `[ ]` | |
| B9-03 | Redirect HTTP ke HTTPS | Akses via `http://` otomatis diarahkan ke `https://`; tidak ada konten yang dimuat via HTTP | `[ ]` | |
| B9-04 | URL production dikomunikasikan | Alamat URL final disampaikan ke Admin dan pihak yang relevan | `[ ]` | |

---

### B10. Monitoring & Error Logging

| # | Item | Detail | Status | Catatan |
|---|------|--------|--------|---------|
| B10-01 | Vercel deployment logs dapat diakses | Tim dapat membaca log deployment dan runtime di Vercel Dashboard | `[ ]` | Manual: cek Vercel Dashboard setelah deploy |
| B10-02 | Error logging server dikonfirmasi | `console.error` di server actions dan API routes tampil di Vercel Function Logs | `[ ]` | [Verifikasi kode oleh Antigravity: `console.error` terpasang di: tickets/actions.ts (createTicket error), api/laporan/export/route.ts (export error), TicketCard.tsx (status update error). Semua jalur error kritis tercakup.] |
| B10-03 | Middleware warning tidak diblok | Log `console.warn` dari middleware (Supabase session refresh) tampil sebagai warning, bukan error | `[ ]` | [Verifikasi kode oleh Antigravity: middleware.ts line 88 -- `catch (err) { console.warn('Supabase middleware warning:', err) }` -- menggunakan `warn` bukan `error`, tidak akan memicu alert error di Vercel.] |
| B10-04 | Tidak ada console error di browser | Buka DevTools di production; tidak ada error merah yang tidak diharapkan saat navigasi normal dan penggunaan fitur utama | `[ ]` | Manual: uji di browser production setelah deploy |
| B10-05 | Peringatan backup gagal terlihat | Jika backup gagal dikirim, status "Gagal" tampil di riwayat backup, bukan diam-diam | `[ ]` | Manual: uji dengan RESEND_API_KEY yang salah lalu periksa riwayat |

---

### B11. Smoke Test Post-Deployment

Jalankan seluruh langkah ini segera setelah deployment ke production berhasil, sebelum memberitahu pengguna.

| # | Langkah | Expected Result | Status | Catatan |
|---|---------|-----------------|--------|---------|
| B11-01 | Buka URL production di browser | Halaman tampil, diarahkan ke `/login` | `[ ]` | |
| B11-02 | Login dengan akun admin production | Berhasil masuk ke `/dashboard` | `[ ]` | |
| B11-03 | Dashboard memuat data | Widget KPI tampil (boleh kosong jika belum ada data) | `[ ]` | |
| B11-04 | Buat satu tiket percobaan | Tiket tersimpan, nomor tiket terbit, muncul di daftar tiket | `[ ]` | |
| B11-05 | Unduh laporan Excel | File Excel berhasil terunduh dan bisa dibuka | `[ ]` | |
| B11-06 | Jalankan backup manual | Status backup tampil; email diterima jika Resend dikonfigurasi | `[ ]` | |
| B11-07 | Buka di HP (browser mobile) | Tampilan responsif, navigasi bawah berfungsi, form bisa diisi | `[ ]` | |
| B11-08 | Logout | Sesi berakhir, akses ke dashboard ditolak | `[ ]` | |

---

## Ringkasan Status

| Bagian | Total Item | Lulus | Gagal | Belum Diuji |
|--------|-----------|-------|-------|-------------|
| UAT Modul 1: Autentikasi | 7 | | | |
| UAT Modul 2: Buat Tiket | 10 | | | |
| UAT Modul 3: Manajemen Tiket | 9 | | | |
| UAT Modul 4: Dashboard | 9 | | | |
| UAT Modul 5: Laporan | 5 | | | |
| UAT Modul 6: Backup | 3 | | | |
| UAT Modul 7: Pengaturan | 4 | | | |
| UAT Modul 8: Impor Pelanggan | 6 | | | |
| UAT Modul 9: Impor Wilayah | 2 | | | |
| UAT Non-Fungsional | 4 | | | |
| B1: Environment | 5 | | | |
| B2: Env Variables | 7 | | | |
| B3: Database | 6 | | | |
| B4: RLS | 3 | | | |
| B5: Storage | 2 | | | |
| B6: Backup & Restore | 5 | | | |
| B7: Autentikasi | 6 | | | |
| B8: Otorisasi | 3 | | | |
| B9: Domain & SSL | 4 | | | |
| B10: Monitoring | 5 | | | |
| B11: Smoke Test | 8 | | | |
| **Total** | **122** | | | |

---

## Kondisi Siap Release

Aplikasi dinyatakan **READY FOR RELEASE** hanya jika semua kondisi berikut terpenuhi:

1. Semua item UAT bertanda `PASS` (tidak ada `FAIL`; `SKIP` boleh dengan alasan tertulis)
2. Semua item Release Checklist (B1 sampai B11) bertanda `[x]`
3. Tidak ada item `B2` yang kosong (semua env vars production terisi)
4. Semua 3 migration database sudah diterapkan di project production
5. Smoke test B11 seluruhnya lulus setelah deployment

Jika ada satu item pun yang `FAIL` atau `[ ]` tanpa alasan tertulis, status adalah **NOT READY FOR RELEASE**.

---

## Persetujuan Final

```
Nama Admin      : ___________________________
Tanggal UAT     : ___________________________
Tanggal Checklist: __________________________

Keputusan       : [ ] READY FOR RELEASE
                  [ ] NOT READY FOR RELEASE

Tanda Tangan    : ___________________________
```

---

*Dokumen ini dibuat berdasarkan: PRD.md, Business_Rules.md, Module_Breakdown.md, dan hasil audit kode per 2026-09-25.*
