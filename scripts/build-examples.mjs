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

import { aggregateSlots, expectedDeclarations, protocolState } from './lib/css.mjs'

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

// No `--config`: the v4 CLI has no such flag and ignores unknown ones silently, so the pointer to
// `examples/tailwind.config.js` never did anything. `input.css` is the config — `@import`,
// `@source`, `@plugin`.
execFileSync(
  'pnpm',
  ['exec', 'tailwindcss', '-i', input, '-o', raw],
  { cwd: root, stdio: 'pipe' },
)

const emitted = readFileSync(raw, 'utf8')
const built = complete(emitted)

console.log('· completing')
writeFileSync(output, built.css)

/* ------------------------------------------------------------------------------------
 * What it cost, and what it produced
 * ---------------------------------------------------------------------------------- */

const staging = [...emitted.matchAll(/[^{}]+\{[^{}]*--jumi-staging-[^{}]*\}/g)]
const stagingBytes = staging.reduce((total, match) => total + match[0].length, 0)
const state = protocolState(built.css)
const expected = expectedDeclarations(state)
const slots = aggregateSlots(built.css)

const percent = (value, total) => `${Math.round(100 * value / total)}%`

console.log(`\n  examples build\n`)
console.log(`    slots           ${slots}`)
console.log(`    compositions    ${built.animations + built.transitions} selectors the composition was written for`
  + ` (${state.animations} animations + ${state.transitions} transitions)`)
console.log(`\n    build cost — what Tailwind emitted, before the finalizer touched it`)
console.log(`      publications  ${staging.length} payload rules, one per slot registered after the first read`)
console.log(`      emitted       ${emitted.length.toLocaleString()} bytes`)
console.log(`      staging       ${stagingBytes.toLocaleString()} bytes (${percent(stagingBytes, emitted.length)} of the emission)`)
console.log(`      keyframes     ${(emitted.match(/@keyframes /g) ?? []).length}`)
console.log(`\n    shipped — what a browser downloads`)
console.log(`      bytes         ${built.css.length.toLocaleString()} bytes`)
console.log(`      aggregate     ${state.declarationBytes.toLocaleString()} bytes (${percent(state.declarationBytes, built.css.length)}),`
  + ` ${state.animations} compositions × ${slots} shallow entries`
  + (state.transitions ? `, ${state.transitions} transition composition` : ''))
console.log(`      protocol      ${state.declarations} declarations written, no build-time name left`)
console.log(`      file          ${path.relative(root, output)}\n`)

/* ------------------------------------------------------------------------------------
 * The protocol invariant — the same ones the frozen corpora are held to, on the real corpus
 * ---------------------------------------------------------------------------------- */

// Without this, `output.css` could ship the transport, or a composition that was derived for no
// selector, and still look fine here.
const leaked = Object.entries(state.leaks).filter(([, count]) => count > 0)
const failures = []

if (leaked.length) {
  failures.push(`the transport reached the file — ${leaked.map(([name, count]) => `${count} ${name}`).join(', ')}`)
}

if (!state.animations && !state.transitions) {
  failures.push('no composition was derived — the payload never reached the output')
}

if (state.declarations !== expected) {
  failures.push(`${state.declarations} materialized declarations for`
    + ` ${state.animations} animations + ${state.transitions} transitions compositions, expected ${expected}`)
}

if (failures.length) {
  console.error('✗ the examples build is not complete:')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}
