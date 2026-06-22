// Weight-log mutations + derived deltas over the reactive `data` store.
import { data, resortWeights } from '../stores/data.svelte'
import * as db from '../offline/localdb'
import type { WeightEntry } from '../types'

/** Upsert one weigh-in (one entry per date; same date overwrites). */
export function addWeight(weight: number, entryDate: string, note: string): void {
  const entry: WeightEntry = { id: entryDate, weight, entryDate, note, updatedAt: Date.now() }
  const idx = data.weights.findIndex((w) => w.id === entryDate)
  if (idx >= 0) data.weights[idx] = entry
  else data.weights.push(entry)
  resortWeights()
  void db.putWeight({ ...entry })
}

export function deleteWeight(id: string): void {
  data.weights = data.weights.filter((w) => w.id !== id)
  void db.deleteWeightRow(id)
}

/** History rows (newest-first) with change vs the previous (older) weigh-in. */
export function weightsWithDeltas(): Array<WeightEntry & { delta: number | null }> {
  return data.weights.map((w, i) => {
    const older = data.weights[i + 1]
    return { ...w, delta: older ? Math.round((w.weight - older.weight) * 10) / 10 : null }
  })
}

export const latestWeight = (): WeightEntry | null => data.weights[0] ?? null
