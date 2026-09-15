#!/usr/bin/env node
/**
 * Can a keyframe animation carry a discrete property change?
 *
 * Adjacent to the entry/exit work, and deliberately narrow: the transition story is already complete, and
 * this only decides whether *animations* can intentionally move things like `display`, or whether discrete
 * state motion is transition-only. Either answer is a note, not a feature.
 *
 * The question is asked in both directions because the first version of this probe only asked one of them,
 * and got a wrong answer for a reason worth keeping: an element with `display: none` **has no animations at
 * all** in Chromium. Nothing is computed for it, so nothing is created — which reads exactly like "the
 * engine cannot animate display". So each case here starts from a *rendered* element and animates away from
 * that state, and the entry direction is measured as its own fact rather than as a missing animation.
 *
 * Per case: does an `Animation` materialise, does the property change, and *when*; then fill-mode,
 * iteration, and a scroll timeline as three separate questions on top.
 *
 * Run: pnpm spike:discrete-keyframes
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

/** `visible` is the property's resting value in each case, so the flip has somewhere to travel to. */
const CASES = [
  ['display', 'block', 'none'],
  ['content-visibility', 'visible', 'hidden'],
  ['visibility', 'visible', 'hidden'],
  ['overlay', 'auto', 'none'],
]

/**
 * The page.
 *
 * Sampling notes, kept here rather than inside the template: a browser fixture *is* one template literal,
 * so a backtick anywhere inside it — even in a comment, even around a single word — ends the template and
 * the file fails to parse. Rather than remember that a tenth time, prose with code spans lives out here and
 * the fixture carries only short markers.
 *
 * A `display: none` element has no boxes, so a paused animation on one cannot be read for every property —
 * which is why each case starts rendered and animates away from that state, and why the sample reports
 * everything a case could be told apart by. Seeking a progress-based animation takes a percent, not a time.
 */
const htmlFor = () => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; font: 12px/1.4 system-ui; }
  /* Rendered from the start: a display:none element gets no animations at all. */
  #board > * { display: block; width: 40px; height: 20px; background: #333; margin: 4px; }
  #tail { height: 1400px; }
${CASES.map(
  ([
    property,
    from,
    to,
  ]) => `  #${property.replaceAll('-', '')} { ${property}: ${from}; }
  @keyframes leave-${property.replaceAll('-', '')} { to { ${property}: ${to} } }
  #${property.replaceAll('-', '')} { animation: leave-${property.replaceAll('-', '')} 1s linear both; }`,
).join('\n')}
  /* The same motion, three separate questions. */
  #filled { display: block; animation: leave-display 1s linear none; }
  #iterated { display: block; animation: leave-display 1s linear both; animation-iteration-count: 3; }
  #scrolled { display: block; animation: leave-display 1s linear both; animation-timeline: scroll(); }
  /* Both endpoints written, so the question is interpolation rather than an implicit from-frame. */
  #bothframes { display: block; animation: flip-both 1s linear both; }
  #bothvisibility { visibility: visible; animation: flip-visibility 1s linear both; }
  @keyframes flip-both { from { display: block } to { display: none } }
  @keyframes flip-visibility { from { visibility: visible } to { visibility: hidden } }
  /* The entry direction, as its own case. */
  #entry { display: none; animation: enter-display 1s linear both; }
  @keyframes enter-display { to { display: block } }
  dialog { display: none; }
  dialog[open] { display: block; }
  @keyframes leave-overlay { to { overlay: none } }
  #modal { animation: leave-overlay 1s linear both; }
</style></head>
<body>
<div id="board">
  <div id="display"></div>
  <div id="contentvisibility"></div>
  <div id="visibility"></div>
  <div id="overlay"></div>
  <div id="filled"></div>
  <div id="iterated"></div>
  <div id="scrolled"></div>
  <div id="bothframes"></div>
  <div id="bothvisibility"></div>
  <div id="entry"></div>
</div>
<dialog id="modal">modal</dialog>
<div id="tail"></div>
<script>
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const read = (id) => {
    const node = document.getElementById(id)
    const style = getComputedStyle(node)

    return {
      contentVisibility: style.contentVisibility,
      display: style.display,
      overlay: style.overlay,
      visibility: style.visibility,
    }
  }

  /** The animation objects targeting an element, and what each one carries. */
  window.__animations = (id) => {
    const node = document.getElementById(id)

    return [...document.getAnimations()]
      .filter(animation => animation.effect?.target === node)
      .map(animation => ({
        duration: String(animation.effect.getComputedTiming().duration),
        fill: getComputedStyle(node).animationFillMode,
        iterations: String(animation.effect.getComputedTiming().iterations),
        keyframes: animation.effect.getKeyframes().map(keyframe => ({
          display: keyframe.display ?? null,
          offset: keyframe.offset,
        })),
        timeline: animation.timeline?.constructor?.name ?? 'none',
      }))
  }

  /**
   * Sample at fractions of the whole animation, seeking a progress-based one by percent.
   */
  window.__sample = async (id, fractions) => {
    const node = document.getElementById(id)
    const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

    if (!animations.length) return { samples: [], timeline: 'none' }

    const progressBased = animations[0].timeline?.constructor?.name !== 'DocumentTimeline'
    const raw = animations[0].effect.getComputedTiming().duration
    const duration = typeof raw === 'number' ? raw : raw?.value ?? 1000
    const samples = []

    for (const fraction of fractions) {
      for (const animation of animations) {
        animation.pause()
        animation.currentTime = progressBased
          ? new CSSUnitValue(fraction * 100, 'percent')
          : Math.round(fraction * duration)
      }

      await frame()
      samples.push({ at: fraction, ...read(id) })
    }

    return { samples, timeline: animations[0].timeline?.constructor?.name ?? 'none' }
  }

  window.__support = (list) => list.map(([property, value]) => [property, value, CSS.supports(property, value)])
  window.__ready = true
</script>
</body></html>`

const server = (await import('node:http'))
  .createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(htmlFor())
  })
  .listen(0)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${server.address().port}`)
await page.waitForFunction(() => window.__ready === true)

const line = (label, value) => console.log(`  ${label.padEnd(34)} ${value}`)

// ── 1 · one case at a time: does it materialise, does it change, and when ───────────────────────
console.log('\n1 · a keyframe that sets a discrete property')
console.log('─'.repeat(88))

const FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

for (const [property, from, to] of CASES) {
  const id = property.replaceAll('-', '')
  const animations = await page.evaluate(
    target => window.__animations(target),
    id,
  )
  const { samples } = await page.evaluate(
    ({ fractions, target }) => window.__sample(target, fractions),
    { fractions: FRACTIONS, target: id },
  )

  const shown = samples
    .map(
      sample =>
        sample[
          property === 'content-visibility' ? 'contentVisibility' : property
        ],
    )
    .join(' → ')

  line(
    `${property}: ${from} → ${to}`,
    animations.length
      ? `Animation ✓ · ${shown}`
      : `no Animation object · ${shown}`,
  )
}

// ── 2 · the entry direction, which is a different question ──────────────────────────────────────
console.log('\n2 · the same property, animating inwards')
console.log('─'.repeat(88))

const entry = await page.evaluate(async () => {
  const node = document.getElementById('entry')
  const animations = [...document.getAnimations()].filter(
    animation => animation.effect?.target === node,
  )

  return {
    animations: animations.length,
    display: getComputedStyle(node).display,
  }
})

line(
  'display: none → block',
  entry.animations
    ? `${entry.animations} Animation object(s), display ${entry.display}`
    : `no Animation object — a display:none element is never computed, so nothing is created (display ${entry.display})`,
)

// ── 3 · fill-mode, iteration, and a scroll timeline ─────────────────────────────────────────────
console.log('\n3 · fill, iteration, and a scroll timeline')
console.log('─'.repeat(88))

const filled = await page.evaluate(
  ({ fractions }) => window.__sample('filled', fractions),
  { fractions: [1] },
)
line('fill: none, at the very end', `display ${filled.samples[0]?.display}`)
line(
  'fill: none, after the end (idle)',
  await page.evaluate(async () => {
    for (const animation of document.getAnimations())
      if (animation.effect?.target?.id === 'filled') animation.finish()

    await new Promise(resolve => requestAnimationFrame(resolve))

    return `display ${getComputedStyle(document.getElementById('filled')).display}`
  }),
)

const iterated = await page.evaluate(
  ({ fractions }) => window.__sample('iterated', fractions),
  { fractions: [0.1, 0.6, 1.1, 1.6, 2.1, 2.6] },
)
line(
  '3 iterations, six samples',
  iterated.samples.map(sample => `${sample.at}:${sample.display}`).join('  '),
)

const scrolled = await page.evaluate(
  ({ fractions }) => window.__sample('scrolled', fractions),
  { fractions: FRACTIONS },
)
line(
  'on a scroll timeline',
  `${scrolled.timeline} · ${scrolled.samples.map(sample => `${sample.at}:${sample.display}`).join('  ')}`,
)

// Around the midpoint, with both endpoints written: the difference between "a discrete property flips at 50%"
// and "it never interpolates at all" shows up only here.
const bothFrames = await page.evaluate(
  ({ fractions }) => window.__sample('bothframes', fractions),
  { fractions: [0.4, 0.5, 0.6, 1] },
)
const bothVisibility = await page.evaluate(
  ({ fractions }) => window.__sample('bothvisibility', fractions),
  { fractions: [0.4, 0.5, 0.6, 1] },
)

line(
  'display, both frames written',
  bothFrames.samples.map(sample => `${sample.at}:${sample.display}`).join('  '),
)
line(
  'visibility, both frames written',
  bothVisibility.samples
    .map(sample => `${sample.at}:${sample.visibility}`)
    .join('  '),
)

// ── 4 · the top layer, where `overlay` means something ──────────────────────────────────────────
console.log('\n4 · overlay, which only exists in the top layer')
console.log('─'.repeat(88))

const overlaySupport = await page.evaluate(() =>
  window.__support([
    ['overlay', 'auto'],
    ['overlay', 'none'],
    ['transition-behavior', 'allow-discrete'],
  ]),
)

for (const [property, value, ok] of overlaySupport)
  line(`${property}: ${value}`, ok ? 'supported' : 'REFUSED')

const modal = await page.evaluate(async () => {
  const node = document.getElementById('modal')

  node.showModal()
  await new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  )

  const animations = [...document.getAnimations()].filter(
    animation => animation.effect?.target === node,
  )

  return {
    animations: animations.length,
    overlay: getComputedStyle(node).overlay,
  }
})

line(
  'a modal dialog with a keyframe',
  `${modal.animations} Animation object(s), overlay ${modal.overlay}`,
)

await browser.close()
server.close()

console.log('')
