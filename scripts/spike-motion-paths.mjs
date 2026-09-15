#!/usr/bin/env node
/**
 * Motion paths — the platform measured before any syntax.
 *
 * Jumi already ships the whole `offset-*` family as tweens (`animate-offset-path`, `-distance`,
 * `-rotate`, `-anchor`, `-position`, and their parts), so the question is not "is there a surface"
 * but "does that surface produce a motion path, and where is the boundary between a property you
 * **set** and a property you **drive**".
 *
 * Nothing here changes `src/`. Every measurement is in a browser except the first section, which is
 * `CSS.supports` — and that one is worth doing first, because most of the family's value forms either
 * parse everywhere or nowhere.
 *
//   · **A control arm is what separates the instrument from the platform.** The first version of this
//     harness reported every time-driven arm — and a hand-written control — as motionless, which read
//     as "the platform does not move the element". It was `getComputedTiming().duration` being a number
//     for time-driven animations and a `CSSUnitValue` for progress-driven ones, so every seek was
//     `fraction * undefined`. The control is what made that cheap to find.
 *   · **Reduced motion is the author's to clamp.** Nothing about a motion path changes that.
 *
 * Run: pnpm spike:motion-paths
 */
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const { build, compiler } = await import('./lib/compile.mjs')

const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

/** A path with an obvious shape: right along x, then down along y. Corners are easy to read. */
const PATH = "path('M0,0 L200,0 L200,200')"

const PROPERTIES = [
  'offset-path',
  'offset-distance',
  'offset-rotate',
  'offset-anchor',
  'offset-position',
]

/**
 * Every value form the family takes. `ray()` and `path()` are the two that carry the feature; the
 * shapes and the `<coord-box>` keywords are the ones that decide whether arbitrary values are enough.
 */
const VALUES = [
  ['offset-path', 'none'],
  ['offset-path', `path('M0,0 L100,0')`],
  ['offset-path', 'ray(45deg)'],
  ['offset-path', 'ray(45deg 100px)'],
  ['offset-path', 'ray(45deg closest-side)'],
  ['offset-path', 'circle(40%)'],
  ['offset-path', 'ellipse(30% 20%)'],
  ['offset-path', 'inset(10%)'],
  ['offset-path', 'polygon(0 0, 100% 0, 100% 100%)'],
  ['offset-path', 'border-box'],
  ['offset-path', 'content-box'],
  ['offset-path', 'view-box'],
  ['offset-distance', '50%'],
  ['offset-distance', '100px'],
  ['offset-distance', 'calc(50% + 10px)'],
  ['offset-rotate', 'auto'],
  ['offset-rotate', 'reverse'],
  ['offset-rotate', '45deg'],
  ['offset-rotate', 'auto 45deg'],
  ['offset-anchor', 'auto'],
  ['offset-anchor', 'center'],
  ['offset-anchor', 'top left'],
  ['offset-anchor', '10% 90%'],
  ['offset-position', 'normal'],
  ['offset-position', 'auto'],
  ['offset-position', 'center'],
  ['offset-position', '10px 20px'],
]

/**
 * The arms. `path` is set as a plain declaration — not animated — which is the distinction the spike
 * is looking for: a path is where the motion happens, not something the motion interpolates.
 */
const ARMS = [
  // The idiom: path set, distance driven by a Jumi single-value tween.
  { classes: 'animate-offset-distance-100', id: 'drive', path: PATH },
  // The same thing as a phrase, so the frames come from Jumi's own keyframe machinery.
  {
    classes: 'animate-offset-distance-[0:0%|100:100%]',
    id: 'phrase',
    path: PATH,
  },
  // The idiom with the element turning to follow the path.
  {
    classes: 'animate-offset-distance-100',
    extra: 'offset-rotate: auto;',
    id: 'spin',
    path: PATH,
  },
  // Jumi animating the *path itself*, which is the question "declaration or driver".
  {
    classes: `animate-offset-path-[${PATH.replaceAll(' ', '_')}] animate-offset-distance-100`,
    id: 'animatedPath',
  },
  // Jumi animating `offset-rotate` from its initial value, same question for the tangent.
  {
    classes: 'animate-offset-rotate-[auto] animate-offset-distance-100',
    id: 'animatedRotate',
    path: PATH,
  },
  // Two of the family driven at once, and a transform beside them.
  {
    classes: 'animate-offset-distance-100 animate-translate-x-[40px]',
    id: 'withTransform',
    path: PATH,
  },
  // A ray, which is the one form that needs `offset-position` to mean anything.
  {
    classes: 'animate-offset-distance-100',
    extra: 'offset-path: ray(45deg); offset-position: 50% 50%;',
    id: 'ray',
  },
  // A shape as the path: the element travels the shape's perimeter.
  {
    classes: 'animate-offset-distance-100',
    extra: 'offset-path: circle(60px); offset-position: 50% 50%;',
    id: 'circle',
  },
  // The box itself as the path — no geometry to author at all.
  {
    classes: 'animate-offset-distance-100',
    extra: 'offset-path: border-box;',
    id: 'box',
  },
  // The anchor decides which point of the element sits on the path.
  {
    classes: 'animate-offset-distance-100',
    extra: 'offset-anchor: center;',
    id: 'anchor',
    path: PATH,
  },
  // Scroll drives the same motion, with a range to place the window on the scroll.
  {
    classes:
      'animate-offset-distance-100 animation-timeline-scroll animation-range-[25%_75%]',
    id: 'scrolled',
    path: PATH,
  },
]

const CANDIDATES = [
  ...new Set(ARMS.flatMap(arm => arm.classes.split(/\s+/).filter(Boolean))),
]

const emitted = build(await compiler(entry, root), CANDIDATES)

const htmlFor = css => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; font: 12px/1.4 system-ui; }
  #board { position: relative; width: 420px; height: 320px; background: #f6f6f6; margin: 8px; }
  /* Every arm is the same box, so a rect measures where the path put it. */
  #board > * { position: absolute; top: 0; left: 0; width: 20px; height: 20px; background: #333; }
${ARMS.map(arm => {
  const declarations = [
    arm.path ? `offset-path: ${arm.path};` : '',
    arm.extra ?? '',
  ].join(' ')

  return declarations.trim() ? `  #${arm.id} { ${declarations} }` : ''
})
  .filter(Boolean)
  .join('\n')}
  #lead { height: 120px; }
  #tail { height: 1600px; }
  /* The control: the same motion, written by hand, sampled by the same instrument. If this one does
     not move, the instrument is broken; if it moves and the Jumi arms do not, the emission is. */
  #control { position: absolute; top: 0; left: 0; width: 20px; height: 20px; background: #c00;
    offset-path: ${PATH}; animation: control 1s linear; }
  @keyframes control { from { offset-distance: 0%; } to { offset-distance: 100%; } }
</style>
<style id="jumi">${css}</style></head>
<body>
<div id="lead">lead</div>
<div id="board">
${ARMS.map(arm => `<div id="${arm.id}" class="${arm.classes}"></div>`).join('\n')}
<div id="control"></div>
</div>
<div id="tail">tail</div>
<script>
  window.__fractions = async (id, fractions) => {
    const node = document.getElementById(id)

    if (!node) return null

    const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const live = () => [...document.getAnimations()].filter(animation => animation.effect?.target === node)

    let animations = live()

    // A CSS animation is created during the first style pass, which may not have happened when this
    // is called. Retry once rather than reporting "nothing animates" — the first run of this harness
    // read a hand-written control arm as motionless for exactly that reason, which looked like a
    // platform limitation and was not one.
    if (!animations.length) {
      await frame()
      animations = live()
    }

    const out = []

    if (!animations.length) return { animations: 0, positions: [] }

    for (const animation of animations) animation.pause()

    // A scroll-driven animation is progress-based: Chromium refuses an absolute time on it, and its
    // currentTime is a percentage instead. Measured, and worth knowing before any harness tries to
    // sample one by time. (No backticks in this comment: the whole fixture is one template literal.)
    const progressBased = animations[0].timeline?.constructor?.name !== 'DocumentTimeline'
    // A number for a time-driven animation, a CSSUnitValue for a progress-driven one. Reading the
    // value property on both — as the first version of this harness did — silently seeks every
    // time-driven arm to zero, which reports as "the platform does not move the element" and is not
    // that at all. (No backticks in here: the whole fixture is one template literal.)
    const raw = animations[0].effect.getComputedTiming().duration
    const duration = typeof raw === 'number' ? raw : raw?.value ?? 0

    for (const fraction of fractions) {
      for (const animation of animations) {
        animation.currentTime = progressBased
          ? new CSSUnitValue(fraction * 100, 'percent')
          : fraction * duration
      }

      // Two frames, not zero: a paused animation whose time was just set applies its effect on the
      // next style update, so a synchronous read measures the value from before the change. The
      // first run of this harness reported every time-driven arm as motionless because of exactly
      // that, which is the kind of result that looks like a platform limitation and is not one.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      const rect = node.getBoundingClientRect()

      // Document-relative, so a scrolled position can be compared with an unscrolled one.
      const style = getComputedStyle(node)

      out.push({
        distance: style.offsetDistance,
        w: Math.round(rect.width * 10) / 10,
        x: Math.round((rect.x + scrollX) * 10) / 10,
        y: Math.round((rect.y + scrollY) * 10) / 10,
      })
    }

    return { animations: animations.length, positions: out }
  }

  window.__resume = () => [...document.getAnimations()].forEach(animation => animation.play())

  window.__rect = (id) => {
    const rect = document.getElementById(id).getBoundingClientRect()

    return { x: Math.round((rect.x + scrollX) * 10) / 10, y: Math.round((rect.y + scrollY) * 10) / 10 }
  }

  /** The keyframes each animation on an element actually got, verbatim. */
  window.__keyframes = (id) => [...document.getAnimations()]
    .filter(animation => animation.effect?.target === document.getElementById(id))
    .flatMap(animation => animation.effect.getKeyframes().map(frame => ({ name: animation.animationName })), )
    .map((_, at) => at)

  window.__frames = (id) => [...document.getAnimations()]
    .filter(animation => animation.effect?.target === document.getElementById(id))
    .map(animation => ({
      duration: String(animation.effect.getComputedTiming().duration),
      name: animation.animationName ?? '?',
      keyframes: animation.effect.getKeyframes().map(frame => ({
        offset: frame.offset,
        value: frame.offsetDistance ?? '∅',
      })),
    }))

  window.__computed = (id) => {
    const style = getComputedStyle(document.getElementById(id))

    return {
      path: style.offsetPath,
      distance: style.offsetDistance,
      rotate: style.offsetRotate,
      anchor: style.offsetAnchor,
    }
  }

  window.__supports = (list) => list.map(([property, value]) => [property, value, CSS.supports(property, value)])

  window.__scrollTo = (fraction) => {
    document.documentElement.scrollTop = Math.round(fraction * (document.documentElement.scrollHeight - innerHeight))

    return document.documentElement.scrollTop
  }

  window.__ready = true
</script>
</body></html>`

const server = createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(htmlFor(emitted.css))
}).listen(0)

const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()

const open = async (reducedMotion = 'no-preference') => {
  const context = await browser.newContext({
    reducedMotion,
    viewport: { height: 700, width: 1000 },
  })
  const page = await context.newPage()

  await page.goto(origin)
  await page.waitForFunction(() => window.__ready === true)

  return page
}

const page = await open()
const FRACTIONS = [0, 0.25, 0.5, 0.75, 1]
const line = (label, value) => console.log(`  ${label.padEnd(34)} ${value}`)

// ── 1 · what the platform accepts ───────────────────────────────────────────────────────────────
console.log('\n1 · the family, value form by value form')
console.log('─'.repeat(78))

const support = await page.evaluate(
  list => window.__supports(list),
  [...PROPERTIES.map(property => [property, 'initial']), ...VALUES],
)

for (const [property, value, ok] of support) {
  if (value === 'initial') line(property, ok ? 'supported' : 'NOT SUPPORTED')
}

for (const [property, value, ok] of support.filter(
  ([, value]) => value !== 'initial',
)) {
  if (!ok) line(`${property}: ${value}`, 'REFUSED')
}

const refused = support.filter(
  ([, value, ok]) => value !== 'initial' && !ok,
).length

line(
  'value forms refused',
  refused === 0 ? 'none' : `${refused} of ${VALUES.length}`,
)

// ── 2 · is it a motion path at all? ─────────────────────────────────────────────────────────────
console.log('\n2 · where the element is, along the path')
console.log('─'.repeat(78))

const positions = {}

for (const arm of ARMS) {
  positions[arm.id] = await page.evaluate(
    ({ fractions, id }) => window.__fractions(id, fractions),
    { fractions: FRACTIONS, id: arm.id },
  )
}

const show = id => {
  const reading = positions[id]

  if (!reading || !reading.positions[0]) return `${id}: nothing resolves`

  const first = reading.positions[0]
  const moves = reading.positions.map(
    ({ x, y }) => `${x - first.x},${y - first.y}`,
  )

  return `${id}: ${moves.join('  ')}${reading.animations > 1 ? `  (${reading.animations} animations)` : ''}`
}

/** Rotation is invisible on a square box, so the width is reported for the arms that turn. */
const showWidth = id =>
  (positions[id]?.positions ?? []).map(position => position.w).join(' ') ||
  'none'

for (const id of [
  'control',
  'drive',
  'phrase',
  'scrolled',
  'spin',
  'withTransform',
])
  line(id, show(id).slice(id.length + 2))

for (const id of ['spin', 'animatedRotate'])
  line(`${id} box width`, showWidth(id))

line(
  'control keyframes',
  JSON.stringify(await page.evaluate(() => window.__frames('control'))),
)
line(
  'drive keyframes',
  JSON.stringify(await page.evaluate(() => window.__frames('drive'))),
)

for (const id of ['control', 'drive']) {
  line(
    `${id} samples`,
    (positions[id]?.positions ?? [])
      .map(position => `${position.distance}@${position.x},${position.y}`)
      .join('  ') || 'none',
  )
}

// ── 3 · declaration or driver? ──────────────────────────────────────────────────────────────────
console.log('\n3 · a property you set, against a property you drive')
console.log('─'.repeat(78))

line('path set, distance driven', show('drive').slice('drive: '.length))
line(
  'path animated by Jumi',
  show('animatedPath').slice('animatedPath: '.length),
)
line('rotate set to auto', show('spin').slice('spin: '.length))
line(
  'rotate animated by Jumi',
  show('animatedRotate').slice('animatedRotate: '.length),
)

for (const id of ['animatedPath', 'animatedRotate']) {
  const computed = await page.evaluate(arm => window.__computed(arm), id)

  line(`  ${id} computed`, JSON.stringify(computed))
}

// ── 4 · the geometry the family offers ──────────────────────────────────────────────────────────
console.log('\n4 · shapes, rays, boxes and anchors')
console.log('─'.repeat(78))

for (const id of ['ray', 'circle', 'box', 'anchor'])
  line(id, show(id).slice(id.length + 2))

// ── 5 · does a scroll timeline drive it? ────────────────────────────────────────────────────────
console.log('\n5 · the same motion on a scroll timeline, with a range')
console.log('─'.repeat(78))

const settle = target =>
  target.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
const scrolled = []

// Sampling paused every animation it touched, so the scroll section would measure a frozen page.
await page.evaluate(() => window.__resume())

for (const fraction of [0.25, 0.5, 0.75]) {
  await page.evaluate(share => window.__scrollTo(share), fraction)
  await settle(page)

  const rect = await page.evaluate(() => window.__rect('scrolled'))

  scrolled.push(rect)
}

const scrolledFirst = positions.scrolled.positions[0]

line(
  'scroll ¼ ½ ¾ (delta from start)',
  scrolled
    .map(
      ({ x, y }) =>
        `${Math.round((x - scrolledFirst.x) * 10) / 10},${Math.round((y - scrolledFirst.y) * 10) / 10}`,
    )
    .join('  '),
)

// ── 6 · reduced motion ──────────────────────────────────────────────────────────────────────────
console.log('\n6 · reduced motion')
console.log('─'.repeat(78))

const reduced = await open('reduce')
const reducedReading = await reduced.evaluate(
  ({ fractions, id }) => window.__fractions(id, fractions),
  { fractions: [0, 0.5, 1], id: 'drive' },
)

line(
  'under reduce, the platform',
  reducedReading.animations
    ? `still runs it (${reducedReading.positions.map(position => position.x).join(' ')})`
    : 'runs nothing',
)

await reduced.context().close()

// ── 7 · the composite ───────────────────────────────────────────────────────────────────────────
console.log('\n7 · what the emission says')
console.log('─'.repeat(78))

line('bytes', `${emitted.css.length}`)
line(
  'warnings',
  emitted.warnings.length ? emitted.warnings.join(' | ') : 'none',
)
line(
  'keyframes for offset-distance',
  `${(emitted.css.match(/@keyframes jumi-offset-distance/g) ?? []).length}`,
)
line(
  'arms with no animation at all',
  Object.entries(positions)
    .filter(([, reading]) => !reading?.animations)
    .map(([id]) => id)
    .join(', ') || 'none',
)

const distance = /animation: var\(--jumi-slot-offset-distance[^;]*/.exec(
  emitted.css,
)

line(
  'the slot the distance is written on',
  distance ? distance[0].slice(0, 60) : 'not composed',
)

await browser.close()
server.close()

console.log(
  `\n${ARMS.length} arms, ${VALUES.length} value forms, ${PROPERTIES.length} properties measured in Chromium.`,
)
