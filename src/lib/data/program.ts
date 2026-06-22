// MASS — 4-week Push/Pull/Legs hypertrophy block with a bench-strength spine.
// Built for: muscle gain + bench press toward a 275 max (working off a ~235 max).
// Hand-authored (replaces the legacy SHRED block). 6 days/week, full gym.
// Bench/squat/deadlift/incline loads are % of CURRENT max; accessories are rep ranges.
import type { Day, Exercise, LiftKey, ProgramData } from '../types'

type Wk = 1 | 2 | 3 | 4
type Sched = Record<Wk, { sets: number; reps: string; pct: number }>

// ── Main-lift weekly progression (W1-3 build, W4 deload). pct = of 1RM. ──────
const BENCH: Sched = {
  1: { sets: 5, reps: '5', pct: 0.75 }, 2: { sets: 5, reps: '5', pct: 0.78 },
  3: { sets: 4, reps: '4', pct: 0.84 }, 4: { sets: 3, reps: '5', pct: 0.65 },
}
const INCLINE: Sched = {
  1: { sets: 4, reps: '8', pct: 0.65 }, 2: { sets: 4, reps: '8', pct: 0.68 },
  3: { sets: 4, reps: '6', pct: 0.72 }, 4: { sets: 3, reps: '8', pct: 0.58 },
}
const SQUAT: Sched = {
  1: { sets: 4, reps: '6', pct: 0.72 }, 2: { sets: 4, reps: '6', pct: 0.76 },
  3: { sets: 5, reps: '4', pct: 0.82 }, 4: { sets: 3, reps: '5', pct: 0.6 },
}
const DEADLIFT: Sched = {
  1: { sets: 3, reps: '5', pct: 0.72 }, 2: { sets: 3, reps: '5', pct: 0.76 },
  3: { sets: 4, reps: '3', pct: 0.82 }, 4: { sets: 2, reps: '5', pct: 0.6 },
}
const PULLUP: Record<Wk, string> = { 1: '4×8', 2: '4×8', 3: '4×6 +load', 4: '3×8' }
const deload = (w: Wk, base: string): string => (w === 4 ? `${base} · deload` : base)

// Build a computed main-lift exercise (weight shown = % of the user's 1RM).
function mainLift(name: string, lift: LiftKey, sched: Sched, w: Wk, note: string): Exercise {
  const s = sched[w]
  return {
    n: name,
    r: `${s.sets}×${s.reps}`,
    note: w === 4 ? `${note} · deload` : note,
    lift,
    pct: s.pct,
    sets: s.sets,
    reps: s.reps,
  }
}

// ── Reusable warmups / cooldowns ────────────────────────────────────────────
const WU_PUSH: Exercise[] = [
  { n: 'Band Pull-Aparts', r: '2×20', note: 'Shoulders + upper back' },
  { n: 'Scapular Push-Ups', r: '2×10', note: 'Serratus activation' },
  { n: 'Band Dislocates', r: '2×10', note: 'Shoulder mobility' },
  { n: 'Empty/Light Bar Bench', r: '2×10', note: 'Groove the press' },
]
const WU_PULL: Exercise[] = [
  { n: 'Band Pull-Aparts', r: '2×20', note: 'Rear delts' },
  { n: 'Scapular Pull-Ups', r: '2×8', note: 'Lat engagement' },
  { n: 'Face Pulls — Light', r: '2×15', note: 'Cuff + rear delt' },
]
const WU_LEGS: Exercise[] = [
  { n: 'Glute Bridges', r: '2×15', note: '2s squeeze' },
  { n: 'Leg Swings', r: '2×10 each', note: 'Front-back + side' },
  { n: 'Bodyweight Squats', r: '2×12', note: '3s lower' },
  { n: 'Banded Lateral Walk', r: '2×12 each', note: 'Glute med' },
]
const CD_UPPER: Exercise[] = [
  { n: 'Doorway Chest Stretch', r: '2×30s', note: '' },
  { n: 'Lat Stretch', r: '2×30s each', note: '' },
  { n: 'Cross-Body Shoulder Stretch', r: '2×30s each', note: '' },
]
const CD_LOWER: Exercise[] = [
  { n: 'Couch / Hip Flexor Stretch', r: '2×30s each', note: '' },
  { n: 'Seated Hamstring Stretch', r: '2×30s each', note: '' },
  { n: 'Pigeon Stretch', r: '2×30s each', note: 'Glute / hip' },
]

// ── Day builders (per training week) ─────────────────────────────────────────
function pushA(w: Wk): Day {
  return {
    title: 'Push A',
    subtitle: 'Heavy Bench · Chest / Shoulders / Triceps',
    tag: 'chest',
    tagClass: 'tag-chest',
    sections: [
      { type: 'warmup', name: 'Warmup — Shoulder & Press Prep', exercises: WU_PUSH },
      {
        type: 'straight',
        name: 'Bench Press — Strength',
        exercises: [mainLift('Bench Press', 'bench', BENCH, w, 'Rest 2–3 min — driving toward a 275 max')],
      },
      {
        type: 'superset',
        name: 'Superset A — Incline + Row',
        exercises: [
          { n: 'Incline DB Press', r: '3×8-10', note: '2s lower — deep stretch' },
          { n: 'Chest-Supported Row', r: '3×10-12', note: 'Squeeze shoulder blades' },
        ],
      },
      { type: 'straight', name: 'Seated DB Shoulder Press', exercises: [{ n: 'Seated DB Shoulder Press', r: '3×8-10', note: 'Brace core, no over-arch' }] },
      {
        type: 'superset',
        name: 'Superset B — Side Delts + Triceps',
        exercises: [
          { n: 'Cable Lateral Raise', r: '3×12-15', note: 'Light, controlled' },
          { n: 'Tricep Rope Pushdown', r: '3×12-15', note: 'Full lockout' },
        ],
      },
      { type: 'straight', name: 'Overhead Triceps Extension', exercises: [{ n: 'Overhead Cable/DB Extension', r: '3×10-12', note: 'Stretch at bottom' }] },
      { type: 'cardio', name: 'Optional Conditioning', exercises: [{ n: 'Incline Walk', r: '10-15 min', note: 'Easy pace — recovery' }] },
      { type: 'mobility', name: 'Cooldown — Upper', exercises: CD_UPPER },
    ],
  }
}

function pullA(w: Wk): Day {
  return {
    title: 'Pull A',
    subtitle: 'Back / Biceps — Strength',
    tag: 'pull',
    tagClass: 'tag-pull',
    sections: [
      { type: 'warmup', name: 'Warmup — Back & Scap Prep', exercises: WU_PULL },
      { type: 'straight', name: 'Weighted Pull-Up — Strength', exercises: [{ n: 'Weighted Pull-Up (or Lat Pulldown)', r: deload(w, PULLUP[w]), note: 'Add load once 4×8 is easy' }] },
      { type: 'straight', name: 'Barbell Row', exercises: [{ n: 'Barbell Row', r: '4×6-8', note: 'Flat back — pull to waist' }] },
      {
        type: 'superset',
        name: 'Superset A — Row + Pullover',
        exercises: [
          { n: 'Seated Cable Row', r: '3×10-12', note: 'Tall chest, squeeze' },
          { n: 'Straight-Arm Pulldown', r: '3×12-15', note: 'Lats — slight elbow bend' },
        ],
      },
      { type: 'straight', name: 'Rear Delt Fly', exercises: [{ n: 'Reverse Pec Deck / Cable', r: '3×15', note: 'Pause at peak' }] },
      {
        type: 'superset',
        name: 'Superset B — Biceps',
        exercises: [
          { n: 'Barbell Curl', r: '3×8-10', note: 'No swing' },
          { n: 'Hammer Curl', r: '3×10-12', note: 'Brachialis / forearm' },
        ],
      },
      { type: 'mobility', name: 'Cooldown — Upper', exercises: CD_UPPER },
    ],
  }
}

function legsA(w: Wk): Day {
  return {
    title: 'Legs A',
    subtitle: 'Squat · Quads / Hamstrings',
    tag: 'legs',
    tagClass: 'tag-legs',
    sections: [
      { type: 'warmup', name: 'Warmup — Hip & Knee Prep', exercises: WU_LEGS },
      { type: 'straight', name: 'Back Squat — Strength', exercises: [mainLift('Back Squat', 'squat', SQUAT, w, 'Below parallel — brace hard')] },
      { type: 'straight', name: 'Leg Press', exercises: [{ n: 'Leg Press', r: '3×10-12', note: 'Full ROM, controlled' }] },
      {
        type: 'superset',
        name: 'Superset A — RDL + Leg Curl',
        exercises: [
          { n: 'Romanian Deadlift', r: '3×8-10', note: 'Hamstring stretch, flat back' },
          { n: 'Lying Leg Curl', r: '3×12-15', note: 'Squeeze, slow negative' },
        ],
      },
      { type: 'straight', name: 'Leg Extension', exercises: [{ n: 'Leg Extension', r: '3×12-15', note: '1s hold at top' }] },
      { type: 'straight', name: 'Calves', exercises: [{ n: 'Standing Calf Raise', r: '4×12-15', note: 'Pause in the stretch' }] },
      { type: 'mobility', name: 'Cooldown — Lower', exercises: CD_LOWER },
    ],
  }
}

function pushB(w: Wk): Day {
  return {
    title: 'Push B',
    subtitle: 'Incline / Volume · Chest / Shoulders / Tri',
    tag: 'shoulder',
    tagClass: 'tag-shoulder',
    sections: [
      { type: 'warmup', name: 'Warmup — Shoulder & Press Prep', exercises: WU_PUSH },
      { type: 'straight', name: 'Incline Bench Press — Primary', exercises: [mainLift('Incline Barbell Press', 'incline', INCLINE, w, 'Upper chest + bench carryover')] },
      {
        type: 'superset',
        name: 'Superset A — Flat DB + Fly',
        exercises: [
          { n: 'Flat DB Press', r: '3×8-10', note: 'Deep stretch' },
          { n: 'Cable Fly', r: '3×12-15', note: '1s squeeze at center' },
        ],
      },
      { type: 'straight', name: 'Machine Shoulder Press', exercises: [{ n: 'Machine/DB Shoulder Press', r: '3×10-12', note: 'Controlled' }] },
      {
        type: 'superset',
        name: 'Superset B — Side Delts + Triceps',
        exercises: [
          { n: 'DB Lateral Raise', r: '3×15', note: 'Lean away, pinkies up' },
          { n: 'Close-Grip Bench / Dips', r: '3×8-10', note: 'Triceps → bench strength' },
        ],
      },
      {
        type: 'core',
        name: 'Core Finisher × 3',
        exercises: [
          { n: 'Cable Crunch', r: '3×15', note: 'Crunch ribs to hips' },
          { n: 'Hanging Knee Raise', r: '3×12', note: 'No swing' },
        ],
      },
      { type: 'mobility', name: 'Cooldown — Upper', exercises: CD_UPPER },
    ],
  }
}

function pullB(w: Wk): Day {
  return {
    title: 'Pull B',
    subtitle: 'Back Width / Biceps',
    tag: 'pull',
    tagClass: 'tag-pull',
    sections: [
      { type: 'warmup', name: 'Warmup — Back & Scap Prep', exercises: WU_PULL },
      { type: 'straight', name: 'Wide-Grip Lat Pulldown — Strength', exercises: [{ n: 'Wide-Grip Lat Pulldown', r: '4×8-10', note: 'Back width — full stretch' }] },
      { type: 'straight', name: 'T-Bar / Chest-Supported Row', exercises: [{ n: 'T-Bar Row', r: '3×10-12', note: 'Thickness — squeeze' }] },
      {
        type: 'superset',
        name: 'Superset A — Row + Pullover',
        exercises: [
          { n: 'Single-Arm DB Row', r: '3×10 each', note: 'Full stretch + squeeze' },
          { n: 'Cable Pullover', r: '3×12-15', note: 'Lats, constant tension' },
        ],
      },
      { type: 'straight', name: 'Face Pulls', exercises: [{ n: 'Face Pull', r: '3×15-20', note: 'Rear delt + shoulder health' }] },
      {
        type: 'superset',
        name: 'Superset B — Biceps',
        exercises: [
          { n: 'Incline DB Curl', r: '3×10-12', note: 'Full stretch' },
          { n: 'Cable Curl', r: '3×12-15', note: 'Constant tension' },
        ],
      },
      {
        type: 'core',
        name: 'Core Finisher × 3',
        exercises: [
          { n: 'Weighted Plank', r: '3×40s', note: 'Brace, glutes tight' },
          { n: 'Russian Twist', r: '3×20', note: 'Controlled rotation' },
        ],
      },
      { type: 'mobility', name: 'Cooldown — Upper', exercises: CD_UPPER },
    ],
  }
}

function legsB(w: Wk): Day {
  return {
    title: 'Legs B',
    subtitle: 'Deadlift · Posterior Chain',
    tag: 'dead',
    tagClass: 'tag-dead',
    sections: [
      { type: 'warmup', name: 'Warmup — Hip & Hinge Prep', exercises: WU_LEGS },
      { type: 'straight', name: 'Deadlift — Strength', exercises: [mainLift('Deadlift', 'deadlift', DEADLIFT, w, 'Brace, neutral spine — reset each rep')] },
      { type: 'straight', name: 'Hack Squat / Front Squat', exercises: [{ n: 'Hack Squat', r: '3×10-12', note: 'Quads — controlled' }] },
      {
        type: 'superset',
        name: 'Superset A — Hip Thrust + Leg Curl',
        exercises: [
          { n: 'Hip Thrust', r: '3×10-12', note: 'Glutes — pause at top' },
          { n: 'Seated Leg Curl', r: '3×12-15', note: 'Squeeze hard' },
        ],
      },
      { type: 'straight', name: 'Walking Lunge', exercises: [{ n: 'DB Walking Lunge', r: '3×10 each', note: 'Upright torso' }] },
      { type: 'straight', name: 'Calves', exercises: [{ n: 'Seated Calf Raise', r: '4×15', note: 'Slow negative' }] },
      { type: 'mobility', name: 'Cooldown — Lower', exercises: CD_LOWER },
    ],
  }
}

function week(w: Wk): Day[] {
  return [pushA(w), pullA(w), legsA(w), pushB(w), pullB(w), legsB(w)]
}

export const PROGRAM = {
  1: week(1),
  2: week(2),
  3: week(3),
  4: week(4),
} satisfies ProgramData
