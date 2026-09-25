# Prompt: Audit & Klasifikasi Struktur Project

Bertindak sebagai Senior Software Engineer yang bertugas melakukan audit struktur folder project ini.

Jangan ubah, hapus, atau pindahkan file apapun dulu. Tugasmu di prompt ini HANYA memindai dan melaporkan, bukan mengeksekusi.

## TUGAS

1. Pindai seluruh isi folder project ini (termasuk sub-folder), lalu kelompokkan SETIAP file/folder ke dalam salah satu kategori berikut:

   **A. CORE SYSTEM** — kode inti aplikasi yang wajib ada supaya sistem bisa jalan (contoh: source code utama, komponen, route, model, config yang tidak sensitif).

   **B. TEST CODE (logika test)** — file berisi kode/skrip untuk menjalankan pengetesan otomatis (contoh: unit test, integration test). Ini BUKAN hasil test, tapi kode yang menjalankan test.

   **C. TEST OUTPUT / AUDIT REPORT / HASIL AUDIT** — file/folder hasil dari proses testing, audit, atau laporan (contoh: laporan bug, coverage report, screenshot bug, log hasil run, hasil red team attack, dsb). Apapun namanya, kalau ini adalah OUTPUT dari proses tes/audit, masuk sini.

   **D. SECRET / KREDENSIAL** — file yang berisi API key, password, token, connection string database, atau informasi sensitif lain.

   **E. DEPENDENCY / AUTO-GENERATED** — folder/file yang dibuat otomatis oleh tools dan BISA di-generate ulang kapan saja (contoh: node_modules, folder build/dist hasil compile, cache, lockfile hasil install).

   **F. DOKUMENTASI / CATATAN PRIBADI** — file catatan, planning, atau dokumen yang kamu pakai sendiri untuk mikir/planning, tapi tidak dibutuhkan sistem saat jalan.

   **G. TIDAK YAKIN / PERLU DITANYAKAN** — kalau kamu (AI) tidak yakin file itu masuk kategori mana, JANGAN DITEBAK. Masukkan ke kategori ini dan jelaskan alasan kenapa ragu.

2. Tampilkan hasilnya dalam bentuk tabel:

   | Kategori | Path File/Folder | Alasan Singkat |
   |---|---|---|

3. Setelah tabel selesai, berikan REKOMENDASI dalam 2 daftar terpisah:

   **✅ REKOMENDASI MASUK GIT/GITHUB (dan ikut saat deploy):**
   (daftar dari kategori A dan B)

   **❌ REKOMENDASI TIDAK MASUK GIT/GITHUB:**
   (daftar dari kategori C, D, E, F — sebutkan juga alasannya per kategori)

4. Berdasarkan rekomendasi di atas, buatkan DRAFT isi `.gitignore` yang sesuai dengan nama folder/file yang benar-benar ada di project ini (bukan template umum, tapi sesuai hasil pemindaian nyata di project ini).

5. Tampilkan draft `.gitignore` tersebut ke saya dan TUNGGU PERSETUJUAN saya sebelum benar-benar menuliskannya ke file `.gitignore`. Jangan langsung menimpa `.gitignore` yang sudah ada tanpa saya lihat dulu perbedaannya (file lama vs draft baru).

6. Jika ada file di kategori G (Tidak Yakin), tanyakan ke saya satu per satu dengan bahasa sederhana, contoh: "File `abc.json` ini isinya untuk apa ya? kalau untuk hasil test, saya masukkan ke daftar yang tidak ikut GitHub."

## ATURAN

- Jangan mengarang isi file — kalau perlu, buka/baca isinya dulu sebelum mengklasifikasi, terutama untuk file yang namanya ambigu.
- Gunakan bahasa sederhana di setiap penjelasan, saya (user) pemula dan tidak paham istilah teknis tanpa penjelasan singkat.
- Jangan mengeksekusi apapun (jangan git add/commit/push, jangan hapus file) di prompt ini — prompt ini KHUSUS untuk audit dan laporan saja.
- Setelah laporan ini saya setujui, langkah selanjutnya adalah menjalankan `git-checklist.md`.
