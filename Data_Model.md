# Data Model: Aplikasi Logbook & Ticketing Call Center PDAM (Mobile-First Edition)

## 1. Entitas Utama: Admin (Users)
Menyimpan kredensial autentikasi untuk admin tunggal.
- `id` (UUID, Primary Key)
- `username` (Varchar, Unique, Not Null)
- `password_hash` (Varchar, Not Null)
- `email` (Varchar, Not Null) -> Digunakan sebagai tujuan pengiriman backup CSV otomatis
- `created_at` (Timestamp)

## 2. Entitas Baru: Jenis Interaksi (Interaction_Types)
Master data yang bisa dikelola admin sendiri lewat menu Pengaturan (bisa tambah, edit nama, ubah urutan, nonaktifkan) — tidak lagi hardcode di kode aplikasi.
- `id` (UUID, Primary Key)
- `nama` (Varchar, Unique, Not Null) -> Contoh awal: Komplain, Pertanyaan/Informasi, Lapor Gangguan/Kerusakan, Konten Sosmed, Lainnya (isi awal/default, boleh diubah admin)
- `urutan` (Integer)
- `aktif` (Boolean, Default: true)
- `created_at` / `updated_at` (Timestamp)

## 3. Entitas Baru: Kategori (Categories)
Master data kategori, juga dikelola lewat menu Pengaturan.
- `id` (UUID, Primary Key)
- `nama` (Varchar, Unique, Not Null) -> Contoh awal: Tagihan Tidak Sesuai, Harga Naik, Cara Daftar, Cara Bayar Online, Lapor Gangguan, Status Pengaduan, Lain-lain
- `jenis_interaksi_id` (UUID, FK -> Interaction_Types.id, Nullable)
- `urutan` (Integer)
- `aktif` (Boolean, Default: true)
- `created_at` / `updated_at` (Timestamp)

## 4. Entitas Baru: Tujuan Penanganan (Handling_Types)
**[BARU]** Master data cara penyelesaian/eskalasi tiket, dikelola lewat menu Pengaturan (pola sama seperti Jenis Interaksi & Kategori).
- `id` (UUID, Primary Key)
- `nama` (Varchar, Unique, Not Null) -> Default awal: **"Selesai di Edukasi (Tanpa Eskalasi)"**, **"Eskalasi ke Bidang Pelayanan"**, **"Eskalasi ke Kantor Cabang"**, **"Lainnya"** — boleh ditambah/diedit admin
- `otomatis_selesai` (Boolean, Default: false) -> Jika `true` (misal untuk "Selesai di Edukasi"), sistem otomatis set `Tickets.status` = "Selesai" begitu dipilih, karena tidak perlu menunggu tindak lanjut pihak lain. Jika `false` (opsi eskalasi), `Tickets.status` tetap "Berjalan" sampai admin update manual setelah pihak terkait konfirmasi selesai.
- `urutan` (Integer)
- `aktif` (Boolean, Default: true)
- `created_at` / `updated_at` (Timestamp)

## 5. Entitas Baru: Kecamatan (Districts)
**[BARU]** Master data kecamatan, dikelola lewat menu Pengaturan. Dua digit pertama ID Pelanggan PDAM merujuk ke kode kecamatan ini.
- `id` (UUID, Primary Key)
- `kode_kecamatan` (Varchar(2), Unique, Not Null) -> Contoh: "01", "02", "03", "04", "05", dst — sesuai jumlah kecamatan wilayah layanan PDAM
- `nama_kecamatan` (Varchar, Not Null)
- `urutan` (Integer)
- `aktif` (Boolean, Default: true)
- `created_at` / `updated_at` (Timestamp)

## 6. Entitas Baru: Desa (Villages)
**[BARU]** Master data desa, dikelola lewat menu Pengaturan. Digit ke-3 & ke-4 ID Pelanggan merujuk ke kode desa ini, dalam lingkup satu kecamatan.
- `id` (UUID, Primary Key)
- `kecamatan_id` (UUID, FK -> Districts.id, Not Null) -> Desa ini milik kecamatan yang mana
- `kode_desa` (Varchar(2), Not Null) -> Contoh: "01", "02", dst. **Unique per kecamatan** (kode "02" boleh dipakai ulang di kecamatan berbeda, tapi tidak boleh dobel dalam kecamatan yang sama)
- `nama_desa` (Varchar, Not Null)
- `urutan` (Integer)
- `aktif` (Boolean, Default: true)
- `created_at` / `updated_at` (Timestamp)

## 7. Entitas Baru: Data Pelanggan Master (Customer_Master)
**[BARU]** Salinan data pelanggan yang diperbarui admin setiap awal bulan dari file Excel aplikasi billing pihak ketiga (tidak ada akses API, hanya file unduhan berisi: ID, Nama, Alamat Detail, Koordinat, Golongan Pelanggan). Menjadi sumber autofill saat input tiket.
- `id` (UUID, Primary Key)
- `customer_id` (Varchar(9), Unique, Not Null) -> Format 9 digit: **2 digit kode kecamatan + 2 digit kode desa + 5 digit kode unik pelanggan** (contoh: `050200666` = kecamatan `05`, desa `02`, kode unik `00666`)
- `kecamatan_id` (UUID, FK -> Districts.id, Nullable) -> Diisi otomatis oleh sistem saat impor, hasil pencocokan 2 digit pertama `customer_id` ke tabel Kecamatan
- `desa_id` (UUID, FK -> Villages.id, Nullable) -> Diisi otomatis oleh sistem saat impor, hasil pencocokan digit ke-3–4 `customer_id` ke tabel Desa (dalam kecamatan yang sesuai)
- `nama` (Varchar, Not Null)
- `alamat_detail` (Text, Nullable) -> **[BARU]** Sesuai kolom "Alamat Detail" di file impor
- `golongan_pelanggan` (Varchar, Nullable) -> **[BARU]** Sesuai kolom "Golongan Pelanggan" di file impor (contoh: Rumah Tangga, Niaga, Sosial, Pemerintah — mengikuti istilah baku PDAM)
- `no_hp` (Varchar, Nullable) -> Sesuai kolom "No. HP" di file impor bulanan; bisa berbeda dari nomor yang tercatat di suatu tiket lama jika pelanggan sudah ganti nomor (lihat BR-011)
- `koordinat_asli` (Varchar, Nullable) -> Teks mentah kolom koordinat gabungan dari file sumber
- `latitude` (Decimal, Nullable) -> Hasil pemisahan otomatis dari `koordinat_asli`
- `longitude` (Decimal, Nullable) -> Hasil pemisahan otomatis dari `koordinat_asli`
- `import_batch_id` (UUID, FK -> Import_Batches.id)
- `updated_at` (Timestamp)

## 8. Entitas Baru: Riwayat Impor Data Pelanggan (Import_Batches)
Mencatat setiap kali admin mengunggah file Excel data pelanggan bulanan, termasuk hasil verifikasinya.
- `id` (UUID, Primary Key)
- `nama_file` (Varchar, Not Null)
- `tanggal_upload` (Timestamp, Not Null)
- `jumlah_baris_terbaca` / `jumlah_baris_valid` / `jumlah_baris_error` (Integer)
- `status` (Varchar) -> "Menunggu Verifikasi" / "Diterapkan" / "Dibatalkan"
- `catatan_error` (Text, Nullable) -> **[DIPERLUAS]** Termasuk baris yang gagal karena kode kecamatan/desa pada ID Pelanggan belum terdaftar di master Kecamatan/Desa (lihat BR-016)
- `created_at` (Timestamp)

## 9. Entitas Utama: Tiket / Logbook (Tickets)
Menyimpan data interaksi dan komplain pelanggan yang dioptimalkan untuk input seluler.
- `id` (UUID, Primary Key)
- `ticket_number` (Varchar, Unique, Not Null) -> Format: TIK-CC-[YYMM]-[XXXX], digenerate Supabase, reset ke 0001 tiap bulan/tahun baru
- `timestamp` (Timestamp, Not Null)
- `customer_id_input` (Varchar(4-9), Nullable) -> **[DIUBAH]** Apa yang diketik admin: ID lengkap 9 digit, ATAU cukup 4 digit pertama (kecamatan+desa) jika ID lengkap tidak diketahui
- `customer_ref_id` (UUID, FK -> Customer_Master.id, Nullable) -> Terisi otomatis **hanya jika** 9 digit lengkap cocok dengan Data Pelanggan Master → memicu autofill Nama, Alamat, Golongan, No. HP (jika ada), dan koordinat
- `kecamatan_id` (UUID, FK -> Districts.id, Nullable) -> **[BARU]** Diisi otomatis dari 2 digit pertama `customer_id_input`, baik itu skenario ID lengkap maupun 4-digit saja
- `desa_id` (UUID, FK -> Villages.id, Nullable) -> **[BARU]** Diisi otomatis dari digit ke-3–4 `customer_id_input`
- `customer_name` (Varchar, Not Null) -> Auto-terisi jika `customer_ref_id` ditemukan (ID lengkap); jika hanya 4 digit, **wajib diketik manual**
- `alamat_detail` (Text, Nullable) -> **[BARU]** Auto-terisi jika `customer_ref_id` ditemukan; jika hanya 4 digit, diketik manual
- `customer_phone` (Varchar, Nullable) -> Snapshot No. HP saat tiket dibuat; auto-terisi jika tersedia di master & ID cocok, tetap bisa diedit manual (perubahan hanya untuk tiket ini, tidak mengubah master)
- `latitude` (Decimal, Nullable) -> Terisi otomatis **hanya jika** ID lengkap 9 digit cocok dengan Customer_Master. **Kosong jika hanya 4 digit yang diinput** (tidak ada data koordinat pasti untuk itu)
- `longitude` (Decimal, Nullable) -> Sama seperti di atas
- `channel` (Varchar, Not Null) -> Pilihan: WhatsApp, Instagram, Facebook, TikTok, Telepon
- `jenis_interaksi_id` (UUID, FK -> Interaction_Types.id, Not Null)
- `category_id` (UUID, FK -> Categories.id, Not Null)
- `detail` (Text, Nullable)
- `status` (Varchar, Not Null) -> **[DISEDERHANAKAN]** Hanya 2 nilai: **"Berjalan"** / **"Selesai"** — status siklus hidup tiket, terpisah dari cara penanganannya
- `handling_type_id` (UUID, FK -> Handling_Types.id, Not Null) -> **[BARU, menggantikan `diteruskan_ke_bidang`]** Cara penyelesaian/tujuan eskalasi: Selesai di Edukasi / Eskalasi ke Bidang Pelayanan / Eskalasi ke Kantor Cabang / Lainnya. Memicu auto-set `status` = "Selesai" jika `Handling_Types.otomatis_selesai` = true
- `screenshot_path` (Varchar, Nullable)
- `created_at` / `updated_at` (Timestamp)

## 10. Entitas Baru: Histori Status (Ticket_Status_History)
- `id` (UUID, Primary Key)
- `ticket_id` (UUID, FK -> Tickets.id, Not Null)
- `status_sebelumnya` (Varchar, Nullable)
- `status_baru` (Varchar, Not Null)
- `catatan` (Text, Nullable)
- `changed_at` (Timestamp, Default: now())

*Trigger otomatis: setiap kali `Tickets.status` berubah, sistem otomatis membuat baris baru di tabel ini.*

## 11. Entitas Baru: Log Backup (Backup_Logs)
- `id` (UUID, Primary Key)
- `periode` (Varchar, Not Null)
- `jumlah_baris` (Integer)
- `file_name` (Varchar)
- `status_kirim` (Varchar) -> "Berhasil" / "Gagal"
- `dikirim_ke` (Varchar)
- `created_at` (Timestamp)
