export interface DemoTicket {
  id: string
  ticket_number: string
  timestamp: string
  customer_id_input: string | null
  customer_name: string
  customer_phone: string | null
  alamat_detail: string | null
  channel: string
  status: 'Berjalan' | 'Selesai'
  created_at: string
  kecamatan?: { id: string; nama_kecamatan: string } | null
  desa?: { id: string; nama_desa: string } | null
  kategori?: { id: string; nama: string } | null
  jenis_interaksi?: { id: string; nama: string } | null
  tujuan?: { id: string; nama: string; otomatis_selesai?: boolean } | null
  detail?: string | null
  screenshot_path?: string | null
  latitude?: number | null
  longitude?: number | null
  riwayat?: Array<{
    id: string
    status_sebelumnya: string | null
    status_baru: string
    catatan: string | null
    changed_at: string
  }>
}

const INITIAL_DEMO_TICKETS: DemoTicket[] = [
  {
    id: 'demo-1',
    ticket_number: 'TIK-CC-2609-0001',
    timestamp: new Date().toISOString(),
    customer_id_input: '01010001',
    customer_name: 'Budi Santoso',
    customer_phone: '081234567890',
    alamat_detail: 'Jl. Raya Tanjung No. 12',
    channel: 'WhatsApp',
    status: 'Berjalan',
    created_at: new Date().toISOString(),
    kecamatan: { id: '1', nama_kecamatan: 'Tanjung' },
    desa: { id: '1', nama_desa: 'Tanjung' },
    kategori: { id: '1', nama: 'Tagihan Tidak Sesuai' },
    jenis_interaksi: { id: '1', nama: 'Komplain' },
    tujuan: { id: '2', nama: 'Diteruskan ke Unit Terkait', otomatis_selesai: false },
    detail: 'Tagihan melonjak tinggi dibanding bulan lalu padahal pemakaian normal.',
    riwayat: [
      {
        id: 'h-1',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat',
        changed_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo-2',
    ticket_number: 'TIK-CC-2609-0002',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer_id_input: '01020004',
    customer_name: 'Dewi Lestari',
    customer_phone: '081987654321',
    alamat_detail: 'Dusun Karang Anyar, Sokong',
    channel: 'WhatsApp',
    status: 'Berjalan',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    kecamatan: { id: '1', nama_kecamatan: 'Tanjung' },
    desa: { id: '2', nama_desa: 'Sokong' },
    kategori: { id: '1', nama: 'Tagihan Tidak Sesuai' },
    jenis_interaksi: { id: '1', nama: 'Komplain' },
    tujuan: { id: '2', nama: 'Diteruskan ke Unit Terkait', otomatis_selesai: false },
    detail: 'Jumlah meteran di struk berbeda dengan angka di fisik meteran air rumah.',
    riwayat: [
      {
        id: 'h-2',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat',
        changed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'demo-3',
    ticket_number: 'TIK-CC-2609-0003',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer_id_input: '02010005',
    customer_name: 'Siti Aminah',
    customer_phone: '085234567890',
    alamat_detail: 'Dusun Karang Pangsor, Pemenang Barat',
    channel: 'Telepon',
    status: 'Selesai',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    kecamatan: { id: '2', nama_kecamatan: 'Pemenang' },
    desa: { id: '6', nama_desa: 'Pemenang Barat' },
    kategori: { id: '5', nama: 'Lapor Gangguan' },
    jenis_interaksi: { id: '3', nama: 'Lapor Gangguan/Kerusakan' },
    tujuan: { id: '1', nama: 'Selesai di Call Center', otomatis_selesai: true },
    detail: 'Pipa distribusi depan rumah rembes air, sudah ditangani petugas piket.',
    riwayat: [
      {
        id: 'h-3',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat',
        changed_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'h-4',
        status_sebelumnya: 'Berjalan',
        status_baru: 'Selesai',
        catatan: 'Petugas lapangan mengonfirmasi perbaikan selesai.',
        changed_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-4',
    ticket_number: 'TIK-CC-2609-0004',
    timestamp: new Date(Date.now() - 3600000 * 24 * 9).toISOString(), // 9 hari lalu (aging)
    customer_id_input: '01010001',
    customer_name: 'Budi Santoso',
    customer_phone: '081234567890',
    alamat_detail: 'Jl. Raya Tanjung',
    channel: 'WhatsApp',
    status: 'Berjalan',
    created_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    kecamatan: { id: '1', nama_kecamatan: 'Tanjung' },
    desa: { id: '1', nama_desa: 'Tanjung' },
    kategori: { id: '5', nama: 'Lapor Gangguan' },
    jenis_interaksi: { id: '3', nama: 'Lapor Gangguan/Kerusakan' },
    tujuan: { id: '3', nama: 'Perlu Kunjungan Lapangan', otomatis_selesai: false },
    detail: 'Air sering mati di jam sibuk pagi dan sore hari.',
    riwayat: [
      {
        id: 'h-5',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat - Menunggu jadwal tim teknik',
        changed_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
      },
    ],
  },
  {
    id: 'demo-5',
    ticket_number: 'TIK-CC-2609-0005',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    customer_id_input: '010100001',
    customer_name: 'ABDUL MUID',
    customer_phone: '081765432109',
    alamat_detail: 'Dusun Karang Baru, Desa Tanjung',
    channel: 'WhatsApp',
    status: 'Berjalan',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    kecamatan: { id: '1', nama_kecamatan: 'Tanjung' },
    desa: { id: '1', nama_desa: 'Tanjung' },
    kategori: { id: '1', nama: 'Tagihan Tidak Sesuai' },
    jenis_interaksi: { id: '1', nama: 'Komplain' },
    tujuan: { id: '2', nama: 'Diteruskan ke Unit Terkait', otomatis_selesai: false },
    detail: 'Aduan tagihan ketiga dalam bulan ini, mohon pengecekan tera meteran.',
    riwayat: [
      {
        id: 'h-6',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat',
        changed_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
  },
  {
    id: 'demo-6',
    ticket_number: 'TIK-CC-2609-0006',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    customer_id_input: '010100009',
    customer_name: 'ARIP RAHMAN',
    customer_phone: '087812345678',
    alamat_detail: 'Dusun Medana, Tanjung',
    channel: 'Telepon',
    status: 'Berjalan',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    kecamatan: { id: '1', nama_kecamatan: 'Tanjung' },
    desa: { id: '3', nama_desa: 'Medana' },
    kategori: { id: '2', nama: 'Harga Naik' },
    jenis_interaksi: { id: '2', nama: 'Pertanyaan/Informasi' },
    tujuan: { id: '1', nama: 'Selesai di Call Center', otomatis_selesai: true },
    detail: 'Menanyakan dasar kenaikan tarif blok 2 pada periode berjalan.',
    riwayat: [
      {
        id: 'h-7',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat',
        changed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
  },
  {
    id: 'demo-7',
    ticket_number: 'TIK-CC-2609-0007',
    timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
    customer_id_input: '05010002',
    customer_name: 'I Made Sudarta',
    customer_phone: '081339876543',
    alamat_detail: 'Dusun Gondang Barat, Kec. Gangga',
    channel: 'WhatsApp',
    status: 'Selesai',
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    kecamatan: { id: '5', nama_kecamatan: 'Gangga' },
    desa: { id: '26', nama_desa: 'Gondang' },
    kategori: { id: '5', nama: 'Lapor Gangguan' },
    jenis_interaksi: { id: '3', nama: 'Lapor Gangguan/Kerusakan' },
    tujuan: { id: '1', nama: 'Selesai di Call Center', otomatis_selesai: true },
    detail: 'Tekanan air mengecil setelah ada perbaikan jalan di depan gang.',
    riwayat: [
      {
        id: 'h-8',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat',
        changed_at: new Date(Date.now() - 3600000 * 16).toISOString(),
      },
      {
        id: 'h-9',
        status_sebelumnya: 'Berjalan',
        status_baru: 'Selesai',
        catatan: 'Valve utama telah dibuka normal oleh tim cabang Gangga.',
        changed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'demo-8',
    ticket_number: 'TIK-CC-2609-0008',
    timestamp: new Date(Date.now() - 3600000 * 24 * 4).toISOString(), // 4 hari lalu (aging)
    customer_id_input: '04010008',
    customer_name: 'Siti Rahmawati',
    customer_phone: '085333444555',
    alamat_detail: 'Dusun Kayangan, Kec. Kayangan',
    channel: 'Instagram',
    status: 'Berjalan',
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    kecamatan: { id: '4', nama_kecamatan: 'Kayangan' },
    desa: { id: '18', nama_desa: 'Kayangan' },
    kategori: { id: '1', nama: 'Tagihan Tidak Sesuai' },
    jenis_interaksi: { id: '1', nama: 'Komplain' },
    tujuan: { id: '2', nama: 'Diteruskan ke Unit Terkait', otomatis_selesai: false },
    detail: 'Menyampaikan bukti transfer pembayaran online belum tercatat di sistem billing.',
    riwayat: [
      {
        id: 'h-10',
        status_sebelumnya: null,
        status_baru: 'Berjalan',
        catatan: 'Tiket dibuat - Koordinasi dengan bagian Keuangan/Billing',
        changed_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'demo-9',
    ticket_number: 'TIK-CC-2609-0009',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    customer_id_input: '03010003',
    customer_name: 'Lalu Ahmad',
    customer_phone: '087711223344',
    alamat_detail: 'Dusun Senaru, Bayan',
    channel: 'Facebook',
    status: 'Selesai',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    kecamatan: { id: '3', nama_kecamatan: 'Bayan' },
    desa: { id: '13', nama_desa: 'Senaru' },
    kategori: { id: '4', nama: 'Cara Bayar Online' },
    jenis_interaksi: { id: '2', nama: 'Pertanyaan/Informasi' },
    tujuan: { id: '1', nama: 'Selesai di Call Center', otomatis_selesai: true },
    detail: 'Panduan pembayaran via Virtual Account Bank NTB Syariah dan e-wallet.',
    riwayat: [
      {
        id: 'h-11',
        status_sebelumnya: null,
        status_baru: 'Selesai',
        catatan: 'Petugas memberikan tutorial langkah pembayaran online.',
        changed_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
    ],
  },
]

const globalStore = globalThis as unknown as {
  __pdamDemoTickets?: DemoTicket[]
}

if (!globalStore.__pdamDemoTickets) {
  globalStore.__pdamDemoTickets = [...INITIAL_DEMO_TICKETS]
}

export const DEMO_TICKETS: DemoTicket[] = globalStore.__pdamDemoTickets
