// Workout logging mutations over the reactive `data` store. Pure helpers
// (set parsing, completion math) live in lib/logic.ts and are re-exported here
// for component convenience. Components read data.setLogs[...] directly.
import { data } from '../stores/data.svelte'
import * as db from '../offline/localdb'
import { PROGRAM, dayId as makeDayId, exerciseSlug } from '../program'
import {
  computeCompletion,
  isNumericSection,
  isToggleSection,
  parseSets,
  setLogId,
  type Completion,
} from '../logic'
import type { Day, SetLog, WeekNumber } from '../types'

export { isNumericSection, isToggleSection, parseSets, setLogId }
export type { Completion }

export function dayCompletion(week: WeekNumber, dayIndex: number, day: Day): Completion {
  const id = makeDayId(week, dayIndex)
  return computeCompletion(day, id, (k) => data.setLogs[k]?.completed ?? false)
}

export function weekCompletion(week: WeekNumber): Completion {
  let done = 0
  let total = 0
  PROGRAM[week].forEach((day, di) => {
    const c = dayCompletion(week, di, day)
    done += c.done
    total += c.total
  })
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

export function getSet(
  week: WeekNumber,
  dayIndex: number,
  si: number,
  ei: number,
  k: number,
): SetLog | undefined {
  return data.setLogs[setLogId(makeDayId(week, dayIndex), si, ei, k)]
}

/** Most recent logged numbers for an exercise (across weeks) — used to prefill. */
export function lastLoggedFor(name: string): { weight: number | null; reps: number | null } | null {
  const slug = exerciseSlug(name)
  let best: SetLog | null = null
  for (const id in data.setLogs) {
    const l = data.setLogs[id]
    if (l.exerciseSlug === slug && l.weight != null && (!best || l.updatedAt > best.updatedAt)) {
      best = l
    }
  }
  return best ? { weight: best.weight, reps: best.reps } : null
}

interface UpdateOpts {
  week: WeekNumber
  dayIndex: number
  sectionIndex: number
  exerciseIndex: number
  setIndex: number
  exerciseName: string
  targetReps: string
  patch: Partial<Pick<SetLog, 'weight' | 'reps' | 'rpe' | 'completed'>>
}

export function updateSet(o: UpdateOpts): void {
  const dId = makeDayId(o.week, o.dayIndex)
  const id = setLogId(dId, o.sectionIndex, o.exerciseIndex, o.setIndex)
  const existing = data.setLogs[id]
  const baseLog: SetLog = existing
    ? { ...existing }
    : {
        id,
        dayId: dId,
        week: o.week,
        exerciseSlug: exerciseSlug(o.exerciseName),
        exerciseName: o.exerciseName,
        sectionIndex: o.sectionIndex,
        exerciseIndex: o.exerciseIndex,
        setIndex: o.setIndex,
        targetReps: o.targetReps,
        weight: null,
        reps: null,
        rpe: null,
        completed: false,
        updatedAt: 0,
      }
  const next: SetLog = { ...baseLog, ...o.patch, updatedAt: Date.now() }
  data.setLogs[id] = next
  void db.putSetLog({ ...next })
}

/** Toggle a single done-unit (warmup/cardio/mobility, or a set's done flag). */
export function toggleDone(o: Omit<UpdateOpts, 'patch'>): void {
  const current = getSet(o.week, o.dayIndex, o.sectionIndex, o.exerciseIndex, o.setIndex)
  updateSet({ ...o, patch: { completed: !current?.completed } })
}
