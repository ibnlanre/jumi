/**
 * The axis-pair generalization test, re-run with the sources separated and the arms made to earn their equality.
 *
 * `background-position` carries the depth — x, y, x + y, single-layer only — and `object-position` and
 * `offset-position` carry one adversarial simultaneous arm each, because shared structure is a reusable hypothesis
 * and not transferable evidence.
 *
 * Three rules this pass follows, all of them paid for:
 *
 *   **A structure question goes to the model.** The decomposition is read from `modelLeaves()`, not from the compiled
 *   sheet: with `source(none)` the sheet carries only the slots the used class needs, so a walk over it finds nothing
 *   and an arm measures an empty keyframe.
 *   **An arm proves three things before its equality is accepted** — the route compiled, the typed leaf was written,
 *   and the observable moved under a perturbed endpoint. Only then is native-versus-typed a comparison at all.
 *   **`offset-position` is authored, not rested.** Its resting composition computes to the keyword `normal`, so both
 *   sides are put into a concrete positional state before anything moves; comparing `normal → position` against the
 *   other families would not be an axis test.
 *
 * Multilayer is out of scope by measurement rather than by assumption: the comma-separated input routes through the
 * whole property and never reaches this decomposition.
 *
 * Run: `pnpm research:d3-position-axis` (exits non-zero only on an arm defect, never on a finding).
 */
import { chromium } from 'playwright'

import { DURATION, nativeSheet } from '../lib/frames.mjs'
import {
  earned,
  liveness,
  modelExpressions,
  modelLeaves,
  resolveToLeaves,
  resolveWith,
} from '../lib/sources.mjs'

import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

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

const observedOf = attribute =>
  attribute.replace(/-([a-z])/g, (_, one) => one.toUpperCase())

const browser = await chromium.launch()

const readSeries = async (css, ids, property) => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${ids
      .map(one => `<div id="${one}"></div>`)
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
    { ids, property, wall: WALL },
  )

  await page.close()

  return values
}

const records = []

for (const target of TARGETS) {
  const observed = observedOf(target.attribute)
  const css = finalizeCss(
    (await compiler(ENTRY, root)).build([target.route]),
  ).css

  // ── structural: the leaves, their rests, and the shell the emission composes
  const leaves = modelLeaves(target.attribute).filter(one =>
    one.name.endsWith('-offset'),
  )
  const emitted = new RegExp(`--jumi-${target.attribute}:\\s*([^;]+);`).exec(
    css,
  )?.[1]

  /**
   * The prototype's property value is the composition **resolved to its leaves**, not the shipped two-level form.
   *
   * The shipped shell reads the axis slots, and an axis slot's own definition is emitted only when a candidate that
   * uses it is compiled — so a page carrying one class has `var(--jumi-background-position-x)` resolving to nothing,
   * and an arm that animates the leaves beneath it measures a property which never sees them. The canary caught it:
   * the typed series and its perturbed twin were identical, at every property, which is what the check exists for.
   */
  const shell = resolveToLeaves(target.attribute)

  /**
   * Every read the shell makes has to be **defined**, or the declaration is invalid at computed-value time and the
   * property falls back to its initial value at every instant — which reads as a motion that never happened. With
   * `source(none)` the sheet carries only the slots the used class needs, so the edge reads beside the offsets are
   * absent; they are defined here from the model's own rests, which is the structural source doing the job it has.
   */
  const reads = [
    ...new Set([...shell.matchAll(/--jumi-([\w-]+)/g)].map(match => match[1])),
  ]
  const edgeDefinitions = reads
    .filter(name => !name.endsWith('-offset'))
    .map(
      name =>
        `--jumi-${name}: ${String(modelExpressions().get(name) ?? '').trim() || 'initial'};`,
    )
    .join(' ')

  const moved = leaves.slice(0, 2)
  const values = new Map()
  const valuesEnd = new Map()

  for (const one of moved) {
    const start = Number.parseFloat(one.rest)
    values.set(one.name, one.rest)
    valuesEnd.set(one.name, `${start + 40}%`)
  }

  /**
   * Both sides are **authored** to the same concrete position: the native arm animates the property between the
   * resolved start and the resolved end, and the typed arm animates the leaves between the same two states. That is
   * what isolates interpolation from a resting state like `normal`.
   */
  const from = resolveWith(target.attribute, values)
  const to = resolveWith(target.attribute, valuesEnd)

  const typed = {
    css: [
      ...[...values.keys()].map(
        name =>
          `@property --jumi-${name} { syntax: '<percentage>'; inherits: false; initial-value: ${values.get(name)}; }`,
      ),
      `@keyframes typed { from { ${[...values].map(([name, value]) => `--jumi-${name}: ${value};`).join(' ')} } to { ${[...valuesEnd].map(([name, value]) => `--jumi-${name}: ${value};`).join(' ')} } }`,
      `#typed, #canary { ${edgeDefinitions} }`,
      `#typed { animation: typed ${DURATION}ms linear both; ${target.attribute}: ${shell}; }`,
      // The canary: the same arm with the far endpoint perturbed. If this does not move, the leaf is not written.
      `@keyframes canary { from { ${[...values].map(([name, value]) => `--jumi-${name}: ${value};`).join(' ')} } to { ${[...valuesEnd].map(([name, value]) => `--jumi-${name}: ${value.replace(/[\d.]+/, n => String(Number(n) * 2))};`).join(' ')} } }`,
      `#canary { animation: canary ${DURATION}ms linear both; ${target.attribute}: ${shell}; }`,
    ].join('\n'),
    id: 'typed',
  }
  const reference = nativeSheet({
    from,
    id: 'native',
    property: observed,
    to,
  })

  const readings = await readSeries(
    `${css}\n${typed.css}\n${reference.css}`,
    ['typed', 'canary', reference.name],
    observed,
  )

  const typedSeries = readings.typed.series
  const canarySeries = readings.canary.series
  const nativeSeries = readings[reference.name].series
  const same = (one, two) => one.every((value, at) => value === two[at])

  // The emission wrote the leaf if the sheet's frames assign it; the typed arm moved if the canary differs from it.
  const checks = earned(
    liveness({
      compiled: Boolean(emitted) && /@keyframes/.test(css),
      moved: !same(typedSeries, canarySeries),
      wrote: /--jumi-[\w-]+-offset:/.test(typed.css),
    }),
  )

  records.push({
    canary: canarySeries,
    checks,
    depth: target.depth,
    emitted,
    leaves: moved.map(one => one.name),
    native: nativeSeries,
    property: target.attribute,
    route: target.route,
    shell,
    typed: typedSeries,
    verdict: !checks.ok
      ? `unearned: ${checks.failed.join('; ')}`
      : same(typedSeries, nativeSeries)
        ? 'same-series'
        : 'differs',
  })
}

await browser.close()

const target = path.join(root, 'scripts', 'position-axis-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ records, source: 'scripts/research/d3-position-axis.mjs', wall: WALL }, null, 2)}\n`,
)

for (const one of records) {
  console.log(
    `${one.depth.padEnd(13)} ${one.property.padEnd(22)} ${one.verdict}\n` +
      `    leaves ${(one.leaves ?? []).join(', ') || '—'}\n` +
      `    shell  ${one.shell ?? '—'}\n` +
      `    typed  ${(one.typed ?? []).join(' · ') || '—'}\n` +
      `    native ${(one.native ?? []).join(' · ') || '—'}`,
  )
}

console.log(`\nwritten to \`${path.relative(root, target)}\``)
