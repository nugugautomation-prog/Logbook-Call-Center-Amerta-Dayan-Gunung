# Module Breakdown: Aplikasi Logbook & Ticketing Call Center PDAM (Mobile-First Edition)

## Modul 1: Autentikasi & Sesi Seluler (Auth Module)
- **Purpose:** Mengamankan akses aplikasi agar hanya dapat digunakan oleh Admin Call Center secara praktis di perangkat seluler.
- **Scope:** Halaman login responsif, manajemen token/sesi lokal.
- **Dependencies:** Database tabel Admin.
- **Input:** Username dan Password.
- **Process:** Verifikasi kecocokan hash password.
- **Output:** Sesi aktif admin dan pengalihan ke Dashboard seluler.
- **Business Rules:** Akses eksklusif single-user.
- **Permission:** Admin only.
- **Validation:** Username dan password wajib diisi.
- **Acceptance Criteria:** Admin berhasil masuk ke dashboard seluler setelah memasukkan kredensial yang benar.

## Modul 2: Form Input Tiket Ramah Jempol (Ticket Module)
- **Purpose:** Mencatat interaksi dan keluhan pelanggan secara cepat langsung dari ponsel, tanpa perlu ketik ulang data pelanggan yang sudah ada.
- **Scope:** Form modal/halaman tambah tiket vertikal, generate nomor tiket otomatis, pencarian ID Pelanggan dengan autofill (termasuk fallback 4-digit kecamatan/desa), validasi input, dan update status/tujuan penanganan via kartu dengan pencatatan riwayat status otomatis.
- **Dependencies:** Database tabel Tickets, Ticket_Status_History, Customer_Master, Districts, Villages, Handling_Types (Supabase, single source of truth).
- **Input:** Tanggal/Waktu, **ID Pelanggan** (9 digit lengkap atau cukup 4 digit pertama), Nama Pelanggan, Alamat, No. HP (auto-terisi tapi bisa diedit), Kanal, Jenis Interaksi, Kategori, **Tujuan Penanganan**, Detail, File Screenshot.
- **Process:**
  1. Admin mengetik ID Pelanggan. Sistem baca 2 digit pertama → cocokkan ke master Kecamatan; 2 digit berikutnya → cocokkan ke master Desa (dalam kecamatan tsb) — keduanya langsung tampil sebagai label (misal "Kec. X / Desa Y") begitu 4 digit pertama diketik.
  2. **Jika ID lengkap 9 digit** dan cocok dengan `Customer_Master`: sistem otomatis isi Nama, No. HP, Alamat Detail, Golongan Pelanggan, dan koordinat (latitude/longitude).
  3. **Jika admin hanya mengetik 4 digit** (kecamatan+desa) karena ID lengkap tidak diketahui: sistem tetap menampilkan nama kecamatan & desa hasil mapping, tapi Nama Pelanggan dan Alamat **wajib diketik manual**, dan koordinat dibiarkan **kosong** (BR-014).
  4. Admin memilih **Tujuan Penanganan** (Selesai di Edukasi / Eskalasi ke Bidang Pelayanan / Eskalasi ke Kantor Cabang / Lainnya) — sistem otomatis set `status` = "Selesai" jika pilihan tsb bertanda `otomatis_selesai`, atau "Berjalan" jika berupa eskalasi (BR-004).
  5. No. HP hasil autofill tetap bisa diedit manual (snapshot per tiket, tidak mengubah data master).
  6. Validasi data, pembuatan nomor tiket otomatis, kompresi gambar klien (max 2MB), penyimpanan ke cloud, dan pencatatan otomatis setiap perubahan status ke tabel riwayat.
- **Output:** Tiket tersimpan (lengkap dengan kecamatan/desa, dan koordinat jika tersedia) dan daftar logbook seluler ter-update.
- **Business Rules:** BR-001, BR-002, BR-004, BR-011, BR-014.
- **Permission:** Admin.
- **Validation:** Field wajib (Tanggal, Nama, Kanal, Jenis Interaksi, Kategori, Tujuan Penanganan) tidak boleh kosong; No. HP jika diisi harus numerik; minimal 4 digit ID Pelanggan (kecamatan+desa) sebaiknya terisi agar tiket punya konteks lokasi administratif.
- **Acceptance Criteria:** Mengetik ID Pelanggan 9 digit yang valid otomatis mengisi Nama, Alamat, No. HP, dan koordinat; mengetik 4 digit saja tetap menampilkan nama kecamatan/desa meski field lain harus manual; perubahan status otomatis tercatat di riwayat.

## Modul 3: Dashboard KPI & Analitik Seluler (Dashboard Module)
- **Purpose:** Menyajikan ringkasan KPI, pengingat tiket menggantung, dan analisis pola aduan dalam format layar ponsel yang ringkas — membantu Admin dan manajemen melihat "apa yang paling sering dikeluhkan" dan "dari mana" tanpa hitung manual.
- **Scope:** Kartu metrik ringkasan, *reminder* mingguan, dan 6 widget analitik berikut:
  1. **Top Kategori Aduan** — ranking kategori paling sering muncul (bar chart, periode terpilih: minggu ini/bulan ini).
  2. **Top Wilayah Komplain** — ranking Desa (dengan label Kecamatan induknya) berdasarkan jumlah tiket, membantu manajemen menandai wilayah yang butuh perhatian infrastruktur.
  3. **Kategori per Wilayah (Drill-Down)** — tap sebuah Desa di widget #2 untuk melihat breakdown kategori aduan di desa tsb, agar kelihatan bukan cuma "desa mana paling ramai" tapi "ramai karena apa".
  4. **Tren Harian/Mingguan** — grafik garis jumlah tiket per hari, untuk melihat lonjakan (misal pasca info kenaikan tarif) dan pola hari/jam paling sibuk.
  5. **Rasio & Durasi Tujuan Penanganan** — untuk tiap Tujuan Penanganan (Eskalasi ke Bidang Pelayanan / Kantor Cabang / dll), tampilkan jumlah "Selesai" vs "Berjalan" dan rata-rata lama penanganan (hari), untuk melihat unit mana yang responsif.
  6. **Pelanggan Berulang (Repeat Complainer)** — daftar ID Pelanggan yang membuat ≥3 tiket dalam 30 hari terakhir, sebagai sinyal kemungkinan masalah teknis yang belum tuntas di lokasi tsb.
  7. **Aging Report** — daftar tiket berstatus "Berjalan", diurutkan dari yang **paling lama menggantung** (bukan cuma reminder mingguan biasa), lengkap dengan jumlah hari sejak dibuat.
  8. **Channel Favorit per Kategori** — tabel silang Channel × Kategori, untuk melihat pola (misal "Cara Bayar Online" didominasi WhatsApp, sementara "Lapor Gangguan" lebih banyak via Telepon).
- **Dependencies:** Data dari Modul Tiket (Tickets, Districts, Villages, Categories, Handling_Types).
- **Input:** Kumpulan data tiket dari database, filter periode (Hari Ini/Minggu Ini/Bulan Ini/Kustom).
- **Process:** Agregasi & ranking data real-time per widget; deteksi pelanggan berulang via `GROUP BY customer_id_input` dengan filter jumlah ≥3 dalam rentang 30 hari berjalan; aging dihitung dari `now() - created_at` untuk tiket `status = "Berjalan"`.
- **Output:** Tampilan visual metrik KPI dan analitik, responsif di layar ponsel.
- **Business Rules:** Menyoroti tiket yang masih berstatus "Berjalan", dikelompokkan per Tujuan Penanganan.
- **Permission:** Admin.
- **Validation:** Agregasi aman dari nilai kosong (*null safety*); widget yang datanya kosong (misal belum ada pelanggan berulang) menampilkan pesan "Belum ada data" bukan error.
- **Acceptance Criteria:** Semua 8 widget menampilkan angka/ranking yang akurat sesuai periode terpilih dan pas di layar ponsel; tap pada Desa di widget Top Wilayah membuka breakdown kategori untuk desa tsb.
- **Catatan (Next Plan):** Peta sebaran titik komplain (menggunakan koordinat latitude/longitude yang sudah tersedia di data) **ditunda ke tahap pengembangan berikutnya**, belum masuk cakupan versi ini.

## Modul 4: Pelaporan & Ekspor Excel (Reporting Module)
- **Purpose:** Menyediakan rekapitulasi data siap cetak untuk tanda tangan manajemen dan BPK.
- **Scope:** Tombol unduh laporan format Excel (.xlsx, 3 sheet: Kop & Ringkasan, Data Rinci, Rekap per Tujuan Penanganan — lihat `Report_Format.md`) yang dapat diakses dari perangkat seluler maupun desktop.
- **Dependencies:** Data Modul Tiket & Modul Riwayat Status.
- **Input:** Rentang tanggal atau filter periode laporan (Hari Ini / Minggu Ini / Bulan Ini / Kustom).
- **Process:** Agregasi data (total per kategori, channel, jenis interaksi, kecamatan/desa, tujuan penanganan), lalu disusun ke 3 sheet sesuai format baku, termasuk blok tanda tangan otomatis.
- **Output:** File unduhan Excel formal, siap cetak tanpa perlu diformat ulang.
- **Business Rules:** Format kolom baku sesuai `Report_Format.md`, konsisten untuk rekap harian, mingguan, dan bulanan.
- **Permission:** Admin.
- **Validation:** Pastikan data periode tersedia sebelum diekspor.
- **Acceptance Criteria:** File Excel berhasil diunduh dengan 3 sheet lengkap, blok tanda tangan tercetak rapi, siap ditandatangani Admin, Manager, dan Direktur.

## Modul 5: Backup Otomatis (Backup Module)
**[BARU]**
- **Purpose:** Melindungi data dari risiko hilang akibat keterbatasan layanan hosting gratis.
- **Scope:** Proses terjadwal (cron/scheduled function) yang mengekspor data ke CSV dan mengirimkannya via email; tombol backup manual di dashboard; halaman riwayat backup.
- **Dependencies:** Data Modul Tiket, tabel Backup_Logs, layanan email pihak ketiga (gratis).
- **Input:** Terjadwal otomatis (harian 23:00, mingguan Senin pagi) atau dipicu manual oleh admin.
- **Process:** Query seluruh/data-baru tiket → generate file CSV → kirim ke email admin → catat hasil proses ke Backup_Logs.
- **Output:** File CSV terkirim ke email; entri baru di riwayat backup.
- **Business Rules:** Backup wajib berjalan otomatis; kegagalan backup harus tercatat dan terlihat oleh admin (bukan gagal diam-diam).
- **Permission:** Admin (untuk trigger manual & lihat riwayat); proses terjadwal berjalan otomatis di backend.
- **Validation:** Sistem menandai status "Gagal" jika email tidak terkirim, agar admin bisa retry manual.
- **Acceptance Criteria:** Backup harian & mingguan berjalan sesuai jadwal, email diterima admin, dan riwayat backup dapat dilihat di aplikasi.

## Modul 6: Pengaturan Master Data (Settings Module)
- **Purpose:** Memungkinkan admin mengelola sendiri semua pilihan yang sering berubah (Jenis Interaksi, Kategori, Tujuan Penanganan, Kecamatan, Desa) tanpa perlu ubah kode aplikasi.
- **Scope:** Halaman Pengaturan dengan 5 tab: Jenis Interaksi, Kategori, Tujuan Penanganan, Kecamatan, Desa. Tiap tab punya daftar item, tombol tambah, edit nama/urutan, dan toggle aktif/nonaktif.
- **Dependencies:** Tabel Interaction_Types, Categories, Handling_Types, Districts, Villages; dicek silang ke tabel Tickets/Customer_Master untuk validasi pemakaian.
- **Input:** Nama item baru/ubahan, urutan tampil, status aktif. Khusus Kategori: opsional dikaitkan ke Jenis Interaksi. Khusus Tujuan Penanganan: tandai apakah otomatis menyelesaikan tiket (`otomatis_selesai`). Khusus Desa: wajib pilih Kecamatan induknya.
- **Process:** Validasi nama tidak kosong dan unik per tab (kode desa unik per kecamatan); saat admin menekan "Hapus" pada item yang sudah pernah dipakai, sistem otomatis mengalihkan ke "Nonaktifkan" (soft delete) sesuai BR-009.
- **Output:** Daftar pilihan di form Tiket dan proses impor pelanggan otomatis mengikuti data aktif terbaru dari menu ini — tanpa perlu update aplikasi.
- **Business Rules:** BR-005, BR-009, BR-015.
- **Permission:** Admin.
- **Validation:** Nama wajib diisi & unik dalam tab yang sama; item yang sedang dipakai tidak bisa dihapus permanen; Desa wajib punya Kecamatan induk.
- **Acceptance Criteria:** Admin bisa menambah, mengedit, mengubah urutan, dan menonaktifkan Jenis Interaksi/Kategori/Tujuan Penanganan/Kecamatan/Desa dari menu Pengaturan, dan perubahan langsung tercermin di form input tiket dan proses impor tanpa perlu deploy ulang aplikasi.

## Modul 7: Impor & Verifikasi Data Pelanggan (Customer Import Module)
- **Purpose:** Menghindari pengetikan ulang nama, alamat, dan lokasi setiap kali ada komplain, dengan memanfaatkan data pelanggan bulanan dari aplikasi billing pihak ketiga (yang tidak menyediakan API).
- **Scope:** Halaman "Impor Data Pelanggan" di menu Pengaturan — unggah file Excel, pratinjau hasil parsing (termasuk mapping kecamatan/desa), konfirmasi terap, dan riwayat impor.
- **Dependencies:** Tabel Customer_Master, Import_Batches, Districts, Villages.
- **Input:** File Excel (.xlsx/.csv) bulanan berisi kolom: **ID Pelanggan, Nama, No. HP, Alamat Detail, Koordinat (gabungan lat,long), Golongan Pelanggan.**
- **Process:**
  1. Admin unggah file di awal bulan.
  2. Sistem membaca & memvalidasi setiap baris: ID Pelanggan wajib 9 digit angka; 2 digit pertama & 2 digit berikutnya dicocokkan ke master Kecamatan & Desa (jika kodenya belum terdaftar, baris ditandai error — BR-015).
  3. Kolom koordinat gabungan otomatis dipecah menjadi `latitude` dan `longitude` terpisah (BR-013).
  4. Sistem menampilkan **halaman pratinjau**: ringkasan jumlah baris valid/error, daftar baris error (termasuk kode kecamatan/desa tak dikenal) untuk ditinjau, dan perubahan data dibanding bulan lalu.
  5. Admin menekan **"Terapkan"** untuk mengonfirmasi import (data lama dengan ID sama di-*update*, ID baru ditambahkan) — atau **"Batalkan"**.
  6. Hasil proses dicatat ke `Import_Batches`.
- **Output:** Data pelanggan master ter-update (lengkap dengan kecamatan/desa hasil mapping) dan siap dipakai untuk autofill di Modul Tiket.
- **Business Rules:** BR-010, BR-012, BR-013, BR-015.
- **Permission:** Admin.
- **Validation:** File wajib berformat kolom yang sesuai template; import tidak diterapkan ke database sebelum admin klik "Terapkan" di halaman pratinjau (BR-012); baris dengan kode kecamatan/desa tak dikenal tidak diterapkan sampai master data dilengkapi.
- **Acceptance Criteria:** Admin berhasil unggah file bulanan, melihat pratinjau hasil (termasuk baris error jika ada), dan setelah menekan "Terapkan", data pelanggan di seluruh aplikasi ter-update — ID Pelanggan yang baru diimpor langsung bisa dicari & autofill di form Tiket.
