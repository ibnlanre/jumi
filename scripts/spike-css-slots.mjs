#!/usr/bin/env node
/**
 * SPIKE — collect Jumi's slots back out of emitted CSS.
 *
 * Result (2026-09-11): falsified, and the question retired. Document order is not
 * registry order — the aggregate's order is model state (`values → composed →
 * phrases → effects`, with `perValue`'s move-to-end) and is not recoverable from
 * emitted CSS, so a host integration could not rebuild it. Step 3 removed the
 * need instead: the aggregate is published as base-layer data that the cached
 * `.animations` rule reads, which made the plain plugin path incrementally
 * correct. That closes the `jumi/vite` branch — not needed for aggregate
 * correctness — and this file is kept as the record of why.
 *
 * Phase 1 asked: can `jumi/vite` derive the aggregate slot lists from the CSS
 * Tailwind already emitted, instead of from Tailwind's compiler state? The risky
 * part is not the chains — those are pure functions of `(attribute, label,
 * part)` — it is *ordering*: the aggregate must list slots in the order the
 * adapter registered them, because that order is what
 * `animation-composition: replace` uses to decide which animation wins.
 *
 * So this walks the stylesheet in document order (recursing into @media,
 * @supports, @layer) recognising only Jumi's own declarations:
 *
 *   --jumi-{X}-animation-name   the slot, and its name variable
 *   --jumi-{X}-label            the label a declaration gave it, if any
 *
 * It never inspects a selector, never parses a candidate, and does not care how
 * Tailwind escaped anything. The only host behaviour it relies on is document
 * order — and that a slot declared twice takes the position of its last mention,
 * which is `perValue`'s move-to-end semantics.
 *
 * Run: node scripts/spike-css-slots.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { lastDeclaration, splitTopLevel } from './lib/css.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

/** The slot list the adapter publishes, read from the aggregate data channel. */
function aggregateOrder(css) {
  return splitTopLevel(lastDeclaration(css, '--jumi-aggregate-animation-name'))
    .map(entry => /^var\(--jumi-(.+)-animation-name/.exec(entry)?.[1])
    .filter(Boolean)
}

/**
 * The slots a stylesheet declares, in the order the aggregate must list them.
 *
 * A repeat moves the slot to the end rather than keeping its first position —
 * the same delete/set that `perValue` performs, and the reason a `hover:` or
 * variant re-registration wins under `animation-composition: replace`.
 */
function collectSlots(css) {
  const slots = new Map()

  for (const { property, value } of declarations(css)) {
    const name = /^--jumi-(.+)-animation-name$/.exec(property)
    if (name) {
      const key = name[1]
      slots.delete(key)
      slots.set(key, { animation: value, key, label: undefined, nameVar: property })
      continue
    }

    const label = /^--jumi-(.+)-label$/.exec(property)
    if (label) {
      const slot = slots.get(label[1])
      if (slot) slot.label = value
    }
  }

  return [...slots.values()]
}

/** Every declaration in the stylesheet, in document order, nested blocks included. */
function* declarations(css) {
  let prefix = ''

  for (let i = 0; i < css.length; i++) {
    if (css[i] !== '{') {
      prefix += css[i]
      continue
    }

    // Text before a block is that block's selector, not declarations — harmless
    // to scan, since a selector never carries a `--jumi-…: …` pair.
    yield* pairs(prefix)

    let depth = 1
    let end = i + 1
    while (end < css.length && depth > 0) {
      if (css[end] === '{') depth += 1
      else if (css[end] === '}') depth -= 1
      end += 1
    }

    yield* declarations(css.slice(i + 1, end - 1))
    i = end - 1
    prefix = ''
  }

  yield* pairs(prefix)
}

/**
 * Each slot as the adapter emitted it: `{ key, label, attribute }`, read out of
 * the aggregate's name list and timing chain. The middle link names the property
 * scope, so the attribute needs no vocabulary and no splitting.
 */
function emittedSlots(css) {
  const names = splitTopLevel(lastDeclaration(css, '--jumi-aggregate-animation-name'))
  const timing = splitTopLevel(lastDeclaration(css, '--jumi-aggregate-animation-timing-function'))

  const slots = []
  const nameEntries = names
  const timingEntries = timing

  for (const [index, entry] of nameEntries.entries()) {
    const key = /^var\(--jumi-(.+)-animation-name/.exec(entry)?.[1]
    if (!key) continue

    const chain = timingEntries[index] ?? ''
    const links = [...chain.matchAll(/--jumi-([\w-]+)-animation-timing-function/g)].map(m => m[1])
    // `[label, attribute]` when the slot is labelled, `[attribute]` when not.
    const attribute = links.at(-1)
    const label = links.length > 1 ? links[0] : undefined

    slots.push({ attribute, key, label })
  }

  return slots
}

/** Every `--jumi-*: value;` pair in a stretch of CSS text. */
function* pairs(text) {
  for (const m of text.matchAll(/(--jumi-[A-Za-z0-9_-]+)\s*:\s*([^;}]+)/g)) {
    yield { property: m[1], value: m[2].trim() }
  }
}

/** Slots that share an attribute compete under `animation-composition: replace`, so
 * their relative order is the part of the ordering that carries meaning. */
function precedenceIntact(emitted, extracted) {
  const groups = new Map()
  let unscoped = 0

  for (const slot of emitted) {
    if (!slot.attribute) {
      unscoped += 1
      continue
    }

    const family = slot.attribute.split('-')[0]
    if (!groups.has(family)) groups.set(family, [])
    groups.get(family).push(slot.key)
  }

  const position = new Map(extracted.map((key, index) => [key, index]))
  const inversions = []

  for (const [family, keys] of groups) {
    const present = keys.filter(key => position.has(key))
    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        if (position.get(present[i]) > position.get(present[j])) {
          inversions.push(`${family}: ${present[i]} now follows ${present[j]}`)
        }
      }
    }
  }

  return { inversions, unscoped }
}

const keys = slots => slots.map(slot => slot.key)
const same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index])

const fixtures = [
  {
    css: [
      '.a { --jumi-x-animation-name: jumi-x; }',
      '@media (min-width: 40rem) { .b { --jumi-y-animation-name: jumi-y; } }',
      '@supports (display: grid) { .c { --jumi-z-animation-name: jumi-z; } }',
      '.d { --jumi-w-animation-name: jumi-w; }',
    ].join('\n'),
    expect: ['x', 'y', 'z', 'w'],
    what: 'nested @media / @supports keep document order',
  },
  {
    also: { pass: slots => slots.at(-1)?.label === 'second', what: 'and keeps its last label' },
    css: [
      '.a { --jumi-a-animation-name: jumi-a; --jumi-a-label: first; }',
      '.b { --jumi-b-animation-name: jumi-b; }',
      '.c { --jumi-a-animation-name: jumi-a; --jumi-a-label: second; }',
    ].join('\n'),
    expect: ['b', 'a'],
    what: 'a repeated slot moves to the end',
  },
]

const results = []

for (const fixture of fixtures) {
  const slots = collectSlots(fixture.css)
  results.push({ detail: `${keys(slots).join(' → ')}  (expected ${fixture.expect.join(' → ')})`, pass: same(keys(slots), fixture.expect), what: fixture.what })

  if (fixture.also) {
    results.push({ detail: `label ${slots.at(-1)?.label ?? '(none)'}`, pass: fixture.also.pass(slots), what: fixture.also.what })
  }
}

const sources = [
  { file: path.join(root, 'scripts/css-snapshot/snapshot.css'), what: 'recorded snapshot' },
]

// The docs page CSS carries a build hash in its filename.
const astroDir = path.join(root, 'docs/dist/_astro')
if (existsSync(astroDir)) {
  const page = readdirSync(astroDir).find(name => /^index\..+\.css$/.test(name))
  if (page) sources.push({ file: path.join(astroDir, page), what: 'docs build' })
}

for (const source of sources) {
  let css
  try {
    css = readFileSync(source.file, 'utf8')
  }
  catch {
    results.push({ detail: 'not built — skipped', pass: false, what: `${source.what}: ${path.basename(source.file)}` })
    continue
  }

  const extracted = keys(collectSlots(css))
  const emitted = aggregateOrder(css)
  const match = same(extracted, emitted)

  results.push({
    detail: `${extracted.length} slots extracted, ${emitted.length} emitted`
      + (match ? '' : `\n      first divergence: ${JSON.stringify(extracted.find((key, i) => key !== emitted[i]) ?? null)} vs ${JSON.stringify(emitted.find((key, i) => key !== extracted[i]) ?? null)}`),
    pass: match && emitted.length > 0,
    what: `${source.what}: extracted order matches the emitted aggregate`,
  })

  const slots = emittedSlots(css)
  const { inversions, unscoped } = precedenceIntact(slots, extracted)
  results.push({
    detail: inversions.length
      ? inversions.slice(0, 4).join('\n      ')
      : `${slots.length} slots, ${new Set(slots.map(slot => slot.attribute?.split('-')[0])).size} scope families, no inversions`
        + (unscoped ? `, ${unscoped} without a scope link` : ''),
    pass: slots.length > 0 && inversions.length === 0,
    what: `${source.what}: competing slots keep their relative order`,
  })
}

console.log('spike — collecting Jumi slots from emitted CSS\n')

for (const { detail, pass, what } of results) {
  console.log(`${pass ? '✓' : '✗'} ${what}`)
  console.log(`    ${detail}`)
}

const failed = results.filter(result => !result.pass).length
console.log(`\n${failed ? '✗' : '✓'} ${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
