/**
 * D.3.10 · the two open questions, answered by the browser rather than by inference.
 *
 * **`border-image-outset`.** Gate B found the shipped route flipping discretely where native was expected to interpolate
 * the length list. Gate A's only job now is to establish the **native** behaviour of the grammar the public route
 * exposes — one value, a 2- to 4-value list, numbers, lengths, and a mixed list — because that decides whether the
 * components are independently interpolable or the whole property is the subject. Non-zero probes throughout, since
 * zero is exactly where a type boundary can be canonicalised out of sight.
 *
 * **`background-size`.** `auto → 50% auto` looked discrete in Gate B, and looking discrete is not a finding: native
 * may be discrete too. The native reference decides, and nothing is classified until it does.
 *
 * Each arm compares the shipped route against the browser interpolating the same two values, from the same resting
 * point to the same named target, with the shipped timing function read off the emission — the discipline the earlier
 * passes paid for, including the component guard: the arm states which part of the value it measured.
 *
 * Run: `node scripts/research/d3-outset-size.mjs` (exits non-zero only on a fixture defect, never on a finding).
 */
import { chromium } from 'playwright'

import { nativeSheet } from '../lib/frames.mjs'
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

/**
 * The grammar classes the ruling asked about, one arm each. The target is the value the class **names**, which is what
 * a native reference has to interpolate to for the comparison to be about the route rather than about two motions.
 */
const TARGETS = [
  {
    kind: 'length → length',
    klass: 'animate-border-image-outset-[8px]',
    to: '8px',
  },
  {
    kind: 'length → length (nonzero)',
    klass: 'animate-border-image-outset-[16px]',
    to: '16px',
  },
  {
    kind: 'number → number',
    klass: 'animate-border-image-outset-[2]',
    to: '2',
  },
  {
    kind: 'list, 2 values',
    klass: 'animate-border-image-outset-[2_10px]',
    to: '2 10px',
  },
  {
    kind: 'list, 4 values',
    klass: 'animate-border-image-outset-[2_10px_4px_20px]',
    to: '2 10px 4px 20px',
  },
  {
    kind: 'mixed, number ↔ length',
    klass: 'animate-border-image-outset-[10px_2]',
    to: '10px 2',
  },
  {
    kind: 'size: auto → percentage',
    klass: 'animate-background-size-[50%_auto]',
    to: '50% auto',
  },
  {
    kind: 'size: percentage → percentage',
    klass: 'animate-background-size-[50%_50%]',
    to: '50% 50%',
  },
]

const OUTSET = 'borderImageOutset'
const SIZE = 'backgroundSize'

const observableOf = klass =>
  klass.includes('background-size') ? SIZE : OUTSET

const browser = await chromium.launch()

/**
 * Both elements on one page, and the **shipped class on the probe** — which the first version of this book omitted,
 * so every shipped arm read a resting value and reported `unearned` while the native side moved. A fixture that
 * forgets to apply the class it is measuring is the same defect class as one that reads a resting declaration as a
 * target: it produces a verdict about the fixture and presents it as a verdict about the route.
 */
const readBoth = async (css, klass) => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>` +
      `<div id="probe" class="${klass}"></div><div id="native"></div></body></html>`,
  )

  const out = await page.evaluate(
    async ({ wall }) => {
      const ids = ['probe', 'native']
      const own = ids.map(id => document.getElementById(id).getAnimations())
      const series = []

      for (const at of wall) {
        for (const animations of own)
          for (const animation of animations) {
            animation.pause()
            animation.currentTime = at
          }

        await new Promise(requestAnimationFrame)

        series.push(
          ids.map(id => {
            const element = document.getElementById(id)

            return [
              getComputedStyle(element).borderImageOutset,
              getComputedStyle(element).backgroundSize,
            ]
          }),
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

for (const target of TARGETS) {
  const observable = observableOf(target.klass)
  const slot = observable === SIZE ? 1 : 0
  const shipped = finalizeCss(
    (await compiler(ENTRY, root)).build([target.klass]),
  ).css
  const easing =
    /--jumi-animation-timing-function:\s*([^;]+);/.exec(shipped)?.[1]?.trim() ??
    'linear'

  const restRead = await readBoth(
    `${shipped}\n#native { animation: none }`,
    target.klass,
  )
  const rest = restRead.series[0][0][slot]

  const reference = nativeSheet({
    easing,
    from: rest,
    id: 'native',
    property: observable,
    to: target.to,
  })

  const read = await readBoth(`${shipped}\n${reference.css}`, target.klass)
  const shippedSeries = read.series.map(one => one[0][slot])
  const nativeSeries = read.series.map(one => one[1][slot])

  const checks = earned([
    {
      check: 'the shipped class emitted an animation',
      ok: read.animations[0] > 0,
    },
    {
      check: 'the native arm emitted an animation',
      ok: read.animations[1] > 0,
    },
    { check: 'the native arm moved', ok: moved(nativeSeries) },
    { check: 'the shipped route moved', ok: moved(shippedSeries) },
  ])

  const agrees = shippedSeries.every((value, at) => value === nativeSeries[at])

  records.push({
    checks,
    kind: target.kind,
    klass: target.klass,
    native: nativeSeries,
    rest,
    shipped: shippedSeries,
    to: target.to,
    verdict: !checks.ok
      ? `unearned: ${checks.failed.join('; ')}`
      : agrees
        ? 'equivalent'
        : 'differs',
  })
}

await browser.close()

const target = path.join(root, 'scripts', 'outset-size-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ records, source: 'scripts/research/d3-outset-size.mjs', wall: WALL }, null, 2)}\n`,
)

for (const one of records) {
  console.log(`${one.kind.padEnd(26)} ${one.klass.padEnd(48)} ${one.verdict}`)
  console.log(
    `    shipped ${one.shipped.join(' · ')}\n    native  ${one.native.join(' · ')}`,
  )
}

console.log(`\nwritten to \`${path.relative(root, target)}\``)
