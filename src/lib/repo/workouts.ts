// Workout logging mutations over the reactive `data` store. Pure helpers
// (set parsing, completion math) live in lib/logic.ts and are re-exported here
// for component convenience. Components read data.setLogs[...] directly.
import { data } from '../stores/data.svelte'
import * as db from '../offline/localdb'
import { recordMutation } from '../offline/sync.svelte'
import { PROGRAM, WEEK_NUMBERS, dayId as makeDayId, exerciseSlug } from '../program'
import {
  computeCompletion,
  isNumericSection,
  isToggleSection,
  parseSets,
  setLogId,
  workingWeight,
  type Completion,
} from '../logic'
import type { Day, Exercise, Maxes, SetLog, WeekNumber } from '../types'

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

/** First day in the block that isn't fully logged — the user's next session. */
export function nextWorkout(): { week: WeekNumber; dayIndex: number; day: Day } | null {
  for (const w of WEEK_NUMBERS) {
    const days = PROGRAM[w]
    for (let i = 0; i < days.length; i++) {
      if (dayCompletion(w, i, days[i]).pct < 100) return { week: w, dayIndex: i, day: days[i] }
    }
  }
  return null
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

/** Heaviest logged set per exercise (surfaces the compound lifts) — for Progress. */
export function strengthBests(limit = 6): Array<{ name: string; weight: number; reps: number | null }> {
  const best = new Map<string, { name: string; weight: number; reps: number | null }>()
  for (const id in data.setLogs) {
    const l = data.setLogs[id]
    if (l.weight == null) continue
    const cur = best.get(l.exerciseSlug)
    if (!cur || l.weight > cur.weight) {
      best.set(l.exerciseSlug, { name: l.exerciseName, weight: l.weight, reps: l.reps })
    }
  }
  return [...best.values()].sort((a, b) => b.weight - a.weight).slice(0, limit)
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
  recordMutation('setLogs', 'put', id, { ...next })
}

/** Toggle a single done-unit (warmup/cardio/mobility, or a set's done flag). */
export function toggleDone(o: Omit<UpdateOpts, 'patch'>): void {
  const current = getSet(o.week, o.dayIndex, o.sectionIndex, o.exerciseIndex, o.setIndex)
  updateSet({ ...o, patch: { completed: !current?.completed } })
}

/** Toggle a prescribed set done; on completion, records the computed weight + reps
 *  (so Progress charts still track strength without any manual input). */
export function setDone(o: {
  week: WeekNumber
  dayIndex: number
  sectionIndex: number
  exerciseIndex: number
  setIndex: number
  ex: Exercise
  maxes: Maxes
}): void {
  const wasDone = getSet(o.week, o.dayIndex, o.sectionIndex, o.exerciseIndex, o.setIndex)?.completed ?? false
  const completed = !wasDone
  let weight: number | null = null
  let reps: number | null = null
  if (completed && o.ex.lift && o.ex.pct != null) {
    weight = workingWeight(o.ex.lift, o.ex.pct, o.maxes)
    const r = o.ex.reps ? parseInt(o.ex.reps, 10) : NaN
    reps = Number.isNaN(r) ? null : r
  }
  updateSet({
    week: o.week,
    dayIndex: o.dayIndex,
    sectionIndex: o.sectionIndex,
    exerciseIndex: o.exerciseIndex,
    setIndex: o.setIndex,
    exerciseName: o.ex.n,
    targetReps: o.ex.r,
    patch: { completed, weight, reps },
  })
}
