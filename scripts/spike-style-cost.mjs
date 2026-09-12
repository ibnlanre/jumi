#!/usr/bin/env node
/**
 * SPIKE — the K curve: what does redundancy buy the linked aggregate?
 *
 * VERDICT, recorded after this ran: not enough. `K = 8` costs 1.82× the flat list's per-carrier
 * restyle on the real emission, against a 1.5× bar — see `docs/aggregate-representation.md`.
 * The representation that shipped is the flat list, completed into the carriers after the
 * build, and this script outlives the design it measured because the measurement is the reason
 * the design is not here.
 *
 * One link per slot (`K = 1`) costs ~3× the per-carrier restyle of the flat list at 228
 * slots, because a chain is a *serial* dependency while a flat list is 228 independent
 * lookups. `K` entries per link is the lever: fewer links means a shorter serial chain
 * and less reference overhead, at the price of a bigger rewrite unit per mutation.
 *
 * The representation grammar below is defined **once**, here, and injected into the page
 * as source. The runtime measurement and the size measurement therefore cannot drift
 * apart — the same function produces the CSS that the browser resolves and the bytes
 * that get compressed.
 *
 * Every arm must be **functional**, and the script enforces it: an arm that resolves
 * nothing is reported as **invalid**, not as fast. That check exists because the first
 * version of this harness published the data on `:root`, so two of three arms resolved
 * `animation-name: none` and the fastest-looking arm was the broken one. A `var()` chain
 * inside a custom property resolves where it is *declared*, and the slot variables are
 * element-local — see the P0 note in `docs/migration.md`.
 *
 *   carrier       the list published on the carrier, the consumer reading it — what ships
 *   inline        the carrier rule carries every list in full — pre-bridge
 *   linked        links on the carrier, each appending `K` entries to a predecessor
 *   root-invalid  the `:root` placement, kept as a control: resolves nothing
 *
 * Run: node scripts/spike-style-cost.mjs
 */
import { gzipSync, brotliCompressSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

import path from 'node:path'

/* ------------------------------------------------------------------------------------
 * The representation grammar. These functions are pure and self-contained, so they can
 * be serialised into the page and used verbatim for the size measurement.
 * ---------------------------------------------------------------------------------- */

const PARTS = [
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-composition',
  'animation-direction',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-play-state',
  'animation-timeline',
  'animation-timing-function',
]

/** One slot's entry in a longhand list — the shape Jumi emits, fallbacks included. */
const entry = (slot, part) =>
  part === 'animation-name'
    ? `var(--jumi-slot${slot}-animation-name, var(--jumi-animation-name))`
    : `var(--jumi-slot${slot}-${part}, var(--jumi-animation-${part}))`

/** Per-slot declarations, as the `.animate-*` utility would carry them. */
const slotStyles = slots =>
  Array.from({ length: slots }, (_, i) => `
  .slot-${i} {
    --jumi-slot${i}-animation-name: jumi-slot${i};
    ${PARTS.filter(p => p !== 'animation-name').map(p => `--jumi-slot${i}-${p}: var(--jumi-animation-${p});`).join('')}
  }`).join('')

const list = (slots, part) => Array.from({ length: slots }, (_, i) => entry(i, part)).join(', ')

/** The flat aggregate: one list per longhand. Re-emitted in full on every publication. */
const aggregateData = slots =>
  PARTS.map(part => `--jumi-aggregate-${part}: ${list(slots, part)};`).join('\n    ')

/** The longhand declarations an element needs to animate, reading the aggregate. */
const consumers = target => `
  ${target} {
    ${PARTS.map(part => `${part}: var(--jumi-aggregate-${part}, var(--jumi-animation-${part}));`).join('\n    ')}
  }`

const inline = (slots, target) => `
  ${target} {
    ${PARTS.map(part => `${part}: ${list(slots, part)};`).join('\n    ')}
  }`

const carrier = (slots, target) => `
  ${target} {
    ${aggregateData(slots)}
  }
  ${consumers(target)}`

const rootInvalid = (slots, target) => `
  :root {
    ${aggregateData(slots)}
  }
  ${consumers(target)}`

/** One link: up to `K` entries appended to its predecessor's chain. */
const node = (slots, K, n) =>
  PARTS.map((part) => {
    const from = n * K
    const entries = Array.from(
      { length: Math.min(K, slots - from) },
      (_, j) => entry(from + j, part),
    ).join(', ')

    return `--jumi-link${n}-${part}: ${n === 0 ? entries : `var(--jumi-link${n - 1}-${part}), ${entries}`};`
  }).join('\n    ')

const linksFor = (slots, K) => Math.ceil(slots / K)

const linked = (slots, target, K) => `
  ${target} {
    ${Array.from({ length: linksFor(slots, K) }, (_, n) => node(slots, K, n)).join('\n    ')}
    ${PARTS.map(part => `--jumi-aggregate-${part}: var(--jumi-link${linksFor(slots, K) - 1}-${part});`).join('\n    ')}
  }
  ${consumers(target)}`

const REPRESENTATIONS = { carrier, inline, linked, rootInvalid }

/**
 * Where the data is published. Directly on the carriers, or on their children for the
 * descendant shape — which is exactly what `*:animations` targets, and must be the
 * elements that carry the slots themselves. Publishing it on the carrier *ancestor*
 * resolves nothing, for the same reason `:root` does.
 */
const targetFor = shape => (shape === 'descendants' ? '.animations > *' : '.animations')

/** Just the emission under test: no per-slot utility blocks, no benchmark rule. */
const emission = (representation, slots, K) =>
  REPRESENTATIONS[representation](slots, targetFor('direct'), K)

const css = (representation, slots, shape, K = 1) => `
  ${slotStyles(slots)}
  ${REPRESENTATIONS[representation](slots, targetFor(shape), K)}
  .on { --jumi-animation-duration: 2s; }
`

/* ------------------------------------------------------------------------------------
 * The plan
 * ---------------------------------------------------------------------------------- */

const SLOTS = 228
const CURVE = [1, 4, 8, 16, 32]

const CONFIGS = [
  { carriers: 1, label: '1 carrier · 228 slots', shape: 'direct', slots: 228 },
  { carriers: 200, label: '200 carriers · 228 slots', shape: 'direct', slots: 228 },
  { carriers: 200, label: '200 carriers · 60 slots', shape: 'direct', slots: 60 },
  { carriers: 200, label: '200 descendants · 228 slots', shape: 'descendants', slots: 228 },
]

const PLAN = CONFIGS.flatMap((config, index) => [
  { ...config, K: 1, representation: 'carrier' },
  ...(index === 1 ? [{ ...config, K: 1, representation: 'inline' }] : []),
  ...CURVE.map(K => ({ ...config, K, representation: 'linked' })),
  // Kept so the trap is measured every run, not remembered: it is the fastest arm on
  // the page and it animates nothing.
  ...(index === 1 ? [{ ...config, K: 1, representation: 'rootInvalid' }] : []),
])

/* ------------------------------------------------------------------------------------
 * The page
 * ---------------------------------------------------------------------------------- */

const grammar = [
  `const PARTS = ${JSON.stringify(PARTS)}`,
  `const entry = ${entry.toString()}`,
  `const slotStyles = ${slotStyles.toString()}`,
  `const list = ${list.toString()}`,
  `const aggregateData = ${aggregateData.toString()}`,
  `const consumers = ${consumers.toString()}`,
  `const inline = ${inline.toString()}`,
  `const carrier = ${carrier.toString()}`,
  `const rootInvalid = ${rootInvalid.toString()}`,
  `const node = ${node.toString()}`,
  `const linksFor = ${linksFor.toString()}`,
  `const linked = ${linked.toString()}`,
  `const REPRESENTATIONS = { carrier, inline, linked, rootInvalid }`,
  `const targetFor = ${targetFor.toString()}`,
  `const css = ${css.toString()}`,
].join('\n')

const measurement = `
const PLAN = ${JSON.stringify(PLAN)}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

/** How many names the last element actually resolves. 0 means the arm is not functional. */
const resolvedNames = (element) =>
  getComputedStyle(element).animationName.split(',').filter(name => name.trim() !== 'none').length

const time = (work) => {
  const start = performance.now()
  work()
  // Reading layout forces the style pass the work invalidated.
  void document.body.offsetHeight
  return performance.now() - start
}

const dom = (carriers, slots, shape) => {
  const host = document.getElementById('host')
  const slotClasses = Array.from({ length: slots }, (_, i) => \`slot-\${i}\`).join(' ')

  if (shape === 'descendants') {
    host.innerHTML = \`<div class="animations">\${Array.from({ length: carriers }, () => \`<i class="\${slotClasses}"></i>\`).join('')}</div>\`
    return [...document.querySelectorAll('.animations > *')]
  }

  host.innerHTML = Array.from({ length: carriers }, () => \`<div class="animations \${slotClasses}"></div>\`).join('')
  return [...document.querySelectorAll('.animations')]
}

/** One cell: a fresh document state, then the two invalidation shapes. */
const cell = (plan, repeats) => {
  const { carriers, K, representation, shape, slots } = plan
  const host = document.getElementById('host')
  const initial = []
  const single = []
  const forced = []
  let resolved = 0

  for (let run = 0; run < repeats; run += 1) {
    // Fresh state: no stylesheet, no DOM.
    host.innerHTML = ''
    document.querySelectorAll('style.bench').forEach(style => style.remove())

    const style = document.createElement('style')
    style.className = 'bench'
    style.textContent = css(representation, slots, shape, K)
    document.head.append(style)

    const elements = dom(carriers, slots, shape)
    resolved = resolvedNames(elements[elements.length - 1])

    initial.push(time(() => {
      for (const element of elements) getComputedStyle(element).animationName
    }))

    // The design's own mutation model: one carrier changes.
    single.push(time(() => {
      const element = elements[elements.length - 1]
      element.classList.toggle('on')
      getComputedStyle(element).animationName
    }))

    // The adversarial case: a variant-style change on every carrier at once.
    forced.push(time(() => {
      for (const element of elements) element.classList.toggle('on')
      for (const element of elements) getComputedStyle(element).animationName
    }))
  }

  host.innerHTML = ''
  document.querySelectorAll('style.bench').forEach(style => style.remove())

  return { ...plan, forced: median(forced), initial: median(initial), resolved, single: median(single) }
}

window.runBenchmark = (repeats = 5) =>
  JSON.stringify({
    results: PLAN.map(plan => cell(plan, repeats)),
    ua: navigator.userAgent.match(/(Chrome\\/[\\d.]+)/)?.[1] ?? navigator.userAgent.slice(0, 40),
  })
`

const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(here, 'tmp-style')
const file = path.join(dir, 'bench.html')

mkdirSync(dir, { recursive: true })
writeFileSync(
  file,
  `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>K curve</title></head>
  <body>
    <div id="host"></div>
    <script>${grammar}${measurement}</script>
  </body>
</html>
`,
)

const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(`file://${file}`)

const report = JSON.parse(await page.evaluate(() => window.runBenchmark(5)))

await browser.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

const bytes = (text) => ({
  brotli: brotliCompressSync(text).length,
  gzip: gzipSync(text).length,
  raw: Buffer.byteLength(text),
})

/**
 * What one publication appends. The first carries the whole representation; every later
 * one appends a rewrite unit — the full lists for a flat representation, the ≤2 touched
 * nodes for the linked one. This is where the quadratic growth actually lives.
 */
const append = (representation, K) =>
  representation === 'linked'
    ? `${node(SLOTS, K, 0)}${node(SLOTS, K, 1)}`
    : aggregateData(SLOTS)

const rewriteUnit = (representation, K) => Buffer.byteLength(append(representation, K))

/** A flat publication re-emits every list; a linked one appends its chain once. */
const totals = (representation, K, publications) =>
  bytes(emission(representation, SLOTS, K) + append(representation, K).repeat(publications - 1))

const at = (config, representation, K) =>
  report.results.find(
    r => r.label === config.label
      && r.representation === representation
      && r.K === K,
  )

const invalid = report.results.filter(
  row => row.representation !== 'rootInvalid' && row.resolved !== row.slots,
)

const kb = value => `${(value / 1024).toFixed(1)} KB`
const mark = row => (row.resolved === 0 ? 'INVALID' : '')

console.log(`\n${report.ua} · median of 5 · runtime in ms (initial / forced-all / forced-one)\n`)

for (const config of CONFIGS) {
  console.log(`  ${config.label}`)

  const baseline = at(config, 'carrier', 1)

  console.log(`    ${'carrier (ships, K=1)'.padEnd(26)}${baseline.initial.toFixed(1)} / ${baseline.forced.toFixed(1).padStart(6)} / ${baseline.single.toFixed(2)}`)

  const inlineRow = at(config, 'inline', 1)

  if (inlineRow) {
    console.log(`    ${'inline (pre-bridge)'.padEnd(26)}${inlineRow.initial.toFixed(1)} / ${inlineRow.forced.toFixed(1).padStart(6)} / ${inlineRow.single.toFixed(2)}`)
  }

  for (const K of CURVE) {
    const row = at(config, 'linked', K)
    const ratio = row.single / baseline.single
    const reads = `${row.initial.toFixed(1)} / ${row.forced.toFixed(1).padStart(6)} / ${row.single.toFixed(2)}`

    console.log(`    ${`linked K=${K}`.padEnd(26)}${reads}   ${ratio.toFixed(2)}× ${mark(row)}`)
  }

  const control = at(config, 'rootInvalid', 1)

  if (control) {
    console.log(
      `    ${'root-invalid (control)'.padEnd(26)}${control.initial.toFixed(1)} / ${control.forced.toFixed(1).padStart(6)} / ${control.single.toFixed(2)}`
      + `   resolves 0/${control.slots} — fast because nothing resolves`,
    )
  }

  console.log('')
}

console.log(`  228 slots · a single publication, and what one mutation appends\n`)
console.log(`    ${'representation'.padEnd(26)}${'raw'.padStart(9)}${'gzip'.padStart(9)}${'brotli'.padStart(9)}${'append'.padStart(10)}`)

for (const representation of ['carrier', 'linked']) {
  for (const K of representation === 'linked' ? CURVE : [1]) {
    const size = bytes(emission(representation, SLOTS, K))
    const label = representation === 'carrier' ? 'carrier (ships, K=1)' : `linked K=${K}`

    console.log(
      `    ${label.padEnd(26)}${kb(size.raw).padStart(9)}${kb(size.gzip).padStart(9)}${kb(size.brotli).padStart(9)}${kb(rewriteUnit(representation, K)).padStart(10)}`,
    )
  }
}

// The real corpora publish 27 times (canonical) and 59–63 times (examples). Total output
// is where the quadratic shows up and where the linked representation is actually aimed.
const COUNTS = [27, 63]

console.log(`\n  228 slots · total output for the publication counts we measured\n`)
console.log(`    ${'representation'.padEnd(26)}${COUNTS.map(n => `N=${n}`.padStart(12)).join('')}${'vs carrier'.padStart(12)}`)

const carrierTotal = totals('carrier', 1, 63)

for (const representation of ['carrier', 'linked']) {
  for (const K of representation === 'linked' ? CURVE : [1]) {
    const label = representation === 'carrier' ? 'carrier (ships, K=1)' : `linked K=${K}`
    const cells = COUNTS.map(n => kb(totals(representation, K, n).raw).padStart(12))
    const ratio = representation === 'carrier' ? '1.00×' : `${(totals(representation, K, 63).raw / carrierTotal.raw).toFixed(2)}×`

    console.log(`    ${label.padEnd(26)}${cells.join('')}${ratio.padStart(12)}`)
  }
}

/* ------------------------------------------------------------------------------------
 * The target the CTO set: ≤1.5× today's per-carrier restyle, with the output collapsed.
 * ---------------------------------------------------------------------------------- */

const baselineSingle = at(CONFIGS[1], 'carrier', 1).single

console.log('\n  target: restyle ≤1.5× today, and total output ≤0.5× at N=63\n')

let survivor = 0

for (const K of CURVE) {
  const single = at(CONFIGS[1], 'linked', K).single
  const restyle = single / baselineSingle
  const output = totals('linked', K, 63).raw / carrierTotal.raw
  const passes = restyle <= 1.5 && output <= 0.5

  if (passes) survivor += 1

  console.log(
    `    K=${String(K).padEnd(3)} restyle ${restyle.toFixed(2)}× (${single.toFixed(2)} ms)  `
    + `output ${output.toFixed(3)}× (${kb(totals('linked', K, 63).raw)})  append ${kb(rewriteUnit('linked', K))}  ${passes ? 'PASS' : '—'}`,
  )
}

if (!survivor) {
  console.log('\n  no K meets the bar on this evidence')
} else {
  console.log(`\n  ${survivor} K value(s) meet the bar`)
}

if (invalid.length) {
  console.error('\n✗ cells that measured a page which does not animate:')

  for (const row of invalid) {
    console.error(`  ${row.representation} K=${row.K} @ ${row.label}: resolved ${row.resolved}/${row.slots}`)
  }

  console.error('\n  Numbers above are not comparable. Fix the placement before reading them.')
  process.exit(1)
}

for (const control of report.results.filter(row => row.representation === 'rootInvalid')) {
  if (control.resolved !== 0) {
    console.error(`\n✗ the control resolved ${control.resolved} names — it is not a control`)
    process.exit(1)
  }
}

console.log('\n✓ every arm resolved one name per slot (the invalid control is measured separately)')
console.log(`  wrote ${path.relative(process.cwd(), file)}`)
