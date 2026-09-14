#!/usr/bin/env node
/**
 * The gate, run so that it cannot report a green summary it did not earn.
 *
 * `check` used to be a chain of `&&`, and a chain has one failure mode that matters here: it stops
 * at the first failure and says nothing about the rest. The reader sees the output end after
 * `test:run`, and the checks that never ran are indistinguishable from the ones that passed. That is
 * not hypothetical — it is how a composition fingerprint in `incremental-build` stayed stale for a
 * whole representation change without anyone seeing it. `test:run` failed, the chain stopped, and
 * every stage after it was skipped in silence.
 *
 * So the stages are a list rather than a chain. The order and the commands are exactly what the
 * chain ran, and **the sequence still stops at the first failure** — running later checks against a
 * half-built `dist`, or paying for a browser when the types do not compile, would produce a
 * different gate rather than a clearer one. What changes is only the reporting: every stage is named
 * in the summary, and the ones that did not run say `not run` in as many characters as the ones that
 * did.
 *
 * Run: `pnpm check`
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The stages, in order, each one the exact command the chain ran.
 *
 * Two of them are not package scripts — `tsc` and `eslint` are invoked directly — which is the only
 * reason `run` is an argv tail rather than a script name.
 */
const STAGES = [
  // First, and it is a prerequisite rather than a check. The root `tailwind.config.ts` imports
  // `./dist/index.js`, and every harness from `css` down loads the finalizer out of it, so on a fresh
  // clone the `types` stage fails with `Cannot find module './dist/index.js'` and the gate stops before
  // it has checked anything. Measured on a clean tree: without this stage `pnpm check` cannot run at
  // all. A gate that only works on the machine that last built is not a gate.
  { about: 'the shipped bundle, which every stage below loads', label: 'bundle', run: ['run', 'bundle'] },
  // Also a prerequisite rather than a check, and for the same reason as `bundle`: the site's own sources
  // are in this TypeScript project (`include: ["./**/*.ts"]` covers `docs/`), and they import the vendored
  // modules. `docs/astro.config.ts` imports `./vendor/jumi-vite.js`, the demo's module imports
  // `../../vendor/jumi-view-transition.js`, and `allowJs` is false — so without the vendored declarations
  // the very next stage fails with `Cannot find module`. That is the point rather than a nuisance: it is
  // what makes a missing declaration a gate failure instead of a silent loss of types, which is how the
  // demo's script went unchecked (`tsc` cannot parse `.astro`) and how `docs/vendor/` could once have
  // disappeared without anything noticing.
  { about: 'the vendored modules the site imports, with their declarations', label: 'prepare', run: ['run', 'docs:prepare'] },
  { about: 'the public surface compiles', label: 'types', run: ['run', 'check-types'] },
  { about: 'src, scripts and the site sources are clean', label: 'lint', run: ['exec', 'eslint', 'src', 'scripts', 'docs/src', 'docs/astro.config.ts'] },
  { about: 'the finalizer, the model and the CSS helper', label: 'unit', run: ['run', 'test:run'] },
  { about: 'the theme maps still resolve', label: 'theme', run: ['run', 'theme:map'] },
  { about: 'the byte snapshot, over two frozen corpora', label: 'css', run: ['run', 'css:check'] },
  { about: 'a phrase takes the bypass, a scalar keeps the host type check', label: 'phrase', run: ['run', 'phrase:check'] },
  { about: 'incremental builds stay correct and local', label: 'incremental', run: ['run', 'incremental:check'] },
  { about: 'a real browser resolves a real carrier', label: 'behaviour', run: ['run', 'behaviour:check'] },
  { about: 'the emitted view transition actually travels', label: 'view-transition', run: ['run', 'view-transition:check'] },
  { about: 'a retargeted slot scrubs, and a range lands where it was addressed', label: 'scroll-driven', run: ['run', 'scroll-driven:check'] },
  { about: 'the Vite integration, dev and every build shape', label: 'vite', run: ['run', 'vite:check'] },
  { about: 'the PostCSS integration, in every configuration', label: 'postcss', run: ['run', 'postcss:check'] },
  { about: 'no carrier class in a shipped surface', label: 'legacy', run: ['run', 'legacy:check'] },
  { about: 'every effect the Storybook names is one Jumi ships', label: 'stories', run: ['run', 'stories:check'] },
]

const results = STAGES.map(stage => ({ ...stage, seconds: 0, status: 'not run' }))
let failures = 0

for (const [index, result] of results.entries()) {
  const { label, run } = result
  const start = performance.now()

  process.stdout.write(`\n${'─'.repeat(72)}\n· ${label} — ${result.about}\n${'─'.repeat(72)}\n`)

  try {
    execFileSync('pnpm', run, { cwd: root, stdio: 'inherit' })
    result.status = 'passed'
  }
  catch (error) {
    // The stage prints its own reason; this only records that it stopped the gate. `error.status` is
    // the child's exit code, and a signal is reported as one rather than as a number.
    result.status = 'FAILED'
    result.code = error.signal ?? error.status ?? 'unknown'
    failures += 1
  }

  result.seconds = Math.round((performance.now() - start) / 100) / 10

  if (failures) break
}

const width = Math.max(...results.map(result => result.label.length))

console.log(`\n${'═'.repeat(72)}\n  the gate\n${'═'.repeat(72)}`)

for (const result of results) {
  const mark = result.status === 'passed' ? '✓' : result.status === 'FAILED' ? '✗' : '·'
  const time = result.status === 'passed' ? `${result.seconds}s` : ''

  console.log(`  ${mark} ${result.label.padEnd(width)}  ${result.status}${time ? `  ${time}` : ''}`)
}

if (failures) {
  const skipped = results.filter(result => result.status === 'not run').length

  console.log(`\n✗ ${results.find(result => result.status === 'FAILED').label} failed`
    + `${skipped ? ` — the ${skipped} stage${skipped === 1 ? '' : 's'} below it did not run` : ''}.`)
  console.log('  Nothing below the failure has been checked, whether or not it looks quiet.\n')
  process.exit(1)
}

console.log(`\n✓ all ${results.length} stages passed.\n`)
