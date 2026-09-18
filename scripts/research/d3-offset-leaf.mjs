/**
 * The admission test for widening the positional offset execution leaf from `<percentage>` to
 * `<length-percentage>`.
 *
 * Gate B left one decision open, and the ruling refused to settle it by convenience: the public offset routes accept
 * `length` while the leaf is declared `<percentage>`, and a write to a `<percentage>`-registered property is invalid
 * at computed-value time — which is the inert-animation shape this track has just finished measuring. So the widening
 * is not adopted because it looks harmless. It is adopted if a fixed-edge differential says the browser interpolates
 * the **leaf** the way it interpolates the **property**.
 *
 * Both arms move the same subject at the same edge, and the only difference is whether the offset is a leaf of its
 * own or part of the serialized property. Both carry the same timing function, because a curve difference was read
 * as a finding once already, and both are guarded for liveness before the comparison is read.
 *
 * The subject is named in the **four-value** form (`left <offset> top 0%`), which is the form the shell generates.
 * Written as `left <offset>` it is not an x edge with an offset at all: that is `<position>`'s two-value form, so the
 * offset lands on the **y** axis, the first run of this test measured y on both sides, and the two arms agreed about
 * something that was not the question. A guard now asserts that the component which moves is the x one and that the
 * y component stays at its rest, so the trap reports itself rather than reading as a pass.
 *
 * Five pairs, chosen to separate the homogeneous case from the mixed one rather than to survey the grammar.
 *
 * Run: `node scripts/research/d3-offset-leaf.mjs` (exits non-zero only on a fixture defect, never on a finding).
 */
import { chromium } from 'playwright'

import { earned } from '../lib/sources.mjs'

import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const DURATION = 1000
const LEAF = '--probe-offset-x'

const PAIRS = [
  { from: '10px', kind: 'lengths', to: '40px' },
  { from: '10%', kind: 'percentages', to: '40%' },
  { from: '10px', kind: 'length → percentage', to: '40%' },
  { from: '10%', kind: 'percentage → length', to: '40px' },
  { from: 'calc(10% + 5px)', kind: 'arithmetic', to: 'calc(40% - 5px)' },
]

/**
 * The reference: the browser interpolating the serialized property, both edges named and held.
 *
 * Four values — x edge, x offset, y edge, y offset — which is the composition the shell emits, so the y axis is
 * identical on both sides and the comparison is about the x offset alone.
 */
const nativeCss = ({ from, to }) =>
  `@keyframes native-motion { from { background-position: left ${from} top 0%; } to { background-position: left ${to} top 0%; } }
#native { animation: native-motion ${DURATION}ms linear both; }
`

/**
 * The candidate: the same motion expressed as a registered offset leaf under a static shell.
 *
 * The registration is the load-bearing part — an unregistered custom property animates discretely, so without
 * `@property` this arm would measure the absence of a registration rather than the width of a syntax.
 */
const typedCss = ({ from, to }) =>
  `@property ${LEAF} { syntax: "<length-percentage>"; inherits: false; initial-value: 0px; }
@keyframes leaf-motion { from { ${LEAF}: ${from}; } to { ${LEAF}: ${to}; } }
#typed { background-position: left var(${LEAF}) top 0%; animation: leaf-motion ${DURATION}ms linear both; }
`

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
    `<!doctype html><html><head><style>${css}</style></head><body><div id="native"></div><div id="typed"></div></body></html>`,
  )

  const out = await page.evaluate(
    async ({ wall }) => {
      const elements = ['native', 'typed'].map(id =>
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

        series.push({
          native: getComputedStyle(elements[0]).backgroundPosition,
          typed: getComputedStyle(elements[1]).backgroundPosition,
        })
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
  const read = await readBoth(`${nativeCss(pair)}\n${typedCss(pair)}`)
  const nativeSeries = read.series.map(one => one.native)
  const typedSeries = read.series.map(one => one.typed)

  const checks = earned([
    { check: 'the native arm animated', ok: read.animations[0] > 0 },
    { check: 'the leaf arm animated', ok: read.animations[1] > 0 },
    { check: 'the native arm moved', ok: moved(nativeSeries) },
    { check: 'the leaf arm moved', ok: moved(typedSeries) },
    {
      check: 'the x component is the one that moves',
      ok:
        moved(nativeSeries.map(one => componentsOf(one)[0])) &&
        moved(typedSeries.map(one => componentsOf(one)[0])),
    },
    {
      check: 'the y component stays at its rest',
      ok:
        new Set(nativeSeries.map(one => componentsOf(one)[1])).size === 1 &&
        new Set(typedSeries.map(one => componentsOf(one)[1])).size === 1,
    },
  ])

  const agrees = nativeSeries.every((value, at) => value === typedSeries[at])

  records.push({
    checks,
    from: pair.from,
    kind: pair.kind,
    native: nativeSeries,
    to: pair.to,
    typed: typedSeries,
    verdict: checks.ok ? (agrees ? 'equivalent' : 'differs') : 'unearned',
  })
}

await browser.close()

/**
 * The outcome the ruling asked for, decided from the arms rather than from the expectation that
 * `<length-percentage>` obviously works. A homogeneous pass with a mixed failure is a third outcome and is named as
 * one: it would mean the typed route could serve lengths and percentages separately but not a crossing, which is
 * probably not worth encoding unless the public API already distinguishes them.
 */
const equivalent = records.filter(one => one.verdict === 'equivalent')
const homogeneous = records.filter(
  one => one.kind === 'lengths' || one.kind === 'percentages',
)
const crossings = records.filter(one => one.kind.includes('→'))
const homogeneousPass = homogeneous.every(one => one.verdict === 'equivalent')

const outcome = !homogeneousPass
  ? 'keep-percentage'
  : equivalent.length === records.length
    ? 'widen-to-length-percentage'
    : crossings.every(one => one.verdict !== 'equivalent')
      ? 'homogeneous-only'
      : 'mixed-with-a-defect'

const target = path.join(root, 'scripts', 'offset-leaf-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ outcome, records, source: 'scripts/research/d3-offset-leaf.mjs', wall: WALL }, null, 2)}\n`,
)

for (const one of records) {
  console.log(
    `${one.kind.padEnd(18)} ${`${one.from} → ${one.to}`.padEnd(34)} ${one.verdict}`,
  )

  if (one.verdict !== 'equivalent')
    console.log(
      `    native ${one.native.join(' · ')}\n    leaf   ${one.typed.join(' · ')}`,
    )

  if (!one.checks.ok) console.log(`    ${one.checks.failed.join('; ')}`)
}

console.log(`\noutcome: ${outcome}`)
console.log(`written to \`${path.relative(root, target)}\``)
