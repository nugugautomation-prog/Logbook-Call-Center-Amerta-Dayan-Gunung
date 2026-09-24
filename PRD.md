# Product Requirements Document (PRD): Aplikasi Logbook & Ticketing Call Center PDAM (Mobile-First Edition)

## 1. Product Overview
Aplikasi web *logbook/ticketing* mandiri yang dioptimalkan dengan pendekatan **Mobile-First UX** untuk Admin Call Center Perumda Air Minum Amerta Dayan Gunung. Aplikasi ini dirancang agar sangat nyaman dioperasikan melalui *smartphone* saat di lapangan maupun di meja kerja, berfungsi mencatat, mengkategorikan, dan merekapitulasi seluruh interaksi pelanggan guna memenuhi kebutuhan audit BPK.

## 2. Problem Statement
- Data interaksi dan komplain pelanggan tercecer di berbagai platform komunikasi (WA, IG, FB, TikTok, Telepon) yang sering diakses langsung via HP.
- Proses rekapitulasi manual menggunakan rumus Excel memakan waktu tinggi dan rentan salah.
- Ketiadaan sistem pencatatan seluler yang cepat dan terstruktur menyulitkan penyediaan data saat audit BPK.

## 3. Goals
- Menyediakan sistem input logbook seluler yang cepat, ramah jempol (*thumb-friendly*), dan terpusat.
- Mengotomatisasi rekapitulasi data berdasarkan kategori, kanal, dan status penanganan.
- Menyediakan Dashboard KPI/Summary responsif untuk monitoring performa layanan.
- Menghasilkan format ekspor Excel formal yang siap dicetak dan ditandatangani oleh Admin, Manager, dan Direktur.
- Menyediakan pengingat (*reminder*) mingguan untuk tiket yang masih berstatus belum selesai.

## 4. Non Goals
- Menyediakan bot otomatisasi balasan atau integrasi *paid API* WhatsApp resmi.
- Memfasilitasi multi-user login untuk berbagai level manajemen.

## 5. Target Users
- **Admin Call Center (Single User):** Pengguna tunggal yang melakukan seluruh operasional input seluler, manajemen status, melihat dashboard, dan mengunduh laporan.

## 6. User Roles
- **Admin:** Memiliki hak akses penuh (100%) terhadap seluruh fungsi aplikasi.

## 7. Features
- **FT-001: Autentikasi & Sesi Seluler Aman** (Akses tunggal berbasis kredensial dengan penyimpanan sesi responsif).
- **FT-002: Form Input Tiket Ramah Jempol (Mobile-First Input)** (Pencatatan data komplain cepat dengan nomor tiket otomatis dan tata letak vertikal).
- **FT-003: Manajemen & Update Status Tiket** (Ubah status dari "Diteruskan ke Pelayanan" menjadi "Selesai" via tampilan kartu seluler).
- **FT-004: Dashboard KPI & Summary Responsif** (Visualisasi statistik ringkas yang pas di layar HP).
- **FT-005: Sistem Pengingat Mingguan (Weekly Reminder)** (Notifikasi tiket menggantung).
- **FT-006: Ekspor Laporan Excel** (Unduh rekap data siap cetak).
- **FT-007: Mekanisme Offline-First Caching** (Penyimpanan sementara di browser saat jaringan internet kantor/seluler terputus).

## 8. Functional Requirements
- **FR-001:** Sistem harus menghasilkan nomor tiket secara otomatis dan unik dengan format spesifik `TIK-CC-[YYMM]-[XXXX]` (contoh: `TIK-CC-2609-0001`), di mana nomor urut 4 digit terakhir (`[XXXX]`) akan otomatis di-reset kembali menjadi `0001` setiap kali terjadi pergantian bulan atau tahun baru.
- **FR-002:** Sistem wajib merekam Tanggal & Waktu input (format YYYY-MM-DD HH:MM).
- **FR-003:** Sistem menyediakan pilihan Kanal Komunikasi berbasis tombol/picker sentuh: WhatsApp, Instagram, Facebook, TikTok, Telepon.
- **FR-004:** Sistem menyediakan pilihan Kategori yang datanya diambil dari master data (bukan hardcode), dapat dikelola admin lewat menu Pengaturan.
- **FR-005:** Sistem menyediakan field Status tiket dengan 2 nilai: "Berjalan" atau "Selesai", yang otomatis mengikuti pilihan Tujuan Penanganan (lihat FR-010).
- **FR-006:** Sistem mendukung unggah file *screenshot* opsional dengan fitur kompresi otomatis untuk menghemat kuota dan ruang penyimpanan seluler.
- **FR-007:** Sistem menampilkan rekapitulasi otomatis pada Dashboard KPI seluler tanpa perhitungan manual.
- **FR-008:** Sistem menyediakan tombol ekspor data ke format file Excel (.xlsx), dengan struktur 3 sheet (Kop & Ringkasan, Data Rinci, Rekap per Tujuan Penanganan) sesuai `Report_Format.md`.
- **FR-009:** Sistem menyediakan pilihan `Jenis Interaksi` (default: Komplain, Pertanyaan/Informasi, Lapor Gangguan/Kerusakan, Konten Sosmed, Lainnya) terpisah dari Kategori, dan datanya diambil dari master data yang bisa dikelola admin.
- **FR-010:** **[DIPERBARUI]** Sistem menyediakan pilihan `Tujuan Penanganan` dari master data (default: Selesai di Edukasi, Eskalasi ke Bidang Pelayanan, Eskalasi ke Kantor Cabang, Lainnya). Memilih opsi bertanda "otomatis selesai" langsung menutup tiket; opsi eskalasi lain membuat tiket tetap berstatus "Berjalan" sampai admin memperbarui manual.
- **FR-011:** Sistem otomatis mencatat setiap perubahan status ke riwayat status (audit trail) tanpa input manual dari admin.
- **FR-012:** Sistem menjalankan backup CSV otomatis terjadwal (harian & mingguan) ke email admin, dan mencatat hasil tiap proses backup (berhasil/gagal).
- **FR-013:** Sistem menyediakan menu Pengaturan untuk admin menambah, mengedit nama/urutan, dan menonaktifkan (bukan menghapus permanen) item Jenis Interaksi, Kategori, Tujuan Penanganan, Kecamatan, dan Desa, tanpa perlu ubah kode aplikasi.
- **FR-014:** Sistem menyediakan fitur impor data pelanggan bulanan dari file Excel (ID Pelanggan, Nama, No. HP, Alamat Detail, Koordinat gabungan, Golongan Pelanggan), dengan tahap pratinjau/verifikasi wajib sebelum diterapkan ke database.
- **FR-015:** Sistem otomatis memisahkan kolom koordinat gabungan dari file impor menjadi `latitude` dan `longitude` terpisah.
- **FR-016:** Pada form input tiket, mengetik ID Pelanggan 9 digit yang cocok dengan Data Pelanggan Master otomatis mengisi Nama, No. HP, Alamat, dan koordinat lokasi; field hasil autofill tetap dapat diedit manual per tiket.
- **FR-017:** **[DIPERBARUI]** Sistem membaca ID Pelanggan berformat 9 digit (2 digit kode kecamatan + 2 digit kode desa + 5 digit kode unik). Jika ID lengkap tidak diketahui, admin cukup mengisi 4 digit pertama; sistem otomatis menampilkan nama kecamatan & desa hasil mapping dari master data, dengan koordinat dikosongkan.
- **FR-018:** Sistem menyediakan master data Kecamatan dan Desa (dikelola di menu Pengaturan) untuk memetakan 4 digit pertama ID Pelanggan; baris impor dengan kode kecamatan/desa yang belum terdaftar ditandai error pada tahap pratinjau.
- **FR-019:** **[BARU]** Dashboard menampilkan ranking Top Kategori Aduan berdasarkan jumlah tiket pada periode terpilih.
- **FR-020:** **[BARU]** Dashboard menampilkan ranking Top Wilayah (Desa/Kecamatan) berdasarkan jumlah tiket, dengan kemampuan drill-down untuk melihat breakdown kategori per desa.
- **FR-021:** **[BARU]** Dashboard menampilkan grafik tren jumlah tiket harian/mingguan untuk periode terpilih.
- **FR-022:** **[BARU]** Dashboard menampilkan rasio Selesai/Berjalan dan rata-rata durasi penanganan (hari) per Tujuan Penanganan.
- **FR-023:** **[BARU]** Dashboard mendeteksi dan menampilkan daftar ID Pelanggan dengan ≥3 tiket dalam 30 hari terakhir (Pelanggan Berulang).
- **FR-024:** **[BARU]** Dashboard menampilkan Aging Report: daftar tiket berstatus "Berjalan" diurutkan dari yang paling lama menggantung.
- **FR-025:** **[BARU]** Dashboard menampilkan tabel silang Channel × Kategori untuk melihat pola penggunaan kanal per jenis aduan.

## 9. Non Functional Requirements
- **NFR-001:** Antarmuka dirancang dengan prinsip **Mobile-First**, memastikan elemen sentuh berukuran minimum 44px agar mudah dijangkau dengan satu tangan di layar ponsel.
- **NFR-002:** Waktu muat halaman (*page load time*) cepat dan ringan di jaringan seluler standar.
- **NFR-003:** Kapasitas penyimpanan file *screenshot* dibatasi maksimum 2 MB per file melalui kompresi otomatis di sisi klien.
- **NFR-004:** **[BARU]** Seluruh data (dari HP rumah maupun perangkat kantor) tersimpan ke satu database cloud (Supabase) yang sama — tidak ada database lokal terpisah — guna mencegah duplikasi nomor tiket dan konflik data.
- **NFR-005:** Sistem menjalankan backup otomatis (CSV via email) harian dan mingguan sebagai mitigasi risiko data hilang di layanan hosting gratis.
- **NFR-006:** Pilihan Jenis Interaksi, Kategori, Tujuan Penanganan, Kecamatan, dan Desa bersifat dapat dikonfigurasi (configurable) oleh admin sendiri melalui menu Pengaturan, bukan hardcode di kode aplikasi.
- **NFR-007:** **[BARU]** Sinkronisasi data pelanggan bersifat manual/periodik (bulanan) mengikuti siklus unduh file dari aplikasi billing pihak ketiga, bukan real-time, karena tidak tersedia akses API.

## 10. Business Rules
- **BR-001:** Nomor kontak pelanggan wajib diisi dan hanya boleh berupa karakter angka (validasi numerik).
- **BR-002:** Data logbook yang sudah berstatus **"Selesai"** dikunci dan tidak dapat dihapus sembarangan guna menjaga integritas data audit BPK.
- **BR-003:** Status tiket yang awalnya "Diteruskan ke Bidang Pelayanan" dapat di-*update* oleh admin menjadi "Selesai" apabila penanganan telah tuntas.
- **BR-004:** Penomoran tiket bersifat unik dan terikat pada periode bulan/tahun berjalan, serta dikelola secara otomatis oleh sistem tanpa input manual guna memastikan kerapian rekapitulasi audit BPK.


## 11. Permission Requirements
- **PER-001:** Seluruh fitur dalam aplikasi bersifat terbuka penuh hanya untuk akun Admin tunggal yang terautentikasi.

## 12. Workflow
1. Pelanggan menghubungi via WA/IG/FB/TikTok/Telepon $\rightarrow$ Admin melayani.
2. Admin membuka aplikasi di HP $\rightarrow$ Ketuk tombol "Tambah Tiket" di area navigasi bawah.
3. Mengisi Tanggal/Waktu, Nama Pelanggan, ID Pelanggan (opsional), Nomor Kontak (angka), Pilih Kanal, Pilih Kategori, Detail Komplain (opsional), Pilih Status, dan Upload Screenshot (opsional).
4. Ketuk Simpan $\rightarrow$ Data masuk ke *cloud database*, nomor tiket terbit otomatis, dashboard langsung memperbarui statistik.
5. Jika status awal "Diteruskan ke Pelayanan", admin dapat memperbarui status menjadi "Selesai" di kemudian hari.
6. Pada akhir pekan/bulan, admin memeriksa rekap dan mengunduh file Excel untuk dicetak dan ditandatangani bersama Manager dan Direktur.

## 13. Validation
- **VAL-001:** Validasi form input menolak pengosongan field wajib: Tanggal & Waktu, Nama Pelanggan, Nomor Kontak, Kanal Komunikasi, dan Kategori Komplain.
- **VAL-002:** Validasi field Nomor Kontak menolak input selain angka.
- **VAL-003:** Validasi ukuran file *screenshot* menolak file di atas batas maksimal sebelum dikompresi.

## 14. Error Handling
- **ERR-001:** Jika koneksi internet seluler/kantor terputus saat menyimpan data, sistem otomatis mengaktifkan mekanisme *local caching* di *browser HP* dan menampilkan indikator status "Offline - Tersimpan Lokal".
- **ERR-002:** Jika input gagal tervalidasi, sistem menampilkan pesan peringatan spesifik di dekat field yang bermasalah.

## 15. Edge Cases
- **EDG-001:** Terputusnya koneksi internet secara mendadak saat admin sedang melakukan input di HP (diatasi dengan *Local Storage* yang melakukan *auto-sync* begitu koneksi pulih).
- **EDG-002:** Unggah gambar dari galeri HP dengan format tidak didukung (sistem otomatis membatasi format gambar).

## 16. Acceptance Criteria
- **AC-001:** Admin berhasil membuat tiket baru via HP dan nomor tiket terbit otomatis dengan format unik tahun/bulan.
- **AC-002:** Form menolak input jika nomor kontak diisi huruf atau kosong.
- **AC-003:** Data dengan status "Selesai" berhasil dikunci dari aksi penghapusan sembarangan.
- **AC-004:** Dashboard KPI seluler menampilkan grafik/angka ringkasan yang akurat sesuai data yang masuk.
- **AC-005:** File laporan Excel berhasil diunduh dari perangkat seluler/desktop dengan struktur kolom yang rapi dan siap cetak.

## 17. Reporting
- **REP-001:** Laporan berkala (harian, mingguan, bulanan) yang disajikan lewat Dashboard KPI seluler dan diekspor ke Excel untuk ditandatangani Admin, Manager, dan Direktur.

## 18. Audit Trail
- **ADT-001:** Pencatatan waktu pembuatan data (*created_at*) dan perubahan status (*updated_at*) tersimpan di database untuk keperluan penelusuran audit BPK.

## 19. Data Requirements
- **DAT-001:** Entitas Tiket/Logbook menyimpan atribut: ID Unik, Nomor Tiket, Timestamp, Nama Pelanggan, ID Pelanggan, Nomor Kontak, Kanal, Kategori, Detail Komplain, Status, dan Path/URL File Screenshot.

## 20. Out of Scope
- Integrasi API WhatsApp resmi berbayar.
- Multi-user login untuk manajemen atau pihak luar.
- Fitur *Auto-reply* atau chatbot.
- **[BARU] Peta sebaran titik komplain** (visualisasi latitude/longitude tiket di atas peta) — data koordinat sudah tersedia, tapi widget peta ditunda ke tahap pengembangan berikutnya (*next plan*), belum masuk versi ini.

## 21. Dependencies
- Layanan Hosting Cloud gratis (Supabase untuk database, Vercel/Render untuk deployment aplikasi web).

## 22. Risks
- **RSK-001:** Gangguan koneksi internet total (mitigasi: penerapan *Hybrid Local Caching* pada browser seluler/desktop).
- **RSK-002:** Kapasitas penyimpanan server gratis penuh akibat file screenshot (mitigasi: pembatasan ukuran dan kompresi otomatis).

