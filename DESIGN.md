# DESIGN.md — Aplikasi Logbook & Ticketing Call Center PDAM

## Identity
Aplikasi internal untuk Admin Call Center PDAM Amerta Dayan Gunung.
Desain mengutamakan fungsi, kecepatan input dari HP, dan keterbacaan laporan.
Ini adalah tool kerja harian, bukan landing page atau marketing site.

## Palette
- **Primary:** `#1B4F8A` (biru tua PDAM, header, active states)
- **Primary Light:** `#2E7FD9` (tombol utama, link, focus ring)
- **Primary Hover:** `#16407A` (hover tombol primary)
- **Background:** `#FFFFFF` (latar halaman)
- **Surface:** `#F5F7FA` (latar kartu, form input, section)
- **Border:** `#E2E8F0` (garis pembatas, outline input)
- **Text Primary:** `#1A202C` (teks utama)
- **Text Secondary:** `#718096` (label, placeholder, caption)
- **Success:** `#16A34A` (status Selesai, konfirmasi)
- **Success Light:** `#F0FDF4` (background badge Selesai)
- **Warning:** `#D97706` (tiket menggantung, perhatian)
- **Warning Light:** `#FFFBEB` (background badge warning)
- **Error:** `#DC2626` (validasi gagal, status error)
- **Error Light:** `#FEF2F2` (background badge error)

## Typography
- **Font:** Inter (via next/font/google)
- **Alasan:** Inter dirancang untuk readability di layar kecil, weight 400/500/600 cukup untuk
  membedakan hierarki tanpa perlu font dekoratif. Familiar bagi pengguna tool internal.
- **Ukuran:** body 14px (mobile), 15px (desktop); heading 16-20px; caption 12px

## Component System
- **Border radius:** 6px (input, small card), 10px (large card, dialog), 9999px (status pill saja)
- **Shadow:** ringan hanya di kartu yang perlu elevasi (shadow-sm). Tidak floating semua.
- **Spacing scale:** 4px base (Tailwind default)
- **Tap target minimum:** 44x44px semua elemen interaktif mobile

## Dials
- **ENERGY:** 1 (calm - tool kerja, bukan marketing)
- **RHYTHM:** 2 (konsisten dengan sedikit variasi antar section dashboard)
- **MOTION:** 1 (hover/active/focus states saja, tidak ada animasi dekoratif)

## Navigation
- Bottom navigation bar (4 item): Tiket, Dashboard, Laporan, Pengaturan
- Top bar: nama halaman + action button opsional
- Tidak ada sidebar (mobile-first, layar sempit)
