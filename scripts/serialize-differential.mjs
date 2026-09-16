#!/usr/bin/env node
/**
 * Adversarial serialization differential — does the carrier pass read text a serializer wrote?
 *
 * Jumi's carrier pass reads the sheet it is about to rewrite, so every lookup it makes is a lookup in
 * text somebody else serialized. One of those lookups was written as `var(--jumi-slot-<key>-<part>, `
 * — comma, space — and matched against a sheet a minifier had already been through, so the link read
 * `,(`, the swap matched nothing, and an entire class of defect went unnoticed because only one of the
 * two outputs was ever inspected.
 *
 * This asks the general question instead of the specific one: emit a corpus, run the finalizer over
 * several spellings of the *same text*, and require the semantics to be identical.
 *
 *   formatted · minified · extra whitespace · no whitespace after commas
 *   · escaped custom-property names · nested var() fallbacks
 *
 * The last two are corpus axes rather than spellings — an escaped name and a deep fallback are things
 * the sheet *contains*, not things a serializer does to it — so they are measured off the baseline and
 * reported, and the assertion at the top of each fixture refuses to compare sheets that do not carry
 * them. A differential that passes on a corpus with nothing in it has been paid for once already.
 *
 * Exits non-zero on any semantic difference. Whitespace-only differences are reported and do **not**
 * fail: two spellings that read the same are the same value, and calling that a failure would train
 * whoever reads this to ignore it.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

import { compiler, finalizeCss, root, snapshot } from './lib/compile.mjs'
import { coverage, keyOf, semantics, serializations } from './lib/serialize.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

/**
 * The frozen canonical corpus, emitted by the CLI and left **unfinalized**.
 *
 * Unfinalized is the whole point: this text is exactly what the pass consumes. `corpus()` finalizes,
 * and a finalized sheet has no staging left to hoist — the defect would be invisible behind it.
 */
const emittedByCli = () => {
  const entry = path.join(snapshot, 'input.css')
  const out = path.join(
    mkdtempSync(path.join(tmpdir(), 'jumi-ser-')),
    'out.css',
  )

  execFileSync('pnpm', ['exec', 'tailwindcss', '-i', entry, '-o', out], {
    cwd: root,
    stdio: 'pipe',
  })

  return readFileSync(out, 'utf8')
}

/**
 * A second corpus for the one thing the frozen corpus cannot reach: a **timing phrase**.
 *
 * The frozen corpus carries frame phrases (`animate-rotate-[0:…|100:…]/[flick]`) and per-property
 * controls, but no `animation-timing-function-[0:…]/[name]` — so nothing selects an instance,
 * `segmentSelections` returns an empty map, and the branch that writes a selection link into the hoist
 * never runs. Measured: the recorded snapshot holds no `--jumi-segment-` record, and no
 * `--jumi-slot-…-animation-name` declaration, anywhere.
 *
 * That gap is worth naming rather than quietly working around. It means the *second* half of this class
 * of defect — the same literal, one line above the one that shipped broken — is not covered by
 * `css:check` at all, and this fixture is what covers it.
 */
const PHRASE = [
  'animate-rotate-[0:0deg|20:-8deg|100:-8deg]/[flick]',
  'animation-timing-function-[0:ease-out]/[flick]',
  'animation-duration-[3000ms]/[flick]',
  'animation-composition-replace/[flick]',
  // The escaping axis, which the frozen corpus does not reach: a name holding a character that has to
  // be escaped inside a custom-property name, so the emitted key carries a backslash.
  'animate-rotate-[0:0deg|100:45deg]/[foo.bar]',
  'animation-duration-[600ms]/[foo.bar]',
  'animation-timing-function-[0:linear]/[foo.bar]',
  'animate-fade-in',
  'transition-duration-500',
]

const MINIMAL = `@import 'tailwindcss' source(none);\n@plugin "../../dist/index.js";\n`

const emittedByCompiler = async () => {
  const instance = await compiler(MINIMAL, snapshot)

  // `build` answers with the stylesheet itself — the same string `corpus()` hands to the finalizer.
  return instance.build(PHRASE)
}

/**
 * A staged view-transition sheet, written the way Jumi's own emission writes one.
 *
 * Hand-written rather than compiled, because the pass under test is the *finalizer*: it reads markers out
 * of selectors, and it does not care who wrote them. The shape is the one the pass documents and the unit
 * tests stage — `.hero:where(.jumi-vt-old-hero)` — plus the merged form with a second selector, which is
 * the case that measures a reader assuming one selector per rule.
 *
 * No Tailwind here on purpose: this text goes straight to `finalizeCss`, which is the whole of the step.
 */
const STAGED = [
  '.hero:where(.jumi-vt-old-hero) { --jumi-fade-out-animation-name: jumi-fade-out }',
  '.card:where(.jumi-vt-new-card), .mine { --jumi-fade-in-animation-name: jumi-fade-in }',
].join('\n')

const fixtures = [
  {
    emit: emittedByCli,
    /** The frozen corpus selects nothing, and that is a fact to declare rather than to assert away. */
    expect: { fallbackDepth: 4, labelInHoist: true, selectionLinks: 0 },
    name: 'canonical',
  },
  {
    emit: emittedByCompiler,
    expect: { fallbackDepth: 4, labelInHoist: true, selectionLinks: 2 },
    name: 'selection',
  },
  {
    emit: () => STAGED,
    expect: {
      labelInHoist: false,
      selectionLinks: 0,
      viewTransitionNames: 2,
    },
    name: 'staged',
  },
]

/** How many occurrences of each key, so a doubled publication is a difference and not a set. */
const tally = items => {
  const counts = new Map()
  const spellings = new Map()

  for (const item of items) {
    const key = keyOf(item)

    counts.set(key, (counts.get(key) ?? 0) + 1)
    spellings.set(key, (spellings.get(key) ?? new Set()).add(item.raw))
  }

  return { counts, spellings }
}

/** What changed between two spellings: links added, links removed, and whitespace that moved. */
const compare = (baseline, variant) => {
  const before = tally(baseline)
  const after = tally(variant)
  const added = []
  const removed = []
  let whitespace = 0

  for (const [key, count] of before.counts) {
    const now = after.counts.get(key) ?? 0

    if (now > count)
      added.push(...Array.from({ length: now - count }, () => key))
    if (now < count)
      removed.push(...Array.from({ length: count - now }, () => key))

    if (now === count) {
      const was = before.spellings.get(key)
      const is = after.spellings.get(key)

      if (was.size !== is.size || [...was].some(spelling => !is.has(spelling)))
        whitespace += 1
    }
  }

  for (const [key, count] of after.counts) {
    const was = before.counts.get(key) ?? 0

    if (count > was)
      added.push(...Array.from({ length: count - was }, () => key))
  }

  return { added, removed, whitespace }
}

const short = text => (text.length > 108 ? `${text.slice(0, 108)}…` : text)

const report = (label, values, limit = 2) => {
  for (const value of values.slice(0, limit))
    console.log(`      ${label} ${short(value)}`)

  if (values.length > limit)
    console.log(`      ${label} …and ${values.length - limit} more`)
}

/** Refuse to compare sheets that do not carry the axes this harness exists to compare. */
const assertExercise = (fixture, cover) => {
  const problems = []

  // The one assertion no fixture can decline: a comparison between identical values is not a result.
  if (cover.distinctValues < 2)
    problems.push(
      `every carried value is identical (${cover.distinctValues} distinct) — the comparison would be agreement about nothing`,
    )

  // Everything else is declared, not assumed. A fixture says which axes it carries and how many of each,
  // so a corpus that stops carrying one fails loudly instead of comparing nothing against nothing — and a
  // fixture that never carried it (a staged sheet has no link layer to check) says so in the same place.
  for (const [axis, expected] of Object.entries(fixture.expect)) {
    const found = cover[axis]

    if (found === expected) continue

    problems.push(
      `${axis} is ${JSON.stringify(found)}, and this fixture declares ${JSON.stringify(expected)} — the axis would be compared without being present`,
    )
  }

  if (!problems.length) return

  console.error(`\n✗ fixture “${fixture.name}” is degenerate:`)

  for (const problem of problems) console.error(`    · ${problem}`)

  process.exit(1)
}

let failures = 0

for (const fixture of fixtures) {
  const raw = await fixture.emit()
  const baselineCss = finalizeCss(raw).css
  const baseline = semantics(baselineCss)
  const cover = coverage(baselineCss)

  assertExercise(fixture, cover)

  console.log(
    `\n${fixture.name} — ${raw.length.toLocaleString()} bytes emitted, ${baselineCss.length.toLocaleString()} shipped, ${cover.declarations.toLocaleString()} carrier declarations`,
  )
  console.log(
    `  axes   label links ${cover.labelLinks.toLocaleString()} · in a hoist ${cover.labelInHoist ? 'yes' : 'no'} · selection links ${cover.selectionLinks} · fallback depth ${cover.fallbackDepth} · escaped names ${cover.escapedNames || 'none'} · view-transition names ${cover.viewTransitionNames}`,
  )

  for (const serialization of serializations.slice(1)) {
    const variant = semantics(finalizeCss(serialization.run(raw)).css)
    const { added, removed, whitespace } = compare(baseline, variant)
    const changed = added.length + removed.length

    if (changed) failures += 1

    const verdict = changed
      ? `DIFFERS  +${added.length} −${removed.length}`
      : `same     ${whitespace ? `${whitespace} whitespace-only` : 'no change at all'}`

    console.log(`  ${serialization.name.padEnd(14)} ${verdict}`)

    if (changed) {
      console.log(`      ${serialization.note}`)
      report('−', removed)
      report('+', added)
    }
  }
}

if (failures) {
  console.error(
    `\n✗ ${failures} serialization${failures === 1 ? '' : 's'} changed the carrier semantics — a lookup is reading text it assumed the shape of:\n`,
  )
  console.error(
    '  A pass may only match text it wrote in the same step. Anything matched in text that came off\n  the sheet has to tolerate the serialization, because the sheet may have been optimized first.\n',
  )

  process.exit(1)
}

console.log(
  `\n✓ every serialization of ${fixtures.length} corpora carried the same semantics\n`,
)
