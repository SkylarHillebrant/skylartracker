// Selectors + presentation metadata over the generated program data.
import { PROGRAM } from './data/program'
import type { WeekNumber, Day } from './types'

export { PROGRAM }

export const WEEK_NUMBERS: WeekNumber[] = [9, 10, 11, 12]

/** Short tab label; week 11 is the peak, week 12 the deload (matches legacy). */
export function weekLabel(w: WeekNumber): string {
  if (w === 11) return 'W11 Peak'
  if (w === 12) return 'W12 Deload'
  return `Week ${w}`
}

export function getWeek(w: WeekNumber): Day[] {
  return PROGRAM[w]
}

/** Stable per-day id for logging joins (program is fixed, so index is stable). */
export function dayId(week: WeekNumber, dayIndex: number): string {
  return `w${week}-d${dayIndex + 1}`
}

/** Cross-program exercise slug so the same lift tracks progress across weeks. */
export function exerciseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Day colour tags, ported from the legacy .tag-* CSS rules.
const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  chest: { bg: '#3a2040', fg: '#f0a0d0' },
  legs: { bg: '#1a3040', fg: '#70c0f0' },
  core: { bg: '#3a3a10', fg: '#e0d060' },
  pull: { bg: '#102a3a', fg: '#60b0e0' },
  dead: { bg: '#3a2020', fg: '#f09090' },
  shoulder: { bg: '#2a1a3a', fg: '#c090f0' },
}

export function tagColor(tag: string): { bg: string; fg: string } {
  return TAG_COLORS[tag] ?? { bg: 'var(--bg3)', fg: 'var(--text2)' }
}

// Section-type presentation (label + accent).
const SECTION_META: Record<string, { label: string; accent: string }> = {
  warmup: { label: 'Warm-up', accent: '#e0d060' },
  straight: { label: 'Strength', accent: '#5c9eff' },
  superset: { label: 'Superset', accent: '#8fc0ff' },
  core: { label: 'Core', accent: '#f0a0d0' },
  cardio: { label: 'Cardio', accent: '#4ade80' },
  mobility: { label: 'Mobility', accent: '#70c0f0' },
  weighin: { label: 'Weigh-in', accent: '#f09090' },
}

export function sectionMeta(type: string): { label: string; accent: string } {
  return SECTION_META[type] ?? { label: type, accent: 'var(--text2)' }
}
