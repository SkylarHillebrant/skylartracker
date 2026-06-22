// Pure logging logic (no store/DOM deps) so it can be unit-tested in isolation.
import type { Day } from './types'

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
export function unitsForExercise(sectionType: string, r: string, name: string): number {
  if (name === '') return 0
  if (isNumericSection(sectionType)) return parseSets(r)
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
      const units = unitsForExercise(section.type, ex.r, ex.n)
      for (let k = 0; k < units; k++) {
        total++
        if (isDone(setLogId(dayId, si, ei, k))) done++
      }
    })
  })
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}
