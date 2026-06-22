// Verifies the pure logic — set parsing, completion, AND the new load math
// (computed working weights from 1-rep maxes) — plus a sweep of the real program.
// Run: node scripts/test-logic.mjs
import {
  parseSets,
  unitsForExercise,
  computeCompletion,
  round5,
  workingWeight,
  prescription,
  setCount,
} from '../src/lib/logic.ts'
import { PROGRAM } from '../src/lib/data/program.ts'

let pass = 0
let fail = 0
function eq(actual, expected, label) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) pass++
  else {
    fail++
    console.log(`  FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

// 1) parseSets
eq(parseSets('5×5'), 5, 'parseSets 5x5')
eq(parseSets('3×10-12'), 3, 'parseSets range')
eq(parseSets('3×10 each'), 3, 'parseSets each')
eq(parseSets('10-15 min'), 1, 'parseSets cardio')

// 2) unitsForExercise (now takes the exercise; uses sets field when present)
eq(unitsForExercise('straight', { n: 'Bench', r: '5×5', sets: 5 }), 5, 'units uses sets field')
eq(unitsForExercise('straight', { n: 'Acc', r: '3×10-12' }), 3, 'units parses r when no sets')
eq(unitsForExercise('warmup', { n: 'Band', r: '2×20' }), 0, 'units warmup not counted')
eq(unitsForExercise('cardio', { n: 'Walk', r: '10 min' }), 0, 'units cardio not counted')
eq(unitsForExercise('weighin', { n: '', r: '' }), 0, 'units empty')
eq(unitsForExercise('core', { n: 'Crunch', r: '3×15' }), 3, 'units core')

// 2b) LOAD MATH — the core of the new model
eq(round5(176.25), 175, 'round5 176.25 → 175')
eq(round5(197.4), 195, 'round5 197.4 → 195')
eq(workingWeight('bench', 0.75, { bench: 235 }), 175, 'bench 75% of 235')
eq(workingWeight('bench', 0.84, { bench: 235 }), 195, 'bench 84% of 235')
eq(workingWeight('squat', 0.72, { squat: 300 }), 215, 'squat 72% of 300')
eq(workingWeight('incline', 0.65, { bench: 235 }), 130, 'incline derived from bench')
eq(workingWeight('bench', 0.75, {}), null, 'no max → null')
eq(setCount({ n: 'B', r: '5×5', sets: 5 }), 5, 'setCount uses sets')
eq(setCount({ n: 'A', r: '3×10-12' }), 3, 'setCount parses r')
eq(prescription({ n: 'Bench', r: '5×5', lift: 'bench', pct: 0.75, sets: 5, reps: '5' }, { bench: 235 }), '175 lb × 5', 'prescription computed')
eq(prescription({ n: 'Bench', r: '5×5', lift: 'bench', pct: 0.75, sets: 5, reps: '5' }, {}), '75% · set your bench max', 'prescription no max')
eq(prescription({ n: 'Curl', r: '3×10-12' }, {}), '10-12 reps', 'prescription accessory')

// 3) computeCompletion — only working sets count (warmup/mobility = 0)
const day = {
  title: 'T', subtitle: '', tag: 'chest', tagClass: '',
  sections: [
    { type: 'warmup', name: 'w', exercises: [{ n: 'A', r: '2×10', note: '' }] },
    { type: 'straight', name: 's', exercises: [{ n: 'B', r: '4×8', note: '' }] },
    { type: 'weighin', name: 'wi', exercises: [] },
    { type: 'mobility', name: 'm', exercises: [{ n: 'C', r: '30s', note: '' }] },
  ],
}
eq(computeCompletion(day, 'd', () => false), { done: 0, total: 4, pct: 0 }, 'completion none')
eq(computeCompletion(day, 'd', () => true), { done: 4, total: 4, pct: 100 }, 'completion all')
eq(computeCompletion(day, 'd', (k) => k.endsWith('.set0')), { done: 1, total: 4, pct: 25 }, 'completion one set')

// 4) sweep the real program — every working exercise; spot-check computed bench weights
let days = 0
let suspect = 0
const MAXES = { bench: 235, squat: 300, deadlift: 350 }
const benchByWeek = {}
for (const w of [1, 2, 3, 4]) {
  for (const d of PROGRAM[w]) {
    days++
    for (const s of d.sections) {
      for (let ei = 0; ei < s.exercises.length; ei++) {
        const ex = s.exercises[ei]
        if (ex.n === '') continue
        const u = unitsForExercise(s.type, ex)
        if (!Number.isInteger(u) || u < 0 || u > 10) {
          suspect++
          console.log(`  SUSPECT units=${u} type=${s.type} "${ex.n}" r=${ex.r}`)
        }
        if (ex.lift === 'bench') benchByWeek[w] = prescription(ex, MAXES)
      }
    }
  }
}
eq(days, 24, 'program has 24 days')
eq(suspect, 0, 'no suspect set counts')
console.log('\nBench prescription by week (235 max):')
for (const w of [1, 2, 3, 4]) console.log(`  W${w}: ${benchByWeek[w]}`)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
