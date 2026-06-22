// Weight checkpoints toward the secondary goal of 200 lb (muscle-gain block;
// weight is not the primary driver — bench 275 is).
export interface Milestone {
  label: string
  target: number
}

export const MILESTONES: Milestone[] = [
  { label: 'Down to 210', target: 210 },
  { label: 'Down to 205', target: 205 },
  { label: 'Goal · 200 lb', target: 200 },
]

/** A milestone is "hit" once the latest weight is at or below its target. */
export function isHit(target: number, current: number | null): boolean {
  return current != null && current <= target
}
