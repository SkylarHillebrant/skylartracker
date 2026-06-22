// Verifies src/lib/data/program.ts is a faithful, COMPLETE copy of the legacy program.
// 1) byte-diff the embedded data against legacy lines 205–909 (after reversing the
//    type/export edits) — proves zero transcription drift.
// 2) completeness: assert NO program data markers exist outside the extracted ranges.
// Run: node scripts/verify-program.mjs
import { readFileSync } from 'node:fs'

const legacyLines = readFileSync('legacy/tracker.html', 'utf8').split(/\r?\n/)
const COOL = [205, 239], PROG = [244, 909]

const coolLegacy = legacyLines.slice(COOL[0] - 1, COOL[1]).join('\n')
const progLegacy = legacyLines.slice(PROG[0] - 1, PROG[1]).join('\n')
const expected = (coolLegacy + '\n\n' + progLegacy).trimEnd()

const gen = readFileSync('src/lib/data/program.ts', 'utf8')
const genBody = gen
  .slice(gen.indexOf('const COOL_UPPER'))
  .replace('const COOL_UPPER: Exercise[] = [', 'const COOL_UPPER=[')
  .replace('const COOL_LOWER: Exercise[] = [', 'const COOL_LOWER=[')
  .replace('const COOL_FULL: Exercise[] = [', 'const COOL_FULL=[')
  .replace('const COOL_FULL_EXT: Exercise[] = [', 'const COOL_FULL_EXT=[')
  .replace('export const PROGRAM = {', 'const PROGRAM = {')
  .replace('} satisfies ProgramData', '};')
  .trimEnd()

let ok = true

if (genBody === expected) {
  console.log('[1/3] byte-identical to legacy source ............ PASS')
} else {
  ok = false
  console.log('[1/3] byte-identical to legacy source ............ FAIL')
  const n = Math.max(genBody.length, expected.length)
  for (let i = 0; i < n; i++) {
    if (genBody[i] !== expected[i]) {
      console.log('  first diff @char', i)
      console.log('  expected:', JSON.stringify(expected.slice(Math.max(0, i - 50), i + 50)))
      console.log('  got     :', JSON.stringify(genBody.slice(Math.max(0, i - 50), i + 50)))
      break
    }
  }
}

// Completeness: every data marker must live inside the extracted ranges.
const inRange = (i) => (i >= COOL[0] && i <= COOL[1]) || (i >= PROG[0] && i <= PROG[1])
let stray = 0
legacyLines.forEach((line, idx) => {
  const ln = idx + 1
  if ((/\{n:"/.test(line) || /\{type:"/.test(line) || /title:"/.test(line)) && !inRange(ln)) {
    stray++
    if (stray <= 5) console.log('  stray data line', ln, '->', line.trim().slice(0, 60))
  }
})
console.log(stray === 0
  ? '[2/3] no program data outside ranges ............. PASS'
  : `[2/3] no program data outside ranges ............. FAIL (${stray})`)
if (stray) ok = false

// Counts (informational + week presence).
const weeks = [9, 10, 11, 12].filter((w) => new RegExp(`\\n${w}:\\[`).test(gen))
console.log(`[3/3] weeks present: ${weeks.join(', ')}  (expect 9, 10, 11, 12)`)
if (weeks.length !== 4) ok = false

console.log(ok ? '\nVERIFIED ✓ program port is faithful and complete.' : '\nVERIFICATION FAILED ✗')
process.exit(ok ? 0 : 1)
