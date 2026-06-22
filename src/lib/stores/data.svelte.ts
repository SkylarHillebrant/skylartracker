// Reactive, in-memory source of truth for logged data. Loaded once from
// IndexedDB at startup; repo functions mutate this AND write through to IDB.
// (M3 will also enqueue each mutation to the outbox for Supabase sync.)
import type { SetLog, WeightEntry, Profile, SessionMeta, Maxes } from '../types'
import * as db from '../offline/localdb'

// Defaults for the MASS block: secondary weight goal 200 (muscle gain).
function defaultProfile(): Profile {
  return { id: 'me', goalWeight: 200, startWeight: 230, updatedAt: Date.now() }
}

export const data = $state({
  ready: false,
  setLogs: {} as Record<string, SetLog>,
  weights: [] as WeightEntry[],
  sessions: {} as Record<string, SessionMeta>,
  profile: defaultProfile(),
  maxes: {} as Maxes, // 1-rep maxes (local; drives computed working weights)
})

/** Update 1-rep maxes (stored locally in the meta store). */
export async function setMaxes(patch: Partial<Maxes>): Promise<void> {
  data.maxes = { ...data.maxes, ...patch }
  await db.setMeta('maxes', { ...data.maxes })
}

function byDateDesc(a: WeightEntry, b: WeightEntry): number {
  return a.entryDate < b.entryDate ? 1 : a.entryDate > b.entryDate ? -1 : 0
}

export async function initData(): Promise<void> {
  if (data.ready) return
  const [logs, weights, sessions, profile, maxes] = await Promise.all([
    db.allSetLogs(),
    db.allWeights(),
    db.allSessions(),
    db.getProfile(),
    db.getMeta<Maxes>('maxes'),
  ])
  for (const l of logs) data.setLogs[l.id] = l
  data.weights = weights.sort(byDateDesc)
  for (const s of sessions) data.sessions[s.id] = s
  if (maxes) data.maxes = maxes
  if (profile) {
    data.profile = profile
  } else {
    data.profile = defaultProfile()
    await db.putProfile($state.snapshot(data.profile))
  }
  data.ready = true
}

// Re-sort weights after mutation (keeps newest first for the history table).
export function resortWeights(): void {
  data.weights.sort(byDateDesc)
}
