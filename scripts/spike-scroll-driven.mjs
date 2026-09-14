#!/usr/bin/env node
/**
 * Scroll-driven animations spike — what the platform gives us, measured in Chromium.
 *
 * The question is the same shape as the view-transition one, and so is the discipline: **can an
 * animation Jumi already emits be retargeted from the document timeline to a scroll or view
 * timeline without changing the motion, and what does the rest of the control vocabulary mean once
 * it has been?** No design, no public classes, no `src` changes. It measures the platform and the
 * *finalized* emission together, and ends with a capability matrix.
 *
 * Everything under test is a real build: the candidates in `spike-scroll-driven/arms.mjs` are
 * compiled by Tailwind and finalized by `dist/index.js`, so the composition rule, the substrate,
 * the hoisted `--jumi-slot-*` publications and the keyframes under test are the ones a build ships.
 *
 * Two stylesheets run side by side. The Jumi arm is the emission; the plain arm is hand-written CSS
 * and exists because Jumi cannot state a named timeline or an `animation-range` today — so the
 * platform's semantics for those are established there, and Jumi's gap is a measurement rather than
 * an inference.
 *
 * Run: pnpm spike:scroll-driven   (bundles first: the harness loads `dist/`)
 *
 * RESULT (Chromium 153.0.8010.12, 2026-09-14, 8 sections, 31 arms) — the full record, the
 * capability matrix and the recommendation are in `engineering/research/scroll-driven.md`. In short:
 *
 *   · The hypothesis holds and the emission already implements it. `animation-timeline` is a
 *     per-slot list, position-aligned with the `animation` shorthand, so one slot can be retargeted
 *     while its neighbours stay on the document timeline: `scroll(), auto` measures as position 0 on
 *     a ScrollTimeline and position 1 on a DocumentTimeline. `scroll()`, `scroll(root|nearest|self)`,
 *     the axes, `view()` and arbitrary values all work; `nearest` correctly follows the nested pane.
 *   · The time vocabulary is reinterpreted rather than ignored: the range normalizes to each
 *     animation's own end, so `animation-duration` is inert on its own (resolved `100%` for 1s, 600ms,
 *     2s and auto alike) while `animation-delay` is a share of the scroll that also compresses the
 *     motion (`83.3333%` at delay 200ms/1s). Direction, iteration-count, fill, play-state and
 *     composition all keep their meaning.
 *   · `animation-range` is written by Jumi and read by nobody — the shipped stylesheet declares no
 *     real `animation-range`, `scroll-timeline-*` or `view-timeline-*` property at all, and the range
 *     arms measure identical to a bare `view()`. That, and not the retarget, is the missing part.
 *   · Two shapes fail open with no signal: an axis that cannot scroll (no animation at all) and
 *     `animation-timeline: none` (a motion that never progresses).
 *   · Reduced motion is the author's to clamp, and the obvious arm is a trap: wrapping the *timeline*
 *     in `motion-safe:` turns a scroll-driven entrance into a time-driven one under `reduce`.
 *   · Compositing was NOT established. `Animation.animationUpdated` was given a control that had to
 *     report updates, the control reported none, so the instrument measured the protocol's silence.
 */
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'
import { ARMS, CANDIDATES, page as pageHtml, reader, TIMELINE_PROPERTIES } from './spike-scroll-driven/arms.mjs'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))

/** Scroll positions every sweep visits, as a fraction of the scroller's range. */
const SWEEP = [0, 0.25, 0.5, 0.75, 1]

/**
 * The platform reports a progress-based timeline's own clock as a `CSSNumericValue` — `25%`, not
 * `250ms` — so a number formatter alone renders it as `NaN`. Units arrive spelled out.
 */
const round = (value) => {
  if (value == null) return '—'
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return `${Math.round(value * 100) / 100}`
  if (value.unit != null) return `${Math.round(value.value * 100) / 100}${value.unit === 'percent' ? '%' : value.unit}`

  return value.constructor?.name ?? String(value)
}
const list = values => values.map(round).join(' ')

/** Fixed-width rows, because these tables are read by eye and compared down a column. */
const table = (rows, gap = '  ') => {
  const widths = rows[0].map((_, column) => Math.max(...rows.map(row => String(row[column] ?? '').length)))

  return rows.map(row => row.map((cell, column) => String(cell ?? '').padEnd(widths[column])).join(gap).trimEnd()).join('\n')
}

const heading = text => console.log(`\n${text}\n${'─'.repeat(Math.max(text.length, 60))}`)

// ── the emission ────────────────────────────────────────────────────────────────────────────────
const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

const instance = await compiler(entry, root)
const emitted = build(instance, CANDIDATES)

console.log(`scroll-driven spike · ${CANDIDATES.length} candidates · ${emitted.css.length} bytes emitted`)

/** The composition, read out of the finished stylesheet rather than assumed. */
const sheet = postcss.parse(emitted.css)
const composition = (() => {
  let best = null

  sheet.walkRules((rule) => {
    const own = (rule.nodes ?? []).filter(node => node.type === 'decl')

    if (!own.some(node => node.prop === 'animation')) return

    if (!best || rule.selector.length > best.selector.length) best = rule
  })

  return best
})()

const splitTop = (value) => {
  const parts = []
  let current = ''
  let depth = 0

  for (const char of value) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''

      continue
    }

    current += char
  }

  parts.push(current)

  return parts.map(part => part.trim()).filter(Boolean)
}

// ── the page ────────────────────────────────────────────────────────────────────────────────────
const html = pageHtml(emitted.css, reader(
  ARMS.filter(arm => arm.where !== 'plain').map(({ classes, id, where }) => ({ classes, id, where: where ?? 'lane' })),
  TIMELINE_PROPERTIES,
))

const server = createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(html)
}).listen(0)

const origin = `http://127.0.0.1:${server.address().port}`

const browser = await chromium.launch()
console.log(`chromium ${browser.version()}`)

const context = await browser.newContext({ viewport: { height: 700, width: 1200 } })
const page = await context.newPage()

await page.goto(origin)
await page.waitForFunction(() => window.__ready === true)

/** Scroll, then let the frame that applies it land: scroll-driven progress is read off the frame. */
const scrollTo = async (target, fraction) => {
  await page.evaluate(([where, at]) => {
    const node = where === 'root' ? document.documentElement : document.getElementById(where)
    const max = where === 'root'
      ? document.documentElement.scrollHeight - innerHeight
      : node.scrollHeight - node.clientHeight

    node.scrollTop = Math.round(at * max)
  }, [target, fraction])

  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

const read = id => page.evaluate(arm => window.__read(arm), id)
const readAll = ids => page.evaluate(arms => window.__all(arms), ids)

/** A sweep: the same reading at each scroll position, so progress can be seen against position. */
const sweep = async (id, target = 'root', positions = SWEEP) => {
  const out = []

  for (const fraction of positions) {
    await scrollTo(target, fraction)
    out.push(await read(id))
  }

  return out
}

const scrollTargetFor = id => (id === 'aPaneScroll' ? 'pane' : id === 'aSelfScroll' ? 'aSelfScroll' : 'root')

// ── 0 · what the platform claims ────────────────────────────────────────────────────────────────
heading('0 · platform support')

const support = await page.evaluate(() => window.__support())

for (const [key, value] of Object.entries(support)) console.log(`  ${key.padEnd(20)} ${value}`)

// ── 1 · the composition, read off the stylesheet ────────────────────────────────────────────────
heading('1 · the composition a build writes')

const parts = Object.fromEntries(
  (composition?.nodes ?? [])
    .filter(node => node.type === 'decl')
    .map(node => [node.prop, node.value]),
)

const slots = splitTop(parts['animation'] ?? '').length
const timelines = splitTop(parts['animation-timeline'] ?? '')

console.log(`  slots (animation list)      ${slots}`)
console.log(`  timeline entries            ${timelines.length}`)
console.log(`  composition bytes           ${(composition?.toString().length ?? 0)}`)
console.log(`  real longhands declared     ${Object.keys(parts).join(', ')}`)
console.log(`\n  animation-timeline: ${(parts['animation-timeline'] ?? '—').slice(0, 200)}`)

// ── 2 · retarget ────────────────────────────────────────────────────────────────────────────────
heading('2 · retarget: the same motion, a different driver')

const retargetArms = ARMS.filter(arm => arm.group === 'A')

const retargetRows = [['arm', 'timeline', 'source', 'currentTime', 'progress', 'opacity']]

for (const arm of retargetArms) {
  const readings = await sweep(arm.id, scrollTargetFor(arm.id))
  const first = readings[0]

  retargetRows.push([
    arm.id,
    first.animations[0]?.timeline ?? '(none)',
    first.animations[0]?.source ?? '—',
    list(readings.map(reading => reading.animations[0]?.currentTime)),
    list(readings.map(reading => reading.animations[0]?.progress)),
    list(readings.map(reading => Number(reading.computed.opacity))),
  ])
}

console.log(table(retargetRows))

console.log('\n  computed animation-timeline, at rest:')
for (const arm of retargetArms) {
  await scrollTo(scrollTargetFor(arm.id), 0.5)

  const reading = await read(arm.id)

  console.log(`    ${arm.id.padEnd(14)} ${String(reading.computed['animation-timeline']).padEnd(34)} ${arm.note ?? ''}`)
}

console.log('\n  the timeline clock, as the platform reports it: ' + JSON.stringify(await page.evaluate(() => window.__shape('aScroll'))))

// ── 3 · the aggregate ───────────────────────────────────────────────────────────────────────────
heading('3 · the aggregate: several slots, more than one timeline')

for (const arm of ARMS.filter(entry => entry.group === 'B')) {
  const readings = await sweep(arm.id, scrollTargetFor(arm.id))
  const composed = readings[0].computed

  console.log(`\n  ${arm.id} — ${arm.note}`)
  console.log(`    computed animation-name      ${composed['animation-name']}`)
  console.log(`    computed animation-timeline  ${composed['animation-timeline']}`)

  const row = [['position', 'name', 'timeline', 'source', 'progress at 0 · ¼ · ½ · ¾ · 1']]

  readings[0].animations.forEach((animation, index) => {
    row.push([
      index,
      animation.name,
      animation.timeline ?? '(none)',
      animation.source ?? '—',
      readings.map(reading => round(reading.animations[index]?.progress)).join(' · '),
    ])
  })

  console.log(table(row, '  ').split('\n').map(line => `    ${line}`).join('\n'))
}

// ── 4 · every control ───────────────────────────────────────────────────────────────────────────
heading('4 · every existing control, on a scroll-driven slot')

const controls = [
  ['animation-duration-600', 'animation-duration', 'duration'],
  ['animation-duration-[auto]', 'animation-duration', 'duration (auto)'],
  ['animation-delay-200', 'animation-delay', 'delay'],
  ['animation-timing-function-linear', 'animation-timing-function', 'timing-function'],
  ['animation-direction-reverse', 'animation-direction', 'direction'],
  ['animation-iteration-count-2', 'animation-iteration-count', 'iteration-count'],
  ['animation-fill-mode-none', 'animation-fill-mode', 'fill-mode'],
  ['animation-play-state-paused', 'animation-play-state', 'play-state'],
  ['animation-composition-add', 'animation-composition', 'composition'],
]

const controlRows = [['control', 'computed (document)', 'computed (scroll)', 'progress across a scroll sweep']]

for (const [candidate, property, label] of controls) {
  const arm = ARMS.find(entry => entry.classes === `animate-fade-in ${candidate} animation-timeline-scroll`)

  if (!arm) {
    controlRows.push([label, '(no arm)', '(no arm)', '—'])

    continue
  }

  const scrollReadings = await sweep(arm.id)
  const documentArm = ARMS.find(entry => entry.classes === `animate-fade-in ${candidate}`)
  const documentReading = documentArm ? (await sweep(documentArm.id))[2] : null

  controlRows.push([
    label,
    documentReading
      ? `${documentReading.computed[property] ?? '—'} · timing ${documentReading.animations[0]?.duration}`
      : '—',
    `${scrollReadings[0].computed[property] ?? '—'} · timing ${scrollReadings[0].animations[0]?.duration}`,
    list(scrollReadings.map(reading => reading.animations[0]?.progress))
    + `   (delay ${scrollReadings[2].animations[0]?.delay}, iterations ${scrollReadings[2].animations[0]?.iterations}, direction ${scrollReadings[2].animations[0]?.direction}, fill ${scrollReadings[2].animations[0]?.fill}, ${scrollReadings[2].animations[0]?.playState})`,
  ])
}

console.log(table(controlRows))

// ── 4b · duration and delay, at a finer grain ───────────────────────────────────────────────────
heading('4b · duration and delay: what a time value means once the driver is scroll')

const FINE = [0, 0.25, 0.5, 0.75, 1]
const semanticsRows = [['arm', 'computed duration', 'computed delay', 'resolved duration per position', 'timeline %', 'progress per position']]

for (const id of ['aScroll', 'cDurationS', 'cDuration2sS', 'cDurationAutoS', 'cDelayS', 'cDelay600S', 'bDurations']) {
  const readings = await sweep(id, 'root', FINE)

  semanticsRows.push([
    id,
    readings[0].computed['animation-duration'],
    readings[0].computed['animation-delay'],
    readings[0].animations.map(animation => round(animation.duration)).join(' '),
    list(readings.map(reading => reading.animations[0]?.currentTime)),
    readings[0].animations
      .map((animation, index) => `${index} ${animation.name}: ${list(readings.map(reading => reading.animations[index]?.progress))}`)
      .join('   '),
  ])
}

console.log(table(semanticsRows))

// ── 5 · animation-range ─────────────────────────────────────────────────────────────────────────
heading('5 · animation-range: what Jumi writes, and what the platform does with a range')

const rangeRows = [['arm', 'computed animation-range', 'progress across a 12-step scroll sweep']]
const COARSE = [...Array(13).keys()].map(index => index / 12)

for (const id of ['dRangeJumi', 'dRangeJumiArb', 'dPlainPct', 'dPlainNamed', 'dPlainMixed', 'dPlainLonghand']) {
  const readings = await sweep(id, 'root', COARSE)

  rangeRows.push([
    id,
    readings[6].computed['animation-range'],
    list(readings.map(reading => reading.animations[0]?.progress)),
  ])
}

console.log(table(rangeRows))

// ── 5b · the range value itself ─────────────────────────────────────────────────────────────────
heading('5b · the range value: what is legal, and what a composed default would be')

const spellingRows = [['arm', 'declared animation-range', 'computed', 'progress across a 13-point sweep']]

for (const id of ['rNormal', 'rNormalOffsets', 'rOffsets', 'rCoverView', 'rNormalScroll', 'rCoverScroll']) {
  const readings = await sweep(id, 'root', COARSE)

  spellingRows.push([
    id,
    { rCoverScroll: 'cover 0% cover 100%', rCoverView: 'cover 0% cover 100%', rNormal: 'normal', rNormalOffsets: 'normal 0% normal 100%', rNormalScroll: 'normal', rOffsets: '0% 100%' }[id],
    readings[6].computed['animation-range'],
    list(readings.map(reading => reading.animations[0]?.progress)),
  ])
}

console.log(table(spellingRows))

console.log('\n  and the range against the shorthand, which is where a reset would show:')
for (const id of ['rOrderBefore', 'rOrderAfter']) {
  const reading = (await sweep(id, 'root', COARSE))[0]

  console.log(`    ${id.padEnd(14)} declared 25% 75% → computed ${reading.computed['animation-range']}`)
}

/** The two instruments a computed `normal` cannot separate: parse support, and a live substitution. */
const parseSupport = await page.evaluate(() => Object.fromEntries([
  'normal',
  'normal 0%',
  'normal 0% normal 100%',
  '0% 100%',
  'cover 0% cover 100%',
  'entry 0% cover 50%',
  // What a *component* spelling produces when `normal` is one of its values: the keyword joined to
  // an offset, on one side only. The pair is the case that was measured illegal; these are the
  // one-sided shapes a `-start-timeline-normal` control would write.
  'normal 0% 100%',
  '0% normal 100%',
  // And the bare range names, which the whole-value control would write.
  'entry',
  'cover',
  'contain',
  'exit',
  // The shapes a *half* control produces when it writes a complete start or end: a named range
  // against the other half's default offset, and a name against a name.
  'entry 100%',
  'entry 50%',
  'entry cover',
  'entry-crossing 100%',
  '0% entry',
].map(value => [value, window.__parse('animation-range', value)])))

console.log('\n  CSS.supports("animation-range", …):')
for (const [value, ok] of Object.entries(parseSupport)) console.log(`    ${value.padEnd(22)} ${ok}`)

const substitutionRows = [['arm', 'declaration', 'computed animation-range', 'means']]

for (const [id, note] of [
  ['rVarScoped', 'the live position keeps its range'],
  ['rVarGlobal', 'the fallback alone is the value'],
  ['rVarMixed', 'one position set, one falling back — the emission\'s shape'],
  ['rVarMixedValid', 'the same list with a legal fallback, as the control'],
  ['rEmpty', 'a composed default where the name part is absent'],
  ['rEmptySet', 'the same composition with a name and an end offset'],
]) {
  const readings = await sweep(id, 'root', COARSE)

  substitutionRows.push([id, 'var(...)', readings[6].computed['animation-range'], note])
}

console.log(`\n${table(substitutionRows)}`)

const fallbackSupport = await page.evaluate(() => ({
  'var(--x,)': window.__parse('animation-range', 'var(--x,)'),
  'var(--x,) var(--y, 0%)': window.__parse('animation-range', 'var(--x,) var(--y, 0%)'),
  'var(--x,) var(--y, 0%) var(--z,) var(--w, 100%)': window.__parse('animation-range', 'var(--x,) var(--y, 0%) var(--z,) var(--w, 100%)'),
}))

console.log('\n  parse support for the composed forms:')
for (const [value, ok] of Object.entries(fallbackSupport)) console.log(`    ${value.padEnd(48)} ${ok}`)

console.log('\n  the shorthand resets the two longhands it cannot set:')
for (const id of ['dOrderBefore', 'dOrderAfter']) {
  const reading = (await sweep(id))[0]

  console.log(`    ${id.padEnd(14)} animation-timeline ${String(reading.computed['animation-timeline']).padEnd(24)} animation-composition ${reading.computed['animation-composition']}`)
}

// ── 6 · named timelines ─────────────────────────────────────────────────────────────────────────
heading('6 · named timelines: declaring, consuming, scope, collision')

const namedRows = [['arm', 'computed animation-timeline', 'timeline', 'source', 'currentTime at pane 0 · ½ · 1']]

for (const id of ['eNamed', 'eNamedOutside', 'eNamedMissing', 'eViewSelf', 'eViewNamed', 'eDup', 'bArbNamed']) {
  const readings = await sweep(id, 'pane', [0, 0.5, 1])
  const rootReadings = await sweep(id, 'root', [0, 0.5, 1])

  namedRows.push([
    id,
    readings[0].computed['animation-timeline'],
    readings[0].animations[0]?.timeline ?? '(none)',
    readings[0].animations[0]?.source ?? '—',
    `${list(readings.map(reading => reading.animations[0]?.currentTime))}  ·  root sweep ${list(rootReadings.map(reading => reading.animations[0]?.currentTime))}`,
  ])
}

console.log(table(namedRows))

// ── 7 · reduced motion ──────────────────────────────────────────────────────────────────────────
heading('7 · reduced motion: who stops scrolling from driving a motion')

const quiet = await browser.newContext({ reducedMotion: 'reduce', viewport: { height: 700, width: 1200 } })
const quietPage = await quiet.newPage()

await quietPage.goto(origin)
await quietPage.waitForFunction(() => window.__ready === true)

const reducedRows = [['arm', 'context', 'timeline', 'currentTime at 0 · ½ · 1', 'animations']]

for (const id of ['fScroll', 'fClamped', 'fMotionSafe', 'aScroll']) {
  const out = []

  for (const fraction of [0, 0.5, 1]) {
    await quietPage.evaluate((at) => {
      document.documentElement.scrollTop = Math.round(at * (document.documentElement.scrollHeight - innerHeight))
    }, fraction)
    await quietPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    out.push(await quietPage.evaluate(arm => window.__read(arm), id))
  }

  reducedRows.push([
    id,
    'reduce',
    out[0].animations[0]?.timeline ?? '(none)',
    list(out.map(reading => reading.animations[0]?.currentTime)),
    `${out[0].animations.length} animation(s)`,
  ])
}

await quiet.close()

// The same arms again where motion is welcome, so the difference is the context and not the arm.
for (const id of ['fScroll', 'fClamped', 'fMotionSafe']) {
  const out = []

  for (const fraction of [0, 0.5, 1]) {
    await scrollTo('root', fraction)
    out.push(await read(id))
  }

  reducedRows.push([
    id,
    'no-preference',
    out[0].animations[0]?.timeline ?? '(none)',
    list(out.map(reading => reading.animations[0]?.currentTime)),
    `${out[0].animations.length} animation(s)`,
  ])
}

console.log(table(reducedRows))

// ── 8 · cost ────────────────────────────────────────────────────────────────────────────────────
heading('8 · cost: the timeline list, the inspector, and the renderer')

const session = await context.newCDPSession(page)

await session.send('Performance.enable')
await session.send('DOM.enable')
await session.send('CSS.enable')

const metrics = async () => Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(entry => [entry.name, entry.value]))

/** Recalc while scrolling, against the same sweep with the timeline arms hidden. */
const scrollCost = async () => {
  const before = await metrics()

  for (let step = 0; step <= 40; step += 1) {
    await page.evaluate((at) => {
      document.documentElement.scrollTop = Math.round(at * (document.documentElement.scrollHeight - innerHeight))
    }, step / 40)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)))
  }

  const after = await metrics()

  return {
    layout: Math.round((after.LayoutCount ?? 0) - (before.LayoutCount ?? 0)),
    recalc: Math.round((after.RecalcStyleCount ?? 0) - (before.RecalcStyleCount ?? 0)),
    recalcMs: Math.round(((after.RecalcStyleDuration ?? 0) - (before.RecalcStyleDuration ?? 0)) * 1000),
  }
}

const allTimelines = await scrollCost()

await page.evaluate(() => {
  for (const arm of document.querySelectorAll('#lane > *')) {
    arm.dataset.classes = arm.className
    arm.className = arm.className.replace(/animation-timeline-\S*/g, '')
  }
})

const withoutTimelines = await scrollCost()

await page.evaluate(() => {
  for (const arm of document.querySelectorAll('#lane > *')) arm.className = arm.dataset.classes
})

console.log(table([
  ['page state', 'RecalcStyleCount', 'RecalcStyleDuration ms', 'LayoutCount'],
  ['every timeline arm live', allTimelines.recalc, allTimelines.recalcMs, allTimelines.layout],
  ['the same page, timelines removed', withoutTimelines.recalc, withoutTimelines.recalcMs, withoutTimelines.layout],
]))

/** What the inspector is handed for one animated element — the measurement `style-cost.md` uses. */
const matchedBytes = async (id) => {
  const { root: documentRoot } = await session.send('DOM.getDocument', { depth: -1 })
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: documentRoot.nodeId, selector: `#${id}` })
  const matched = await session.send('CSS.getMatchedStylesForNode', { nodeId })

  return Buffer.byteLength(JSON.stringify(matched))
}

const inspectorRows = [['arm', 'slots', 'timeline entries', 'getMatchedStylesForNode bytes']]

for (const id of ['aDtm', 'aScroll', 'bMixed', 'bBoth']) {
  const reading = await read(id)

  await scrollTo('root', 0.5)

  inspectorRows.push([
    id,
    reading.animations.length,
    splitTop(reading.computed['animation-timeline'] ?? '').length,
    await matchedBytes(id),
  ])
}

console.log(`\n${table(inspectorRows)}`)

/** Composited or not, straight from the protocol: the Animation domain names the thread. */
const started = []
const updated = []

session.on('Animation.animationStarted', event => started.push(event))
session.on('Animation.animationUpdated', event => updated.push(event))

await session.send('Animation.enable')
await page.reload()

await page.waitForFunction(() => window.__ready === true)
await scrollTo('root', 0.5)

const reported = started.filter(event => event.animation.name?.startsWith('jumi-'))

console.log(`\n  Animation domain, ${reported.length} jumi animations announced`)
console.log(`  fields on one of them: ${Object.keys(reported[0]?.animation ?? {}).sort().join(', ') || '(none)'}`)

/**
 * Whether the driver keeps the animation on the compositor is the one question here that was NOT
 * answered, and the way it failed is worth keeping.
 *
 * The instrument was `Animation.animationUpdated`, on the theory that an animation the compositor
 * drives is not the main thread's to update — so a scroll-driven slot would report nothing and a
 * time-driven one would report progress. The control arm (`gWidthTime`: the same property on the
 * document timeline) was put there to make that falsifiable. **It reported nothing too**, so the
 * zero meant the protocol sends no such event for these CSS animations, and the reading measured
 * the instrument rather than the subject. No claim about threading is made from it.
 *
 * The one positive signal in the same direction is measured, not inferred: a 40-step scroll costs
 * no style recalculation at all, with the timeline arms live or removed.
 */
const tally = (events) => {
  const counts = events.reduce((out, event) => {
    const name = event.animation.name ?? '(unnamed)'

    out[name] = (out[name] ?? 0) + 1

    return out
  }, {})

  const entries = Object.entries(counts)

  return entries.length ? entries.map(([name, count]) => `${name}=${count}`).join(' ') : '(none)'
}

updated.length = 0
await page.waitForTimeout(400)

const whileTimePasses = tally(updated)

updated.length = 0

for (let step = 0; step <= 20; step += 1) {
  await page.evaluate((at) => {
    document.documentElement.scrollTop = Math.round(at * (document.documentElement.scrollHeight - innerHeight))
  }, step / 20)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)))
}

console.log(`\n  Animation.animationUpdated while time passes:  ${whileTimePasses}`)
console.log(`  Animation.animationUpdated while scrolling:    ${tally(updated)}   ← the control is empty, so this instrument is vacuous`)

/** How the timeline list scales with slots: the only list that grows and is not hoisted. */
const scaleCandidates = [
  'animate-fade-in',
  'animation-timeline-scroll',
  ...[...Array(30).keys()].map(index => `animate-rotate-${index + 1}`),
]
const scaleCss = build(await compiler(entry, root), scaleCandidates).css
const scaleSheet = postcss.parse(scaleCss)
let scaleComposition = null

scaleSheet.walkRules((rule) => {
  const own = (rule.nodes ?? []).filter(node => node.type === 'decl')

  if (!own.some(node => node.prop === 'animation')) return

  if (!scaleComposition || rule.selector.length > scaleComposition.selector.length) scaleComposition = rule
})

const scaleParts = Object.fromEntries((scaleComposition?.nodes ?? []).filter(node => node.type === 'decl').map(node => [node.prop, node.value]))

console.log(`\n  with 31 slots: animation list ${splitTop(scaleParts['animation'] ?? '').length} entries, animation-timeline ${splitTop(scaleParts['animation-timeline'] ?? '').length} entries, timeline list ${(scaleParts['animation-timeline'] ?? '').length} bytes, whole composition ${scaleComposition?.toString().length ?? 0} bytes`)

await session.detach()
await browser.close()
server.close()
