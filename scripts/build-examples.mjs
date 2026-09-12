#!/usr/bin/env node
/**
 * The examples build, and the measurement of it.
 *
 * The CLI can no longer be the last step. It writes the stylesheet straight to disk, and the
 * aggregate has to be written into the carriers *after* Tailwind is done — the carrier marks
 * itself, and the marker is only in the emitted CSS. No plugin hook inside the compiler reaches
 * that point, which is why this script exists instead of `tailwindcss -i … -o …`.
 *
 * A real host does the same at its own boundary: run the build, then `finalize(css)` once before
 * the CSS is served or written (a Vite `transform` hook, a PostCSS `Once`).
 *
 * It also prints what the build *cost* next to what it *produced*, because those stopped being the
 * same number: staging is published once per registration and then deleted, and what ships is one
 * list per carrier. Getting those two confused is what made the quadratic cost look unavoidable.
 *
 * Run: pnpm examples:build
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

import { aggregateSlots } from './lib/css.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const input = path.join(root, 'examples', 'input.css')
const output = path.join(root, 'examples', 'output.css')

console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const { complete } = await import('./lib/compile.mjs')

console.log('· emitting')
const raw = path.join(mkdtempSync(path.join(tmpdir(), 'jumi-examples-')), 'output.css')

execFileSync(
  'pnpm',
  ['exec', 'tailwindcss', '-i', input, '-o', raw, '--config', path.join(root, 'examples', 'tailwind.config.js')],
  { cwd: root, stdio: 'pipe' },
)

const emitted = readFileSync(raw, 'utf8')
const built = complete(emitted)

console.log('· completing')
writeFileSync(output, built.css)

/* ------------------------------------------------------------------------------------
 * What it cost, and what it produced
 * ---------------------------------------------------------------------------------- */

const staging = [...emitted.matchAll(/[^{}]+\{[^{}]*--jumi-carrier-staging[^{}]*\}/g)]
const stagingBytes = staging.reduce((total, match) => total + match[0].length, 0)
const aggregate = [...built.css.matchAll(/--jumi-aggregate-[\w-]+:\s*[^;]*;?/g)]
const aggregateBytes = aggregate.reduce((total, match) => total + match[0].length, 0)
const slots = aggregateSlots(built.css)
const stray = (built.css.match(/--jumi-carrier-staging/g) ?? []).length

const percent = (value, total) => `${Math.round(100 * value / total)}%`

console.log(`\n  examples build\n`)
console.log(`    slots           ${slots}`)
console.log(`    carriers        ${built.carriers} rules the aggregate was written into`)
console.log(`\n    build cost — what Tailwind emitted, before the finalizer touched it`)
console.log(`      publications  ${staging.length} staging rules, one per slot registered after the first read`)
console.log(`      emitted       ${emitted.length.toLocaleString()} bytes`)
console.log(`      staging       ${stagingBytes.toLocaleString()} bytes (${percent(stagingBytes, emitted.length)} of the emission)`)
console.log(`      keyframes     ${(emitted.match(/@keyframes /g) ?? []).length}`)
console.log(`\n    shipped — what a browser downloads`)
console.log(`      bytes         ${built.css.length.toLocaleString()} bytes`)
console.log(`      aggregate     ${aggregateBytes.toLocaleString()} bytes (${percent(aggregateBytes, built.css.length)}),`
  + ` ${built.carriers} copies of ${slots} entries × 10 lists`)
console.log(`      staging       ${stray} declarations left`)
console.log(`      file          ${path.relative(root, output)}\n`)

// The same two invariants the frozen corpora are held to, on the real corpus: the aggregate
// reaches every carrier exactly once, and none of the staging that carried it survives. Without
// this, `output.css` could be a file that ships a rule nothing reads and still look fine here.
const failures = []

if (stray) failures.push(`${stray} staging declarations survived finalization`)
if (aggregate.length !== built.carriers * 10) {
  failures.push(`${aggregate.length} aggregate declarations for ${built.carriers} carriers, expected ${built.carriers * 10}`)
}

if (built.carriers === 0) failures.push('no carrier was finalized — the marker never reached the output')

if (failures.length) {
  console.error('✗ the examples build is not complete:')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}
