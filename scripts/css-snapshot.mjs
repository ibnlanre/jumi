#!/usr/bin/env node
/**
 * CSS behaviour snapshots — two corpora, two jobs.
 *
 * Compiles frozen candidate corpora through the same two steps a real build runs — Tailwind
 * emitting, then Jumi finalizing — and either records the result or diffs it against the
 * recorded one.
 *
 *   pnpm css:snapshot   record   — writes snapshot.css + structure.json
 *   pnpm css:check      verify   — fails with a unified diff on any change
 *
 * Two corpora, because they answer different questions:
 *
 *   canonical   an ordinary unprefixed carrier. Its bytes are the contract: any change at
 *               all is a change to decide, and it stays readable because publication is
 *               linear there.
 *   variant     the prefixed carrier forms — `*:animations`, `before:animations`,
 *               `hover:animations`. Those sort before every `animate-*` candidate, which is
 *               what puts aggregate publication on its quadratic path: the data is read
 *               while almost no slots exist, and every slot after that re-publishes the whole
 *               list. It was 1.47 MB for 60 slots with 96% of the file repeated bookkeeping.
 *               Measured and budgeted rather than byte-snapshotted.
 *
 * The metrics separate the two halves of that story, because they are no longer the same
 * number: `rawBytes`, `publishEvents` and `stagingBytes` describe the *build* — what Tailwind
 * emitted, staging and all — while `bytes`, `aggregateBytes` and `aggregateShare` describe
 * what *ships*, after the finalizer has moved the aggregate into the carriers and deleted the
 * staging. A quadratic build cost that no longer reaches the file is the whole result, and
 * recording only one of the two numbers would hide it.
 *
 * The corpora are frozen deliberately: scanning the docs instead would make every docs edit a
 * CSS failure. The byte snapshot says *that* something changed; the structure table says *what
 * kind* of thing changed (`15 keyframes → 14` is a much better clue than 50 KB of diff), and
 * it is printed on every run so an intended refresh stays reviewable.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

import { aggregateSlots } from './lib/css.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const dir = path.join(here, 'css-snapshot')

const snapshot = path.join(dir, 'snapshot.css')
const structureFile = path.join(dir, 'structure.json')
const update = process.argv.includes('--update')

/** A staging rule: the aggregate the model published, before the finalizer consumed it. */
const STAGING = /[^{}]+\{[^{}]*--jumi-carrier-staging[^{}]*\}/g

/** One aggregate declaration, wherever the finalizer wrote it. */
const AGGREGATE = /--jumi-aggregate-[\w-]+:\s*[^;]*;?/g

/** A CSS colour literal — what a theme value looks like before it is a token. */
const COLOR_LITERAL = /^(?:#|(?:rgba?|hsla?|lab|lch|oklab|oklch|color|color-mix|light-dark)\()|^(?:currentColor|transparent|canvastext)$/i

/**
 * The values Jumi writes into its own utility rules — one per tween target or
 * phrase frame. Read from `.animate-*` rules so the counts describe theme
 * resolution rather than every custom property in the file.
 */
const tweenValues = (css) => {
  const values = []

  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!rule[1].trim().startsWith('.animate-')) continue

    for (const declaration of rule[2].matchAll(/(--jumi-[\w-]+):\s*([^;]+);/g)) {
      values.push(declaration[2].trim())
    }
  }

  return values
}

/**
 * How Jumi resolves theme values, by kind: a token reference, a computed token
 * formula, or an explicit literal. Reported on every run because a batch of the
 * theme migration changes values without changing the utility set — a large
 * mechanical diff is exactly where a reviewer loses the signal.
 */
const resolution = (css) => {
  const themeResolution = { formula: 0, literal: 0, token: 0 }
  const colorValues = { literal: 0, token: 0 }

  for (const value of tweenValues(css)) {
    if (value.startsWith('calc(var(--spacing)')) themeResolution.formula += 1
    else if (/^var\(--(?!jumi-)/.test(value)) themeResolution.token += 1
    else themeResolution.literal += 1

    if (value.startsWith('var(--color-')) colorValues.token += 1
    else if (COLOR_LITERAL.test(value)) colorValues.literal += 1
  }

  return { colorValues, themeResolution }
}

/** The shape of the output, as opposed to its bytes. One finalized build in, one row out. */
function measure(built) {
  const css = built.css
  const staging = [...built.raw.matchAll(STAGING)]
  const writes = [...css.matchAll(AGGREGATE)]
  const aggregate = writes.reduce((total, match) => total + match[0].length, 0)

  // Two halves, two objects, because they answer different questions and the numbers no longer
  // agree — kept apart rather than merged so that stays visible in the code that measures them.
  //
  // What ships. The aggregate is one copy of each list per carrier: a carrier reads it, so it has
  // to declare it, and `aggregateWrites / carriers` is the number that says no *publication*
  // reached the file (anything above ten means a copy survived outside a carrier). `strayStaging`
  // is a leak by construction — the file would be shipping a rule nothing reads.
  const shipped = {
    aggregateBytes: aggregate,
    aggregateShare: Math.round(100 * aggregate / css.length),
    aggregateWrites: writes.length,
    bytes: css.length,
    // Carrier rules the finalizer wrote the aggregate into. The number that used to be one — it
    // is whatever Tailwind made of the class, and no longer something Jumi chooses.
    carriers: built.carriers,
    keyframes: (css.match(/@keyframes jumi-/g) ?? []).length,
    media: (css.match(/@media /g) ?? []).length,
    properties: (css.match(/@property --jumi-/g) ?? []).length,
    slots: aggregateSlots(css),
    strayStaging: (css.match(/--jumi-carrier-staging/g) ?? []).length,
    supports: (css.match(/@supports /g) ?? []).length,
  }

  // What the build cost. `publishEvents` is one staging rule per publication — the number the
  // representation work could not reduce, because the trigger is Tailwind's: it re-reads the
  // utility whenever a slot registers after the first read. It is bounded by the slot count, and
  // each publication is one declaration per longhand. `rawBytes` is the whole emission, before
  // the finalizer touched it, and `stagingBytes` is how much of it was that bookkeeping — the
  // 1.47 MB, and what the quadratic path looked like when the data had to be *published*.
  const cost = {
    publishEvents: staging.length,
    rawBytes: built.raw.length,
    stagingBytes: staging.reduce((total, match) => total + match[0].length, 0),
  }

  return {
    ...shipped,
    ...cost,
    ...resolution(css),
  }
}

function report(before, after, indent = 2) {
  for (const [key, value] of Object.entries(after)) {
    const pad = ' '.repeat(indent)
    const was = before?.[key]

    if (value && typeof value === 'object') {
      console.log(`${pad}${key}`)
      report(was && typeof was === 'object' ? was : undefined, value, indent + 2)
      continue
    }

    const moved = was !== undefined && was !== value
    console.log(`${pad}${key.padEnd(11)} ${String(value).padStart(8)}${moved ? `   (was ${was})` : ''}`)
  }
}

/**
 * Safety bounds, not desired performance. They exist so the cost cannot quietly get *worse*;
 * passing them is not evidence the architecture is good.
 *
 * The representation workstream closed with the flat lists, and the finalizer is what makes
 * them shippable: the aggregate is written into the carriers and the staging that carried it is
 * deleted, so a build's repeated bookkeeping never reaches the file. That changes what can
 * regress quietly, and these are the three things that can:
 *
 *   a publication surviving into the output   (the aggregate declared outside a carrier)
 *   staging surviving finalization            (the finalizer not finishing its job)
 *   the shipped file growing with the build   (the two halves collapsing back together)
 *
 * What is *not* bounded is the aggregate's share of the file, and that is deliberate: a
 * carrier reads the aggregate, so it has to declare it, and Tailwind decides how many carriers
 * there are. Two carriers holding the same ten lists is 2× the aggregate in the output and
 * perfectly correct — the number that can only ever be wrong is whether a *third* copy exists,
 * which is what the first check asks.
 */
const variantChecks = [
  {
    detail: measured => `${measured.aggregateWrites} aggregate declarations for ${measured.carriers} carriers`,
    holds: measured => measured.carriers > 0 && measured.aggregateWrites === measured.carriers * 10,
    what: 'every carrier declares the aggregate exactly once, and no publication survives',
  },
  {
    detail: measured => `${measured.strayStaging} staging declarations left in the output`,
    holds: measured => measured.strayStaging === 0,
    what: 'finalization consumed every staging rule',
  },
  {
    detail: measured => `${measured.bytes} shipped from ${measured.rawBytes} emitted`
      + (measured.stagingBytes ? `, ${measured.stagingBytes} of it staging` : ''),
    holds: measured => measured.bytes < measured.rawBytes,
    what: 'the build cost does not reach the file: what ships is smaller than what was emitted',
  },
]

// The fixtures load dist/index.js, so the bundle has to reflect src first.
console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

// After bundling: the helper loads the finalizer out of `dist/`, so the harness exercises the
// artifact that ships rather than the source it was built from.
const { corpus } = await import('./lib/compile.mjs')

if (!existsSync(snapshot) && !update) {
  console.error('✗ no snapshot to check against — run `pnpm css:snapshot` first')
  process.exit(1)
}

const previous = existsSync(structureFile) ? JSON.parse(readFileSync(structureFile, 'utf8')) : null
const failures = []

// --- canonical: byte-for-byte, because its job is to notice any change at all ---
const canonicalBuild = await corpus('input.css')
const canonicalCss = canonicalBuild.css
const canonical = measure(canonicalBuild)
const canonicalOut = update ? snapshot : path.join(mkdtempSync(path.join(tmpdir(), 'jumi-css-')), 'out.css')

// The CLI used to write this file as a side effect of compiling; the harness owns it now, and
// the temp copy is what the `diff` below is run against.
writeFileSync(canonicalOut, canonicalCss)

console.log('· structure (canonical)')
report(previous?.canonical, canonical)

// --- variant: measured and budgeted, because its job is to bound a cost ---
const variant = measure(await corpus('variant.css'))

console.log('· structure (carrier variant)')
report(previous?.carrierVariant, variant)

for (const check of variantChecks) {
  if (check.holds(variant)) continue

  failures.push(`carrier variant: ${check.what} — ${check.detail(variant)}`)
}

if (failures.length) {
  console.error('')
  for (const failure of failures) console.error(`✗ ${failure}`)
  console.error('\n  These record a cost rather than a target: loosening one is a deliberate')
  console.error('  edit to `variantChecks` in this script, and satisfying one is the workstream.')
}

if (update) {
  writeFileSync(structureFile, `${JSON.stringify({ canonical, carrierVariant: variant }, null, 2)}\n`)
  console.log(`✓ recorded — ${path.relative(root, snapshot)} (${canonical.bytes} bytes) + structure.json`)
  process.exit(failures.length ? 1 : 0)
}

if (readFileSync(snapshot, 'utf8') === canonicalCss) {
  console.log(`✓ css snapshot unchanged (${canonical.bytes} bytes shipped from ${canonical.rawBytes} emitted)`)
  process.exit(failures.length ? 1 : 0)
}

console.error('✗ css snapshot changed — the emitted CSS differs from the recorded one:\n')
try {
  execFileSync('diff', ['-u', snapshot, canonicalOut], { stdio: 'inherit' })
}
catch {
  // diff exits 1 when the files differ; that is the case we are reporting.
}
console.error('\nIf the change is intended, re-record it with `pnpm css:snapshot`.')
process.exit(1)
