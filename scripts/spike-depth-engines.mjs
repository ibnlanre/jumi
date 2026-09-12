#!/usr/bin/env node
/**
 * SPIKE — depth and behaviour of a linked aggregate across engines.
 *
 * Deeply nested custom-property substitution is a foundational assumption of the
 * representation, so this closes the cross-engine gap the style-cost result left open.
 * Per engine, per depth, it verifies what the design relies on:
 *
 *   1. the full list resolves — depth N, first to last, nothing truncated
 *   2. the chains stay aligned — a slot's name, duration, delay and iteration count
 *      all belong to the same slot, and all ten longhands resolve to depth N
 *   3. a link can be vacated — republished as `none`, its entry stops animating
 *   4. a link can be relinked — the successor skips it and the rest keeps its order
 *   5. `animation-composition: add` still proves exactly-once — once sums to the sum,
 *      a duplicated slot sums twice, which is why removal has to be real
 *
 * The chain is generated exactly as the aggregate will emit it: each link references
 * its predecessor and adds one slot's entries, which themselves reference per-slot
 * variables declared on the element.
 *
 * Run: node scripts/spike-depth-engines.mjs [depths...]
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium, firefox, webkit } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

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

/** What each slot's entry resolves to, so alignment can be read back. */
const marker = (index, part) => {
  if (part === 'animation-name') return `s${index}`
  if (part === 'animation-delay' || part === 'animation-duration') return `${index + 1}ms`
  if (part === 'animation-iteration-count') return `${index + 1}`

  return null
}

const sheet = (depth) => {
  const links = Array.from({ length: depth }, (_, index) => PARTS.map(part =>
    `--link${index}-${part}: ${index === 0
      ? `var(--slot${index}-${part})`
      : `var(--link${index - 1}-${part}), var(--slot${index}-${part})`};`).join('\n        ')).join('\n        ')

  const slots = Array.from({ length: depth }, (_, index) => PARTS.map(part =>
    `--slot${index}-${part}: ${marker(index, part) ?? 'initial'};`).join('\n        ')).join('\n        ')

  return `
      @keyframes a100 { from { width: 0px } to { width: 100px } }
      @keyframes a300 { from { width: 0px } to { width: 300px } }

      :root {
        ${links}
        ${PARTS.map(part => `--aggregate-${part}: var(--link${depth - 1}-${part});`).join('\n        ')}
        --sum: a100, a300;
      }

      #el {
        ${PARTS.map(part => `${part}: var(--aggregate-${part}, var(--fallback-${part}));`).join('\n        ')}
      }

      #sum {
        animation-name: var(--sum);
        animation-duration: 1ms;
        animation-fill-mode: forwards;
        animation-composition: add;
        width: 0px;
      }

      .slots {
        ${slots}
      }
`
}

const page = (depth) => `<!doctype html>
<html>
  <head><meta charset="utf-8"><style>${sheet(depth)}</style></head>
  <body>
    <div id="el" class="animations slots"></div>
    <div id="sum" class="slots"></div>
    <script>
      window.DEPTH = ${depth}
      window.PARTS = ${JSON.stringify(PARTS)}

      const read = (id, part) => getComputedStyle(document.getElementById(id))[part]
      const list = (value) => value.split(',').map(s => s.trim())
      const republish = (css) => {
        const style = document.createElement('style')
        style.textContent = css
        document.head.append(style)
      }

      window.runChecks = async () => {
        const depth = window.DEPTH
        const parts = window.PARTS

        const names = list(read('el', 'animationName'))
        const durations = list(read('el', 'animationDuration'))
        const delays = list(read('el', 'animationDelay'))
        const counts = list(read('el', 'animationIterationCount'))

        // 1: full resolution, nothing truncated.
        const resolved = names.length === depth && names[0] === 's0' && names[depth - 1] === 's' + (depth - 1)

        // 2: aligned — every readable marker belongs to the same slot index.
        const aligned = names.every((name, i) =>
          name === 's' + i
          && durations[i] === (i + 1) + 'ms'
          && delays[i] === (i + 1) + 'ms'
          && counts[i] === String(i + 1))

        // …and the other six longhands resolve to the same depth.
        const othersResolve = ['animationComposition', 'animationDirection', 'animationFillMode',
          'animationPlayState', 'animationTimeline', 'animationTimingFunction']
          .every(part => list(read('el', part)).length === depth)

        // 3: vacate — a later declaration of the same link wins.
        republish(':root { ' + parts.map(part => '--link5-' + part + ': var(--link4-' + part + '), none;').join(' ') + ' }')
        const vacated = list(read('el', 'animationName'))
        const vacatedOk = vacated.length === depth && vacated[5] === 'none' && vacated[6] === 's6'

        // 4: relink — the successor skips the vacated link entirely.
        republish(':root { ' + parts.map(part =>
          '--link6-' + part + ': var(--link4-' + part + '), var(--slot6-' + part + ');').join(' ') + ' }')
        const relinked = list(read('el', 'animationName'))
        const relinkedOk = relinked.length === depth - 1 && relinked[5] === 's6' && relinked[4] === 's4'

        // 5: exactly once — a summing composition exposes a duplicated slot.
        await new Promise(resolve => setTimeout(resolve, 40))
        const addOnce = read('sum', 'width')

        republish(':root { --sum: a100, a300, a100; }')
        await new Promise(resolve => setTimeout(resolve, 40))
        const addTwice = read('sum', 'width')

        return { addOnce, addTwice, aligned, alignedAndResolved: resolved && othersResolve, depth, relinkedOk, resolved, vacatedOk }
      }
    </script>
  </body>
</html>
`

const depths = process.argv.slice(2).map(Number)
const targets = depths.length ? depths : [60, 228, 512]

const engines = { chromium, firefox, webkit }
const results = []

for (const [name, engine] of Object.entries(engines)) {
  let browser

  try {
    browser = await engine.launch()

    for (const depth of targets) {
      const handle = await browser.newPage()

      try {
        await handle.setContent(page(depth))

        results.push({ engine: name, ...(await handle.evaluate(() => window.runChecks())) })
      }
      finally {
        await handle.close()
      }
    }
  }
  catch (error) {
    // An engine that cannot run here is reported as such rather than aborting the
    // other engines' results. WebKit segfaults on this machine, for instance.
    results.push({ engine: name, launchFailed: String(error).split('\n')[0].slice(0, 90) })
  }
  finally {
    await browser?.close()
  }
}

writeFileSync(path.join(here, 'tmp-depth-engines.json'), `${JSON.stringify(results, null, 2)}\n`)

console.log(`${'engine'.padEnd(10)} ${'depth'.padStart(5)}  resolved  aligned  six others  vacate  relink  add once/twice`)
console.log('─'.repeat(96))

for (const r of results) {
  if (r.launchFailed) {
    console.log(`${r.engine.padEnd(10)} ${'—'.padStart(5)}  could not launch: ${r.launchFailed}`)
    continue
  }

  console.log(
    `${r.engine.padEnd(10)} ${String(r.depth).padStart(5)}  `
    + `${(r.resolved ? 'yes' : 'NO').padStart(8)}  ${(r.aligned ? 'yes' : 'NO').padStart(7)}  `
    + `${(r.alignedAndResolved ? 'yes' : 'NO').padStart(10)}  ${(r.vacatedOk ? 'yes' : 'NO').padStart(6)}  `
    + `${(r.relinkedOk ? 'yes' : 'NO').padStart(6)}  ${r.addOnce} / ${r.addTwice}`,
  )
}

const measured = results.filter(r => !r.launchFailed)
const failed = measured.filter(r =>
  !r.resolved || !r.aligned || !r.alignedAndResolved || !r.vacatedOk || !r.relinkedOk
  || r.addOnce !== '400px' || r.addTwice !== '500px')

console.log(`\n${measured.length - failed.length}/${measured.length} engine·depth combinations passed every check`)
process.exit(failed.length ? 1 : 0)
