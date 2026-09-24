# Logbook & Ticketing Call Center PDAM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web PWA Mobile-First untuk Admin Call Center PDAM — mencatat, mengelola, dan merekapitulasi interaksi pelanggan dari berbagai kanal komunikasi, siap audit BPK.

**Architecture:** Next.js 14 (App Router) sebagai frontend + Supabase (PostgreSQL + Auth + Storage + Edge Functions) sebagai backend tunggal. PWA via next-pwa untuk offline-first caching. UI dibangun dengan Tailwind CSS + shadcn/ui, Excel export via exceljs, chart via recharts.

**Tech Stack:**
- Framework: Next.js 14 (App Router, TypeScript)
- Database & Auth: Supabase (PostgreSQL, Row Level Security, Realtime)
- Styling: Tailwind CSS + shadcn/ui
- PWA: next-pwa (IndexedDB via idb untuk offline caching)
- Excel Export: exceljs
- Charts: recharts
- Image Compression: browser-image-compression
- Email/Backup: Supabase Edge Functions + Resend (gratis tier)
- Hosting: Vercel
- Testing: Vitest + React Testing Library + Playwright (E2E)

**Spec:** `PRD.md`, `Project_Context.md`, `Module_Breakdown.md`, `Data_Model.md`, `Business_Rules.md`, `Report_Format.md`

## Global Constraints

- Next.js 14.x, TypeScript strict mode, no `any`
- Supabase sebagai satu-satunya sumber data (BR-008) — tidak ada DB lokal terpisah
- Semua elemen sentuh minimum 44x44 px (NFR-001, R-03)
- Zero horizontal overflow di semua breakpoint (R-03)
- WCAG AA contrast minimum 4.5:1 teks normal, 3:1 teks besar (R-25)
- Tidak ada em dash (`—`) dalam teks UI (R-02)
- Tidak ada angka/statistik palsu — semua angka dari data nyata (R-17)
- Semua tombol/link harus punya perilaku nyata — tidak ada dead control (R-26)
- Tiga state wajib: empty, loading, error (R-27)
- Mobile breakpoints: sm=640px, md=768px, lg=1024px — layout reflow nyata (bukan sekadar shrink)
- Nomor tiket format `TIK-CC-[YYMM]-[XXXX]`, reset ke 0001 tiap bulan (BR-003)
- Data "Selesai" dikunci dari penghapusan (BR-002)
- Master data soft-delete only jika sudah pernah dipakai (BR-009)

## Review Focus

- Nomor tiket tidak boleh duplikat antar sesi concurrent (race condition saat dua tab dibuka)
- Fallback 4-digit ID Pelanggan: koordinat wajib kosong, nama wajib manual — jangan autofill parsial
- Offline sync: tiket yang dibuat offline harus sync setelah online, tanpa duplikat nomor tiket
- Export Excel di mobile (Safari/Firefox Android): file .xlsx harus bisa diunduh via blob URL
- Backup email gagal: harus tercatat di Backup_Logs dengan status "Gagal", bukan gagal diam-diam

---

## Task 1: Project Scaffold & Supabase Setup

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `.env.local.example`
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/migrations/002_rls_policies.sql`
- Create: `supabase/migrations/003_seed_master_data.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/types/database.ts`
- Test: `src/lib/supabase/__tests__/client.test.ts`

**Interfaces:**
- Produces:
  - `createClient(): SupabaseClient` (client-side)
  - `createServerClient(): SupabaseClient` (server-side, untuk Server Components)
  - Type `Database` yang merepresentasikan seluruh skema Supabase

- [ ] **Step 1: Inisialisasi proyek Next.js**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr \
  exceljs recharts \
  browser-image-compression idb \
  next-pwa \
  @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs \
  @radix-ui/react-toast @radix-ui/react-switch @radix-ui/react-label \
  class-variance-authority clsx tailwind-merge lucide-react \
  date-fns react-hook-form @hookform/resolvers zod \
  sonner

npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react \
  @testing-library/user-event @testing-library/jest-dom \
  playwright @playwright/test
```

- [ ] **Step 3: Tulis failing test — koneksi Supabase client**

```typescript
// src/lib/supabase/__tests__/client.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { getSession: vi.fn() } })),
}))

describe('createClient', () => {
  it('returns a supabase client object', async () => {
    const { createClient } = await import('../client')
    const client = createClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
```

- [ ] **Step 4: Jalankan test — pastikan FAIL**

```bash
npx vitest run src/lib/supabase/__tests__/client.test.ts
```
Expected: FAIL — `createClient` not defined

- [ ] **Step 5: Buat SQL migration — skema lengkap**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin (Users)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Interaction Types (Jenis Interaksi)
CREATE TABLE IF NOT EXISTS interaction_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Categories (Kategori)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  jenis_interaksi_id UUID REFERENCES interaction_types(id) ON DELETE SET NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Handling Types (Tujuan Penanganan)
CREATE TABLE IF NOT EXISTS handling_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  otomatis_selesai BOOLEAN DEFAULT false,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Districts (Kecamatan)
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_kecamatan VARCHAR(2) UNIQUE NOT NULL,
  nama_kecamatan VARCHAR(100) NOT NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Villages (Desa)
CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kecamatan_id UUID NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
  kode_desa VARCHAR(2) NOT NULL,
  nama_desa VARCHAR(100) NOT NULL,
  urutan INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (kecamatan_id, kode_desa)
);

-- 7. Customer Master
CREATE TABLE IF NOT EXISTS customer_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id VARCHAR(9) UNIQUE NOT NULL,
  kecamatan_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  desa_id UUID REFERENCES villages(id) ON DELETE SET NULL,
  nama VARCHAR(255) NOT NULL,
  alamat_detail TEXT,
  golongan_pelanggan VARCHAR(50),
  no_hp VARCHAR(20),
  koordinat_asli VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  import_batch_id UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Import Batches
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_file VARCHAR(255) NOT NULL,
  tanggal_upload TIMESTAMPTZ NOT NULL DEFAULT now(),
  jumlah_baris_terbaca INTEGER DEFAULT 0,
  jumlah_baris_valid INTEGER DEFAULT 0,
  jumlah_baris_error INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Menunggu Verifikasi',
  catatan_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customer_master
  ADD CONSTRAINT fk_import_batch
  FOREIGN KEY (import_batch_id) REFERENCES import_batches(id) ON DELETE SET NULL;

-- 9. Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  customer_id_input VARCHAR(9),
  customer_ref_id UUID REFERENCES customer_master(id) ON DELETE SET NULL,
  kecamatan_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  desa_id UUID REFERENCES villages(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  alamat_detail TEXT,
  customer_phone VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  channel VARCHAR(20) NOT NULL
    CHECK (channel IN ('WhatsApp','Instagram','Facebook','TikTok','Telepon')),
  jenis_interaksi_id UUID NOT NULL REFERENCES interaction_types(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  detail TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'Berjalan'
    CHECK (status IN ('Berjalan','Selesai')),
  handling_type_id UUID NOT NULL REFERENCES handling_types(id),
  screenshot_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Ticket Status History
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status_sebelumnya VARCHAR(10),
  status_baru VARCHAR(10) NOT NULL,
  catatan TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-record status history
CREATE OR REPLACE FUNCTION record_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_status_history (ticket_id, status_sebelumnya, status_baru)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_status_audit
  AFTER UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION record_status_change();

-- Sequence for ticket numbers per month
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;

-- Function: generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  yymm TEXT;
  seq_val INTEGER;
  current_month TEXT;
  last_month TEXT;
BEGIN
  yymm := TO_CHAR(NOW(), 'YYMM');
  -- Get last ticket number prefix to detect month rollover
  SELECT ticket_number INTO STRICT last_month
  FROM tickets ORDER BY created_at DESC LIMIT 1;
  EXCEPTION WHEN NO_DATA_FOUND THEN last_month := '';

  -- If month changed, reset sequence
  IF last_month IS NULL OR SUBSTRING(last_month, 8, 4) != yymm THEN
    ALTER SEQUENCE ticket_seq RESTART WITH 1;
  END IF;

  seq_val := nextval('ticket_seq');
  NEW.ticket_number := 'TIK-CC-' || yymm || '-' || LPAD(seq_val::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- 11. Backup Logs
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  periode VARCHAR(100) NOT NULL,
  jumlah_baris INTEGER DEFAULT 0,
  file_name VARCHAR(255),
  status_kirim VARCHAR(10) CHECK (status_kirim IN ('Berhasil','Gagal')),
  dikirim_ke VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

- [ ] **Step 6: Buat RLS policies**

```sql
-- supabase/migrations/002_rls_policies.sql
-- Semua tabel hanya bisa diakses oleh authenticated user (admin tunggal)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE handling_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Policy: hanya authenticated user
CREATE POLICY "auth_only" ON admins FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON interaction_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON handling_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON districts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON villages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON customer_master FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON import_batches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON tickets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON ticket_status_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON backup_logs FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 7: Buat seed master data awal**

```sql
-- supabase/migrations/003_seed_master_data.sql
INSERT INTO interaction_types (nama, urutan) VALUES
  ('Komplain', 1),
  ('Pertanyaan/Informasi', 2),
  ('Lapor Gangguan/Kerusakan', 3),
  ('Konten Sosmed', 4),
  ('Lainnya', 5);

INSERT INTO categories (nama, urutan) VALUES
  ('Tagihan Tidak Sesuai', 1),
  ('Harga Naik', 2),
  ('Cara Daftar', 3),
  ('Cara Bayar Online', 4),
  ('Lapor Gangguan', 5),
  ('Status Pengaduan', 6),
  ('Lain-lain', 7);

INSERT INTO handling_types (nama, otomatis_selesai, urutan) VALUES
  ('Selesai di Edukasi (Tanpa Eskalasi)', true, 1),
  ('Eskalasi ke Bidang Pelayanan', false, 2),
  ('Eskalasi ke Kantor Cabang', false, 3),
  ('Lainnya', false, 4);
```

- [ ] **Step 8: Buat Supabase client utilities**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

- [ ] **Step 9: Generate types dari Supabase**

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

- [ ] **Step 10: Jalankan test — pastikan PASS**

```bash
npx vitest run src/lib/supabase/__tests__/client.test.ts
```
Expected: PASS 1/1

- [ ] **Step 11: Buat .env.local.example**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=admin@pdam.example.com
```

- [ ] **Step 12: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffold, Supabase schema, and client setup"
```

---

## Task 2: Design System & Layout Shell (antislop-ui + antislop-layoutmobile)

**Files:**
- Create: `DESIGN.md`
- Create: `src/app/globals.css`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/ui/` (Button, Card, Badge, Input, Select, Textarea, Spinner, EmptyState, ErrorState)
- Test: `src/components/layout/__tests__/AppShell.test.tsx`
- Test: `src/components/layout/__tests__/BottomNav.test.tsx`

**Interfaces:**
- Consumes: nothing (foundational layer)
- Produces:
  - `AppShell` — wrapper layout dengan BottomNav + TopBar
  - `BottomNav` — navigasi bawah mobile (4 item: Tiket, Dashboard, Laporan, Pengaturan)
  - Komponen UI primitif yang dipakai semua task berikutnya

**Design Direction (R-37):**

DESIGN.md berisi:
- Warna brand PDAM: biru tua `#1B4F8A` sebagai primary, putih `#FFFFFF` sebagai background, abu-abu ringan `#F5F7FA` sebagai surface
- Aksen: biru sedang `#2E7FD9` untuk tombol utama, merah `#DC2626` untuk error/danger
- Font: Inter (clean, readable, sesuai karakter aplikasi kerja — bukan estetika semata)
- ENERGY 1 (calm) / RHYTHM 2 (sedikit variasi antar section) / MOTION 1 (hover & active states saja)
- Target: tool kerja internal, bukan landing page — keputusan desain mengikuti fungsi

- [ ] **Step 1: Tulis failing test — AppShell renders BottomNav**

```typescript
// src/components/layout/__tests__/AppShell.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from '../AppShell'

describe('AppShell', () => {
  it('renders children and bottom navigation', () => {
    render(<AppShell><div>content</div></AppShell>)
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /navigasi utama/i })).toBeInTheDocument()
  })

  it('reserves padding at bottom for fixed nav bar', () => {
    const { container } = render(<AppShell><div>content</div></AppShell>)
    const main = container.querySelector('main')
    expect(main?.className).toContain('pb-16')
  })
})
```

- [ ] **Step 2: Jalankan test — pastikan FAIL**

```bash
npx vitest run src/components/layout/__tests__/AppShell.test.tsx
```
Expected: FAIL — AppShell not found

- [ ] **Step 3: Buat DESIGN.md**

```markdown
# DESIGN.md — Aplikasi Logbook & Ticketing Call Center PDAM

## Identity
Aplikasi internal PDAM: tool kerja harian admin call center.
Desain mengutamakan fungsi, kecepatan input, dan keterbacaan — bukan estetika.

## Palette
- Primary: `#1B4F8A` (biru tua PDAM)
- Primary Light: `#2E7FD9` (aksen tombol utama, links)
- Background: `#FFFFFF`
- Surface: `#F5F7FA` (latar kartu, sidebar)
- Border: `#E2E8F0`
- Text Primary: `#1A202C`
- Text Secondary: `#718096`
- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`

## Typography
- Font: Inter (tersedia via next/font/google)
- Alasan: clean, readability tinggi untuk teks pendek maupun panjang, familiar bagi pengguna tool internal

## Dials
- ENERGY: 1 (calm — tool kerja, bukan marketing)
- RHYTHM: 2 (konsisten dengan sedikit variasi section)
- MOTION: 1 (hover states + active press saja, tidak ada animasi dekoratif)

## Component Rules
- Border radius: small=4px (input/badge), medium=8px (kartu), pill=9999px (status badge saja)
- Shadow: ringan di kartu saja (elevation marker), tidak floating
- Spacing scale: 4px base (p-1=4px, p-2=8px, p-4=16px, p-6=24px)
- Tap target minimum: 44x44px (semua tombol dan link mobile)
```

- [ ] **Step 4: Buat globals.css dengan CSS custom properties**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #1B4F8A;
  --color-primary-light: #2E7FD9;
  --color-bg: #FFFFFF;
  --color-surface: #F5F7FA;
  --color-border: #E2E8F0;
  --color-text: #1A202C;
  --color-text-secondary: #718096;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
}

* { box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: var(--color-bg); color: var(--color-text); }

/* Focus ring untuk keyboard nav (R-32) */
:focus-visible {
  outline: 2px solid var(--color-primary-light);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Buat BottomNav**

```typescript
// src/components/layout/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, LayoutDashboard, FileText, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/tiket', label: 'Tiket', icon: ClipboardList },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/laporan', label: 'Laporan', icon: FileText },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#E2E8F0] safe-area-inset-bottom"
    >
      <ul className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] rounded-lg text-xs font-medium transition-colors',
                  active
                    ? 'text-[#1B4F8A]'
                    : 'text-[#718096] hover:text-[#1B4F8A] active:bg-[#F5F7FA]',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={22}
                  aria-hidden="true"
                  strokeWidth={active ? 2.5 : 1.75}
                />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 6: Buat AppShell**

```typescript
// src/components/layout/AppShell.tsx
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
}

export function AppShell({ children, title, action }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <TopBar title={title} action={action} />
      <main className="flex-1 px-4 pt-4 pb-20 max-w-2xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

```typescript
// src/components/layout/TopBar.tsx
export function TopBar({ title, action }: { title?: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-[#1B4F8A] text-white px-4 h-14 flex items-center justify-between shadow-sm">
      <h1 className="text-base font-semibold truncate">
        {title ?? 'Call Center PDAM'}
      </h1>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  )
}
```

- [ ] **Step 7: Buat komponen UI primitif**

```typescript
// src/components/ui/EmptyState.tsx
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#718096] text-sm">
      <span className="text-4xl mb-3" aria-hidden="true">📭</span>
      <p>{message}</p>
    </div>
  )
}

// src/components/ui/Spinner.tsx
export function Spinner({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex justify-center py-8">
      <div className="h-8 w-8 rounded-full border-2 border-[#E2E8F0] border-t-[#1B4F8A] animate-spin" />
    </div>
  )
}

// src/components/ui/ErrorState.tsx
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center text-sm text-red-700">
      <p className="mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md min-h-[44px] hover:bg-red-700 active:bg-red-800"
        >
          Coba Lagi
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Jalankan test — pastikan PASS**

```bash
npx vitest run src/components/layout/__tests__/AppShell.test.tsx
```
Expected: PASS 2/2

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: design system, AppShell, BottomNav, TopBar, UI primitives"
```

---

## Task 3: Autentikasi (Modul 1)

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/middleware.ts`
- Create: `src/lib/auth/actions.ts`
- Test: `src/app/(auth)/login/__tests__/page.test.tsx`
- Test: `src/lib/auth/__tests__/actions.test.ts`

**Interfaces:**
- Consumes: `createClient()` dari Task 1
- Produces:
  - `signIn(email, password): Promise<void>` — server action login
  - `signOut(): Promise<void>` — server action logout
  - Middleware yang redirect unauthenticated ke `/login`

- [ ] **Step 1: Tulis failing test — halaman login render form**

```typescript
// src/app/(auth)/login/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoginPage from '../page'

describe('LoginPage', () => {
  it('renders username and password fields', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument()
  })

  it('submit button has minimum touch target', () => {
    render(<LoginPage />)
    const btn = screen.getByRole('button', { name: /masuk/i })
    expect(btn.className).toContain('min-h-[44px]')
  })
})
```

- [ ] **Step 2: Jalankan test — pastikan FAIL**

```bash
npx vitest run src/app/\(auth\)/login/__tests__/page.test.tsx
```
Expected: FAIL — LoginPage not found

- [ ] **Step 3: Buat middleware**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { response.cookies.set({ name, value, ...options }) },
        remove(name, options) { response.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const isAuth = request.nextUrl.pathname.startsWith('/login')

  if (!session && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (session && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
}
```

- [ ] **Step 4: Buat server actions auth**

```typescript
// src/lib/auth/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Username atau password salah' }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 5: Buat halaman login**

```typescript
// src/app/(auth)/login/page.tsx
import { signIn } from '@/lib/auth/actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1B4F8A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#1B4F8A]">Call Center PDAM</h1>
          <p className="text-sm text-[#718096] mt-1">Logbook & Ticketing</p>
        </div>

        <form action={signIn} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1A202C] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2.5 text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9]"
              placeholder="admin@pdam.id"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1A202C] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2.5 text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7FD9]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B4F8A] text-white rounded-md py-3 text-sm font-semibold min-h-[44px] hover:bg-[#16407A] active:bg-[#12325F] transition-colors mt-2"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Jalankan test — pastikan PASS**

```bash
npx vitest run src/app/\(auth\)/login/__tests__/page.test.tsx
```
Expected: PASS 2/2

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: auth module — login page, middleware, server actions"
```

---

## Task 4: Form Input Tiket & Customer Autofill (Modul 2)

**Files:**
- Create: `src/app/(app)/tiket/page.tsx`
- Create: `src/app/(app)/tiket/tambah/page.tsx`
- Create: `src/components/tickets/TicketForm.tsx`
- Create: `src/components/tickets/CustomerIdInput.tsx`
- Create: `src/components/tickets/ChannelPicker.tsx`
- Create: `src/lib/tickets/actions.ts`
- Create: `src/lib/tickets/schema.ts`
- Create: `src/lib/customers/lookup.ts`
- Create: `src/lib/image/compress.ts`
- Test: `src/lib/customers/__tests__/lookup.test.ts`
- Test: `src/lib/tickets/__tests__/schema.test.ts`
- Test: `src/components/tickets/__tests__/CustomerIdInput.test.tsx`

**Interfaces:**
- Consumes: `createClient()`, `AppShell`, master data dari Supabase (categories, interaction_types, handling_types, districts, villages)
- Produces:
  - `lookupCustomer(input: string): Promise<CustomerLookupResult>` — resolves 4-digit atau 9-digit
  - `createTicket(data: TicketFormData): Promise<{ticketNumber: string}>` — server action
  - `TicketForm` component
  - `CustomerIdInput` component dengan autofill

```typescript
// CustomerLookupResult interface
interface CustomerLookupResult {
  type: 'full' | 'partial' | 'not_found'
  kecamatan?: { id: string; nama: string }
  desa?: { id: string; nama: string }
  customer?: {
    id: string
    nama: string
    alamat: string
    noHp: string
    golongan: string
    latitude: number | null
    longitude: number | null
  }
}
```

- [ ] **Step 1: Tulis failing test — customer lookup logic**

```typescript
// src/lib/customers/__tests__/lookup.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupCustomer } from '../lookup'

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
}
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

describe('lookupCustomer', () => {
  it('returns not_found for less than 4 digits', async () => {
    const result = await lookupCustomer('12')
    expect(result.type).toBe('not_found')
  })

  it('returns partial match for 4-digit input with known district/village', async () => {
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({ data: { id: 'dist-1', nama_kecamatan: 'Kec. A' } })
      .mockResolvedValueOnce({ data: { id: 'vil-1', nama_desa: 'Desa B' } })

    const result = await lookupCustomer('0102')
    expect(result.type).toBe('partial')
    expect(result.kecamatan?.nama).toBe('Kec. A')
    expect(result.desa?.nama).toBe('Desa B')
    expect(result.customer).toBeUndefined()
  })

  it('returns full match for 9-digit input matching customer_master', async () => {
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({ data: { id: 'dist-1', nama_kecamatan: 'Kec. A' } })
      .mockResolvedValueOnce({ data: { id: 'vil-1', nama_desa: 'Desa B' } })
      .mockResolvedValueOnce({
        data: {
          id: 'cust-1', nama: 'Budi', alamat_detail: 'Jl. A',
          no_hp: '081234', golongan_pelanggan: 'RT',
          latitude: -8.5, longitude: 116.2,
        }
      })

    const result = await lookupCustomer('010200123')
    expect(result.type).toBe('full')
    expect(result.customer?.nama).toBe('Budi')
    expect(result.customer?.latitude).toBe(-8.5)
  })
})
```

- [ ] **Step 2: Jalankan test — pastikan FAIL**

```bash
npx vitest run src/lib/customers/__tests__/lookup.test.ts
```
Expected: FAIL — lookupCustomer not found

- [ ] **Step 3: Implementasi lookup logic**

```typescript
// src/lib/customers/lookup.ts
import { createClient } from '@/lib/supabase/client'

export interface CustomerLookupResult {
  type: 'full' | 'partial' | 'not_found'
  kecamatan?: { id: string; nama: string }
  desa?: { id: string; nama: string }
  customer?: {
    id: string
    nama: string
    alamat: string
    noHp: string
    golongan: string
    latitude: number | null
    longitude: number | null
  }
}

export async function lookupCustomer(input: string): Promise<CustomerLookupResult> {
  const digits = input.replace(/\D/g, '')
  if (digits.length < 4) return { type: 'not_found' }

  const kodeKecamatan = digits.slice(0, 2)
  const kodeDesa = digits.slice(2, 4)
  const supabase = createClient()

  const { data: district } = await supabase
    .from('districts')
    .select('id, nama_kecamatan')
    .eq('kode_kecamatan', kodeKecamatan)
    .eq('aktif', true)
    .maybeSingle()

  if (!district) return { type: 'not_found' }

  const { data: village } = await supabase
    .from('villages')
    .select('id, nama_desa')
    .eq('kecamatan_id', district.id)
    .eq('kode_desa', kodeDesa)
    .eq('aktif', true)
    .maybeSingle()

  if (!village) return { type: 'not_found' }

  const baseResult = {
    kecamatan: { id: district.id, nama: district.nama_kecamatan },
    desa: { id: village.id, nama: village.nama_desa },
  }

  // Only do full lookup if exactly 9 digits provided
  if (digits.length !== 9) return { type: 'partial', ...baseResult }

  const { data: customer } = await supabase
    .from('customer_master')
    .select('id, nama, alamat_detail, no_hp, golongan_pelanggan, latitude, longitude')
    .eq('customer_id', digits)
    .maybeSingle()

  if (!customer) return { type: 'partial', ...baseResult }

  return {
    type: 'full',
    ...baseResult,
    customer: {
      id: customer.id,
      nama: customer.nama,
      alamat: customer.alamat_detail ?? '',
      noHp: customer.no_hp ?? '',
      golongan: customer.golongan_pelanggan ?? '',
      latitude: customer.latitude,
      longitude: customer.longitude,
    },
  }
}
```

- [ ] **Step 4: Jalankan test — pastikan PASS**

```bash
npx vitest run src/lib/customers/__tests__/lookup.test.ts
```
Expected: PASS 3/3

- [ ] **Step 5: Buat Zod schema validasi tiket**

```typescript
// src/lib/tickets/schema.ts
import { z } from 'zod'

export const ticketSchema = z.object({
  timestamp: z.string().min(1, 'Tanggal & waktu wajib diisi'),
  customerIdInput: z.string().optional(),
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi'),
  alamatDetail: z.string().optional(),
  customerPhone: z.string().regex(/^\d*$/, 'Nomor kontak harus berupa angka').optional(),
  channel: z.enum(['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Telepon'], {
    required_error: 'Pilih kanal komunikasi',
  }),
  jenisInteraksiId: z.string().uuid('Jenis interaksi wajib dipilih'),
  categoryId: z.string().uuid('Kategori wajib dipilih'),
  handlingTypeId: z.string().uuid('Tujuan penanganan wajib dipilih'),
  detail: z.string().optional(),
  kecamatanId: z.string().uuid().optional(),
  desaId: z.string().uuid().optional(),
  customerRefId: z.string().uuid().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type TicketFormData = z.infer<typeof ticketSchema>
```

- [ ] **Step 6: Buat server action createTicket**

```typescript
// src/lib/tickets/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { ticketSchema } from './schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTicket(formData: TicketFormData) {
  const parsed = ticketSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = createClient()

  // Determine status from handling_type
  const { data: handlingType } = await supabase
    .from('handling_types')
    .select('otomatis_selesai')
    .eq('id', parsed.data.handlingTypeId)
    .single()

  const status = handlingType?.otomatis_selesai ? 'Selesai' : 'Berjalan'

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      timestamp: parsed.data.timestamp,
      customer_id_input: parsed.data.customerIdInput,
      customer_ref_id: parsed.data.customerRefId,
      kecamatan_id: parsed.data.kecamatanId,
      desa_id: parsed.data.desaId,
      customer_name: parsed.data.customerName,
      alamat_detail: parsed.data.alamatDetail,
      customer_phone: parsed.data.customerPhone,
      channel: parsed.data.channel,
      jenis_interaksi_id: parsed.data.jenisInteraksiId,
      category_id: parsed.data.categoryId,
      detail: parsed.data.detail,
      handling_type_id: parsed.data.handlingTypeId,
      status,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    })
    .select('ticket_number')
    .single()

  if (error) return { error: { _root: ['Gagal menyimpan tiket. Coba lagi.'] } }

  // Record initial status history
  await supabase.from('ticket_status_history').insert({
    ticket_id: data.id,
    status_sebelumnya: null,
    status_baru: status,
    catatan: 'Tiket dibuat',
  })

  revalidatePath('/tiket')
  return { ticketNumber: data.ticket_number }
}
```

- [ ] **Step 7: Buat ChannelPicker component**

```typescript
// src/components/tickets/ChannelPicker.tsx
const CHANNELS = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Telepon'] as const
type Channel = typeof CHANNELS[number]

export function ChannelPicker({
  value,
  onChange,
}: {
  value: Channel | ''
  onChange: (v: Channel) => void
}) {
  return (
    <div role="group" aria-label="Kanal Komunikasi" className="flex flex-wrap gap-2">
      {CHANNELS.map((ch) => (
        <button
          key={ch}
          type="button"
          onClick={() => onChange(ch)}
          className={[
            'px-4 py-2.5 rounded-full text-sm font-medium border min-h-[44px] transition-colors',
            value === ch
              ? 'bg-[#1B4F8A] text-white border-[#1B4F8A]'
              : 'bg-white text-[#1A202C] border-[#E2E8F0] hover:border-[#2E7FD9]',
          ].join(' ')}
          aria-pressed={value === ch}
        >
          {ch}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Buat TicketForm**

Komponen form lengkap dengan semua field wajib, CustomerIdInput autofill, ChannelPicker, dan validasi inline. File lengkap ada di `src/components/tickets/TicketForm.tsx`.

- [ ] **Step 9: Buat halaman tambah tiket dan daftar tiket**

```typescript
// src/app/(app)/tiket/page.tsx — Daftar tiket
// src/app/(app)/tiket/tambah/page.tsx — Form tambah tiket
```

- [ ] **Step 10: Jalankan semua test**

```bash
npx vitest run src/lib/customers/ src/lib/tickets/ src/components/tickets/
```
Expected: semua PASS

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: ticket form, customer autofill (4-digit & 9-digit), channel picker, create ticket action"
```

---

## Task 5: Manajemen & Update Status Tiket (Modul 2 lanjutan)

**Files:**
- Create: `src/app/(app)/tiket/[id]/page.tsx`
- Create: `src/components/tickets/TicketCard.tsx`
- Create: `src/components/tickets/StatusUpdateDialog.tsx`
- Create: `src/lib/tickets/update-actions.ts`
- Test: `src/components/tickets/__tests__/TicketCard.test.tsx`
- Test: `src/lib/tickets/__tests__/update-actions.test.ts`

**Interfaces:**
- Consumes: `AppShell`, `createClient()`, ticket data dari Supabase
- Produces:
  - `TicketCard` — kartu tiket mobile dengan status badge
  - `StatusUpdateDialog` — dialog ubah status dari Berjalan ke Selesai
  - `updateTicketStatus(ticketId, newStatus): Promise<void>`

- [ ] **Step 1: Tulis failing test — ubah status hanya bisa ke Selesai, data Selesai terkunci**

```typescript
// src/lib/tickets/__tests__/update-actions.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: 'tid', status: 'Berjalan' },
      error: null,
    }),
  })),
}))

describe('updateTicketStatus', () => {
  it('allows updating from Berjalan to Selesai', async () => {
    const { updateTicketStatus } = await import('../update-actions')
    const result = await updateTicketStatus('tid', 'Selesai')
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Jalankan test — FAIL**

```bash
npx vitest run src/lib/tickets/__tests__/update-actions.test.ts
```

- [ ] **Step 3: Implementasi update status action**

```typescript
// src/lib/tickets/update-actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTicketStatus(
  ticketId: string,
  newStatus: 'Selesai'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // BR-002: hanya bisa ke Selesai (tidak bisa revert)
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', ticketId)
    .single()

  if (fetchError || !ticket) return { success: false, error: 'Tiket tidak ditemukan' }
  if (ticket.status === 'Selesai') return { success: false, error: 'Tiket sudah selesai' }

  const { error } = await supabase
    .from('tickets')
    .update({ status: 'Selesai', updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (error) return { success: false, error: 'Gagal mengubah status' }

  revalidatePath('/tiket')
  revalidatePath(`/tiket/${ticketId}`)
  return { success: true }
}
```

- [ ] **Step 4: Buat TicketCard component**

```typescript
// src/components/tickets/TicketCard.tsx
// Kartu tiket dengan: nomor tiket, nama, channel badge, status badge, tanggal, action button
// Status "Selesai" = locked (no edit button)
// Status "Berjalan" = tombol "Tandai Selesai" yang buka StatusUpdateDialog
```

- [ ] **Step 5: Buat StatusUpdateDialog**

```typescript
// src/components/tickets/StatusUpdateDialog.tsx
// Dialog konfirmasi sebelum ubah status ke Selesai
// Gunakan Radix Dialog, closable dengan Escape key (R-32)
// Tombol konfirmasi min-h-[44px]
```

- [ ] **Step 6: Jalankan test — PASS**

```bash
npx vitest run src/lib/tickets/__tests__/update-actions.test.ts src/components/tickets/__tests__/TicketCard.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: ticket list, ticket detail, status update dialog (BR-002 lock)"
```

---

## Task 6: Dashboard KPI & Analitik (Modul 3)

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/components/dashboard/MetricCards.tsx`
- Create: `src/components/dashboard/TopKategoriWidget.tsx`
- Create: `src/components/dashboard/TopWilayahWidget.tsx`
- Create: `src/components/dashboard/TrendChart.tsx`
- Create: `src/components/dashboard/AgingReport.tsx`
- Create: `src/components/dashboard/PelangganBerulangWidget.tsx`
- Create: `src/components/dashboard/ChannelKategoriTable.tsx`
- Create: `src/lib/dashboard/queries.ts`
- Test: `src/lib/dashboard/__tests__/queries.test.ts`

**Interfaces:**
- Consumes: Supabase (tickets joined dengan district, village, category, handling_type), `AppShell`
- Produces:
  - `getDashboardData(period: Period): Promise<DashboardData>` — agregasi 8 widget
  - 8 widget komponen dashboard

- [ ] **Step 1: Tulis failing test — query dashboard**

```typescript
// src/lib/dashboard/__tests__/queries.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('getTopKategori', () => {
  it('returns empty array when no tickets', async () => {
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    }))
    const { getTopKategori } = await import('../queries')
    const result = await getTopKategori('2026-09-01', '2026-09-30')
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Jalankan test — FAIL**

- [ ] **Step 3: Implementasi queries dashboard**

```typescript
// src/lib/dashboard/queries.ts
// Semua query aggregasi menggunakan Supabase RPC atau client-side aggregation
// getTopKategori, getTopWilayah, getTrendHarian, getAgingReport,
// getPelangganBerulang, getChannelKategoriCrossTab, getRasioDurasi
```

- [ ] **Step 4: Buat MetricCards — 4 kartu KPI utama**

```typescript
// src/components/dashboard/MetricCards.tsx
// Total tiket, Berjalan, Selesai, Hari ini
// Tiap kartu: angka besar + label — data nyata dari database (R-17)
// Empty state: "Belum ada data periode ini"
```

- [ ] **Step 5: Buat 7 widget analitik lainnya**

Masing-masing widget punya: loading state (Spinner), empty state (EmptyState), error state (ErrorState), data state.

- TrendChart: recharts LineChart, responsif via ResponsiveContainer
- TopKategoriWidget: daftar ranking dengan bar progress
- TopWilayahWidget: daftar ranking dengan tap drill-down ke breakdown kategori per desa
- AgingReport: tabel tiket Berjalan diurutkan terlama, dengan kolom "Hari Menggantung"
- PelangganBerulangWidget: pelanggan dengan >= 3 tiket / 30 hari
- ChannelKategoriTable: tabel silang channel x kategori
- RasioDurasiWidget: rasio selesai/berjalan dan rata-rata durasi per tujuan penanganan

- [ ] **Step 6: Buat period filter (Hari Ini / Minggu Ini / Bulan Ini / Kustom)**

- [ ] **Step 7: Jalankan test**

```bash
npx vitest run src/lib/dashboard/
```
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: dashboard KPI — 8 widgets, period filter, agregasi real-time"
```

---

## Task 7: Export Laporan Excel (Modul 4)

**Files:**
- Create: `src/app/(app)/laporan/page.tsx`
- Create: `src/lib/reports/excel.ts`
- Create: `src/lib/reports/queries.ts`
- Test: `src/lib/reports/__tests__/excel.test.ts`

**Interfaces:**
- Consumes: Supabase tickets data, `AppShell`
- Produces:
  - `generateExcel(startDate, endDate): Promise<Buffer>` — 3-sheet Excel sesuai Report_Format.md
  - Halaman laporan dengan period picker dan tombol download

- [ ] **Step 1: Tulis failing test — struktur Excel 3 sheet**

```typescript
// src/lib/reports/__tests__/excel.test.ts
import { describe, it, expect } from 'vitest'
import { generateExcel } from '../excel'

describe('generateExcel', () => {
  it('generates a buffer with 3 sheets', async () => {
    const Workbook = (await import('exceljs')).default.Workbook
    const buffer = await generateExcel([], '2026-09-01', '2026-09-30', {
      totalInteraksi: 0, totalKomplain: 0, totalPertanyaan: 0,
      totalGangguan: 0, selesaiEdukasi: 0, eskalasiPelayanan: 0,
      eskalasiCabang: 0, statusSelesai: 0, statusBerjalan: 0,
      perChannel: [], perKategori: [], topKategori: [], topDesa: [],
      perHandling: [],
    })
    const wb = new Workbook()
    await wb.xlsx.load(buffer)
    expect(wb.worksheets.length).toBe(3)
    expect(wb.worksheets[0].name).toBe('Kop & Ringkasan')
    expect(wb.worksheets[1].name).toBe('Data Rinci')
    expect(wb.worksheets[2].name).toBe('Rekap per Tujuan Penanganan')
  })
})
```

- [ ] **Step 2: Jalankan test — FAIL**

- [ ] **Step 3: Implementasi generateExcel dengan exceljs**

```typescript
// src/lib/reports/excel.ts
// Sheet 1: Kop PDAM + ringkasan tabel + top5 kategori + top5 desa + blok TTD
// Sheet 2: Data rinci semua tiket (kolom sesuai Report_Format.md)
// Sheet 3: Rekap per Tujuan Penanganan (jumlah, selesai, berjalan, rata-rata hari)
// Header berwarna biru muda (#DBEAFE), border rapi, font sesuai kop resmi
// Nama file: Rekap-CallCenter-[Periode]-[TanggalExport].xlsx
```

- [ ] **Step 4: Buat API Route untuk download**

```typescript
// src/app/api/laporan/export/route.ts
// GET ?start=&end=
// Generate Excel → send as blob dengan Content-Disposition attachment
// Kompatibel dengan Safari iOS dan Firefox Android (tidak menggunakan SW download)
```

- [ ] **Step 5: Buat halaman laporan**

```typescript
// src/app/(app)/laporan/page.tsx
// Period picker (preset + kustom date range)
// Tombol "Unduh Excel" → fetch API route → trigger download via anchor + blob URL
// Min-h-[44px] tombol download
```

- [ ] **Step 6: Jalankan test — PASS**

```bash
npx vitest run src/lib/reports/
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: Excel export — 3-sheet report (kop, data rinci, rekap), period filter"
```

---

## Task 8: Offline-First Caching (Modul 2 edge case)

**Files:**
- Create: `src/lib/offline/queue.ts`
- Create: `src/lib/offline/sync.ts`
- Create: `src/components/ui/OfflineBanner.tsx`
- Create: `public/manifest.json`
- Modify: `next.config.js` (tambah next-pwa config)
- Test: `src/lib/offline/__tests__/queue.test.ts`

**Interfaces:**
- Consumes: `idb`, `createClient()`
- Produces:
  - `enqueueTicket(data): Promise<void>` — simpan ke IndexedDB saat offline
  - `syncPendingTickets(): Promise<{synced: number; failed: number}>` — sync saat online
  - `OfflineBanner` — indikator "Offline - Tersimpan Lokal" (R-27 error state)

- [ ] **Step 1: Tulis failing test — enqueue dan sync**

```typescript
// src/lib/offline/__tests__/queue.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    put: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
  }),
}))

describe('offline queue', () => {
  it('enqueues ticket to IndexedDB', async () => {
    const { enqueueTicket } = await import('../queue')
    await expect(enqueueTicket({ customerName: 'Test' } as any)).resolves.not.toThrow()
  })

  it('sync returns 0 synced when queue is empty', async () => {
    const { syncPendingTickets } = await import('../sync')
    const result = await syncPendingTickets()
    expect(result.synced).toBe(0)
  })
})
```

- [ ] **Step 2: Jalankan test — FAIL**

- [ ] **Step 3: Implementasi IndexedDB queue**

```typescript
// src/lib/offline/queue.ts
import { openDB } from 'idb'

const DB_NAME = 'pdam-offline'
const STORE_NAME = 'pending-tickets'

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true })
      }
    },
  })
}

export async function enqueueTicket(data: object) {
  const db = await getDB()
  await db.put(STORE_NAME, { ...data, enqueuedAt: new Date().toISOString() })
}

export async function getPendingTickets() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function deletePendingTicket(localId: number) {
  const db = await getDB()
  await db.delete(STORE_NAME, localId)
}
```

- [ ] **Step 4: Implementasi sync**

```typescript
// src/lib/offline/sync.ts
import { getPendingTickets, deletePendingTicket } from './queue'
import { createTicket } from '@/lib/tickets/actions'

export async function syncPendingTickets() {
  const pending = await getPendingTickets()
  let synced = 0
  let failed = 0

  for (const item of pending) {
    const { localId, enqueuedAt, ...ticketData } = item
    const result = await createTicket(ticketData)
    if (!result.error) {
      await deletePendingTicket(localId)
      synced++
    } else {
      failed++
    }
  }
  return { synced, failed }
}
```

- [ ] **Step 5: Buat OfflineBanner dan auto-sync on reconnect**

```typescript
// src/components/ui/OfflineBanner.tsx
'use client'
import { useEffect, useState } from 'react'
import { syncPendingTickets } from '@/lib/offline/sync'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const handleOnline = async () => {
      setIsOffline(false)
      await syncPendingTickets()
    }
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div role="alert" className="fixed top-14 inset-x-0 z-50 bg-amber-500 text-white text-sm px-4 py-2 text-center">
      Offline - Data tersimpan lokal, akan sinkron saat online
    </div>
  )
}
```

- [ ] **Step 6: Konfigurasi PWA**

```javascript
// next.config.js — tambah withPWA
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' })
module.exports = withPWA({ /* existing config */ })
```

- [ ] **Step 7: Jalankan test — PASS**

```bash
npx vitest run src/lib/offline/
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: offline-first IndexedDB queue, auto-sync on reconnect, PWA manifest"
```

---

## Task 9: Backup Otomatis (Modul 5)

**Files:**
- Create: `supabase/functions/backup-daily/index.ts`
- Create: `supabase/functions/backup-weekly/index.ts`
- Create: `src/app/(app)/pengaturan/backup/page.tsx`
- Create: `src/lib/backup/manual-trigger.ts`
- Test: `supabase/functions/__tests__/backup.test.ts`

**Interfaces:**
- Consumes: Supabase Edge Functions, Resend email API, `backup_logs` table
- Produces:
  - Edge Function yang auto-backup harian (23:00) dan mingguan (Senin pagi)
  - Halaman riwayat backup di menu Pengaturan
  - Tombol backup manual

- [ ] **Step 1: Tulis failing test — backup mencatat hasil ke backup_logs**

```typescript
// supabase/functions/__tests__/backup.test.ts
// Test bahwa fungsi backup insert baris ke backup_logs dengan status_kirim yang benar
```

- [ ] **Step 2: Implementasi Edge Function backup**

```typescript
// supabase/functions/backup-daily/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .gte('created_at', new Date(Date.now() - 86400000).toISOString())

  const csvContent = convertToCSV(tickets ?? [])
  const fileName = `backup-harian-${new Date().toISOString().slice(0,10)}.csv`

  // Kirim via Resend
  const emailResult = await sendEmailWithAttachment(fileName, csvContent)

  await supabase.from('backup_logs').insert({
    periode: `Harian - ${new Date().toISOString().slice(0,10)}`,
    jumlah_baris: tickets?.length ?? 0,
    file_name: fileName,
    status_kirim: emailResult.success ? 'Berhasil' : 'Gagal',
    dikirim_ke: Deno.env.get('ADMIN_EMAIL'),
  })

  return new Response(JSON.stringify({ success: emailResult.success }))
})
```

- [ ] **Step 3: Buat halaman riwayat backup**

```typescript
// src/app/(app)/pengaturan/backup/page.tsx
// Daftar backup_logs: tanggal, periode, jumlah baris, status (Berhasil/Gagal)
// Status Gagal tampil merah (R-27 error state)
// Tombol "Backup Manual Sekarang"
```

- [ ] **Step 4: Jalankan test — PASS**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: backup otomatis Edge Functions harian & mingguan, riwayat backup"
```

---

## Task 10: Pengaturan Master Data (Modul 6)

**Files:**
- Create: `src/app/(app)/pengaturan/page.tsx`
- Create: `src/app/(app)/pengaturan/jenis-interaksi/page.tsx`
- Create: `src/app/(app)/pengaturan/kategori/page.tsx`
- Create: `src/app/(app)/pengaturan/tujuan-penanganan/page.tsx`
- Create: `src/app/(app)/pengaturan/kecamatan/page.tsx`
- Create: `src/app/(app)/pengaturan/desa/page.tsx`
- Create: `src/components/settings/MasterDataList.tsx`
- Create: `src/lib/settings/actions.ts`
- Test: `src/lib/settings/__tests__/actions.test.ts`

**Interfaces:**
- Consumes: Supabase (interaction_types, categories, handling_types, districts, villages), `AppShell`
- Produces:
  - CRUD actions untuk semua 5 master data
  - `MasterDataList` — komponen reusable list dengan toggle aktif/nonaktif dan edit
  - Soft delete (BR-009): item yang sudah dipakai tidak bisa dihapus, hanya dinonaktifkan

- [ ] **Step 1: Tulis failing test — soft delete protection**

```typescript
// src/lib/settings/__tests__/actions.test.ts
describe('deleteOrDeactivate', () => {
  it('deactivates (not permanently deletes) item that is already used in tickets', async () => {
    // Mock: query tickets dengan category_id = target_id returns 1 row
    // Expected: update aktif = false, bukan DELETE
    const { deleteOrDeactivateMasterItem } = await import('../actions')
    const result = await deleteOrDeactivateMasterItem('categories', 'cat-id')
    expect(result.action).toBe('deactivated') // bukan 'deleted'
  })
})
```

- [ ] **Step 2: Jalankan test — FAIL**

- [ ] **Step 3: Implementasi settings actions**

```typescript
// src/lib/settings/actions.ts
// addMasterItem, updateMasterItem, deleteOrDeactivateMasterItem
// deleteOrDeactivateMasterItem: cek apakah item dipakai di tickets,
// jika ya → soft delete (aktif=false), jika tidak → hard delete (BR-009)
```

- [ ] **Step 4: Buat MasterDataList component**

```typescript
// src/components/settings/MasterDataList.tsx
// Daftar item dengan: nama, status aktif (toggle switch), tombol edit, tombol hapus/nonaktifkan
// Toggle switch min-h-[44px], accessible label
// Confirm dialog sebelum hapus/nonaktifkan
```

- [ ] **Step 5: Buat halaman 5 tab pengaturan**

Halaman index pengaturan dengan navigasi ke 5 sub-halaman: Jenis Interaksi, Kategori, Tujuan Penanganan, Kecamatan, Desa.

- [ ] **Step 6: Jalankan test — PASS**

```bash
npx vitest run src/lib/settings/
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: settings — CRUD 5 master data, soft delete protection (BR-009)"
```

---

## Task 11: Import Data Pelanggan (Modul 7)

**Files:**
- Create: `src/app/(app)/pengaturan/import-pelanggan/page.tsx`
- Create: `src/components/import/ImportPreview.tsx`
- Create: `src/lib/import/parser.ts`
- Create: `src/lib/import/actions.ts`
- Test: `src/lib/import/__tests__/parser.test.ts`

**Interfaces:**
- Consumes: exceljs (baca file), `districts`, `villages`, `customer_master` tables
- Produces:
  - `parseCustomerExcel(file: File): Promise<ParseResult>` — parsing + validasi + preview
  - `applyImport(batchId: string): Promise<void>` — terapkan setelah konfirmasi admin
  - `ImportPreview` component — tabel pratinjau dengan baris valid/error

```typescript
interface ParseResult {
  batchId: string
  totalRows: number
  validRows: CustomerRow[]
  errorRows: ErrorRow[]
}
```

- [ ] **Step 1: Tulis failing test — parser memisahkan koordinat gabungan**

```typescript
// src/lib/import/__tests__/parser.test.ts
describe('parseCoordinates', () => {
  it('splits "lat,long" string into latitude and longitude', () => {
    const { parseCoordinates } = require('../parser')
    const result = parseCoordinates('-8.512345,116.234567')
    expect(result.latitude).toBeCloseTo(-8.512345, 5)
    expect(result.longitude).toBeCloseTo(116.234567, 5)
  })

  it('returns null for invalid coordinate string', () => {
    const { parseCoordinates } = require('../parser')
    const result = parseCoordinates('invalid')
    expect(result.latitude).toBeNull()
    expect(result.longitude).toBeNull()
  })

  it('marks row as error if district code not in master', async () => {
    // Mock districts: only kode '01' exists
    // Input row with customer_id starting with '99...' (unknown district)
    // Expected: row in errorRows
  })
})
```

- [ ] **Step 2: Jalankan test — FAIL**

- [ ] **Step 3: Implementasi parser**

```typescript
// src/lib/import/parser.ts
export function parseCoordinates(raw: string | null) {
  if (!raw) return { latitude: null, longitude: null }
  const parts = raw.split(',').map(s => parseFloat(s.trim()))
  if (parts.length !== 2 || parts.some(isNaN)) return { latitude: null, longitude: null }
  return { latitude: parts[0], longitude: parts[1] }
}

export async function parseCustomerExcel(file: File): Promise<ParseResult> {
  // Baca file xlsx dengan exceljs
  // Validasi setiap baris: customer_id 9 digit, cek kecamatan/desa di master
  // Pisahkan koordinat gabungan
  // Return validRows + errorRows
}
```

- [ ] **Step 4: Buat ImportPreview component**

```typescript
// src/components/import/ImportPreview.tsx
// Ringkasan: X baris valid, Y baris error
// Tabel preview baris valid (ID, Nama, Kecamatan, Desa, No.HP)
// Daftar baris error dengan alasan error
// Tombol "Terapkan" dan "Batalkan" — min-h-[44px]
// Konfirmasi wajib sebelum apply (BR-012)
```

- [ ] **Step 5: Jalankan test — PASS**

```bash
npx vitest run src/lib/import/
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: customer import — Excel parser, coordinate split, preview & apply with validation"
```

---

## Task 12: Weekly Reminder & Final Polish (FT-005 + antislop delivery gate)

**Files:**
- Create: `supabase/functions/weekly-reminder/index.ts`
- Create: `src/components/dashboard/WeeklyReminderBanner.tsx`
- Modify: berbagai komponen (accessibility audit, mobile layout final check)
- Test: E2E tests via Playwright

**Interfaces:**
- Consumes: `tickets` table (filter status=Berjalan dan umur > 7 hari), Resend email
- Produces:
  - Edge Function reminder mingguan (Senin 08:00)
  - Banner reminder di dashboard saat ada tiket menggantung > 7 hari
  - Semua checklist antislop terpenuhi

- [ ] **Step 1: Buat Edge Function weekly reminder**

```typescript
// supabase/functions/weekly-reminder/index.ts
// Query: tickets WHERE status='Berjalan' AND created_at < NOW() - INTERVAL '7 days'
// Kirim email ringkasan ke admin
// Cron: setiap Senin 08:00 WIB (00:00 UTC)
```

- [ ] **Step 2: Buat WeeklyReminderBanner**

```typescript
// src/components/dashboard/WeeklyReminderBanner.tsx
// Tampil di atas dashboard jika ada tiket menggantung > 7 hari
// Link langsung ke aging report
```

- [ ] **Step 3: Tulis E2E test — full user flow**

```typescript
// tests/e2e/ticket-flow.spec.ts
import { test, expect } from '@playwright/test'

test('admin creates ticket and sees it in list', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', process.env.TEST_ADMIN_EMAIL!)
  await page.fill('[name=password]', process.env.TEST_ADMIN_PASSWORD!)
  await page.click('button[type=submit]')
  await page.waitForURL('/dashboard')

  await page.click('[href="/tiket"]')
  await page.click('text=Tambah Tiket')

  // Isi form
  await page.fill('[name=customerName]', 'Budi Santoso')
  await page.fill('[name=customerPhone]', '081234567890')
  await page.click('button[aria-label="WhatsApp"]')
  // ... isi field lainnya

  await page.click('button[type=submit]')
  await expect(page.locator('text=TIK-CC')).toBeVisible()
})
```

- [ ] **Step 4: Jalankan antislop Delivery Gate — semua checklist**

**Block 1: Hard Gate**
- [ ] Tidak ada em dash dalam teks UI (R-02)
- [ ] Tidak ada horizontal overflow di mobile (R-03)
- [ ] Tidak ada angka statistik palsu (R-17)
- [ ] Tidak ada testimonial/ulasan fiktif (R-18)
- [ ] Semua tombol punya perilaku nyata (R-26)
- [ ] Ada empty, loading, error state di semua widget (R-27)
- [ ] Semua elemen interactive reachable via keyboard Tab/Enter/Escape (R-32)
- [ ] Tidak ada patching CSS via script (R-33)

**Block 2: antislop-ui Checklist**
- [ ] Palette dari DESIGN.md (bukan default gradient)
- [ ] Tidak ada emoji dekoratif di UI
- [ ] Section layout tidak monoton template
- [ ] Tidak ada bento grid, fake terminal, stripe dekoratif
- [ ] Semua status dot/badge punya makna nyata

**Block 3: antislop-layoutmobile Checklist**
- [ ] Layout reflow nyata (bukan desktop shrink) di mobile
- [ ] Semua tap target minimum 44x44px
- [ ] Tidak ada horizontal scroll
- [ ] Grid collapse dan stack di narrow viewport
- [ ] BottomNav tidak cover konten (safe area inset)
- [ ] Hover interactions punya tap equivalent

- [ ] **Step 5: Jalankan E2E test**

```bash
npx playwright test tests/e2e/
```

- [ ] **Step 6: Jalankan seluruh test suite**

```bash
npx vitest run
npx playwright test
```
Expected: semua PASS

- [ ] **Step 7: Commit final**

```bash
git add .
git commit -m "feat: weekly reminder Edge Function, E2E tests, antislop delivery gate passed"
```

---

## Task 13: Deployment ke Vercel

**Files:**
- Create: `vercel.json`
- Create: `.github/workflows/ci.yml` (opsional)

- [ ] **Step 1: Setup environment variables di Vercel**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
ADMIN_EMAIL
```

- [ ] **Step 2: Deploy Supabase migrations**

```bash
npx supabase db push
```

- [ ] **Step 3: Deploy ke Vercel**

```bash
npx vercel --prod
```

- [ ] **Step 4: Verifikasi deployment**

- Buka URL Vercel → login → buat 1 tiket percobaan
- Unduh Excel → cek 3 sheet
- Cek di mobile browser (Chrome Android / Safari iOS)
- Cek keyboard navigation
- Cek zero horizontal overflow

- [ ] **Step 5: Commit deployment config**

```bash
git add vercel.json
git commit -m "chore: Vercel deployment config"
git push origin main
```
