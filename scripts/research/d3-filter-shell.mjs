/**
 * The filter track, opened under **both** gates the ruling set.
 *
 * A. **Compositional separability** — multiple filter arguments moving together through a static shell, against the
 *    native whole-function series. `filter` and `backdrop-filter` are measured **independently**: they are different
 *    properties with different observables, and shared machinery is not shared evidence.
 *
 * B. **Production necessity** — whether the *shipped* route for the same motion behaves incorrectly: discrete
 *    steps, lost composition, or an observable that does not move. Eligibility is not necessity; D.3.8 closed with
 *    a separable family that needed nothing, and that is the outcome this gate exists to detect early.
 *
 * The observable is each property's **own** computed value — `filter` and `backdropFilter` — not a constituent's
 * CSS property. Both are function lists, which is what makes them comparable at all.
 *
 * Run: `pnpm research:d3-filter-shell` (exits non-zero only on an arm defect, never on a finding).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const DURATION = 1000

/**
 * The arms. `slots` are the arguments that move, each with the syntax its part of the function needs; `shell` is the
 * typed side's static value, written with those slots in it.
 *
 * `drop-shadow` appears in both properties because its argument is itself compound — length, length, length, colour —
 * so it is the arm that can tell us whether "argument" is the right boundary or whether there is a second nesting.
 */
const COMBOS = [
  {
    family: 'blur + hue-rotate',
    native: { from: 'blur(0) hue-rotate(0deg)', to: 'blur(10px) hue-rotate(90deg)' },
    shell: 'blur(var(--a)) hue-rotate(var(--b))',
    slots: [
      { from: '0', slot: '--a', syntax: '<length>', to: '10px' },
      { from: '0deg', slot: '--b', syntax: '<angle>', to: '90deg' },
    ],
  },
  {
    family: 'brightness + contrast',
    native: { from: 'brightness(1) contrast(1)', to: 'brightness(2) contrast(0.5)' },
    shell: 'brightness(var(--a)) contrast(var(--b))',
    slots: [
      { from: '1', slot: '--a', syntax: '<number>', to: '2' },
      { from: '1', slot: '--b', syntax: '<number>', to: '0.5' },
    ],
  },
  {
    family: 'blur + drop-shadow',
    native: {
      from: 'blur(0) drop-shadow(0px 0px 0px)',
      to: 'blur(10px) drop-shadow(4px 4px 8px)',
    },
    shell: 'blur(var(--a)) drop-shadow(var(--b) var(--c) var(--d))',
    slots: [
      { from: '0', slot: '--a', syntax: '<length>', to: '10px' },
      { from: '0px', slot: '--b', syntax: '<length>', to: '4px' },
      { from: '0px', slot: '--c', syntax: '<length>', to: '4px' },
      { from: '0px', slot: '--d', syntax: '<length>', to: '8px' },
    ],
  },
]

const PROPERTIES = [
  { name: 'backdrop-filter', observed: 'backdropFilter' },
  { name: 'filter', observed: 'filter' },
]

const slug = text => text.replace(/[^a-z0-9]+/gi, '-')

const browser = await chromium.launch()

const seriesOf = async (sheets, observed) => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${sheets.map(one => one.css).join('\n')}</style></head><body>` +
      sheets
        .map(
          one =>
            `<div id="${one.name}" class="${(one.classes ?? []).join(' ')}"></div>`,
        )
        .join('') +
      `</body></html>`,
  )

  const readings = await page.evaluate(
    async ({ ids, observed: property, wall, duration }) => {
      const out = {}

      for (const id of ids) {
        const element = document.getElementById(id)
        const own = element.getAnimations()
        const values = []

        for (const at of wall) {
          own.forEach(animation => {
            animation.pause()
            animation.currentTime = (at / wall.at(-1)) * duration
          })

          await new Promise(requestAnimationFrame)

          values.push(getComputedStyle(element)[property])
        }

        out[id] = { animations: own.length, values }
      }

      return out
    },
    { duration: DURATION, ids: sheets.map(one => one.name), observed, wall: WALL },
  )

  await page.close()

  return readings
}

const records = []

for (const property of PROPERTIES) {
  for (const combo of COMBOS) {
    const native = `native-${slug(property.name)}-${slug(combo.family)}`
    const typed = `typed-${slug(property.name)}-${slug(combo.family)}`
    const nativeCss = `@keyframes ${native} { from { ${property.name}: ${combo.native.from}; } to { ${property.name}: ${combo.native.to}; } }\n#${native} { animation: ${native} ${DURATION}ms linear both; }`
    const typedCss = `${combo.slots.map(one => `@property ${one.slot} { syntax: '${one.syntax}'; inherits: false; initial-value: ${one.from}; }`).join('\n')}
@keyframes ${typed} { from { ${combo.slots.map(one => `${one.slot}: ${one.from};`).join(' ')} } to { ${combo.slots.map(one => `${one.slot}: ${one.to};`).join(' ')} } }
#${typed} { animation: ${typed} ${DURATION}ms linear both; ${property.name}: ${combo.shell}; }`

    const readings = await seriesOf(
      [
        { css: nativeCss, name: native },
        { css: typedCss, name: typed },
      ],
      property.observed,
    )

    const nativeSeries = readings[native].values
    const typedSeries = readings[typed].values
    const identical = nativeSeries.every((value, at) => value === typedSeries[at])

    records.push({
      identical,
      kind: 'separability',
      native: nativeSeries,
      property: property.name,
      typed: typedSeries,
      verdict: !new Set(nativeSeries).size ? 'fixture-inert' : identical ? 'same-series' : 'differs',
      family: `${property.name} · ${combo.family}`,
    })
  }
}

/**
 * Gate B, on the shipped build: an element carrying the real class, read over the same wall, against a native
 * keyframe of the same motion. A discrete or absent series here is a defect the migration would repair; an
 * identical series is the `translate-3d` outcome, and means the family needs nothing.
 */
const SHIPPED = [
  {
    class: 'animate-filter-blur-[10px]',
    family: 'filter · blur alone',
    native: { from: 'blur(0px)', observed: 'filter', to: 'blur(10px)' },
  },
  {
    class: 'animate-backdrop-filter-blur-[10px]',
    family: 'backdrop-filter · blur alone',
    native: { from: 'blur(0px)', observed: 'backdropFilter', to: 'blur(10px)' },
  },
]

const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

for (const probe of SHIPPED) {
  const emitted = finalizeCss((await compiler(ENTRY, root)).build([probe.class])).css
  const name = `native-${slug(probe.family)}`
  const css = `${emitted}\n@keyframes ${name} { from { ${probe.native.observed}: ${probe.native.from}; } to { ${probe.native.observed}: ${probe.native.to}; } }\n#${name} { animation: ${name} ${DURATION}ms linear both; }`
  const readings = await seriesOf(
    [
      { css, name },
      {
        classes: [probe.class],
        css: `${emitted}\n#probe { animation-timing-function: linear; }`,
        name: 'probe',
      },
    ],
    probe.native.observed,
  )
  const shipped = readings.probe.values
  const native = readings[name].values
  const element = readings.probe.animations

  records.push({
    equivalent: shipped.every((value, at) => value === native[at]),
    kind: 'necessity',
    native,
    property: probe.native.observed,
    shipped,
    verdict:
      element === 0
        ? 'no-motion'
        : new Set(shipped).size < 3
          ? 'discrete'
          : shipped.every((value, at) => value === native[at])
            ? 'already-equivalent'
            : 'differs',
    family: probe.family,
  })
}

await browser.close()

const target = path.join(root, 'scripts', 'filter-shell-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ source: 'scripts/research/d3-filter-shell.mjs', wall: WALL, records }, null, 2)}\n`,
)

for (const one of records)
  console.log(
    `${one.kind.padEnd(12)} ${one.family.padEnd(30)} ${one.verdict.padEnd(18)} ${one.identical ?? one.equivalent}\n    native  ${(one.native ?? []).join(' · ')}\n    subject ${(one.typed ?? one.shipped ?? []).join(' · ')}`,
  )

console.log(`\nwritten to \`${path.relative(root, target)}\``)
