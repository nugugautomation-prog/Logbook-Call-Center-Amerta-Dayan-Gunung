import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'pdam-callcenter'
const DB_VERSION = 2
const STORE_CUSTOMERS = 'customers'
const STORE_METADATA = 'master-meta'

export interface StoredCustomer {
  customerId: string
  nama: string
  alamatDetail: string
  noHp: string
  golongan: string
  latitude: number | null
  longitude: number | null
  kecamatanId?: string | null
  desaId?: string | null
}

export interface MasterMeta {
  type: 'pelanggan' | 'wilayah'
  fileName: string
  uploadedAt: string
  count: number
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('pending-tickets')) {
        db.createObjectStore('pending-tickets', {
          keyPath: 'localId',
          autoIncrement: true,
        })
      }
      if (!db.objectStoreNames.contains(STORE_CUSTOMERS)) {
        db.createObjectStore(STORE_CUSTOMERS, { keyPath: 'customerId' })
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'type' })
      }
    },
  })
}

/**
 * Simpan seluruh pelanggan ke IndexedDB dalam satu transaksi cepat
 */
export async function saveCustomersToIndexedDB(
  customers: StoredCustomer[],
  fileName: string
): Promise<void> {
  if (typeof window === 'undefined') return

  const db = await getDB()
  const tx = db.transaction([STORE_CUSTOMERS, STORE_METADATA], 'readwrite')
  const customerStore = tx.objectStore(STORE_CUSTOMERS)
  const metaStore = tx.objectStore(STORE_METADATA)

  // Bersihkan data lama agar selalu sinkron dengan file master terbaru
  await customerStore.clear()

  for (const c of customers) {
    // Normalisasi ID: simpan key dengan string tanpa spasi
    const cleanId = String(c.customerId).trim()
    customerStore.put({ ...c, customerId: cleanId })
  }

  const meta: MasterMeta = {
    type: 'pelanggan',
    fileName,
    uploadedAt: new Date().toISOString(),
    count: customers.length,
  }
  await metaStore.put(meta)

  await tx.done

  // Simpan juga meta di localStorage sebagai backup cepat
  try {
    localStorage.setItem('pdam_master_pelanggan_meta', JSON.stringify(meta))
  } catch {
    // ignore
  }
}

/**
 * Simpan metadata wilayah ke IndexedDB dan localStorage
 */
export async function saveWilayahMeta(fileName: string, count: number): Promise<void> {
  if (typeof window === 'undefined') return

  const meta: MasterMeta = {
    type: 'wilayah',
    fileName,
    uploadedAt: new Date().toISOString(),
    count,
  }

  try {
    const db = await getDB()
    await db.put(STORE_METADATA, meta)
  } catch {
    // ignore
  }

  try {
    localStorage.setItem('pdam_master_wilayah_meta', JSON.stringify(meta))
  } catch {
    // ignore
  }
}

/**
 * Cari pelanggan berdasarkan ID di IndexedDB (bisa 9-digit, atau dengan padding nol)
 */
export async function getCustomerByIdFromDB(id: string): Promise<StoredCustomer | null> {
  if (typeof window === 'undefined') return null

  try {
    const db = await getDB()
    const cleanId = id.trim()
    
    // Coba id langsung
    let found = await db.get(STORE_CUSTOMERS, cleanId)
    if (found) return found

    // Coba dengan padding 9 digit jika digit kurang (misal 8 digit)
    if (cleanId.length < 9) {
      const padded = cleanId.padStart(9, '0')
      found = await db.get(STORE_CUSTOMERS, padded)
      if (found) return found
    }

    // Coba tanpa leading zero
    const unpadded = cleanId.replace(/^0+/, '')
    if (unpadded !== cleanId) {
      found = await db.get(STORE_CUSTOMERS, unpadded)
      if (found) return found
    }

    return null
  } catch {
    return null
  }
}

/**
 * Ambil metadata master data terakhir
 */
export async function getMasterMeta(type: 'pelanggan' | 'wilayah'): Promise<MasterMeta | null> {
  if (typeof window === 'undefined') return null

  try {
    // Prioritas 1: localStorage (instan)
    const local = localStorage.getItem(`pdam_master_${type}_meta`)
    if (local) {
      return JSON.parse(local)
    }

    // Prioritas 2: IndexedDB
    const db = await getDB()
    const meta = await db.get(STORE_METADATA, type)
    return meta ?? null
  } catch {
    return null
  }
}
