# Format Laporan Excel — Rekap Logbook Call Center (Untuk Audit BPK)

Karena BPK tidak memberikan format baku, berikut format yang dirancang agar mudah dibaca, mudah diverifikasi, dan siap tanda tangan tiga pihak (Admin, Manager, Direktur).

Setiap file export terdiri dari **3 sheet**:

## Sheet 1: "Kop & Ringkasan"
Bagian atas berisi kop laporan resmi, sehingga tiap file export langsung siap cetak tanpa perlu edit manual:

```
PERUMDA AIR MINUM AMERTA DAYAN GUNUNG
LAPORAN REKAPITULASI INTERAKSI & PENGADUAN PELANGGAN
CALL CENTER

Periode Laporan     : [Tanggal Mulai] s/d [Tanggal Selesai]
Jenis Laporan       : Harian / Mingguan / Bulanan  (dipilih saat export)
Tanggal Dicetak      : [Auto, tanggal saat file digenerate]
```

Diikuti tabel ringkasan (angka besar, mudah dibaca sekilas):

| Metrik | Jumlah |
|---|---|
| Total Interaksi Masuk | ... |
| Total Komplain | ... |
| Total Pertanyaan/Informasi | ... |
| Total Lapor Gangguan/Kerusakan | ... |
| Selesai di Edukasi (Tanpa Eskalasi) | ... |
| Eskalasi ke Bidang Pelayanan | ... |
| Eskalasi ke Kantor Cabang | ... |
| Status: Selesai | ... |
| Status: Masih Berjalan | ... |

Lalu 2 tabel breakdown kecil:
- **Per Channel:** WhatsApp / Instagram / Facebook / TikTok / Telepon — jumlah masing-masing.
- **Per Kategori:** Tagihan Tidak Sesuai / Harga Naik / Cara Daftar / Cara Bayar Online / Lapor Gangguan / Status Pengaduan / Lain-lain — jumlah masing-masing.
- **Top 5 Kategori Aduan:** **[BARU]** Ranking kategori paling sering muncul pada periode ini, agar Manager/Direktur langsung lihat masalah paling dominan tanpa perlu buka dashboard.
- **Top 5 Desa Komplain:** **[BARU]** Ranking Desa (dengan nama Kecamatan induknya) berdasarkan jumlah tiket pada periode ini, sebagai bahan pertimbangan prioritas penanganan wilayah.

Di bagian paling bawah sheet ini: **blok tanda tangan**, sudah dalam format siap cetak:

```
Dibuat oleh,                Diperiksa oleh,              Disetujui oleh,


( Admin Call Center )        ( Manager )                  ( Direktur )
Nama: [diisi manual/auto]    Nama: ______________         Nama: ______________
Tanggal: __________          Tanggal: __________          Tanggal: __________
```

## Sheet 2: "Data Rinci"
Data mentah semua tiket pada periode terpilih, satu baris = satu tiket, kolom:

| No | Nomor Tiket | Tanggal & Waktu | ID Pelanggan | Kecamatan | Desa | Nama Pelanggan | Alamat | No. HP | Channel | Jenis Interaksi | Kategori | Detail | Tujuan Penanganan | Status | Tanggal Status Terakhir Diubah | Ada Screenshot? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Catatan kolom:
- "Ada Screenshot?" cukup kolom Ya/Tidak (bukan gambar itu sendiri, supaya file Excel tetap ringan) — kalau perlu bukti visual, screenshot tetap bisa dilihat di aplikasi via link.
- Baris diurutkan berdasarkan Tanggal & Waktu (kronologis), memudahkan verifikator menelusuri urutan kejadian.

## Sheet 3: "Rekap per Tujuan Penanganan"
Fokus untuk memantau eskalasi:

| Tujuan Penanganan | Jumlah Tiket | Jumlah Sudah Selesai | Jumlah Masih Berjalan | Rata-rata Lama Penanganan (hari) |
|---|---|---|---|---|

Sheet ini membantu menunjukkan ke BPK bahwa aduan yang dieskalasi (ke Bidang Pelayanan maupun Kantor Cabang) benar-benar ditindaklanjuti, bukan cuma "diteruskan lalu hilang".

## Aturan Export
- Admin memilih rentang tanggal (atau preset: Hari Ini / Minggu Ini / Bulan Ini) sebelum export.
- Nama file otomatis: `Rekap-CallCenter-[Periode]-[TanggalExport].xlsx` (contoh: `Rekap-CallCenter-2026-09-Sep_22-30_2026-10-01.xlsx`).
- Semua sheet menggunakan format tabel dengan border rapi dan header berwarna (biru muda, sesuai tema visual PDAM), siap cetak langsung tanpa perlu diformat ulang.
