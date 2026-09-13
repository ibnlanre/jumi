#!/usr/bin/env node
/**
 * Measure a *built* catalogue the way the synthetic harness measures its fixture.
 *
 * `spike-cdp-cost` prices a fixture it compiles itself, and `spike-real-page` serves the shipped
 * catalogue so a human can time it by hand. Neither answers the question that closes a
 * representation change: **what does the real build cost through the protocol, and do all of its
 * animations still resolve?**
 *
 * So this is the missing third instrument. It serves a build, opens the catalogue page, reads every
 * animating element's live animation positions, and inspects one element through CDP.
 *
 * It has two modes, and the difference matters for keeping it:
 *
 *   default     asserts what needs **no baseline** — every element resolves its own effect, and every
 *               live position resolved its own control rather than a per-position fallback. This is
 *               the permanent regression path: it is self-contained, so it can be run on any build,
 *               including after a deploy.
 *   --compare   diffs against a baseline captured *before* a representation change. The baseline is
 *               an artifact of that change rather than a fixture: it is 150 KB and names the
 *               directory it was taken from, so it is deliberately not committed. Capture it before
 *               rebuilding, or the diff cannot be taken afterwards.
 *
 *   cp -R docs/dist /tmp/jumi-dist-deep
 *   node scripts/measure-real-page.mjs --site=/tmp/jumi-dist-deep --json=/tmp/deep.json
 *   pnpm docs:build
 *   node scripts/measure-real-page.mjs --json=/tmp/hoisted.json --compare=/tmp/deep.json
 *
 * The parity it asserts is the **accepted contract**, not a byte comparison: an *active* position
 * (one whose `animation-name` is not `none`) must resolve identically across all ten longhands,
 * while an inactive position's computed values are bookkeeping and are allowed to differ. Asserting
 * the whole computed style instead would fail on the known, deliberate divergence.
 *
 * Run: node scripts/measure-real-page.mjs [--site=<dir>] [--json=<path>] [--compare=<path>]
 */
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const arg = prefix => process.argv.slice(2).find(argument => argument.startsWith(`${prefix}=`))?.slice(prefix.length + 1)

const site = path.resolve(root, arg('--site') ?? path.join('docs', 'dist'))
const jsonPath = arg('--json')
const comparePath = arg('--compare')
const port = Number(arg('--port') ?? 8793)

/**
 * The ten longhands, named here rather than imported: this instrument deliberately shares no code
 * with the finalizer, so that it can disagree with it.
 */
const PARTS = [
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
  'animation-composition',
  'animation-timeline',
]

if (!existsSync(site)) {
  console.error(`no built site at ${site} — run \`pnpm docs:build\` first`)
  process.exit(1)
}

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const file = path.join(site, decodeURIComponent(url.pathname).replace(/\/$/, '/index.html'))

  if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('not found')

    return
  }

  const type = TYPES[path.extname(file)] ?? 'application/octet-stream'

  response.writeHead(200, { 'cache-control': 'no-store', 'content-type': type })
  createReadStream(file).pipe(response)
})

await new Promise(resolve => server.listen(port, '127.0.0.1', resolve))

const base = `http://127.0.0.1:${port}`

const { chromium } = await import('playwright')

const browser = await chromium.launch()
// Headless Chromium reports `prefers-reduced-motion: reduce` by default, and the catalogue honours
// it — every glyph then computes `animation-name: none` and a run against the shipped site reads as
// 228 broken effects. State the preference rather than inherit the default.
const page = await browser.newPage({ reducedMotion: 'no-preference', viewport: { height: 900, width: 1400 } })
const session = await page.context().newCDPSession(page)

await session.send('DOM.enable')
await session.send('CSS.enable')
await page.goto(`${base}/effects/`, { waitUntil: 'load' })

/**
 * Put the catalogue into the state it is meant to be read in.
 *
 * The docs play an effect only while its card carries `is-playing` — their own rule is
 * `.effect-card:not(.is-playing) .effect-glyph { animation: none !important }`. Left alone, all 228
 * glyphs compute `animation-name: none`, which reads as 228 broken effects and is really 228 idle
 * ones. The class is the page's, not a fixture's: this adds the state the page's own script adds.
 */
await page.evaluate(() => {
  for (const card of document.querySelectorAll('.effect-card')) card.classList.add('is-playing')
})

/**
 * Every animating element's live positions, read in the page.
 *
 * One evaluate for all of them rather than one CDP call each: the question is what the *element*
 * resolves, and 228 round trips would time the instrument instead of the page. `animation-name` is
 * the liveness test — a position the element does not activate computes to `none`, and under the
 * contract that position is not part of the answer.
 */
const elements = await page.evaluate((parts) => {
  const glyphs = [...document.querySelectorAll('.effect-glyph')]

  return glyphs.map((element) => {
    const style = getComputedStyle(element)
    const list = property => style.getPropertyValue(property).split(',').map(part => part.trim())
    const lists = Object.fromEntries(parts.map(part => [part, list(part)]))

    return {
      effect: [...element.classList].map(name => /^animate-(.+)$/.exec(name)?.[1]).filter(Boolean)[0] ?? null,
      live: lists['animation-name']
        .map((name, i) => ({ name, values: Object.fromEntries(parts.map(part => [part, lists[part][i] ?? null])) }))
        .filter(entry => entry.name !== 'none'),
      // The count the aggregate resolved, live or not, so a representation that shrank it is visible.
      positions: lists['animation-name'].length,
      running: element.getAnimations().length,
    }
  })
}, PARTS)

/** Bytes and median milliseconds for one CDP method, after a warm-up that pays for recalculation. */
const timed = async (nodeId, method, runs = 15) => {
  const first = await session.send(method, { nodeId })
  const bytes = Buffer.byteLength(JSON.stringify(first))
  const samples = []

  for (let i = 0; i < runs; i++) {
    const start = performance.now()

    await session.send(method, { nodeId })
    samples.push(performance.now() - start)
  }

  samples.sort((a, b) => a - b)

  return { bytes, median: Math.round(samples[Math.floor(samples.length / 2)] * 10) / 10 }
}

const { root: document } = await session.send('DOM.getDocument', { depth: 0 })
const { nodeId } = await session.send('DOM.querySelector', { nodeId: document.nodeId, selector: '.effect-glyph' })

await timed(nodeId, 'CSS.getMatchedStylesForNode', 1)
await timed(nodeId, 'CSS.getComputedStyleForNode', 1)

const matched = await timed(nodeId, 'CSS.getMatchedStylesForNode')
const computed = await timed(nodeId, 'CSS.getComputedStyleForNode')

const css = readFileSync(path.join(site, readFileSync(path.join(site, 'effects', 'index.html'), 'utf8')
  .match(/href="([^"]*effects\.[^"]*\.css)"/)[1].replace(/^\//, '')), 'utf8')

const measured = {
  computedBytes: computed.bytes,
  computedMs: computed.ms,
  elements,
  matchedBytes: matched.bytes,
  matchedMs: matched.median,
  sheetBytes: css.length,
  site,
  slots: elements.length,
}

console.log(`\n  real catalogue — ${site}`)
console.log(`    stylesheet      ${css.length.toLocaleString()} bytes`)
console.log(`    elements        ${elements.length}`)
console.log(`    positions       ${elements[0]?.positions ?? 0} per element`)
console.log(`    matched styles  ${matched.bytes.toLocaleString()} bytes, ${matched.median} ms (median of 15)`)
console.log(`    computed style  ${computed.bytes.toLocaleString()} bytes, ${computed.median} ms (median of 15)`)

const silent = elements.filter(element => element.live.length === 0)
const misnamed = elements.filter(element => element.effect
  && !element.live.some(entry => entry.name === `jumi-${element.effect}`))

/**
 * The assertion that needs no baseline, and the reason this instrument is worth keeping.
 *
 * Every glyph on the catalogue carries the same control — `animation-duration-[1200ms]` — so every
 * live position should resolve the same duration. If one position read the fallback instead of its
 * own control, the set would have two members.
 *
 * Falsified rather than assumed: removing the control from **one** of the 228 glyphs produces
 * `2 distinct across live positions: 1s, 1.2s` and exit 1. The detail that makes it worth keeping is
 * what also happened — that glyph still resolved a *live* animation, 228/228. A position whose
 * publication did not arrive can still name its animation, so "does it resolve?" passes while the
 * element quietly runs the wrong timing. Comparing the resolved values against each other catches
 * that without a fixture, a baseline or a hard-coded number.
 */
const durations = [...new Set(elements
  .flatMap(element => element.live.map(entry => entry.values['animation-duration'])))]
const uncontrolled = durations.length === 1 && durations[0] !== '0s' ? [] : durations

/** Named in full up to a point: a run that finds nothing is 228 names, and the count is the finding. */
const list = names => (names.length > 12
  ? `${names.slice(0, 12).join(', ')}, … (${names.length} total)`
  : names.join(', '))

console.log(`    live            ${elements.length - silent.length}/${elements.length} elements resolve an animation`)
console.log(`    duration        ${durations.length === 1
  ? `${durations[0]} on every live position`
  : `${durations.length} distinct across live positions: ${durations.join(', ')}`}`)

if (silent.length) {
  console.log(`\n✗ ${silent.length} elements resolve nothing: ${list(silent.map(e => e.effect))}`)
}

if (misnamed.length) {
  console.log(`\n✗ ${misnamed.length} elements resolve something other than their own effect:`
    + ` ${list(misnamed.map(e => e.effect))}`)
}

if (uncontrolled.length !== 0) {
  console.log(`\n✗ live positions disagree about their control — ${uncontrolled.join(', ')}.`
    + ' A position that did not read its own control is a publication that did not arrive.')
}

const failures = []
let parity = null

if (comparePath) {
  const before = JSON.parse(readFileSync(comparePath, 'utf8'))

  /**
   * The contract, element by element and part by part.
   *
   * Only live positions are compared. An inactive position is one the element does not run, and the
   * two representations are known to give it different bookkeeping values — `jumi` leaves it reading
   * the shared control's duration, the hoist falls back to a literal. Comparing it would report the
   * divergence that was accepted rather than a regression.
   */
  const diffs = []

  if (before.elements.length !== elements.length) {
    diffs.push(`element count ${before.elements.length} → ${elements.length}`)
  }

  for (const [index, after] of elements.entries()) {
    const was = before.elements[index]

    if (!was) break
    if (was.effect !== after.effect) diffs.push(`element ${index}: effect ${was.effect} → ${after.effect}`)
    if (was.live.length !== after.live.length) {
      diffs.push(`${after.effect}: ${was.live.length} live positions → ${after.live.length}`)
    }

    for (const [position, entry] of after.live.entries()) {
      const old = was.live[position]

      if (!old) break
      if (old.name !== entry.name) {
        diffs.push(`${after.effect} position ${position}: ${old.name} → ${entry.name}`)

        continue
      }

      for (const part of PARTS) {
        if (old.values[part] !== entry.values[part]) {
          diffs.push(`${after.effect} position ${position} ${part}: ${old.values[part]} → ${entry.values[part]}`)
        }
      }
    }
  }

  parity = {
    compared: elements.length,
    differences: diffs.length,
    livePositions: elements.reduce((total, element) => total + element.live.length, 0),
  }

  console.log(`\n  parity against ${before.site ?? comparePath}`)
  console.log(`    matched styles  ${before.matchedBytes.toLocaleString()} → ${matched.bytes.toLocaleString()} bytes`
    + ` (${Math.round(100 * (matched.bytes - before.matchedBytes) / before.matchedBytes)}%)`)
  console.log(`    matched ms      ${before.matchedMs} → ${matched.median}`)
  console.log(`    live positions  ${parity.livePositions}, ${diffs.length} differences`)

  if (diffs.length) {
    console.log('')

    for (const diff of diffs.slice(0, 40)) console.log(`    ✗ ${diff}`)
    if (diffs.length > 40) console.log(`    … and ${diffs.length - 40} more`)
  }
}

if (jsonPath) {
  writeFileSync(jsonPath, `${JSON.stringify(measured, null, 2)}\n`)
  console.log(`\n    written         ${jsonPath}`)
}

if (silent.length) failures.push(`${silent.length} elements resolve no animation`)
if (misnamed.length) failures.push(`${misnamed.length} elements resolve another effect's animation`)
if (uncontrolled.length !== 0) failures.push(`live positions disagree about their control: ${uncontrolled.join(', ')}`)
if (parity?.differences) failures.push(`${parity.differences} live-position differences against the baseline`)

await browser.close()
server.close()

if (failures.length) {
  console.log(`\n✗ the real catalogue does not hold: ${failures.join('; ')}\n`)
  process.exit(1)
}

console.log(`\n✓ every element resolves its own animation${parity ? ', identically to the baseline' : ''}.\n`)
