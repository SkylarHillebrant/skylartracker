// IndexedDB layer (local-first store). The in-memory Svelte stores in
// lib/stores/data.ts are the reactive source of truth; this module just
// load/saves them. The `outbox` + `meta` stores are created now but only
// used once Supabase sync lands in M3 (avoids a schema version bump later).
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { SetLog, WeightEntry, Profile, SessionMeta } from '../types'

interface ShredDB extends DBSchema {
  setLogs: { key: string; value: SetLog; indexes: { byDay: string; bySlug: string } }
  weights: { key: string; value: WeightEntry }
  sessions: { key: string; value: SessionMeta }
  profile: { key: string; value: Profile }
  outbox: { key: number; value: OutboxItem; indexes: { bySynced: number } }
  meta: { key: string; value: { k: string; v: unknown } }
}

/** Queued mutation for M3 sync (table = store name). */
export interface OutboxItem {
  seq?: number
  table: 'setLogs' | 'weights' | 'sessions' | 'profile'
  op: 'put' | 'delete'
  key: string
  payload: unknown
  createdAt: number
  synced: number // 0 = pending, 1 = synced (number so it can be indexed)
}

let dbp: Promise<IDBPDatabase<ShredDB>> | null = null

function db(): Promise<IDBPDatabase<ShredDB>> {
  if (!dbp) {
    dbp = openDB<ShredDB>('shred', 1, {
      upgrade(d) {
        const sl = d.createObjectStore('setLogs', { keyPath: 'id' })
        sl.createIndex('byDay', 'dayId')
        sl.createIndex('bySlug', 'exerciseSlug')
        d.createObjectStore('weights', { keyPath: 'id' })
        d.createObjectStore('sessions', { keyPath: 'id' })
        d.createObjectStore('profile', { keyPath: 'id' })
        const ob = d.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true })
        ob.createIndex('bySynced', 'synced')
        d.createObjectStore('meta', { keyPath: 'k' })
      },
    })
  }
  return dbp
}

export async function allSetLogs(): Promise<SetLog[]> {
  return (await db()).getAll('setLogs')
}
export async function allWeights(): Promise<WeightEntry[]> {
  return (await db()).getAll('weights')
}
export async function allSessions(): Promise<SessionMeta[]> {
  return (await db()).getAll('sessions')
}
export async function getProfile(): Promise<Profile | undefined> {
  return (await db()).get('profile', 'me')
}

export async function putSetLog(v: SetLog) {
  await (await db()).put('setLogs', v)
}
export async function putWeight(v: WeightEntry) {
  await (await db()).put('weights', v)
}
export async function deleteWeightRow(id: string) {
  await (await db()).delete('weights', id)
}
export async function putSession(v: SessionMeta) {
  await (await db()).put('sessions', v)
}
export async function putProfile(v: Profile) {
  await (await db()).put('profile', v)
}

// ── Outbox (M3 sync queue) ─────────────────────────────────────────────────
export async function enqueue(item: Omit<OutboxItem, 'seq'>): Promise<void> {
  await (await db()).add('outbox', item as OutboxItem)
}
export async function pendingOutbox(): Promise<OutboxItem[]> {
  const all = await (await db()).getAllFromIndex('outbox', 'bySynced', 0)
  return all.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
}
export async function removeOutbox(seq: number): Promise<void> {
  await (await db()).delete('outbox', seq)
}
/** Latest (highest-seq) pending outbox item for a table+key, if any. */
export async function findPendingForKey(
  table: OutboxItem['table'],
  key: string,
): Promise<OutboxItem | undefined> {
  const all = await pendingOutbox() // ascending by seq
  let found: OutboxItem | undefined
  for (const it of all) if (it.table === table && it.key === key) found = it
  return found
}
export async function updateOutbox(item: OutboxItem): Promise<void> {
  await (await db()).put('outbox', item)
}

export async function getMeta<T = unknown>(k: string): Promise<T | undefined> {
  return (await (await db()).get('meta', k))?.v as T | undefined
}
export async function setMeta(k: string, v: unknown): Promise<void> {
  await (await db()).put('meta', { k, v })
}
