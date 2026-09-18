/**
 * D.3.10 · Gate B across the residual families, in the order the ledger ranks them.
 *
 * Gate B asks one question per family — **is the shipped route defective?** — and it asks it before Gate A, because
 * semantic safety does not imply production necessity: `filter`, `backdrop-filter` and both 3D families were proven
 * separable and then turned out to need nothing. The question has two halves that can be answered without a native
 * differential, and both are browser readings:
 *
 *   does the animation exist, and does the computed property move?
 *   does it arrive at the value the class names?
 *
 * The second half matters as much as the first: a route that moves *somewhere else* is a defect of the same kind as
 * one that never moves, and reading the static declaration's own computed value gives the target without a second
 * fixture. Only a defect, or a divergence, sends a family on to Gate A.
 *
 * The probes are the same kind of authored input as the authoring-route book's: one value per component, chosen to be
 * admissible by the component's grammar and different from its rest. They are exercise values, never statements about
 * semantics.
 *
 * Run: `node scripts/research/d3-gate-b-sweep.mjs` (exits non-zero only on a fixture defect, never on a finding).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'
import { earned } from '../lib/sources.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

/** The observable per family, and the exercise value per component. */
const OBSERVABLE = {
  background: 'backgroundSize',
  'border-image': 'borderImageOutset',
  skew: 'transform',
  transform: 'perspective',
}

const TARGETS = [
  { component: 'skew-x', family: 'skew', observable: 'transform', probe: '30deg' },
  { component: 'skew-y', family: 'skew', observable: 'transform', probe: '20deg' },
  {
    component: 'border-image-outset',
    family: 'border-image',
    observable: 'borderImageOutset',
    probe: '8px',
  },
  {
    component: 'border-image-repeat',
    family: 'border-image',
    observable: 'borderImageRepeat',
    probe: 'round',
  },
  {
    component: 'background-size',
    family: 'background',
    observable: 'backgroundSize',
    probe: '50%',
  },
  {
    component: 'perspective-3d',
    family: 'transform',
    observable: 'perspective',
    probe: '300px',
  },
]

const browser = await chromium.launch()

/**
 * One arm, read three ways: the value the class declares when nothing is animating, the series while it animates, and
 * whether an animation exists at all.
 */
const read = async (klass, observable) => {
  const css = finalizeCss((await compiler(ENTRY, root)).build([klass])).css
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>` +
      `<div id="probe" class="${klass}" style="animation-timing-function: linear; animation: none"></div>` +
      `<div id="moving" class="${klass}" style="animation-timing-function: linear"></div>` +
      `</body></html>`,
  )

  const out = await page.evaluate(
    async ({ observable: property, wall }) => {
      const still = document.getElementById('probe')
      const moving = document.getElementById('moving')
      const own = moving.getAnimations()
      const series = []

      for (const at of wall) {
        own.forEach(animation => {
          animation.pause()
          animation.currentTime = at
        })

        await new Promise(requestAnimationFrame)

        series.push(getComputedStyle(moving)[property])
      }

      return {
        animations: own.length,
        declared: getComputedStyle(still)[property],
        series,
      }
    },
    { observable, wall: WALL },
  )

  await page.close()

  return out
}

const records = []

for (const target of TARGETS) {
  const klass = `animate-${target.component}-[${target.probe}]`
  const reading = await read(klass, target.observable)
  const emitted = reading.animations > 0
  const moved = new Set(reading.series).size > 1
  const arrives = reading.series.at(-1) === reading.declared

  const checks = earned([
    { check: 'the shipped class emitted an animation', ok: emitted },
    { check: 'the declared value is not the resting value', ok: reading.declared !== 'none' },
  ])

  /**
   * Three answers, and the middle one is why this pass exists: a route that moves but not where it says is defective
   * in a way a liveness check alone would call healthy.
   */
  const verdict = !checks.ok
    ? `unearned: ${checks.failed.join('; ')}`
    : !moved
      ? 'inert'
      : arrives
        ? 'equivalent'
        : 'diverges'

  records.push({
    checks,
    klass,
    ...target,
    declared: reading.declared,
    series: reading.series,
    verdict,
  })
}

await browser.close()

const target = path.join(root, 'scripts', 'gate-b-sweep-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ source: 'scripts/research/d3-gate-b-sweep.mjs', wall: WALL, records }, null, 2)}\n`,
)

for (const one of records) {
  console.log(
    `${one.family.padEnd(14)} ${one.component.padEnd(22)} ${one.verdict.padEnd(10)} declared=${one.declared}  ${one.series.at(0)} → ${one.series.at(-1)}`,
  )

  if (!one.checks.ok) console.log(`    ${one.checks.failed.join('; ')}`)
}

console.log(`\nwritten to \`${path.relative(root, target)}\``)
