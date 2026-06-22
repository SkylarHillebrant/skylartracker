// Offline-first sync: local writes go to IndexedDB + an outbox queue; this
// drains the outbox to Supabase when online + signed in, then pulls remote rows
// (full pull, last-write-wins by updatedAt — data volume is tiny for one user).
import { supabase, isCloudConfigured } from '../supabase'
import { session } from '../stores/session.svelte'
import { data, resortWeights } from '../stores/data.svelte'
import * as db from './localdb'
import type { OutboxItem } from './localdb'
import type { Profile, SessionMeta, SetLog, WeightEntry } from '../types'

export const sync = $state({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pending: 0,
  lastSyncedAt: null as number | null,
  syncing: false,
})

const iso = (ms: number): string => new Date(ms).toISOString()

// ── mappers (local camelCase ⇆ postgres snake_case) ────────────────────────
const setLogToRow = (l: SetLog, user_id: string) => ({
  user_id,
  id: l.id,
  day_id: l.dayId,
  week: l.week,
  exercise_slug: l.exerciseSlug,
  exercise_name: l.exerciseName,
  section_index: l.sectionIndex,
  exercise_index: l.exerciseIndex,
  set_index: l.setIndex,
  target_reps: l.targetReps,
  weight: l.weight,
  reps: l.reps,
  rpe: l.rpe,
  completed: l.completed,
  updated_at: iso(l.updatedAt),
})
const rowToSetLog = (r: any): SetLog => ({
  id: r.id,
  dayId: r.day_id,
  week: r.week,
  exerciseSlug: r.exercise_slug,
  exerciseName: r.exercise_name,
  sectionIndex: r.section_index,
  exerciseIndex: r.exercise_index,
  setIndex: r.set_index,
  targetReps: r.target_reps,
  weight: r.weight,
  reps: r.reps,
  rpe: r.rpe,
  completed: r.completed,
  updatedAt: Date.parse(r.updated_at),
})

const weightToRow = (w: WeightEntry, user_id: string) => ({
  user_id,
  id: w.id,
  weight: w.weight,
  entry_date: w.entryDate,
  note: w.note,
  updated_at: iso(w.updatedAt),
})
const rowToWeight = (r: any): WeightEntry => ({
  id: r.id,
  weight: r.weight,
  entryDate: r.entry_date,
  note: r.note ?? '',
  updatedAt: Date.parse(r.updated_at),
})

const sessionToRow = (s: SessionMeta, user_id: string) => ({
  user_id,
  id: s.id,
  note: s.note,
  completed_at: s.completedAt ? iso(s.completedAt) : null,
  updated_at: iso(s.updatedAt),
})
const rowToSession = (r: any): SessionMeta => ({
  id: r.id,
  note: r.note ?? '',
  completedAt: r.completed_at ? Date.parse(r.completed_at) : null,
  updatedAt: Date.parse(r.updated_at),
})

const profileToRow = (p: Profile, user_id: string) => ({
  id: user_id,
  goal_weight: p.goalWeight,
  start_weight: p.startWeight,
  updated_at: iso(p.updatedAt),
})

/** Enqueue a local mutation for the cloud (no-op if cloud isn't configured).
 *  Consecutive 'put's for the same row are coalesced into one pending item so
 *  heavy offline logging doesn't bloat the outbox; 'delete' is always appended
 *  to preserve delete-then-recreate ordering. */
export function recordMutation(
  table: OutboxItem['table'],
  op: OutboxItem['op'],
  key: string,
  payload: unknown,
): void {
  if (!isCloudConfigured) return
  void (async () => {
    if (op === 'put') {
      const existing = await db.findPendingForKey(table, key)
      if (existing && existing.op === 'put') {
        existing.payload = payload ?? null
        existing.createdAt = Date.now()
        await db.updateOutbox(existing)
      } else {
        await db.enqueue({ table, op, key, payload: payload ?? null, createdAt: Date.now(), synced: 0 })
      }
    } else {
      await db.enqueue({ table, op, key, payload: null, createdAt: Date.now(), synced: 0 })
    }
    sync.pending = (await db.pendingOutbox()).length
    void flush()
  })()
}

async function pushItem(it: OutboxItem, userId: string): Promise<boolean> {
  if (!supabase) return false
  const tableName = {
    setLogs: 'set_logs',
    weights: 'weight_entries',
    sessions: 'sessions',
    profile: 'profiles',
  }[it.table]

  if (it.op === 'delete') {
    // profiles' PK is id (= user's uuid); other tables key on (user_id, id).
    const match = it.table === 'profile' ? { id: it.key } : { user_id: userId, id: it.key }
    const { error } = await supabase.from(tableName).delete().match(match)
    return !error
  }
  let row: object
  if (it.table === 'setLogs') row = setLogToRow(it.payload as SetLog, userId)
  else if (it.table === 'weights') row = weightToRow(it.payload as WeightEntry, userId)
  else if (it.table === 'sessions') row = sessionToRow(it.payload as SessionMeta, userId)
  else row = profileToRow(it.payload as Profile, userId)
  const onConflict = it.table === 'profile' ? 'id' : 'user_id,id'
  const { error } = await supabase.from(tableName).upsert(row, { onConflict })
  return !error
}

/** Drain the outbox to Supabase, then pull remote changes. */
export async function flush(): Promise<void> {
  if (!supabase || !session.userId || !sync.online || sync.syncing) return
  sync.syncing = true
  try {
    const items = await db.pendingOutbox()
    let allPushed = true
    for (const it of items) {
      const ok = await pushItem(it, session.userId)
      if (!ok) {
        allPushed = false
        break // network/permission issue → stop, retry later (nothing lost)
      }
      if (it.seq != null) await db.removeOutbox(it.seq)
    }
    sync.pending = (await db.pendingOutbox()).length
    // Only pull once local changes are fully flushed, so a stale server view
    // can't undo a pending local delete/edit. pull() also skips pending ids.
    if (allPushed) await pull()
    sync.lastSyncedAt = Date.now()
  } finally {
    sync.syncing = false
  }
}

/** Full pull; remote rows win only if strictly newer than the local copy. */
export async function pull(): Promise<void> {
  if (!supabase || !session.userId) return

  // Ids with a pending local mutation must NOT be overwritten by a (possibly
  // stale) server read — this is what stops a not-yet-pushed delete from being
  // resurrected, or an in-flight edit from being clobbered.
  const pending = await db.pendingOutbox()
  const pendingKey = new Set(pending.map((i) => `${i.table}:${i.key}`))

  const [sl, we, se, pr] = await Promise.all([
    supabase.from('set_logs').select('*'),
    supabase.from('weight_entries').select('*'),
    supabase.from('sessions').select('*'),
    supabase.from('profiles').select('*').eq('id', session.userId).maybeSingle(),
  ])

  for (const r of sl.data ?? []) {
    const local = rowToSetLog(r)
    if (pendingKey.has(`setLogs:${local.id}`)) continue
    const cur = data.setLogs[local.id]
    if (!cur || local.updatedAt > cur.updatedAt) {
      data.setLogs[local.id] = local
      await db.putSetLog(local)
    }
  }

  let weightsChanged = false
  for (const r of we.data ?? []) {
    const local = rowToWeight(r)
    if (pendingKey.has(`weights:${local.id}`)) continue
    const i = data.weights.findIndex((w) => w.id === local.id)
    if (i < 0) {
      data.weights.push(local)
      weightsChanged = true
      await db.putWeight(local)
    } else if (local.updatedAt > data.weights[i].updatedAt) {
      data.weights[i] = local
      weightsChanged = true
      await db.putWeight(local)
    }
  }
  if (weightsChanged) resortWeights()

  for (const r of se.data ?? []) {
    const local = rowToSession(r)
    if (pendingKey.has(`sessions:${local.id}`)) continue
    const cur = data.sessions[local.id]
    if (!cur || local.updatedAt > cur.updatedAt) {
      data.sessions[local.id] = local
      await db.putSession(local)
    }
  }

  if (pr.data) {
    const local: Profile = {
      id: 'me',
      goalWeight: pr.data.goal_weight,
      startWeight: pr.data.start_weight,
      updatedAt: Date.parse(pr.data.updated_at),
    }
    if (local.updatedAt > data.profile.updatedAt) {
      data.profile = local
      await db.putProfile(local)
    }
  }
}

export async function initSync(): Promise<void> {
  if (!isCloudConfigured) return
  sync.online = navigator.onLine
  window.addEventListener('online', () => {
    sync.online = true
    void flush()
  })
  window.addEventListener('offline', () => {
    sync.online = false
  })
  sync.pending = (await db.pendingOutbox()).length
}
