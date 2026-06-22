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
