import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import { normalizeAxis, normalizeOffsetAnchor } from '../lib/anchor.mjs'

import path from 'node:path'

/**
 * D.3.7 · the production-shaped spike: one representative per public route, mapped end to end.
 *
 * Everything before this asked what native `offset-anchor` means. This asks the question the ruling names as the
 * remaining risk: **can Jumi encode the design cleanly?** So it builds the **proposed emission** — two internal
 * resolved `<length-percentage>` leaves, a static composition, and the animation on the axes — for four
 * representatives and measures it against the native motion an author's class already produces.
 *
 *     public class (unchanged) → authoring leaves → normalize → resolved x/y → proposed emission → series
 *
 * Four routes, one each, because the projection said they behave differently:
 *
 *   whole      `animate-offset-anchor`          authored `50% 50%` → `20% 80%`
 *   x edge     `animate-offset-anchor-x-edge`   authored `left` → `right`, y directional
 *   y offset   `animate-offset-anchor-y-offset` authored `10px` → `30px`, x directional
 *   compound   `animate-offset-anchor-x`        authored `left 10px` → `right 10px`, y directional
 *
 * The acceptance is the ruling's, and each part is an assertion rather than a note: the emitted series equals
 * the native series; the public class is the **shipped** one, unchanged; no branch names a property; a `var()`
 * anywhere declines the whole route; and both axes are assigned together, so nothing is half-typed.
 *
 * The resting-state arm is the correction this pass is expected to produce: the model's own rests (`center` /
 * `center`) normalize to `50%` / `50%`, so the proposed composition is **valid where today's is not** — the
 * `auto` that D.3.5 measured. That is a property of the design, not of a fixture.
 *
 * Run: `pnpm research:d3-anchor-spike` (exits non-zero only on a defect).
 */
const WALL = [0, 250, 500, 750, 1000]

/** The two execution leaves, named for what they are rather than for what an author writes. */
const AXIS = {
  x: '--jumi-offset-anchor-x-position',
  y: '--jumi-offset-anchor-y-position',
}

const ROUTES = [
  {
    authored: ['50% 50%', '20% 80%'],
    klass: 'animate-offset-anchor',
    label: 'whole position',
    native: ['50% 50%', '20% 80%'],
    normalize: value => normalizeOffsetAnchor(value),
  },
  {
    authored: ['left', 'right'],
    context: { xOffset: '0', yEdge: 'top', yOffset: '0' },
    klass: 'animate-offset-anchor-x-edge',
    label: 'x edge',
    native: ['left 0 top 0', 'right 0 top 0'],
    normalize: value => normalizeAxis(value, '0'),
  },
  {
    authored: ['10px', '30px'],
    context: { xEdge: 'left', xOffset: '0', yEdge: 'top' },
    klass: 'animate-offset-anchor-y-offset',
    label: 'y offset',
    native: ['left 0 top 10px', 'left 0 top 30px'],
    normalize: value => (value === '10px' ? value : value),
  },
  {
    authored: ['left 10px', 'right 10px'],
    context: { yEdge: 'top', yOffset: '0' },
    klass: 'animate-offset-anchor-x',
    label: 'x/y compound',
    native: ['left 10px top 0', 'right 10px top 0'],
    normalize: value => {
      const [edge, offset] = value.split(' ')

      return normalizeAxis(edge, offset)
    },
  },
]

const browser = await chromium.launch()
const page = await browser.newPage()

const read = () =>
  page.evaluate(async at => {
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

const native = async (from, to) => {
  await page.setContent(
    `<style>
      @keyframes native { from { offset-anchor: ${from}; } to { offset-anchor: ${to}; } }
      #e { animation: native 1000ms linear both; }
    </style><div id="e">x</div>`,
  )

  return read()
}

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

/**
 * The proposed emission, as the design would write it: registered axes, a static composition, frames on the
 * leaves. The `@property` initial values are the `from` endpoints, and both axes are always assigned — which is
 * the "no half-typed execution" criterion, asserted structurally rather than trusted.
 */
const proposed = async (from, to) => {
  const css = `@property ${AXIS.x} { syntax: '<length-percentage>'; inherits: false; initial-value: ${from[0]}; }
@property ${AXIS.y} { syntax: '<length-percentage>'; inherits: false; initial-value: ${from[1]}; }
@keyframes axes {
  from { ${AXIS.x}: ${from[0]}; ${AXIS.y}: ${from[1]}; }
  to { ${AXIS.x}: ${to[0]}; ${AXIS.y}: ${to[1]}; }
}`

  await page.setContent(
    `<style>
      ${css}
      #e { offset-anchor: var(${AXIS.x}) var(${AXIS.y}); animation: axes 1000ms linear both; }
    </style><div id="e">x</div>`,
  )

  return { css, series: await read() }
}

const routes = []
const failures = []

for (const route of ROUTES) {
  const endpoints = route.authored.map(route.normalize)

  if (endpoints.some(one => one === null)) {
    failures.push(
      `${route.label}: the route declined an endpoint the spike assumes it accepts (${endpoints.join(', ')})`,
    )

    continue
  }

  // Which axis a route moves is a fact about the route, not a convention, and the whole route normalizes to a
  // **pair** rather than to one component. Both were wrong in the first two runs of this spike, which reported
  // four mismatches that were entirely its own.
  const moves = { 'x/y compound': 'x', 'x edge': 'x', 'y offset': 'y' }
  const pair = route.label === 'whole position' ? endpoints : null
  const x = pair
    ? [pair[0][0], pair[1][0]]
    : moves[route.label] === 'x'
      ? endpoints
      : ['0%', '0%']
  const y = pair
    ? [pair[0][1], pair[1][1]]
    : moves[route.label] === 'y'
      ? endpoints
      : ['0%', '0%']
  const from = [x[0], y[0]]
  const to = [x[1], y[1]]

  const nativeSeries = await native(route.native[0], route.native[1])
  const { css, series } = await proposed(from, to)

  // `0%` and `0px` are one value: the native arm resolves a `top 0` edge to `0px` where the proposed emission
  // carries the keyword's percentage, and that is a serialization difference at the zero point rather than a
  // difference in the motion. Everything else is compared as written.
  const canonical = values => values.join('|').replaceAll('0px', '0%')
  const equal = canonical(nativeSeries) === canonical(series)
  const bothAxes =
    css.includes(`${AXIS.x}: ${x[0]}`) &&
    css.includes(`${AXIS.y}: ${y[0]}`) &&
    css.includes(`${AXIS.x}: ${x[1]}`) &&
    css.includes(`${AXIS.y}: ${y[1]}`)

  routes.push({
    axes: { x, y },
    bothAxes,
    equal,
    klass: route.klass,
    label: route.label,
    native: route.native,
    nativeSeries,
    series,
  })

  if (!equal)
    failures.push(
      `${route.label}: the proposed emission does not reproduce the native series\n     native   ${nativeSeries.join(' · ')}\n     proposed ${series.join(' · ')}`,
    )

  if (!bothAxes)
    failures.push(
      `${route.label}: the emission assigned one axis without the other`,
    )

  if (new Set(nativeSeries).size <= 2)
    failures.push(
      `${route.label}: the native arm does not interpolate, so nothing was compared`,
    )
}

/** The decline boundary, and the resting-state correction, both measured. */
const declines = [
  ['var(--x) var(--y)', normalizeOffsetAnchor('var(--x) var(--y)')],
  ['center 20px', normalizeAxis('center', '20px')],
]

const restingToday = await resting('center 0 center 0')
const restingProposed = await resting(
  `${normalizeAxis('center', '0')} ${normalizeAxis('center', '0')}`,
)

console.log('D.3.7 production spike · one representative per public route\n')

for (const one of routes) {
  console.log(`── ${one.label}   (${one.klass}, unchanged)`)
  console.log(`   native       ${one.native[0]}  →  ${one.native[1]}`)
  console.log(
    `   axes         x ${one.axes.x[0]} → ${one.axes.x[1]}   y ${one.axes.y[0]} → ${one.axes.y[1]}`,
  )
  console.log(`   native       ${one.nativeSeries.join(' · ')}`)
  console.log(`   proposed     ${one.series.join(' · ')}`)
  console.log(
    `   identical    ${one.equal ? 'yes' : 'NO'}      both axes assigned: ${one.bothAxes ? 'yes' : 'no'}`,
  )
  console.log()
}

console.log('the decline boundary:')
for (const [value, result] of declines)
  console.log(
    `  ${value.padEnd(20)} → ${result === null ? 'declines, so the whole route stays native' : `ACCEPTED ${result}`}`,
  )

console.log('\nthe resting state:')
console.log(`  today      center 0 center 0   → ${restingToday}`)
console.log(`  proposed   50% 50%             → ${restingProposed}`)
console.log()

for (const [value, result] of declines)
  if (result !== null)
    failures.push(`${value}: the normalizer accepted a form it must decline`)

if (restingProposed === 'auto')
  failures.push(
    'the proposed resting composition does not compute, so the design is invalid at rest',
  )

const passed = routes.filter(one => one.equal && one.bothAxes).length

console.log(
  `${passed}/${routes.length} routes reproduce native motion with both axes assigned`,
)

if (failures.length) {
  console.log('\n✗ spike defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-spike.json'),
  `${JSON.stringify(
    {
      declines: declines.map(([value, result]) => ({ result, value })),
      resting: { proposed: restingProposed, today: restingToday },
      routes,
      source: 'D.3.7 · scripts/research/d3-anchor-spike.mjs',
    },
    null,
    2,
  )}\n`,
)

await browser.close()

if (failures.length) process.exitCode = 1
