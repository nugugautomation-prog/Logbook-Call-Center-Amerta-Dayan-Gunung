import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'pdam-callcenter'
const DB_VERSION = 1
const STORE_PENDING_TICKETS = 'pending-tickets'

interface PendingTicket {
  localId?: number
  enqueuedAt: string
  [key: string]: unknown
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PENDING_TICKETS)) {
        db.createObjectStore(STORE_PENDING_TICKETS, {
          keyPath: 'localId',
          autoIncrement: true,
        })
      }
    },
  })
}

export async function enqueueTicket(data: object): Promise<void> {
  const db = await getDB()
  const item: PendingTicket = {
    ...(data as Record<string, unknown>),
    enqueuedAt: new Date().toISOString(),
  }
  await db.put(STORE_PENDING_TICKETS, item)
}

export async function getPendingTickets(): Promise<PendingTicket[]> {
  const db = await getDB()
  return db.getAll(STORE_PENDING_TICKETS)
}

export async function deletePendingTicket(localId: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_PENDING_TICKETS, localId)
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_PENDING_TICKETS)
}
