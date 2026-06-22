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
