/**
 * The fallback arms: is declining to the shipped whole-property route a **strategy**, or a second defect?
 *
 * Gate B proved the shipped single-axis route can be inert through partial-composition invalidity, so "the resolver
 * declines and the old route keeps it" is only safe if the old route is measured to work for that particular
 * declined spelling. Two spellings stand in for the two classes the resolver will decline, and both are measured on
 * the shipped build before any migration lands:
 *
 *   same-edge **length**   `animate-background-position-x-[0%|40px]` — semantically proven safe by the admission
 *                          differential, and unrepresentable in a `<percentage>` leaf
 *   **edge-changing**      `animate-background-position-x-[0%|right_40%]` — the motion lives in the edge, which a
 *                          leaf cannot carry whatever its syntax
 *
 * Each arm answers three questions rather than one: does the animation exist, does the computed property actually
 * move, and does it match a native reference built from the same two authored positions.
 *
 * And each arm asserts **which computed component moved**, which is fixture defect 17 made permanent: for positional
 * grammar a plausible spelling is not evidence of axis ownership, so the arm names the component it measured and
 * fails if the other one is the one that moves.
 *
 * Run: `node scripts/research/d3-fallback-arms.mjs` (exits non-zero only on a fixture defect, never on a finding).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'
import { nativeSheet } from '../lib/frames.mjs'
import { earned } from '../lib/sources.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

/** The two classes the resolver will decline, each with the native reference for the value it names. */
const ARMS = [
  {
    axis: 0,
    kind: 'same-edge length',
    klass: 'animate-background-position-x-[0%|40px]',
    to: '40px 0%',
  },
  {
    axis: 0,
    kind: 'edge-changing',
    klass: 'animate-background-position-x-[0%|right_40%]',
    to: 'right 40% top 0%',
  },
]

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

/** One pair of elements, both read at the same instants, and nothing else on the page to confuse either. */
const readBoth = async (css, ids) => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${ids
      .map(one => `<div id="${one.id}" class="${(one.classes ?? []).join(' ')}"></div>`)
      .join('')}</body></html>`,
  )

  const out = await page.evaluate(
    async ({ ids: list, wall }) => {
      const elements = list.map(one => document.getElementById(one.id))
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
    { ids, wall: WALL },
  )

  await page.close()

  return out
}

const moved = values => new Set(values).size > 1

const records = []

for (const arm of ARMS) {
  const shipped = finalizeCss((await compiler(ENTRY, root)).build([arm.klass])).css
  const restRead = await readBoth(`${shipped}`, [{ classes: [arm.klass], id: 'probe' }])
  const rest = restRead.series[0][0]

  /**
   * The reference is the browser interpolating the same two authored positions — from the shipped resting value to
   * the value this spelling names — so the comparison is about the route and not about two different motions.
   */
  const reference = nativeSheet({
    from: rest,
    id: 'reference',
    property: 'backgroundPosition',
    to: arm.to,
  })

  const read = await readBoth(`${shipped}\n${reference.css}`, [
    { classes: [arm.klass], id: 'probe' },
    { id: reference.name },
  ])
  const shippedSeries = read.series.map(one => one[0])
  const referenceSeries = read.series.map(one => one[1])

  /**
   * Liveness first, and then attribution — which is a different question and is only askable once something has
   * moved. An arm whose route is inert has not misattributed anything: it has measured an inert route, and reading
   * that as a wrong-axis arm would hide the finding behind a fixture complaint.
   */
  const component = offset => shippedSeries.map(one => componentsOf(one)[offset])
  const shippedMoved = moved(shippedSeries)
  const liveness = earned([
    { check: 'the shipped class emitted an animation', ok: read.animations[0] > 0 },
    { check: 'the reference moved', ok: moved(referenceSeries) },
  ])

  /** Fixture defect 17 made permanent: a plausible spelling is not evidence of axis ownership. */
  const attribution = shippedMoved
    ? earned([
        {
          check: 'the claimed component is the one that moves',
          ok: moved(component(arm.axis)),
        },
        {
          check: 'the sibling component holds',
          ok:
            new Set(shippedSeries.map(one => componentsOf(one)[1 - arm.axis]))
              .size === 1,
        },
      ])
    : null

  const agrees = shippedSeries.every((value, at) => value === referenceSeries[at])

  records.push({
    attribution,
    axis: arm.axis,
    checks: liveness,
    klass: arm.klass,
    kind: arm.kind,
    reference: referenceSeries,
    shipped: shippedSeries,
    verdict: !liveness.ok
      ? `unearned: ${liveness.failed.join('; ')}`
      : !shippedMoved
        ? 'inert'
        : !attribution.ok
          ? `misattributed: ${attribution.failed.join('; ')}`
          : agrees
            ? 'native-equivalent'
            : 'differs',
  })
}

await browser.close()

const target = path.join(root, 'scripts', 'fallback-arms-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ source: 'scripts/research/d3-fallback-arms.mjs', wall: WALL, records }, null, 2)}\n`,
)

for (const one of records) {
  console.log(`${one.kind.padEnd(18)} ${one.klass.padEnd(46)} ${one.verdict}`)
  console.log(
    `    shipped ${one.shipped.join(' · ')}\n    refer   ${one.reference.join(' · ')}`,
  )

  if (!one.checks.ok) console.log(`    ${one.checks.failed.join('; ')}`)
  if (one.attribution && !one.attribution.ok)
    console.log(`    ${one.attribution.failed.join('; ')}`)
}

console.log(`\nwritten to \`${path.relative(root, target)}\``)
