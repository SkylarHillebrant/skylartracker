// Generates src/lib/data/program.ts from the archived legacy/tracker.html by copying
// the program data VERBATIM (no transcription) and adding TypeScript types/exports.
// This guarantees the ported reps/notes are byte-identical to the original.
// Run: node scripts/extract-program.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const src = readFileSync('legacy/tracker.html', 'utf8')
const lines = src.split(/\r?\n/)

// 1-based line ranges (verified against the legacy file):
const COOL_START = 205, COOL_END = 239 // const COOL_UPPER … COOL_FULL_EXT
const PROG_START = 244, PROG_END = 909 // const PROGRAM = { … };

const cool = lines.slice(COOL_START - 1, COOL_END).join('\n')
let prog = lines.slice(PROG_START - 1, PROG_END).join('\n')

// Add element types to the cooldown arrays (data unchanged).
const coolTyped = cool
  .replace('const COOL_UPPER=[', 'const COOL_UPPER: Exercise[] = [')
  .replace('const COOL_LOWER=[', 'const COOL_LOWER: Exercise[] = [')
  .replace('const COOL_FULL=[', 'const COOL_FULL: Exercise[] = [')
  .replace('const COOL_FULL_EXT=[', 'const COOL_FULL_EXT: Exercise[] = [')

// Export the program and assert its shape (also catches any bad section `type`).
prog = prog.replace(/^const PROGRAM = \{/, 'export const PROGRAM = {')
prog = prog.replace(/\};$/, '} satisfies ProgramData')

// Sanity checks before writing.
if (!coolTyped.includes('COOL_UPPER: Exercise[]')) throw new Error('cooldown typing failed')
if (!prog.startsWith('export const PROGRAM = {')) throw new Error('PROGRAM export failed')
if (!prog.endsWith('} satisfies ProgramData')) throw new Error('PROGRAM satisfies failed')

const header = `// AUTO-GENERATED from legacy/tracker.html by scripts/extract-program.mjs — do not edit by hand.
// Verbatim copy of the weeks 9–12 program data (zero transcription changes); only types added.
// Regenerate with: npm run extract-program
import type { Exercise, ProgramData } from '../types'

`

const out = header + coolTyped + '\n\n' + prog + '\n'
mkdirSync('src/lib/data', { recursive: true })
writeFileSync('src/lib/data/program.ts', out, 'utf8')

// Quick structural report.
const exCount = (out.match(/\{n:/g) || []).length
const dayCount = (out.match(/title:/g) || []).length
console.log(`wrote src/lib/data/program.ts (${out.length} bytes)`)
console.log(`  days: ${dayCount}, exercise lines (incl. cooldowns): ${exCount}`)
