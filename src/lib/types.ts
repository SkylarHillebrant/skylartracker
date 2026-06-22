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

/** A prescribed exercise line. n = name, r = prescription (e.g. "4×8 @ 68-72%"), note = cue. */
export interface Exercise {
  n: string
  r: string
  note: string
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

export type WeekNumber = 9 | 10 | 11 | 12

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
