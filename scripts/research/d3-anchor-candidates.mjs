import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import { normalizeOffsetAnchor } from '../lib/anchor.mjs'
import {
  readCandidates,
  readExpressions,
  readPropertyEntries,
} from '../lib/property-model.mjs'

import path from 'node:path'

/**
 * D.3.7 · the candidate projection: what the existing `offset-anchor` surface survives of the resolved-axis model.
 *
 * The browser work settled what CSS means and the normalizer proved Jumi can reach it. Neither answered the
 * question this pass exists for: **can the candidates users already write be projected onto two resolved axes
 * without changing what those candidates mean?**
 *
 * The projection is structural, and it runs the ruling's pipeline literally. The candidates come from the
 * candidate table; the leaves and their resting values come from the property graph; the composed value comes
 * from the composition the model actually declares. For one candidate at a time, its leaf is set to an authored
 * probe and every other leaf keeps its rest, the whole `offset-anchor` value is composed from those, and the
 * result goes through the normalizer:
 *
 *     candidate → authored form it contributes → explicit two-axis form → normalizeOffsetAnchor → [x, y] | null
 *
 * The role a leaf plays is read off the model as well, and never off its name: a leaf whose resting value is a
 * keyword is keyword-bearing, one whose resting value is a length is value-bearing, and a leaf with dependencies
 * is compound. Those are the three facts the verdict turns on.
 *
 * Six browser arms answer what structure cannot: what the current composition computes to, whether an offset
 * still moves independently under directional edges, whether an edge can move at all, whether a per-axis
 * spelling can sit inside the two-axis composition, and what an unresolved `var()` does to the whole motion.
 *
 * Run: `pnpm research:d3-anchor-candidates` (exits non-zero only on a defect in the pass).
 */
const WALL = [0, 250, 500, 750, 1000]

const candidates = readCandidates().filter(one =>
  (one.attribute ?? '').startsWith('offset-anchor'),
)
const entries = readPropertyEntries()
const expressions = readExpressions()

const slotOf = name => entries.find(one => one.slot === name)
const variableOf = name => slotOf(name)?.variable

/** A resting value as written, without the source's quotes. */
const restOf = slot => (slotOf(slot)?.value ?? '').replace(/^'|'$/g, '')

/**
 * The composed `offset-anchor` value, with every readable leaf substituted, resolved **transitively**.
 *
 * One level is not enough, and the first run of this pass proved it: `offset-anchor` resolves to
 * `var(--jumi-offset-anchor-x) var(--jumi-offset-anchor-y)`, and each of those is itself a composition whose
 * value is an *identifier* in the source text (`offsetAnchorX`) rather than the expression. So the walk repeats
 * until nothing is left to substitute, with the authored state always winning over a declaration.
 */
const compose = overrides => {
  const values = { ...restState(), ...overrides }
  let out = expressions.get('offset-anchor')

  for (let pass = 0; pass < 8; pass += 1) {
    const next = out.replace(/var\((--jumi-[\w-]+)\)/g, (match, name) => {
      if (values[name] !== undefined) return values[name]

      const entry = entries.find(one => one.variable === name)

      if (!entry) return match

      const expression = expressions.get(entry.slot) ?? restOf(entry.slot)

      return typeof expression === 'string' ? expression : match
    })

    if (next === out) break

    out = next
  }

  return out
}

/**
 * Every `offset-anchor` **leaf** at its resting value, which is the state a lone candidate moves within.
 *
 * Leaves only, and that is the correction this pass needed twice over: the intermediate slots
 * (`offset-anchor-x`, `offset-anchor-y`) are compositions whose source value is an *identifier*
 * (`offsetAnchorX`), so including them put `offsetAnchorX offsetAnchorY` into the state and the substitution
 * never reached a value. A compound slot resolves through its dependencies, which is what `compose` already
 * does.
 */
const restState = () => {
  const values = {}

  for (const one of entries)
    if (one.slot.startsWith('offset-anchor') && !one.deps.length)
      values[one.variable] = restOf(one.slot)

  return values
}

/** The edge state the four-value form requires, which is the one change D.3.5 identified. */
const directional = {
  '--jumi-offset-anchor-x-edge': 'left',
  '--jumi-offset-anchor-y-edge': 'top',
}

/** The role a leaf plays, read off its resting value and its dependencies rather than off its name. */
const roleOf = slot => {
  const entry = slotOf(slot)

  if (!entry) return 'unknown'
  if (entry.deps.length) return 'compound'
  if (/^-?\d/.test(restOf(slot))) return 'value-bearing'

  return 'keyword-bearing'
}

/**
 * An authored probe per role: what an author would write for that leaf, in the form its type admits.
 *
 * A compound leaf is an *axis*, so its authored value is a position (`left 10px`) rather than the bare keyword a
 * bare edge takes — probing it with the keyword measured a form its own candidates do not accept.
 */
const probeOf = (slot, role) => {
  if (role === 'value-bearing') return '10px'
  if (role === 'compound') return slot.endsWith('-y') ? 'top 20px' : 'left 10px'

  return slot.endsWith('y-edge') ? 'top' : 'left'
}

const projection = []

for (const candidate of candidates) {
  const part = candidate.parts[0] ?? candidate.attribute

  // A candidate with **no parts** addresses the property itself; the rest address one leaf of it. Reading that
  // off the attribute instead classified every leaf candidate as a whole one, because they all compose
  // `offset-anchor` — which is exactly the distinction this projection turns on, so the first run of this pass
  // reported six candidates as the seventh.
  if (!candidate.parts.length) {
    // A whole candidate addresses the property itself, so both probes are authored values rather than a leaf.
    for (const authored of [
      'left 10px top 20px',
      '20% 80%',
      'var(--x) var(--y)',
    ]) {
      const normalized = normalizeOffsetAnchor(authored)

      projection.push({
        authored,
        candidate: candidate.name,
        normalized,
        rest: null,
        role: 'whole property',
        staticContext: null,
        verdict: normalized
          ? 'preserves independent control — two resolved axes come straight out of the authored form'
          : authored.includes('var(')
            ? 'declines safely — nothing can resolve it at build time, so the whole motion stays native'
            : 'cannot be read as an explicit two-axis form, so it stays native',
      })
    }

    continue
  }

  const role = roleOf(part)
  const authored = probeOf(part, role)
  const composed = compose({ [variableOf(part)]: authored })
  const normalized = normalizeOffsetAnchor(composed)
  const alsoDirectional = normalizeOffsetAnchor(
    compose({ ...directional, [variableOf(part)]: authored }),
  )
  const edgesAtRest = Object.entries(restState())
    .filter(([name]) =>
      entries.find(one => one.variable === name)?.slot.endsWith('-edge'),
    )
    .map(([, value]) => value)
  const edgesDirectional = edgesAtRest.every(
    value =>
      value === 'left' ||
      value === 'right' ||
      value === 'top' ||
      value === 'bottom',
  )

  projection.push({
    alsoDirectional,
    authored,
    candidate: candidate.name,
    composed,
    directional: edgesDirectional,
    edgesAtRest,
    normalized,
    rest: restOf(part),
    role,
    staticContext:
      role === 'value-bearing'
        ? `edges at rest are ${edgesAtRest.join('/')}, and the four-value form needs left|right and top|bottom`
        : null,
    verdict:
      role === 'value-bearing'
        ? normalized
          ? 'preserves independent control under the edges as they rest'
          : alsoDirectional
            ? 'preserves independent control **if the edges become directional** — the value alone does not compose'
            : 'requires compound normalization — neither the rest nor the value composes'
        : role === 'keyword-bearing'
          ? 'cannot preserve independent animation — a keyword is not a registrable value, and the browser series is discrete'
          : role === 'compound'
            ? alsoDirectional
              ? 'requires compound normalization — it is several components, and it composes only as an explicit two-axis form'
              : 'requires compound normalization — it is several components, and neither the rest nor the value composes'
            : 'unclassified',
  })
}

const browser = await chromium.launch()
const page = await browser.newPage()

const resting = async value => {
  await page.setContent(
    `<style>#e { offset-anchor: ${value}; }</style><div id="e">x</div>`,
  )

  return page.evaluate(() =>
    getComputedStyle(document.querySelector('#e'))
      .getPropertyValue('offset-anchor')
      .trim(),
  )
}

const series = async (defines, css) => {
  await page.setContent(`<style>${defines}\n${css}</style><div id="e">x</div>`)

  return page.evaluate(async at => {
    const node = document.querySelector('#e')
    const animations = node.getAnimations()

    animations.forEach(animation => animation.pause())

    const values = []

    for (const instant of at) {
      animations.forEach(animation => {
        animation.currentTime = instant
      })

      await new Promise(resolve => requestAnimationFrame(resolve))
      values.push(
        getComputedStyle(node).getPropertyValue('offset-anchor').trim(),
      )
    }

    return values
  }, WALL)
}

const LENGTH = syntax =>
  `@property --leaf { syntax: '${syntax}'; inherits: false; initial-value: 0px; }`

const arms = [
  {
    label: 'the composition the model declares today',
    reading: await resting('center 0 center 0'),
    why: 'the composed rest of the current four-leaf model',
  },
  {
    label: 'the same composition, edges directional',
    reading: await resting('left 0 top 0'),
    why: 'the one change that makes the four-value form grammatical',
  },
  {
    label: 'an offset leaf moving under static directional edges',
    reading: (
      await series(
        `${LENGTH('<length>')}\n@keyframes move { from { --leaf: 10px; } to { --leaf: 30px; } }`,
        '#e { offset-anchor: left var(--leaf) top 20px; animation: move 1000ms linear both; }',
      )
    ).join(' · '),
    why: 'whether the value-bearing leaf keeps independent control',
  },
  {
    label: 'an edge leaf moving on its own',
    reading: (
      await series(
        `@keyframes move { from { --leaf: left; } to { --leaf: right; } }`,
        '#e { offset-anchor: var(--leaf) 10px top 20px; animation: move 1000ms linear both; }',
      )
    ).join(' · '),
    why: 'whether a keyword-bearing leaf can be a typed subject at all',
  },
  {
    label: 'a per-axis spelling inside the two-axis composition',
    reading: await resting('left 10px center'),
    why: 'what an axis candidate contributes when its value is not a whole position',
  },
  {
    label: 'an unresolved var() in an authored position',
    reading: await resting('var(--missing) var(--missing)'),
    why: 'what a dynamic source leaves behind — for the whole motion, not one leaf',
  },
]

console.log('D.3.7 candidate projection · the existing offset-anchor surface\n')

console.log('the candidates, as the model declares them:')
for (const one of candidates)
  console.log(
    `  ${one.name.padEnd(32)} attribute ${String(one.attribute).padEnd(12)} parts ${one.parts.length ? one.parts.join(', ') : '(none, the property itself)'}`,
  )

console.log('\nthe projection:\n')

for (const one of projection) {
  console.log(`── ${one.candidate}   (role: ${one.role})`)
  console.log(
    `   authored     ${one.authored}${one.rest === null ? '' : `   over a rest of ${one.rest}`}`,
  )
  if (one.composed) console.log(`   composed     ${one.composed}`)
  console.log(
    `   normalized   ${one.normalized ? one.normalized.join('  ') : 'declines'}`,
  )
  if (one.staticContext) console.log(`   context      ${one.staticContext}`)
  console.log(`   verdict      ${one.verdict}`)
  console.log()
}

console.log('the browser arms:\n')
for (const one of arms) {
  console.log(`── ${one.label}`)
  console.log(`   ${one.why}`)
  console.log(`   ${one.reading}`)
  console.log()
}

/**
 * A defect here is structural, and there are two worth refusing outright: a candidate the projection could not
 * classify, and an arm whose reading is empty — which would mean the pass measured nothing.
 */
const failures = []

for (const one of projection)
  if (one.verdict === 'unclassified')
    failures.push(
      `${one.candidate}: the projection could not classify this candidate`,
    )

for (const one of arms)
  if (!one.reading) failures.push(`${one.label}: the arm read nothing`)

const preserved = projection.filter(one =>
  one.verdict.startsWith('preserves'),
).length
const declined = projection.filter(one =>
  one.verdict.startsWith('declines'),
).length

console.log(
  `${projection.length} candidate projections: ${preserved} preserve independent control, ${declined} decline safely, ${projection.length - preserved - declined} require compound normalization or lose their current semantics`,
)

if (failures.length) {
  console.log('\n✗ projection defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-candidates.json'),
  `${JSON.stringify(
    {
      arms,
      candidates: candidates.map(one => ({
        attribute: one.attribute,
        name: one.name,
        parts: one.parts,
        types: one.types,
      })),
      projection,
      source: 'D.3.7 · scripts/research/d3-anchor-candidates.mjs',
    },
    null,
    2,
  )}\n`,
)

await browser.close()

if (failures.length) process.exitCode = 1
