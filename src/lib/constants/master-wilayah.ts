export interface DistrictData {
  kode_kecamatan: string
  nama_kecamatan: string
  desa: Array<{
    kode_desa: string
    nama_desa: string
  }>
}

export const MASTER_WILAYAH_PDAM: DistrictData[] = [
  {
    kode_kecamatan: '01',
    nama_kecamatan: 'Tanjung',
    desa: [
      { kode_desa: '01', nama_desa: 'Sokong' },
      { kode_desa: '02', nama_desa: 'Tanjung' },
      { kode_desa: '03', nama_desa: 'Jenggala & Sama Guna' },
      { kode_desa: '04', nama_desa: 'Tegal Maja' },
      { kode_desa: '05', nama_desa: 'Sigar Penjalin' },
      { kode_desa: '06', nama_desa: 'Medana' },
    ],
  },
  {
    kode_kecamatan: '02',
    nama_kecamatan: 'Pemenang',
    desa: [
      { kode_desa: '01', nama_desa: 'Pemenang Timur' },
      { kode_desa: '02', nama_desa: 'Pemenang Barat' },
      { kode_desa: '03', nama_desa: 'Malaka' },
      { kode_desa: '04', nama_desa: 'Gili Air' },
    ],
  },
  {
    kode_kecamatan: '03',
    nama_kecamatan: 'Bayan',
    desa: [
      { kode_desa: '01', nama_desa: 'Kr. Bajo' },
      { kode_desa: '03', nama_desa: 'Anyar' },
      { kode_desa: '04', nama_desa: 'Loloan' },
      { kode_desa: '05', nama_desa: 'Tumpang Sari' },
      { kode_desa: '06', nama_desa: 'Sambi\' Elen' },
      { kode_desa: '07', nama_desa: 'Senaru' },
      { kode_desa: '08', nama_desa: 'Sukadana' },
      { kode_desa: '09', nama_desa: 'Akar-Akar' },
    ],
  },
  {
    kode_kecamatan: '04',
    nama_kecamatan: 'Kayangan',
    desa: [
      { kode_desa: '01', nama_desa: 'Kayangan' },
      { kode_desa: '02', nama_desa: 'Dangiang' },
      { kode_desa: '03', nama_desa: 'Sesait' },
      { kode_desa: '04', nama_desa: 'Santong' },
      { kode_desa: '05', nama_desa: 'Pendua' },
      { kode_desa: '06', nama_desa: 'Gumantar' },
    ],
  },
  {
    kode_kecamatan: '05',
    nama_kecamatan: 'Gangga',
    desa: [
      { kode_desa: '01', nama_desa: 'Gondang' },
      { kode_desa: '02', nama_desa: 'Bentek' },
      { kode_desa: '03', nama_desa: 'Segara Katon' },
      { kode_desa: '04', nama_desa: 'Sambi\' Bangkol' },
      { kode_desa: '05', nama_desa: 'Rempek' },
      { kode_desa: '06', nama_desa: 'Rempek Darusalam' },
      { kode_desa: '07', nama_desa: 'Genggelang' },
    ],
  },
]
