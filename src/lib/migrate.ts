// One-time import of the old single-file app's weight history. The new app shares
// the same origin (skylarhillebrant.github.io), so the legacy localStorage keys
// are readable directly. Workout checkmarks (shred_m3_v1) are index-keyed and not
// portable — only the weight log is migrated.
import { addWeight } from './repo/weights'
import { data } from './stores/data.svelte'
import * as db from './offline/localdb'

const LEGACY_WEIGHTS_KEY = 'shred_weights_v2'
const MIGRATED_FLAG = 'shred_migrated_weights_v1'

export interface MigrateResult {
  imported: number
  skipped: number
  alreadyDone: boolean
}

interface LegacyWeight {
  w: number
  d: string
  note?: string
  ts?: number
}

export async function importLegacyWeights(force = false): Promise<MigrateResult> {
  if (!force && (await db.getMeta<boolean>(MIGRATED_FLAG))) {
    return { imported: 0, skipped: 0, alreadyDone: true }
  }

  let raw: string | null = null
  try {
    raw = localStorage.getItem(LEGACY_WEIGHTS_KEY)
  } catch {
    raw = null
  }
  if (!raw) {
    await db.setMeta(MIGRATED_FLAG, true)
    return { imported: 0, skipped: 0, alreadyDone: false }
  }

  let arr: LegacyWeight[] = []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      await db.setMeta(MIGRATED_FLAG, true)
      return { imported: 0, skipped: 0, alreadyDone: false }
    }
    arr = parsed
  } catch {
    await db.setMeta(MIGRATED_FLAG, true) // corrupt key: don't reparse every load
    return { imported: 0, skipped: 0, alreadyDone: false }
  }

  let imported = 0
  let skipped = 0
  for (const e of arr) {
    if (typeof e?.w !== 'number' || !e?.d) {
      skipped++
      continue
    }
    if (data.weights.some((w) => w.id === e.d)) {
      skipped++ // dedupe by date
      continue
    }
    addWeight(e.w, e.d, e.note ?? '')
    imported++
  }
  await db.setMeta(MIGRATED_FLAG, true)
  return { imported, skipped, alreadyDone: false }
}
