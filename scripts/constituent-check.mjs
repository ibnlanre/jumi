#!/usr/bin/env node
/**
 * Check: is every frame value a constituent phrase writes read back by a keyframe?
 *
 * This is the **converse** of `scripts/dead-links.mjs`, run across the whole registration table rather
 * than across whatever a corpus happens to contain. `dead-links` asks whether every read has a writer
 * *class*; this asks whether every writer has a reader — and the second question is the one that would
 * have caught `bb39449`, which deleted the per-frame component lookups to satisfy the first.
 *
 * Why it can be answered without naming a single property here: the registration table says what
 * candidates exist, each candidate is given one phrase over the same frames, and the id a frame key
 * carries is a hash of the frames alone — so every constituent phrase and every composed phrase over
 * these frames agree on it, which is the condition under which the read is possible at all. What the
 * sheet then shows is whether the read was actually emitted.
 *
 * Replaces `spike-keyframe-hooks.mjs`, whose conclusion — that the hooks could be removed safely — was
 * a measurement of the wrong direction: it removed the reads and observed that nothing read them.
 *
 * Measured 2026-09-16, this check run against three trees over the same four hundred candidates:
 *
 *   `bb39449^` (before the regression)   351 read back ·  46 not · but 112 dead reads
 *   `bb39449`  (shipped, after it)       350 read back ·  47 not · 0 dead reads
 *   this change                         351 read back ·  46 not · 0 dead reads
 *
 * So the restoration is consumption-complete relative to the pre-regression tree and inherits none of
 * its dead reads — the whole point of making the read writer-aware rather than unconditional.
 *
 * The remaining 46 are structural rather than a second regression: in every one the writer sits at a
 * depth the composed value never references (`box-shadow-blur` under `box-shadow-inset`, `skew-x` under
 * `skew`, `background-position-x-edge` under `background-position-x`), so the substitution in
 * `propertyKeyframeValue` — which walks the composed attribute's own dependencies — has no point to
 * reach. Fixing that needs the *writer* hoisted to the level the composition references, not a wider
 * predicate here. It is the limitation already recorded in `src/variables/property.ts`'s neighbourhood
 * and in the project's own notes, and it is why this script is an audit rather than a gate stage.
 *
 *   node scripts/constituent-check.mjs
 *
 * Requires a bundle, since the sheet is compiled against the shipped plugin.
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { compiler, finalizeCss, root, snapshot } from './lib/compile.mjs'
import { collect, unconsumedWrites } from './lib/dead-links.mjs'

import path from 'node:path'

const record = process.argv.includes('--record')

const MINIMAL = `@import 'tailwindcss' source(none);\n@plugin "../../dist/index.js";\n`

const source = readFileSync(
  path.join(root, 'src', 'properties', 'tween.ts'),
  'utf8',
)

/**
 * Every candidate the registration table defines, read off the table itself.
 *
 * Not a second list kept here: the question is what the *language* can express, and a hand-kept copy of
 * four hundred names is the "second copy of the model" this repository has already been burned by
 * twice. Whatever the table gains or loses, this check follows.
 */
const candidates = [...source.matchAll(/^ {4}'([\w-]+)': \{$/gm)].map(
  ([, name]) => name,
)

/**
 * The block a candidate declares itself in, so a shape can name its writers.
 *
 * Sliced to the *next* candidate key rather than to the next `},` line: an entry whose parts are a
 * multi-line array contains deeper closing braces, and a lazy `[\s\S]*?` terminates inside it —
 * measured, that is how the first version of this reported `(nothing names it)` for a component the
 * table names three lines above.
 */
const blockOf = name => {
  const start = source.indexOf(`    '${name}': {`)

  if (start < 0) return ''

  const next = /^ {4}'[\w-]+': \{$/gm

  next.lastIndex = start + 1

  return source.slice(start, next.exec(source)?.index ?? source.length)
}

/**
 * The phrase every candidate is given.
 *
 * The table's keys already carry the utility prefix (`'animate-scale-x'`), so the name is used as it
 * stands — a doubled prefix compiles nothing, silently, which is how the first run of this check
 * reported a clean surface by measuring an empty sheet.
 *
 * One frame list for all of them, deliberately — see the header. Frames `0` and `1` are values no
 * candidate can refuse: a phrase is routed to the arbitrary handler by design, which is what makes one
 * value usable across four hundred candidates of every type.
 */
const phrase = name => `${name}-[0:0|100:1]`

/**
 * The detector, run against a sheet that **is** broken.
 *
 * A check that cannot fail is not a check, and this one is unusually easy to make vacuous: it needs a
 * sheet that writes a frame key *and* a keyframe that ought to read it, and a typo in either half
 * leaves it reporting a clean surface. So the shape the shipped build actually emitted for
 * `animate-scale-x-[0:1|100:0]` is asserted first, and the run stops if the detector does not flag it.
 */
const SHIPPED_DEFECT = `
.animate-scale-x-\\[0\\:1\\|100\\:0\\] {
  --jumi-scale-x-1vrwYz-0: 1;
  --jumi-scale-x-1vrwYz-100: 0;
}
@keyframes jumi-scale-1vrwYz {
  0% { scale: var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z); }
  100% { scale: var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z); }
}
`

if (!unconsumedWrites(SHIPPED_DEFECT).length) {
  console.log(
    '\n  ✗ the detector does not flag the sheet the shipped build emitted — fix the detector, not\n' +
      '    the report below, because everything it says from here on is worthless.\n',
  )

  process.exit(1)
}

/**
 * The baseline comparison: what is new, and what has been repaired.
 *
 * Extracted so it can be tested, because this is the part that turns a list into a gate. The two
 * failures it has to produce are the two things that would be news — a candidate outside the baseline
 * being unconsumed, and a candidate that was consumed becoming unconsumed — and an impairment in it
 * would report a clean surface forever, the way the removed lookup did.
 */
const compare = (residual, known) => ({
  introduced: residual.filter(name => !known.has(name)),
  repaired: [...known].filter(name => !residual.includes(name)),
})

// Tested against a synthetic split rather than trusted: one name added, one removed, one kept.
const probe = compare(['a', 'b', 'c'], new Set(['b', 'c', 'd']))

if (probe.introduced.join() !== 'a' || probe.repaired.join() !== 'd') {
  console.log(
    `\n  ✗ the baseline comparison is broken: ${JSON.stringify(probe)} — it must report 'a' as new and\n` +
      '    “d” as repaired, or the audit below cannot fail.\n',
  )

  process.exit(1)
}

/**
 * One candidate at a time, on a **fresh** compiler each time.
 *
 * Not a style choice, and the fresh part is not tidiness either: `build()` accumulates, so a candidate
 * whose phrase emits text PostCSS cannot parse marks every candidate built after it as unparseable too.
 * Measured both ways — compiled together, one offender (Tailwind's *own* `animate-` utility, a name
 * Jumi's effect candidate shares) takes the run down at its line 164; on one accumulating instance it
 * reported all three hundred and ninety-eight candidates as failing when exactly one does.
 */
const results = []

for (const name of candidates) {
  const instance = await compiler(MINIMAL, snapshot)
  const emitted = await instance.build([phrase(name)])
  const result = { keys: [], name, state: null, unconsumed: [] }

  try {
    const { css } = finalizeCss(emitted)
    const { frameWrites, inKeyframes } = collect(css)

    result.keys = [...frameWrites]
    result.unconsumed = unconsumedWrites(css)
  } catch (error) {
    result.state = error.reason ?? error.message
  }

  results.push(result)
}

const wrote = results.filter(result => result.keys.length)
const unread = results.filter(result => result.unconsumed.length)
const unparseable = results.filter(result => result.state)
const keys = wrote.reduce((total, result) => total + result.keys.length, 0)

/** The attribute a candidate declares, and the components it addresses, read off its own entry. */
const declarationOf = name => {
  const match = /(?:property|color)\(\s*'([\w-]+)'\s*,\s*\[([\s\S]*?)\]/.exec(
    blockOf(name),
  )

  if (!match) return null

  return {
    attribute: match[1],
    parts: [...match[2].matchAll(/'([\w-]+)'/g)].map(([, part]) => part),
  }
}

/**
 * The baseline, and why this is an audit rather than a gate.
 *
 * The residual below is ``writer exists, but the composition has no route to it'' — a different class
 * from the regression this script was written to catch, and one the current architecture cannot satisfy
 * without lifting nested component values. A check that is red by design is noise, so the recorded
 * baseline is the *state*, and the failures are the two things that would be news:
 *
 *   a candidate that was consumed becoming unconsumed    the regression this exists for
 *   a candidate outside the baseline being unconsumed    a new surface with no consumer
 *
 * A fall in the number is reported as an improvement and never fails — and the baseline is meant to be
 * re-recorded when the nested-writer track lands (`--record`).
 */
const baselinePath = path.join(root, 'scripts', 'constituent-baseline.json')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const known = new Set(baseline.unconsumed)
const knownBroken = new Set(baseline.unparseable)

const residual = unread.map(result => result.name)
const { introduced, repaired } = compare(residual, known)
const broke = unparseable
  .map(result => result.name)
  .filter(name => !knownBroken.has(name))

/** Candidates whose parts include the attribute itself: `color('border-block-color', ['border-block-color'])`. */
const selfParts = candidates.filter(name => {
  const declaration = declarationOf(name)

  return (
    !!declaration?.parts.length &&
    declaration.parts.includes(declaration.attribute)
  )
})

console.log('\n· the converse invariant, across the whole registration table\n')
console.log(`  ${candidates.length} candidates, one phrase each`)
console.log(
  `  ${wrote.length} of them wrote a frame value — ${keys} keys, every one meant to be read back`,
)
console.log(
  `  ${wrote.length - unread.length} were, ${unread.length} were not` +
    ` (baseline ${known.size}, recorded ${baseline.recorded})`,
)
console.log(
  `  ${selfParts.length} address their own attribute: ${selfParts.join(', ') || 'none'}`,
)

for (const result of unparseable)
  console.log(
    `  · ${result.name} emits text that does not parse${knownBroken.has(result.name) ? ' (baseline)' : ' — NEW'}` +
      `  ${result.state}`,
  )

// A check that cannot fail is not a check. If no candidate wrote a frame value, the sheet held nothing
// to the invariant and a green line below would mean only that there was nothing to inspect — which is
// precisely how the removed reading stayed green for a month.
if (!keys) {
  console.log(
    '\n  ✗ no frame value was written, so nothing was exercised — the harness, not the library, is\n' +
      '    what this run measured. Check that a phrase reaches the candidates at all.\n',
  )

  process.exit(1)
}

if (introduced.length || broke.length) {
  console.log('\n✗ the residual grew beyond the recorded baseline:\n')

  for (const name of introduced)
    console.log(`  · ${name} writes a frame value nothing reads`)

  for (const name of broke)
    console.log(`  · ${name} emits text that does not parse`)

  console.log(
    '\n  A candidate whose phrase can write a frame value must have a keyframe that reads it — that is\n' +
      '  the assertion `bb39449` removed. Fix the emission, or record the new surface deliberately.\n',
  )

  process.exit(1)
}

console.log(
  '  ✓ nothing outside the baseline is unconsumed, and nothing that was consumed became unconsumed',
)

if (repaired.length)
  console.log(
    `  · ${repaired.length} repaired since the baseline was recorded: ${repaired.join(', ')}`,
  )

if (record) {
  writeFileSync(
    baselinePath,
    `${JSON.stringify(
      {
        ...baseline,
        candidates: candidates.length,
        readBack: wrote.length - unread.length,
        recorded: new Date().toISOString().slice(0, 10),
        unconsumed: residual.sort(),
        unparseable: unparseable.map(result => result.name),
      },
      null,
      2,
    )}\n`,
  )

  console.log('  · the baseline has been re-recorded\n')
  process.exit(0)
}

console.log('\n  residual, grouped by the attribute the candidate declares:\n')

const groups = new Map()

for (const result of unread) {
  const attribute = declarationOf(result.name)?.attribute ?? '(no declaration)'
  const components = result.unconsumed.map(entry =>
    entry.shape.replace(/-<id>$/, ''),
  )
  const group = groups.get(attribute) ?? {
    candidates: [],
    components: new Set(),
  }

  group.candidates.push(result.name)

  for (const component of components) group.components.add(component)

  groups.set(attribute, group)
}

for (const [attribute, group] of [...groups].sort())
  console.log(
    `    ${attribute.padEnd(22)} ${String(group.candidates.length).padStart(2)}` +
      ` candidate${group.candidates.length === 1 ? ' ' : 's'}   writes` +
      ` ${[...group.components].join(', ')}`,
  )

console.log(
  [
    '',
    '  One symptom, three routes — and none of them is the `scale-x` defect, which had a direct',
    '  consumer going missing where these have a writer the composed value cannot reach:',
    '    nested        the writer is a component of an *intermediate* composition, one level below',
    '                  the one the frame reads (`box-shadow-blur` under `box-shadow-inset`, `skew-x`',
    '                  under `skew`, `…-position-x-edge` under `…-position-x`)',
    '    not composed  the attribute declares no dependencies at all, so no part is ever read',
    '                  (`gap`, `transform-origin`, `border-block-width`)',
    '    other name    the composition reads a different name than the candidate writes',
    '                  (`border-radius` reads the four physical corners; the candidates write the',
    '                  logical ones)',
    '  Recorded, with the acceptance test for closing it, in `engineering/roadmap/constituent-composition.md`.',
    '',
  ].join('\n'),
)
