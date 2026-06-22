// Verifies the pure logging logic against explicit cases, a representative day,
// AND every exercise in the real (new) program. Run: node scripts/test-logic.mjs
import { parseSets, unitsForExercise, computeCompletion } from '../src/lib/logic.ts'
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

// 1) parseSets explicit cases
eq(parseSets('5×5 @ 75%'), 5, 'parseSets bench')
eq(parseSets('4×4 @ 84%'), 4, 'parseSets heavy')
eq(parseSets('3×8-10'), 3, 'parseSets range')
eq(parseSets('3×10 each'), 3, 'parseSets each')
eq(parseSets('3×5 @ 65% · deload'), 3, 'parseSets deload-suffixed keeps set count')
eq(parseSets('10-15 min'), 1, 'parseSets cardio')
eq(parseSets('2×30s each'), 2, 'parseSets seconds')
eq(parseSets('4×6 +load'), 4, 'parseSets weighted')

// 2) unitsForExercise
eq(unitsForExercise('straight', '5×5 @ 75%', 'Bench Press'), 5, 'units straight')
eq(unitsForExercise('warmup', '2×20', 'Band Pull-Aparts'), 1, 'units warmup toggle')
eq(unitsForExercise('cardio', '10-15 min', 'Incline Walk'), 1, 'units cardio toggle')
eq(unitsForExercise('mobility', '2×30s', 'Stretch'), 1, 'units mobility toggle')
eq(unitsForExercise('core', '3×15', 'Cable Crunch'), 3, 'units core')

// 3) computeCompletion on a representative day (1 + 4 + 0 + 1 = 6)
const day = {
  title: 'T', subtitle: '', tag: 'chest', tagClass: '',
  sections: [
    { type: 'warmup', name: 'w', exercises: [{ n: 'A', r: '2×10', note: '' }] },
    { type: 'straight', name: 's', exercises: [{ n: 'B', r: '4×8', note: '' }] },
    { type: 'weighin', name: 'wi', exercises: [] },
    { type: 'mobility', name: 'm', exercises: [{ n: 'C', r: '30s', note: '' }] },
  ],
}
eq(computeCompletion(day, 'd', () => false), { done: 0, total: 6, pct: 0 }, 'completion none')
eq(computeCompletion(day, 'd', () => true), { done: 6, total: 6, pct: 100 }, 'completion all')
eq(computeCompletion(day, 'd', (k) => k.endsWith('.set0')), { done: 3, total: 6, pct: 50 }, 'completion half')

// 4) sweep EVERY exercise in the real program (imported)
const distinct = new Map()
let strings = 0
let suspect = 0
let days = 0
for (const w of [1, 2, 3, 4]) {
  for (const d of PROGRAM[w]) {
    days++
    for (const s of d.sections) {
      for (const ex of s.exercises) {
        if (ex.n === '') continue
        const u = unitsForExercise(s.type, ex.r, ex.n)
        strings++
        if (!Number.isInteger(u) || u < 0 || u > 10) {
          suspect++
          console.log(`  SUSPECT units=${u} type=${s.type} r="${ex.r}" (${ex.n})`)
        }
        distinct.set(ex.r, parseSets(ex.r))
      }
    }
  }
}
eq(days, 24, 'program has 24 days (4 weeks × 6)')
eq(suspect, 0, `program sweep: ${strings} exercises, 0 suspect`)

console.log(`\nDistinct rep prescriptions → sets parsed (${distinct.size}):`)
;[...distinct.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([r, n]) =>
  console.log(`  ${String(n).padStart(2)}  ${r}`),
)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
