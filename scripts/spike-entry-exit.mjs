#!/usr/bin/env node
/**
 * Entry and exit — the browser's lifecycle model, before Jumi at all.
 *
 * The question this has to answer is architectural: **does Jumi need an entry/exit transition
 * abstraction, or has the platform already reduced it to ordinary transition properties plus
 * `transition-behavior` and `@starting-style`?** So the order is the CTO's, and it is deliberate:
 * lifecycle and flip semantics first, Jumi's own substrate last, and nothing invented in between.
 *
 *   1. can an element transition when it enters or leaves the render tree at all?
 *   2. what does `allow-discrete` change — not *whether* a discrete property flips, but *when*?
 *   3. what does `@starting-style` supply, and for which of the four ways an element becomes present?
 *   4. do `display` and `content-visibility` have their own flip timing?
 *   5. can a transition run on anything but document time?
 *   6. Jumi's existing transition composition, read rather than assumed.
 *
 * Run: pnpm spike:entry-exit
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const { build, compiler } = await import('./lib/compile.mjs')

/**
 * Each case is a closed state, an open state, and the transition between them. `@starting-style` appears
 * only where a case is about it, so its absence is measurable rather than implied.
 */
const CASES = [
  {
    about: 'display none → block, shorthand allow-discrete',
    id: 'shorthand',
    open: 'display: block; opacity: 1',
    start: true,
    style: 'display: none; opacity: 0; transition: opacity 300ms, display 300ms allow-discrete',
  },
  {
    about: 'the same, allow-discrete as a longhand',
    id: 'longhand',
    open: 'display: block; opacity: 1',
    start: true,
    style: 'display: none; opacity: 0; transition-property: opacity, display; transition-duration: 300ms; transition-behavior: allow-discrete',
  },
  {
    about: 'the same again, with no allow-discrete at all',
    id: 'refused',
    open: 'display: block; opacity: 1',
    style: 'display: none; opacity: 0; transition: opacity 300ms, display 300ms',
  },
  {
    about: 'content-visibility hidden → visible',
    id: 'contentVisibility',
    open: 'content-visibility: visible; opacity: 1',
    style: 'content-visibility: hidden; opacity: 0; transition: opacity 300ms, content-visibility 300ms allow-discrete',
  },
  {
    about: 'visibility hidden → visible',
    id: 'visibility',
    open: 'visibility: visible; opacity: 1',
    style: 'visibility: hidden; opacity: 0; transition: opacity 300ms, visibility 300ms allow-discrete',
  },
  {
    about: 'an ordinary style change, nothing discrete',
    id: 'ordinary',
    open: 'opacity: 1',
    style: 'opacity: 0; transition: opacity 300ms',
  },
]

/** `display: block` is the state `dialog` reports while open, so the exit case is the same rule closed. */
const htmlFor = () => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; font: 12px/1.4 system-ui; }
  #board { position: relative; padding: 8px; }
  #board > * { width: 40px; height: 20px; background: #333; margin: 4px; color: #333; font-size: 8px; }
${CASES.map((item) => `  #${item.id} { ${item.style} }
  #${item.id}.open { ${item.open} }
${item.start ? `  @starting-style { #${item.id}.open { opacity: 0; } }` : ''}`).join('\n')}
  /* A newly inserted element: the same styles, once with a starting style and once without. The first
     version of this probe gave the element no transition at all, so "no transition ran" was its own
     bug rather than an answer. */
  .ins { width: 40px; height: 20px; background: #333; margin: 4px; opacity: 1; transition: opacity 300ms; }
  @starting-style { .ins-start { opacity: 0; } }
  /* Top layer: neither of these is in the flow, and both flip display and overlay to enter it. */
  #modal { transition: opacity 300ms, display 300ms allow-discrete, overlay 300ms allow-discrete; opacity: 0;
    display: none; }
  #modal.open { opacity: 1; display: block; }
  #modal::backdrop { background: rgba(0,0,0,.2); }
  [popover] { transition: opacity 300ms, display 300ms allow-discrete, overlay 300ms allow-discrete; opacity: 0; }
  [popover]:popover-open { opacity: 1; }
  @starting-style { #modal.open { opacity: 0; } [popover]:popover-open { opacity: 0; } }
</style></head>
<body>
<div id="board">
${CASES.map(item => `  <div id="${item.id}"></div>`).join('\n')}
  <dialog id="modal"><p>modal</p></dialog>
  <div id="pop" popover>popover</div>
  <button id="anchor">anchor</button>
</div>
<script>
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  /** Every transition the element is running, and where its flip lands. */
  window.__transition = async (id, open, fractions) => {
    const node = document.getElementById(id)
    const live = () => [...document.getAnimations()]
      .filter(animation => animation.effect?.target === node && animation.transitionProperty)

    node.classList.toggle('open', open)
    await frame()

    let running = live()

    if (!running.length) {
      return { properties: [], samples: [], settled: false }
    }

    const duration = running[0].effect.getComputedTiming().duration
    const samples = []

    for (const fraction of fractions) {
      for (const animation of running) {
        animation.pause()
        animation.currentTime = Math.round(fraction * (typeof duration === 'number' ? duration : 300))
      }

      await frame()

      const style = getComputedStyle(node)

      samples.push({
        at: fraction,
        contentVisibility: style.contentVisibility,
        display: style.display,
        opacity: Number(style.opacity).toFixed(2),
        visible: node.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
      })

      // Re-read: a discrete flip can end the transition it belongs to.
      running = running.filter(animation => animation.playState !== 'idle')
    }

    return {
      properties: [...new Set([...live(), ...running].map(animation => animation.transitionProperty))],
      samples,
      settled: true,
    }
  }

  /** A newly inserted element, with and without a starting style. */
  window.__insert = async (starting) => {
    const node = document.createElement('div')

    node.className = starting ? 'ins ins-start' : 'ins'
    document.getElementById('board').append(node)

    await frame()

    const running = [...document.getAnimations()].filter(animation => animation.effect?.target === node)
    const computed = getComputedStyle(node).opacity

    node.remove()

    return { computed, properties: running.map(animation => animation.transitionProperty ?? animation.animationName ?? '?') }
  }

  window.__supports = (list) => list.map(([property, value]) => [property, value, CSS.supports(property, value)])
  window.__ready = true
</script>
</body></html>`

const server = (await import('node:http')).createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(htmlFor())
}).listen(0)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${server.address().port}`)
await page.waitForFunction(() => window.__ready === true)

const FRACTIONS = [0, 0.25, 0.5, 0.75, 1]
const line = (label, value) => console.log(`  ${label.padEnd(38)} ${value}`)
const show = samples => samples
  .map(sample => `${sample.display === 'none' ? 'none' : sample.display}/${sample.opacity}${sample.visible ? '+' : '-'}`)
  .join('  ')

// ── 1 & 2 & 4 · lifecycle, flip timing, and the two properties with their own rules ──────────────
console.log('\n1 · entering and leaving, and where the flip lands')
console.log('─'.repeat(86))

for (const item of CASES) {
  const opened = await page.evaluate(({ fractions, id }) => window.__transition(id, true, fractions), { fractions: FRACTIONS, id: item.id })
  const closed = await page.evaluate(({ fractions, id }) => window.__transition(id, false, fractions), { fractions: FRACTIONS, id: item.id })

  line(item.about, `open ${opened.properties.join('+') || '—'}`)
  line('  in  (display/opacity/visible)', opened.settled ? show(opened.samples) : 'no transition ran')
  line('  out (display/opacity/visible)', closed.settled ? show(closed.samples) : 'no transition ran')
}

// ── 3 · the four ways an element becomes present ────────────────────────────────────────────────
console.log('\n3 · @starting-style, and what it is for')
console.log('─'.repeat(86))

for (const starting of [false, true]) {
  const inserted = await page.evaluate(start => window.__insert(start), starting)

  line(`a newly inserted element${starting ? ' with a starting style' : ''}`,
    inserted.properties.join('+') || `no transition (opacity ${inserted.computed})`)
}

line('from display:none (shorthand case)', 'covered above: the open state is entered from `display: none`')
line('into the top layer (dialog)', 'see below')
line('an ordinary style change (already present)', 'covered above: `opacity` only, one transition')

const modal = await page.evaluate(async () => {
  const node = document.getElementById('modal')

  node.classList.add('open')
  node.showModal()

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const running = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

  return { properties: [...new Set(running.map(animation => animation.transitionProperty))], top: node.matches(':modal') }
})

line('a dialog entering the top layer', `${modal.properties.join('+') || '—'} · :modal ${modal.top}`)

const popover = await page.evaluate(async () => {
  const node = document.getElementById('pop')

  node.showPopover()

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const running = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

  return {
    open: node.matches(':popover-open'),
    properties: [...new Set(running.map(animation => animation.transitionProperty))],
    overlay: getComputedStyle(node).overlay,
  }
})

line('a popover entering the top layer', `${popover.properties.join('+') || '—'} · overlay ${popover.overlay} · open ${popover.open}`)

// ── 5 · timelines ───────────────────────────────────────────────────────────────────────────────
console.log('\n5 · can anything other than document time drive one?')
console.log('─'.repeat(86))

const timelines = await page.evaluate(() => window.__supports([
  ['transition-timeline', 'scroll()'],
  ['transition-behavior', 'allow-discrete'],
  ['overlay', 'auto'],
  ['content-visibility', 'hidden'],
  ['@starting-style', 'x'],
]))

for (const [property, value, ok] of timelines) line(`${property}: ${value}`, ok ? 'supported' : 'REFUSED')

const scrollFlip = await page.evaluate(async () => {
  const sheet = document.createElement('style')

  sheet.textContent = '@keyframes flip { to { display: block } } #probe { display: none; animation: flip 1s linear both; }'
  document.head.append(sheet)

  const node = document.createElement('div')

  node.id = 'probe'
  document.body.append(node)

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)
  const before = getComputedStyle(node).display

  // Halfway is where a discrete step lands, if a keyframe can carry one at all.
  for (const animation of animations) {
    animation.pause()
    animation.currentTime = 500
  }

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const middle = getComputedStyle(node).display

  node.remove()
  sheet.remove()

  return { animations: animations.length, before, middle }
})

line('a discrete property inside @keyframes', scrollFlip.animations
  ? `animations ${scrollFlip.animations}, display ${scrollFlip.before} at 0 → ${scrollFlip.middle} at 50%`
  : 'NOT MEASURED — the probe\'s animation never materialises, so this says nothing about the engine')

// ── 6 · Jumi's own substrate ────────────────────────────────────────────────────────────────────
console.log('\n6 · Jumi, read rather than assumed')
console.log('─'.repeat(86))

const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

const CANDIDATES = [
  // Jumi's transition spelling: `transition-property/<motion>` names the motion, and everything else
  // configures it. Without the modifier a control writes the global variable and no motion exists — which
  // is why the first version of this section read "nothing" from a composition that was never built.
  'transition-property/display',
  'transition-duration-[300ms]/display',
  'transition-behavior-allow-discrete/display',
  'transition-property/opacity',
]

const emitted = build(await compiler(entry, root), CANDIDATES)
const rules = emitted.css.match(/[^{}]+\{[^{}]*\}/g) ?? []
const composition = rules.filter(rule => /\btransition:\s/.test(rule)).pop() ?? ''
const shorthandAt = composition.indexOf('transition:')
const behaviorAt = composition.indexOf('transition-behavior')

line('a control writes', (rules.find(rule => rule.includes('--jumi-transition-behavior')) ?? 'nothing').replace(/\s+/g, ' ').slice(0, 74))
line('the composition declares', composition.replace(/\s+/g, ' ').slice(composition.indexOf('transition:'), composition.indexOf('transition:') + 74) || 'nothing')
line('transition-behavior position', behaviorAt === -1
  ? 'absent from the composition'
  : `after the shorthand (${shorthandAt} < ${behaviorAt}) — the shorthand resets it, so this is the side that survives`)
line('warnings', emitted.warnings.length ? emitted.warnings.join(' | ') : 'none')

await browser.close()
server.close()

console.log(`\n${CASES.length} cases, ${FRACTIONS.length} samples each, in Chromium.`)
