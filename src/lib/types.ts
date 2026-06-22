// Domain types for the fixed SHRED program (weeks 9–12) and logged data.
// The program is shipped as bundled static data (see lib/data/program.ts) so it
// always renders offline. User-generated logs live in Supabase (added in M3).

/** Section kinds, mirroring the legacy tracker's section `type` values. */
export type SectionType =
  | 'warmup'
  | 'straight'
  | 'superset'
  | 'core'
  | 'cardio'
  | 'mobility'
  | 'weighin'

/** Lifts whose 1-rep max drives a computed working weight. */
export type LiftKey = 'bench' | 'squat' | 'deadlift' | 'incline'

/** User-entered 1-rep maxes (incline is derived from bench). */
export interface Maxes {
  bench?: number
  squat?: number
  deadlift?: number
}

/** A prescribed exercise line.
 *  - Main lifts set lift+pct+sets+reps → the app computes "weight × reps".
 *  - Accessories just use r (e.g. "3×10-12") and are pick-by-feel. */
export interface Exercise {
  n: string
  r: string
  note: string
  lift?: LiftKey
  pct?: number
  sets?: number
  reps?: string
}

export interface Section {
  type: SectionType
  name: string
  exercises: Exercise[]
}

export interface Day {
  title: string
  subtitle: string
  /** short colour key, e.g. "chest" | "legs" | "core" | "pull" | "deadlift" | "shoulders" */
  tag: string
  /** legacy css class, e.g. "tag-chest" (kept for parity / reference) */
  tagClass: string
  sections: Section[]
}

export type WeekNumber = 1 | 2 | 3 | 4

/** The whole fixed program, keyed by week number. */
export type ProgramData = Record<WeekNumber, Day[]>

// ── Logged (user-generated) data ──────────────────────────────────────────
// Stored locally in IndexedDB (M2); synced to Supabase in M3. Ids are
// deterministic strings so writes are idempotent across offline replays.

/** One logged set (or a single done-toggle for warmup/cardio/mobility). */
export interface SetLog {
  /** `${dayId}.s${sectionIndex}.e${exerciseIndex}.set${setIndex}` */
  id: string
  dayId: string
  week: WeekNumber
  exerciseSlug: string
  exerciseName: string
  sectionIndex: number
  exerciseIndex: number
  setIndex: number
  targetReps: string
  weight: number | null
  reps: number | null
  rpe: number | null
  completed: boolean
  updatedAt: number
}

/** A body-weight entry. Keyed by date (one weigh-in per day). */
export interface WeightEntry {
  id: string // entryDate, 'YYYY-MM-DD'
  weight: number
  entryDate: string
  note: string
  updatedAt: number
}

/** Single-row goals config. */
export interface Profile {
  id: 'me'
  goalWeight: number
  startWeight: number
  updatedAt: number
}

/** Per-day session metadata (note + completion stamp). Keyed by dayId. */
export interface SessionMeta {
  id: string // dayId
  note: string
  completedAt: number | null
  updatedAt: number
}
