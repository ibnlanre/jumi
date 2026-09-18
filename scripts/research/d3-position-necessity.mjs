/**
 * Gate B for the axis-pair shape: does the **shipped** route already do what the prototype proved safe?
 *
 * Gate A established that typed offset leaves reproduce native motion for three properties. That is eligibility.
 * This asks the other question, per property and separately: does the route that ships today already move, already
 * compose, and already leave the other axis alone — in which case there is nothing to migrate and the family is
 * `safe-no-need`, which is the outcome three families have already reached in this track.
 *
 * Three conditions each, because "x only" and "x + y" are different questions: a route can be correct alone and
 * suppressed when its sibling moves.
 *
 * The candidates are **discovered from the candidate table**, not listed here — an arm whose route does not exist
 * reports that rather than measuring nothing. The observable is the longhand's own computed value, read directly.
 * Every arm carries the same liveness requirement as Gate A: the reference must move, and so must the shipped route,
 * before their agreement means anything. Three fixture defects paid for the version of that rule used here:
 *
 *   **The reference carries the shipped timing function.** The plugin's default is `ease`; the reference's was
 *   `linear`, so every correctly interpolating route reported `differs` on the strength of its curve alone.
 *   **`offset-position` is seated before it is measured.** Its resting composition computes to the keyword
 *   `normal`, which does not interpolate with a length, so the reference never moved and every arm reported itself. *   **`route-inert` is a finding, and `unearned` is a fixture.** An arm whose class emitted an animation, whose
 *   reference moved, and whose shipped route did not has measured a defect and says so; only an arm missing one of
 *   those two preconditions is unearned. The mechanism is then lifted out of the emission and applied as a plain
 *   declaration, so the classification rests on a measured reason rather than on a plausible one.
 *
 * Run: `pnpm research:d3-position-necessity` (exits non-zero only on an arm defect, never on a finding).
 */
import { chromium } from 'playwright'

import { cssNameOf, nativeSheet } from '../lib/frames.mjs'
import { readCandidates } from '../lib/property-model.mjs'
import { earned } from '../lib/sources.mjs'

import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const PROPERTIES = [
  'background-position',
  'object-position',
  'offset-position',
  'background-size',
]
const CONDITIONS = [
  { axis: 0, name: 'x only', part: 'x' },
  { axis: 1, name: 'y only', part: 'y' },
  { axis: -1, name: 'x + y', part: null },
]

/** The authored positional state `offset-position` is seated in, because its resting read is `normal`. */
const SEATED = { 'offset-position': ['50%', '50%'] }

const attributeOf = attribute =>
  attribute.replace(/-([a-z])/g, (_, one) => one.toUpperCase())
const table = new Map(readCandidates().map(one => [one.name, one]))

const browser = await chromium.launch()

/** The shipped candidate for one axis, discovered rather than named — absent candidates report themselves. */
const routeFor = (attribute, part) => {
  if (!part) return null

  const name = `animate-${attribute}-${part}`

  return table.has(name) ? name : null
}

const readSeries = async (css, sheets, property) => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${sheets
      .map(
        one =>
          `<div id="${one.id}" class="${(one.classes ?? []).join(' ')}"></div>`,
      )
      .join('')}</body></html>`,
  )

  const values = await page.evaluate(
    async ({ ids: list, property: name, wall }) => {
      const out = {}

      for (const id of list) {
        const element = document.getElementById(id)
        const own = element.getAnimations()
        const series = []

        for (const at of wall) {
          own.forEach(animation => {
            animation.pause()
            animation.currentTime = at
          })

          await new Promise(requestAnimationFrame)

          series.push(getComputedStyle(element)[name])
        }

        out[id] = { animations: own.length, series }
      }

      return out
    },
    { ids: sheets.map(one => one.id), property, wall: WALL },
  )

  await page.close()

  return values
}

/** The numbers in a computed position or size, so two series can be compared on the axis that moved. */
const numbersOf = value => String(value).match(/-?[\d.]+%?/g) ?? []

const records = []

for (const attribute of PROPERTIES) {
  const observed = attributeOf(attribute)

  for (const condition of CONDITIONS) {
    const routes = condition.part
      ? [routeFor(attribute, condition.part)].filter(Boolean)
      : [routeFor(attribute, 'x'), routeFor(attribute, 'y')].filter(Boolean)
    const classes = routes.map(name => `${name}-[0:0%|100:40%]`)

    if (!classes.length) {
      records.push({
        condition: condition.name,
        property: attribute,
        verdict: 'no-route',
      })

      continue
    }

    const shipped = finalizeCss(
      (await compiler(ENTRY, root)).build(classes),
    ).css

    /**
     * The shipped emission's own timing function, read from the emission rather than assumed: a reference on a
     * different curve than the route it is judging reports the curve, not the route.
     */
    const easing =
      /--jumi-animation-timing-function:\s*([^;]+);/
        .exec(shipped)?.[1]
        ?.trim() ?? 'linear'

    /**
     * `offset-position` rests at `normal`, which does not interpolate with a length, and Chromium reports the used
     * value as `normal` whenever no animation sets it — so its resting read is unavailable by construction and the
     * two sides are seated in the authored state the ruling scoped this property to instead.
     */
    const seating =
      attribute === 'offset-position'
        ? '#probe, #reference { offset-position: 50% 50%; }\n'
        : ''

    const restRead = await readSeries(
      `${shipped}\n${seating}`,
      [{ classes, id: 'probe' }],
      observed,
    )
    /**
     * The reference starts where the shipped composition starts — read from the shipped route, so the comparison is
     * about interpolation and not about two different starting values. `offset-position` alone cannot report one
     * (its used value is `normal` until an animation sets it), so the authored seating is the fallback, exactly
     * where a resting read is unavailable rather than everywhere.
     */
    const resting = numbersOf(restRead.probe.series[0])
    const start = resting.length ? resting : (SEATED[attribute] ?? [])
    const to = start
      .slice(0, 2)
      .map((value, at) =>
        condition.axis === -1 || condition.axis === at
          ? `${Number.parseFloat(value) + 40}%`
          : value,
      )
      .join(' ')

    // The reference starts where the shipped composition rests, so the comparison is about interpolation and not
    // about two different starting values — the same discipline Gate A used.
    const reference = nativeSheet({
      easing,
      from: start.slice(0, 2).join(' '),
      id: 'reference',
      property: observed,
      to,
    })

    const readings = await readSeries(
      `${shipped}\n${seating}\n${reference.css}`,
      [{ classes, id: 'probe' }, { id: reference.name }],
      observed,
    )
    const shippedSeries = readings.probe.series
    const referenceSeries = readings[reference.name].series

    /**
     * Liveness first, on both sides. A shipped route that never moves is a finding — but only once the reference is
     * known to move, and only once the class is known to have emitted an animation, or it is a fixture reporting on
     * itself.
     */
    const emitted = readings.probe.animations > 0
    const referenceMoved = new Set(referenceSeries).size > 1
    const shippedMoved = new Set(shippedSeries).size > 1
    const checks = earned([
      { check: 'the shipped class emitted an animation', ok: emitted },
      { check: 'the reference moved', ok: referenceMoved },
      { check: 'the shipped route moved', ok: shippedMoved },
    ])

    /**
     * The mechanism, measured rather than inferred.
     *
     * The keyframe's own declaration is lifted out of the emission and applied as a plain declaration to an element
     * carrying the same class, with the animation switched off. If it computes to the property's resting value, the
     * declaration is invalid at computed-value time and the keyframes are dropping it — a composition defect inside
     * the emission rather than a timing artefact, which is what the classification has to rest on.
     */
    const keyframe = /@keyframes[^{]+\{([\s\S]*?)\n\}/.exec(shipped)?.[1] ?? ''
    const stop = [...keyframe.matchAll(/([a-z-]+):\s*([^;]+);/g)]
      .filter(one => one[1] === cssNameOf(observed))
      .at(-1)
    const isolated = stop
      ? await readSeries(
          `${shipped}\n#isolated { animation: none; ${stop[1]}: ${stop[2]}; }\n`,
          [{ classes, id: 'isolated' }],
          observed,
        )
      : null
    const mechanism = stop
      ? {
          computed: isolated.isolated.series[0],
          declaration: `${stop[1]}: ${stop[2].trim()}`,
        }
      : null
    const movedAxis = offset => numbersOf(shippedSeries[offset]).slice(0, 2)
    const referenceAxis = offset =>
      numbersOf(referenceSeries[offset]).slice(0, 2)
    const agrees = shippedSeries.every((_, at) => {
      const left = movedAxis(at)
      const right = referenceAxis(at)

      return condition.axis === -1
        ? left[0] === right[0] && left[1] === right[1]
        : left[condition.axis] === right[condition.axis]
    })

    records.push({
      checks,
      classes,
      condition: condition.name,
      easing,
      mechanism,
      property: attribute,
      reference: referenceSeries,
      resting: restRead.probe.series[0],
      shipped: shippedSeries,
      verdict:
        !emitted || !referenceMoved
          ? `unearned: ${checks.failed.join('; ')}`
          : !shippedMoved
            ? 'route-inert'
            : agrees
              ? 'equivalent'
              : 'differs',
    })
  }
}

await browser.close()

const target = path.join(root, 'scripts', 'position-necessity-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ records, source: 'scripts/research/d3-position-necessity.mjs', wall: WALL }, null, 2)}\n`,
)

for (const one of records) {
  console.log(
    `${one.property.padEnd(22)} ${(one.condition ?? '—').padEnd(8)} ${one.verdict}`,
  )

  if (one.shipped)
    console.log(
      `    shipped ${one.shipped.join(' · ')}\n    refer   ${one.reference.join(' · ')}`,
    )

  if (one.mechanism)
    console.log(
      `    mechanism \`${one.mechanism.declaration}\` → ${one.mechanism.computed}`,
    )
}

console.log(`\nwritten to \`${path.relative(root, target)}\``)
