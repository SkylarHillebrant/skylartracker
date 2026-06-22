// Verifies the pure logging logic against explicit cases, a representative day,
// AND every rep string in the real program. Run: node scripts/test-logic.mjs
import { readFileSync } from 'node:fs'
import { parseSets, unitsForExercise, computeCompletion } from '../src/lib/logic.ts'

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
eq(parseSets('4×8 @ 68-72%'), 4, 'parseSets bench')
eq(parseSets('5×5 @ 76-80%'), 5, 'parseSets peak')
eq(parseSets('3×10'), 3, 'parseSets simple')
eq(parseSets('3×10 each'), 3, 'parseSets each')
eq(parseSets('2×30s each'), 2, 'parseSets seconds')
eq(parseSets('3x12'), 3, 'parseSets lowercase x')
eq(parseSets('20 min'), 1, 'parseSets cardio')
eq(parseSets('30s'), 1, 'parseSets hold')
eq(parseSets('HR 130-150'), 1, 'parseSets hr')
eq(parseSets(''), 1, 'parseSets empty')

// 2) unitsForExercise
eq(unitsForExercise('straight', '4×8', 'Bench Press'), 4, 'units straight')
eq(unitsForExercise('warmup', '2×10', 'Bird Dogs'), 1, 'units warmup toggle')
eq(unitsForExercise('cardio', '20 min', 'LISS'), 1, 'units cardio toggle')
eq(unitsForExercise('weighin', '', ''), 0, 'units weighin none')
eq(unitsForExercise('straight', '3×10', ''), 0, 'units empty name')
eq(unitsForExercise('core', '3×30s', 'Hollow Hold'), 3, 'units core')

// 3) computeCompletion on a representative day (1 + 4 + 0 + 1 = 6 units)
const day = {
  title: 'T', subtitle: '', tag: 'chest', tagClass: '',
  sections: [
    { type: 'warmup', name: 'w', exercises: [{ n: 'A', r: '2×10', note: '' }] },
    { type: 'straight', name: 's', exercises: [{ n: 'B', r: '4×8', note: '' }] },
    { type: 'weighin', name: 'wi', exercises: [] },
    { type: 'mobility', name: 'm', exercises: [{ n: 'C', r: '30s', note: '' }] },
  ],
}
const none = computeCompletion(day, 'd', () => false)
const all = computeCompletion(day, 'd', () => true)
const half = computeCompletion(day, 'd', (k) => k.endsWith('.set0'))
eq(none, { done: 0, total: 6, pct: 0 }, 'completion none')
eq(all, { done: 6, total: 6, pct: 100 }, 'completion all')
eq(half, { done: 3, total: 6, pct: 50 }, 'completion half (first set each)')

// 4) sweep EVERY rep string in the real program (extracted from source text)
const src = readFileSync('src/lib/data/program.ts', 'utf8')
const reps = [...src.matchAll(/r:"([^"]*)"/g)].map((m) => m[1])
const distinct = new Map()
let suspect = 0
for (const r of reps) {
  const n = parseSets(r)
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    suspect++
    console.log(`  SUSPECT parseSets("${r}") = ${n}`)
  }
  distinct.set(r, n)
}
eq(suspect, 0, `rep sweep: ${reps.length} rep strings, 0 suspect`)

console.log(`\nDistinct rep prescriptions → sets parsed (${distinct.size}):`)
;[...distinct.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([r, n]) =>
  console.log(`  ${String(n).padStart(2)}  ${r}`),
)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
