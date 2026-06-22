// Pure logging logic (no store/DOM deps) so it can be unit-tested in isolation.
import type { Day, Exercise, LiftKey, Maxes } from './types'

const NUMERIC_TYPES = new Set(['straight', 'superset', 'core'])
const TOGGLE_TYPES = new Set(['warmup', 'cardio', 'mobility'])

export const isNumericSection = (type: string): boolean => NUMERIC_TYPES.has(type)
export const isToggleSection = (type: string): boolean => TOGGLE_TYPES.has(type)

/** Sets prescribed by a reps string: "4×8 @ 68-72%" → 4, "3×10 each" → 3, "20 min" → 1. */
export function parseSets(r: string): number {
  const m = r.match(/^\s*(\d+)\s*[×x]/i)
  return m ? parseInt(m[1], 10) : 1
}

export const setLogId = (dayId: string, si: number, ei: number, k: number): string =>
  `${dayId}.s${si}.e${ei}.set${k}`

/** Working-set units an exercise contributes to completion %. Warmup/cardio/
 *  mobility are checkable but DON'T count (so a day reaches 100% on the lifts
 *  alone and "next workout" advances even if you skip the cooldown). */
export function unitsForExercise(sectionType: string, ex: Exercise): number {
  if (ex.n === '') return 0
  if (isNumericSection(sectionType)) return ex.sets ?? parseSets(ex.r)
  return 0
}

export interface Completion {
  done: number
  total: number
  pct: number
}

/** Completion for a day given a predicate that says whether a set-log id is done. */
export function computeCompletion(day: Day, dayId: string, isDone: (id: string) => boolean): Completion {
  let done = 0
  let total = 0
  day.sections.forEach((section, si) => {
    section.exercises.forEach((ex, ei) => {
      const units = unitsForExercise(section.type, ex)
      for (let k = 0; k < units; k++) {
        total++
        if (isDone(setLogId(dayId, si, ei, k))) done++
      }
    })
  })
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

// ── Load math: computed working weights from 1-rep maxes ────────────────────
export const round5 = (x: number): number => Math.round(x / 5) * 5

// Incline 1RM is estimated from bench when not entered directly.
const INCLINE_FROM_BENCH = 0.85

export function liftMax(lift: LiftKey, maxes: Maxes): number | null {
  if (lift === 'incline') return maxes.bench && maxes.bench > 0 ? maxes.bench * INCLINE_FROM_BENCH : null
  const m = maxes[lift]
  return m && m > 0 ? m : null
}

/** Rounded working weight for a computed set, or null if the max isn't set yet. */
export function workingWeight(lift: LiftKey, pct: number, maxes: Maxes): number | null {
  const m = liftMax(lift, maxes)
  return m ? round5(m * pct) : null
}

/** Working sets for an exercise (computed lifts carry `sets`; accessories parse `r`). */
export function setCount(ex: Exercise): number {
  return ex.sets ?? parseSets(ex.r)
}

/** Header prescription: "175 lb × 5" for main lifts, "10-12 reps" for accessories. */
export function prescription(ex: Exercise, maxes: Maxes): string {
  if (ex.lift && ex.pct != null) {
    const w = workingWeight(ex.lift, ex.pct, maxes)
    if (w == null) return `${Math.round(ex.pct * 100)}% · set your ${ex.lift} max`
    return `${w} lb × ${ex.reps ?? ''}`.trim()
  }
  const reps = ex.r.replace(/^\s*\d+\s*[×x]\s*/i, '')
  return reps ? `${reps} reps` : ex.r
}
