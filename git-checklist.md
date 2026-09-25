# Git Checklist Prompt (Vibe Coding)

Tolong bantu saya menyelesaikan proses Git untuk project ini, IKUTI URUTAN INI DENGAN KETAT. Jangan lompat langkah, jangan gabungkan langkah, dan STOP + tanya saya dulu jika ada kondisi mencurigakan yang saya sebutkan di bawah.

## TAHAP 1: PENGECEKAN AWAL (WAJIB SEBELUM APAPUN)

1. Cek apakah file `.gitignore` sudah ada di root folder.
   - Jika BELUM ada, buatkan `.gitignore` yang sesuai dengan tech stack project ini (minimal harus mencakup: `node_modules/`, `.env`, `.env.local`, `dist/`, `build/`, `.next/`, `__pycache__/`, `*.log`, `.DS_Store`, dan folder/file cache lain yang relevan).
   - Jika SUDAH ada, tampilkan isinya ke saya dan periksa apakah sudah mencakup semua file sensitif/besar di atas. Tambahkan yang kurang.

2. Jalankan `git status` dan tunjukkan HASIL LENGKAPNYA ke saya sebelum lanjut ke tahap manapun.

3. Dari hasil `git status` tersebut, periksa satu per satu:
   - Apakah ada file `.env`, `.env.local`, atau file lain yang mengandung kata "secret", "key", "password", "credential", "token" di namanya? Jika ADA dan itu belum masuk `.gitignore`, JANGAN lanjutkan, laporkan ke saya dulu.
   - Apakah ada folder besar seperti `node_modules/`, `venv/`, `.next/`, `dist/`, `build/` yang ikut terdeteksi (artinya belum ter-ignore)? Jika ADA, tambahkan ke `.gitignore` dulu sebelum lanjut.
   - Apakah ada file yang jelas-jelas tidak seharusnya ikut (file temporary, file percobaan, screenshot pribadi, dsb)? Sebutkan ke saya.

## TAHAP 2: STAGING (SETELAH TAHAP 1 BERSIH)

4. Jika semua sudah aman, jalankan `git add .`
5. Jalankan `git status` LAGI setelah `git add`, tunjukkan daftar file yang akan di-commit (yang berwarna hijau / "Changes to be committed"). Ini adalah konfirmasi terakhir sebelum commit.

## TAHAP 3: COMMIT

6. Buatkan commit message yang jelas dan deskriptif, menjelaskan APA yang berubah, bukan cuma "update" atau "fix". Contoh format: "Tambah fitur login dengan validasi email" atau "Perbaiki bug tombol submit tidak bisa diklik di halaman login".
7. Jalankan `git commit -m "pesan tersebut"`
8. Tampilkan hasil `git log -1` untuk konfirmasi commit berhasil tersimpan.

## TAHAP 4: PUSH KE GITHUB

9. Cek dulu apakah remote origin sudah terhubung dengan `git remote -v`.
   - Jika BELUM ada remote, tanya saya dulu URL repository GitHub-nya sebelum melanjutkan (jangan buat repo baru sendiri tanpa konfirmasi saya).
   - Jika SUDAH ada, lanjutkan.
10. Jalankan `git push` (atau `git push -u origin main` jika ini push pertama kali ke branch tersebut).
11. Tampilkan hasil akhirnya ke saya, termasuk apakah push berhasil atau ada error/konflik.

## ATURAN TAMBAHAN YANG BERLAKU SEPANJANG PROSES

- Saya (user) tidak menulis kode maupun perintah git secara manual. Semua proses git (status, add, commit, push) dijalankan sepenuhnya oleh kamu (AI). Saya hanya akan memberi laporan masalah dalam bahasa sehari-hari (misal: "tombol X tidak berfungsi") dan menyetujui/menolak ringkasan yang kamu berikan sebelum push.
- JANGAN PERNAH menjalankan `git push --force` tanpa saya minta secara eksplisit dan saya pahami risikonya.
- JANGAN PERNAH commit atau push file apapun yang berisi API key, password, token, atau kredensial dalam bentuk apapun, meskipun saya lupa menyebutkannya.
- Jika terjadi merge conflict, JANGAN diselesaikan otomatis — tunjukkan file mana yang konflik dan jelaskan opsi penyelesaiannya ke saya.
- Jika ukuran total file yang akan di-commit terlihat tidak wajar besar (lebih dari beberapa MB untuk project kecil), beri tahu saya dan cek kemungkinan ada file yang seharusnya di-ignore.
- Di setiap tahap, gunakan bahasa yang sederhana untuk menjelaskan ke saya (saya pemula), jangan asumsikan saya paham istilah teknis tanpa penjelasan singkat.
- Setelah semua selesai, berikan ringkasan singkat: apa yang berubah, apa yang di-commit, dan status push (berhasil/gagal beserta alasan singkat jika gagal).
