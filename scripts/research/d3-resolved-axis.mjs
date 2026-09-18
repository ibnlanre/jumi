/**
 * The resolved-axis falsification: is the public route's real interpolation subject the **resolved** axis
 * component, rather than the offset beside an edge?
 *
 * The fallback arms supplied the clue. `left 0% → right 40%` is inert on the shipped route, and its native reference
 * walks `0% · 15% · 30% · 45% · 60%` — which is `0% → 60%`, the far endpoint resolved through the edge. That is
 * interpolation in resolved positional-component space, and it is the same architectural shape D.3.7 found for
 * `offset-anchor`: **authoring state is not execution state**.
 *
 * So the hypothesis under test is not "widen the offset leaf". It is that the production subject should be
 *
 *   authoring   x-edge + x-offset          (what an author writes)
 *   execution   x-position <length-percentage>   (what the browser interpolates)
 *
 * which would represent lengths, mixed units, `calc()` and edge-changing positions in one subject, and leave the
 * offset leaf as authoring vocabulary rather than runtime machinery.
 *
 * This is a **hypothesis, not a transfer**: `background-position` carries its own grammar and its multilayer
 * behaviour, so nothing here is inherited from `offset-anchor`'s result. Single layer only, y pinned explicitly on
 * both sides so the comparison is about the x subject, and x first — `object-position` and `offset-position` stay out
 * until this passes.
 *
 * Run: `node scripts/research/d3-resolved-axis.mjs` (exits non-zero only on a fixture defect, never on a finding).
 */
import { chromium } from 'playwright'

import { nativeSheet } from '../lib/frames.mjs'
import { earned } from '../lib/sources.mjs'

import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const Y_PINNED = 'top 0%'
const LEAF = '--probe-x-position'

/**
 * One axis of authoring state as a resolved component, restated here on purpose.
 *
 * The measured clauses live in `src/variables/typed-leaves.ts` and production cannot import from a book; the
 * precedent for that split is the comparison rather than the import — the prototype stays where it was and the two
 * are read against each other. The clauses: an edge plus an offset offsets from that edge, `center` is the anchor
 * itself and only a zero offset leaves it alone, a zero offset is the edge's own percentage, and an unknown edge
 * declines.
 */
const axisPosition = (edge, offset) => {
  const component = String(offset ?? '').trim()

  if (edge === 'center') return component === '0' ? '50%' : null
  if (component === '0')
    return (
      { bottom: '100%', left: '0%', right: '100%', top: '0%' }[edge] ?? null
    )
  if (edge === 'left' || edge === 'top') return component
  if (edge === 'right' || edge === 'bottom') return `calc(100% - ${component})`

  return null
}

/**
 * The five endpoint shapes the public route genuinely accepts, per the grammar enumeration: homogeneous percentage,
 * homogeneous length, a mixed pair, an edge that changes, and arithmetic. The first four are the classes the migration
 * has to cover; the last is the one an offset leaf could never carry.
 */
const PAIRS = [
  { from: ['left', '0%'], kind: 'same-edge percentage', to: ['left', '40%'] },
  { from: ['left', '0px'], kind: 'same-edge length', to: ['left', '40px'] },
  { from: ['left', '10px'], kind: 'mixed units', to: ['left', '40%'] },
  { from: ['left', '0%'], kind: 'edge-changing', to: ['right', '40%'] },
  {
    from: ['left', 'calc(10% + 5px)'],
    kind: 'arithmetic',
    to: ['right', 'calc(40% - 5px)'],
  },
]

/** The authored spelling, with y pinned so both sides pin it the same way. */
const authored = ([edge, offset]) => `${edge} ${offset} ${Y_PINNED}`

/** A computed position split at its top-level spaces, so a `calc()` stays one component. */
const componentsOf = value => {
  const out = []
  let depth = 0
  let part = ''

  for (const char of String(value ?? '').trim()) {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1

    if (/\s/.test(char) && depth === 0) {
      if (part) out.push(part)

      part = ''

      continue
    }

    part += char
  }

  if (part) out.push(part)

  return out
}

const browser = await chromium.launch()

const readBoth = async css => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body><div id="native"></div><div id="resolved"></div></body></html>`,
  )

  const out = await page.evaluate(
    async ({ wall }) => {
      const elements = ['native', 'resolved'].map(id =>
        document.getElementById(id),
      )
      const own = elements.map(element => element.getAnimations())
      const series = []

      for (const at of wall) {
        for (const animations of own)
          for (const animation of animations) {
            animation.pause()
            animation.currentTime = at
          }

        await new Promise(requestAnimationFrame)

        series.push(
          elements.map(element => getComputedStyle(element).backgroundPosition),
        )
      }

      return { animations: own.map(list => list.length), series }
    },
    { wall: WALL },
  )

  await page.close()

  return out
}

const moved = values => new Set(values).size > 1
const records = []

for (const pair of PAIRS) {
  const from = axisPosition(...pair.from)
  const to = axisPosition(...pair.to)

  if (from === null || to === null) {
    records.push({ kind: pair.kind, verdict: 'unresolved-endpoint' })

    continue
  }

  /**
   * The reference is the browser interpolating the authored positions — the behaviour being claimed. The candidate
   * is a registered `<length-percentage>` leaf holding the **resolved** endpoints, under a static two-value shell
   * with y pinned, which is the composition the migration would emit.
   */
  const reference = nativeSheet({
    from: authored(pair.from),
    id: 'native',
    property: 'backgroundPosition',
    to: authored(pair.to),
  })

  const css = `
@property ${LEAF} { syntax: "<length-percentage>"; inherits: false; initial-value: 0px; }
@keyframes resolved-axis { from { ${LEAF}: ${from}; } to { ${LEAF}: ${to}; } }
#resolved { background-position: var(${LEAF}) 0%; animation: resolved-axis 1000ms linear both; }
`
  const read = await readBoth(`${reference.css}\n${css}`)
  const referenceSeries = read.series.map(one => one[0])
  const resolvedSeries = read.series.map(one => one[1])

  const liveness = earned([
    { check: 'the native arm animated', ok: read.animations[0] > 0 },
    { check: 'the resolved arm animated', ok: read.animations[1] > 0 },
    { check: 'the native arm moved', ok: moved(referenceSeries) },
    { check: 'the resolved arm moved', ok: moved(resolvedSeries) },
  ])

  /** Fixture defect 17's rule: the arm states which component it measured, and fails if the other one moved. */
  const attribution = liveness.ok
    ? earned([
        {
          check: 'the x component is the one that moves',
          ok:
            moved(referenceSeries.map(one => componentsOf(one)[0])) &&
            moved(resolvedSeries.map(one => componentsOf(one)[0])),
        },
        {
          check: 'the y component holds',
          ok:
            new Set(referenceSeries.map(one => componentsOf(one)[1])).size ===
              1 &&
            new Set(resolvedSeries.map(one => componentsOf(one)[1])).size === 1,
        },
      ])
    : null

  const agrees = referenceSeries.every(
    (value, at) => value === resolvedSeries[at],
  )

  records.push({
    attribution,
    authored: `${authored(pair.from)} → ${authored(pair.to)}`,
    checks: liveness,
    kind: pair.kind,
    reference: referenceSeries,
    resolved: resolvedSeries,
    resolvedEndpoints: `${from} → ${to}`,
    verdict: !liveness.ok
      ? `unearned: ${liveness.failed.join('; ')}`
      : !attribution.ok
        ? `misattributed: ${attribution.failed.join('; ')}`
        : agrees
          ? 'equivalent'
          : 'differs',
  })
}

await browser.close()

const equivalent = records.filter(one => one.verdict === 'equivalent')
const outcome = records.every(one => one.verdict === 'equivalent')
  ? 'resolved-axis-reproduces-native'
  : equivalent.length
    ? 'partial'
    : 'falsified'

const target = path.join(root, 'scripts', 'resolved-axis-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ outcome, records, source: 'scripts/research/d3-resolved-axis.mjs', wall: WALL }, null, 2)}\n`,
)

for (const one of records) {
  console.log(
    `${one.kind.padEnd(22)} ${(one.resolvedEndpoints ?? '—').padEnd(30)} ${one.verdict}`,
  )

  if (one.verdict !== 'equivalent' && one.reference)
    console.log(
      `    native   ${one.reference.join(' · ')}\n    resolved ${one.resolved.join(' · ')}`,
    )

  if (one.checks && !one.checks.ok)
    console.log(`    ${one.checks.failed.join('; ')}`)
  if (one.attribution && !one.attribution.ok)
    console.log(`    ${one.attribution.failed.join('; ')}`)
}

console.log(`\noutcome: ${outcome}`)
console.log(`written to \`${path.relative(root, target)}\``)
