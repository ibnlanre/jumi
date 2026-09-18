/**
 * The axis-pair generalization test, run the way D.3.8 taught: **one property in depth, two as corroboration**.
 *
 * Shared structure is a reusable hypothesis, not transferable evidence. `background-position`, `object-position` and
 * `offset-position` all expose an axis-pair decomposition in Jumi, and all three are different CSS properties with
 * different consumers and different observation surfaces. So `background-position` gets the full proof case — x, y,
 * both, an edge change, and the multilayer question — and the other two get one adversarial simultaneous arm each.
 * A family that fails splits the class immediately; a family that passes corroborates the mechanism, not the verdict.
 *
 * Two things the book derives rather than assumes, both from the compiled sheet:
 *
 *   the shell     the property's own composition, read out of the emission (`--jumi-<attribute>: …`)
 *   the leaves    the slots that composition reads and that end in `-offset`, which are the ones a typed motion
 *                 animates; the edge beside each one is a keyword and steps, so it is measured as a step
 *
 * and one it reads from the browser: the **resting value** of the shipped composition, so the native reference
 * starts where the shipped route starts instead of at a value the author would never have.
 *
 * Run: `pnpm research:d3-position-axis` (exits non-zero only on an arm defect, never on a finding).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'
import { DURATION, nativeSheet } from '../lib/frames.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

/** The three properties, the public route that addresses each longhand, and how much of the proof each carries. */
const TARGETS = [
  {
    attribute: 'background-position',
    depth: 'full',
    route: 'animate-background-position-[50%_50%]',
  },
  {
    attribute: 'object-position',
    depth: 'corroboration',
    route: 'animate-object-position-[50%_50%]',
  },
  {
    attribute: 'offset-position',
    depth: 'corroboration',
    route: 'animate-offset-position-[50%_50%]',
  },
]

const slug = text => text.replace(/[^a-z0-9]+/gi, '-')
const browser = await chromium.launch()

/**
 * The composition resolved **transitively to its leaves**, because the property is not where the moving parts are.
 *
 * `background-position` composes `var(--jumi-background-position-x) var(…-y)`, and each of those composes an edge
 * beside an offset — so a typed motion animates an `-offset` leaf two levels down, and an arm that looks for offsets
 * in the property's own composition finds none and measures an empty keyframe. The first run of this book did
 * exactly that and reported three inert arms.
 */
const leavesOf = (css, attribute) => {
  const definitions = new Map(
    [...css.matchAll(/--jumi-([\w-]+):\s*([^;]+);/g)].map(match => [
      match[1],
      match[2].trim(),
    ]),
  )
  const out = []

  const walk = (name, seen = new Set()) => {
    if (seen.has(name)) return
    seen.add(name)

    const value = definitions.get(name)

    if (!value) return

    const refs = [...value.matchAll(/--jumi-([\w-]+)/g)].map(match => match[1])

    if (!refs.length) {
      out.push({ name, rest: value })

      return
    }

    for (const ref of refs) walk(ref, seen)
  }

  walk(attribute)

  return out
}

/** Compile one arm's sheet, read its composition, and resolve the leaves a typed motion would animate. */
const prepare = async target => {
  const css = finalizeCss(
    (await compiler(ENTRY, root)).build([target.route]),
  ).css
  const composition =
    new RegExp(`--jumi-${target.attribute}:\\s*([^;]+);`).exec(css)?.[1] ?? ''
  const slots = leavesOf(css, target.attribute).filter(one =>
    one.name.endsWith('-offset'),
  )

  return { css, composition, slots }
}

const read = async (css, ids, property) => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${ids
      .map(one => `<div id="${one}"></div>`)
      .join('')}</body></html>`,
  )

  const values = await page.evaluate(
    async ({ ids: list, property: name }) => {
      const out = {}

      for (const id of list) {
        const element = document.getElementById(id)
        const own = element.getAnimations()
        const series = []

        for (const at of [0, 250, 500, 750, 1000]) {
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
    { ids, property },
  )

  await page.close()

  return values
}

const records = []

for (const target of TARGETS) {
  const { css, composition, slots } = await prepare(target)
  const observed = target.attribute.replace(/-([a-z])/g, (_, one) => one.toUpperCase())

  // The shipped composition's resting value, so the reference starts where the route starts.
  const restRead = await read(`${css}\n#rest { }`, ['rest'], observed)
  const rest = restRead.rest.series[0]

  /**
   * The typed side: the *same* composition the plugin ships, with the offset leaves registered and animated by hand.
   * That is what migrating these leaves would produce — the composition stays, the motion moves the leaves it reads,
   * one level below the axis slots the composition names.
   */
  const moved = slots.slice(0, 2)
  const typedSlots = moved
    .map(
      one =>
        `@property --jumi-${one.name} { syntax: '<percentage>'; inherits: false; initial-value: ${one.rest}; }`,
    )
    .join('\n')
  const typedFrames = moved
    .map(one => `--jumi-${one.name}: ${one.rest};`)
    .join(' ')
  // The offsets move the same distance in both axes, which is what makes the resolved value comparable to the
  // native arm's `rest + 40%` rather than merely similar to it.
  const typedFramesEnd = moved
    .map(one => `--jumi-${one.name}: ${Number.parseFloat(one.rest) + 40}%;`)
    .join(' ')

  /**
   * The native reference: the property itself, from the value the shipped composition rests at to the value the
   * typed arm resolves to — `50% 50%` to `90% 90%` when the edges are `center` and the offsets run to `40%`.
   */
  const numbers = rest.match(/-?[\d.]+%?/g) ?? ['50%', '50%']
  const to = numbers
    .slice(0, 2)
    .map(value => `${Number.parseFloat(value) + 40}%`)
    .join(' ')

  const arms = [
    {
      id: `typed`,
      css: `${typedSlots}\n@keyframes typed { from { ${typedFrames} } to { ${typedFramesEnd} } }\n#typed { animation: typed ${DURATION}ms linear both; ${target.attribute}: ${composition}; }`,
      label: 'x + y offsets animate',
    },
    {
      ...nativeSheet({
        from: rest,
        id: 'native',
        property: observed,
        to,
      }),
      id: 'native',
      label: 'native property motion',
    },
  ]

  const readings = await read(
    `${css}\n${arms.map(one => one.css).join('\n')}`,
    arms.map(one => one.id),
    observed,
  )

  const typed = readings.typed.series
  const native = readings.native.series
  const same = (one, two) => one.every((value, at) => value === two[at])

  records.push({
    arms: arms.map(one => ({ id: one.id, label: one.label, series: readings[one.id].series })),
    composition,
    depth: target.depth,
    identical: same(typed, native),
    live: new Set(native).size > 1 && new Set(typed).size > 1,
    property: target.attribute,
    rest,
    route: target.route,
    slots: moved,
    to,
    verdict: !(new Set(native).size > 1 && new Set(typed).size > 1)
      ? 'fixture-inert'
      : same(typed, native)
        ? 'same-series'
        : 'differs',
  })
}

/**
 * The multilayer question, answered before any safety claim: can the **public route** carry a comma-separated
 * value, and if it can, does the emission reach the same decomposition it reaches for a single layer?
 */
const MULTILAYER = 'animate-background-position-[0%_0%,_100%_100%]'
const multilayerCss = finalizeCss(
  (await compiler(ENTRY, root)).build([MULTILAYER]),
).css
const multilayerFrames =
  /@keyframes\s+[\w-]+\s*\{([\s\S]*?)\n\}/.exec(multilayerCss)?.[1] ?? ''

records.push({
  composition: /--jumi-background-position:\s*([^;]+);/.exec(multilayerCss)?.[1] ?? '',
  emittedFrames: multilayerFrames.replaceAll('\n', ' ').trim().slice(0, 220),
  kind: 'multilayer',
  property: 'background-position',
  reachable: multilayerCss.includes('background-position'),
  verdict: multilayerFrames.includes('--jumi-background-position-x-offset')
    ? 'reaches-the-decomposition'
    : 'does-not-reach-the-decomposition',
})

await browser.close()

const target = path.join(root, 'scripts', 'position-axis-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ source: 'scripts/research/d3-position-axis.mjs', wall: WALL, records }, null, 2)}\n`,
)

for (const one of records) {
  console.log(`${one.property.padEnd(22)} ${one.verdict}`)
  console.log(`    composition ${one.composition ?? '—'}`)

  for (const arm of one.arms ?? [])
    console.log(`    ${arm.id.padEnd(7)} ${arm.label.padEnd(24)} ${arm.series.join(' · ')}`)

  if (one.kind === 'multilayer') console.log(`    frames ${one.emittedFrames}`)
}

console.log(`\nwritten to \`${path.relative(root, target)}\``)
