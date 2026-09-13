#!/usr/bin/env node
/**
 * Recalc cost spike — what does the aggregate cost the *renderer*?
 *
 * The companion to `spike-cdp-cost`. That one prices the representation through the DevTools
 * protocol; this one prices it through style recalculation, so the two costs can be put on one table
 * before the representation is changed. The earlier investigation rejected hoisting on this half
 * alone (−19%), which is why it is the half that has to be re-measured for the *exact* shape now
 * under consideration rather than for the prototype it rejected.
 *
 * The operation measured is the one a Jumi user actually performs: **change a control**. A class on
 * the root element sets `--jumi-animation-duration`, toggling it invalidates every descendant, and
 * the recalc that follows is read two ways —
 *
 *   · the renderer's own counters, `RecalcStyleDuration` and `RecalcStyleCount`, from
 *     `Performance.getMetrics`. These are not wall clock; they are the browser's accounting of the
 *     work, which is why they are the primary number.
 *   · wall clock around the forced layout, as a cross-check that includes layout.
 *
 * Every cell also measures an **inert page of the same DOM shape** — the same markup with no
 * classes, so nothing animates — because the interesting number is the delta the animation
 * machinery adds, not the absolute cost of recalculating a document.
 *
 * Run: pnpm spike:recalc
 *
 * RESULT — see `engineering/research/style-cost.md`. Chromium 153.0.8010.12, 2026-09-13.
 */
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { shallowOf } from './lib/aggregate.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const SLOTS = process.argv[2] ? process.argv[2].split(',').map(Number) : [10, 25, 50, 100, 150, 228]
const ELEMENTS = [1, 10, 100, 1000]
const ITERATIONS = 3

/** The control the toggle changes. Unregistered, so it inherits and reaches every descendant. */
const CONTROL = '.control { --jumi-animation-duration: 777ms; }'

console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

// After bundling: the helper loads the finalizer out of `dist/`.
const { build, compiler } = await import('./lib/compile.mjs')

const pool = n => Array.from({ length: n }, (_, i) => `animate-rotate-[${i + 1}deg]`)

const candidates = n => [
  'animate-rotate-45',
  'animate-scale-110',
  'animate-opacity-50',
  'animation-duration-500',
  ...pool(n),
]

const compile = async (n) => {
  const css = ['@import "tailwindcss" source(none);', `@plugin "${path.join(root, 'dist', 'index.js')}";`, ''].join('\n')
  const instance = await compiler(css, root)

  return `${build(instance, candidates(n)).css}\n${CONTROL}`
}

/* ------------------------------------------------------------------ serving */

const markup = (count, classes) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>recalc</title><link rel="stylesheet" href="/sheet.css"></head>
<body>${Array.from({ length: count }, (_, i) => `<div class="${classes[i % classes.length] ?? ''}"></div>`).join('')}</body>
</html>`

let current = { css: '', html: '' }

const server = createServer((request, response) => {
  const html = request.url === '/'

  if (!html && request.url !== '/sheet.css') {
    response.writeHead(404).end('no fixture')

    return
  }

  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': html ? 'text/html' : 'text/css',
  }).end(html ? current.html : current.css)
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

const base = `http://127.0.0.1:${server.address().port}`

/* ------------------------------------------------------------------ measuring */

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { height: 600, width: 900 } })
const page = await context.newPage()
const session = await context.newCDPSession(page)

await session.send('Performance.enable')

const counters = async () => {
  const { metrics } = await session.send('Performance.getMetrics')

  return Object.fromEntries(metrics.map(metric => [metric.name, metric.value]))
}

const available = await counters()

if (!('RecalcStyleDuration' in available)) {
  console.log(`! RecalcStyleDuration is unavailable in this build; got: ${Object.keys(available).sort().join(', ')}`)
  console.log('! Falling back to wall clock only — the numbers below are then not comparable to the record.')
}

/**
 * Toggle the control `ITERATIONS` times with a forced layout after each, and return the work the
 * renderer charged for it.
 *
 * The forced read is inside the timed region on purpose: a class change only marks the tree dirty,
 * and the recalculation happens when something asks for style. Timing the class change alone would
 * measure a boolean assignment.
 */
const measure = async () => {
  const before = await counters()

  const samples = await page.evaluate(({ iterations }) => {
    const out = []

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()

      document.documentElement.classList.toggle('control')
      void document.body.offsetHeight
      out.push(performance.now() - start)
    }

    return out
  }, { iterations: ITERATIONS })

  const after = await counters()

  const round = value => Math.round(value * 1000) / 1000

  return {
    elements: Math.round(((after.RecalcStyleCount ?? 0) - (before.RecalcStyleCount ?? 0)) / ITERATIONS),
    styleMs: round(((after.RecalcStyleDuration ?? 0) - (before.RecalcStyleDuration ?? 0)) * 1000 / ITERATIONS),
    wallMs: round(samples.reduce((total, sample) => total + sample, 0) / samples.length),
  }
}

/* ------------------------------------------------------------------ the grid */

const report = []

const NAMES = ['jumi', 'longhand', 'shallow', 'inert']

for (const slots of SLOTS) {
  const css = await compile(slots)

  // Both hoisted shapes are measured, not just the one under consideration. The longhand shape is
  // what the earlier investigation priced at −19%, so reproducing it here is what shows the
  // difference between that number and this one is the *shape* rather than the measurement.
  const sheets = {
    inert: css,
    jumi: css,
    longhand: `${shallowOf(css, 'longhand')}\n${CONTROL}`,
    shallow: `${shallowOf(css, 'shorthand')}\n${CONTROL}`,
  }

  console.log(`\n══ ${slots} slots`)

  for (const elements of ELEMENTS) {
    const row = { elements, slots }

    for (const variant of NAMES) {
      current = { css: sheets[variant], html: markup(elements, variant === 'inert' ? [] : pool(slots)) }

      await page.goto(`${base}/`)

      // Warm-up: the first toggle in a fresh renderer pays for first-recalc effects that every later
      // one does not.
      await page.evaluate(({ iterations }) => {
        document.documentElement.classList.toggle('control')
        void document.body.offsetHeight

        for (let i = 0; i < iterations; i++) {
          document.documentElement.classList.toggle('control')
          void document.body.offsetHeight
        }
      }, { iterations: 1 })

      row[variant] = await measure()
    }

    report.push(row)

    const saved = row.jumi.styleMs - row.inert.styleMs > 0
      ? `${Math.round((1 - (row.shallow.styleMs - row.inert.styleMs) / (row.jumi.styleMs - row.inert.styleMs)) * 100)}%`
      : '—'

    console.log(`   ${String(elements).padStart(5)} elements   ${NAMES.map(name => `${name} ${String(row[name].styleMs).padStart(8)}`).join('   ')}   saved ${saved}`)
  }
}

await browser.close()
server.close()

/* ------------------------------------------------------------------ summary */

console.log(`\n${'─'.repeat(104)}`)
console.log('RecalcStyleDuration per control change, ms (or the wall-clock fallback)')
console.log(`${'slots'.padStart(6)} ${'elements'.padStart(8)} ${NAMES.map(name => name.padStart(10)).join(' ')} ${'Δ jumi'.padStart(10)} ${'Δ shallow'.padStart(10)} ${'saved'.padStart(7)}`)

for (const row of report) {
  const delta = value => Math.round((value - row.inert.styleMs) * 1000) / 1000
  const saved = row.jumi.styleMs - row.inert.styleMs > 0
    ? `${Math.round((1 - (row.shallow.styleMs - row.inert.styleMs) / (row.jumi.styleMs - row.inert.styleMs)) * 100)}%`
    : '—'

  console.log(`${String(row.slots).padStart(6)} ${String(row.elements).padStart(8)} `
    + `${NAMES.map(name => String(row[name].styleMs).padStart(10)).join(' ')} `
    + `${String(delta(row.jumi.styleMs)).padStart(10)} ${String(delta(row.shallow.styleMs)).padStart(10)} ${saved.padStart(7)}`)
}

console.log(`\nwall clock per control change, ms (includes layout)`)
console.log(`${'slots'.padStart(6)} ${'elements'.padStart(8)} ${NAMES.map(name => name.padStart(10)).join(' ')}`)

for (const row of report) {
  console.log(`${String(row.slots).padStart(6)} ${String(row.elements).padStart(8)} `
    + `${NAMES.map(name => String(row[name].wallMs).padStart(10)).join(' ')}`)
}
