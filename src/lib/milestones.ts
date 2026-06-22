// Fixed weight milestones (ported from the legacy tracker / 2026 goals doc).
export interface Milestone {
  label: string
  date: string // YYYY-MM-DD
  target: number
}

export const MILESTONES: Milestone[] = [
  { label: 'End of April', date: '2026-04-30', target: 220 },
  { label: 'End of June', date: '2026-06-30', target: 210 },
  { label: 'End of July', date: '2026-07-31', target: 205 },
  { label: 'End of September', date: '2026-09-30', target: 195 },
]

/** A milestone is "hit" once the latest weight is at or below its target. */
export function isHit(target: number, current: number | null): boolean {
  return current != null && current <= target
}
