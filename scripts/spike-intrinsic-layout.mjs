#!/usr/bin/env node
/**
 * Intrinsic and layout interpolation — the browser's own model, before Jumi at all.
 *
 * The question is architectural, in the same shape as the entry/exit spike: **can the platform interpolate
 * between a keyword size and a definite one, and if so what turns it on?** So the order is deliberate —
 * the mechanism first, the boundaries second, Jumi's own carrier shape last, and nothing invented in
 * between:
 *
 *   1. does `auto → 200px` interpolate at all, with no opt-in?
 *   2. what does `interpolate-size: allow-keywords` turn on, and is it inherited?
 *   3. which values become interpolable — `auto`, `min-content`, `max-content`, `fit-content` — and does
 *      keyword-to-keyword interpolate?
 *   4. is `calc-size()` a second mechanism, or the same one reached differently?
 *   5. does a transition and a keyframe behave the same way?
 *   6. does the value survive `var()` substitution — which is the shape every Jumi carrier has?
 *   7. what does a carrier compute *for its descendants*, and does their own CSS then behave differently
 *      from an identical control outside that subtree? (The question the first version of this spike did not
 *      ask, and the file-wide opt-in survived because of it.)
 *   8. is `auto` reachable for every size property whose grammar accepts it, under the spelling its siblings
 *      use?
 *
 * Fixture notes, kept out of the template on purpose (a backtick inside a browser fixture ends the
 * template, and that mistake has been made ten times): the animated property here is a real CSS property,
 * the "from" state is a keyword and the "to" state a definite length, every case carries `fill: both` so
 * that both endpoints are readable, and sampling is a paused seek rather than a wait.
 *
 * Run: pnpm spike:intrinsic-layout
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

/**
 * What each case asks. `opt` is the opt-in, written on the element only when the case is about it.
 * The inherited case cannot live here: if `interpolate-size` inherits, then putting it on this document
 * would change every other case, so it is measured as a second document instead (see `htmlFor`).
 */
const CASES = [
  { about: 'width, auto → 200px, nothing opt-in', id: 'plain', to: '200px' },
  {
    about: 'the same, interpolate-size on the element',
    id: 'keyword',
    opt: 'interpolate-size: allow-keywords',
    to: '200px',
  },
  {
    about: 'height, 0 → auto, allow-keywords',
    from: '0',
    id: 'height',
    opt: 'interpolate-size: allow-keywords',
    to: 'auto',
    watch: 'height',
  },
  {
    about: 'block-size, auto → 120px, allow-keywords',
    id: 'logical',
    opt: 'interpolate-size: allow-keywords',
    to: '120px',
    watch: 'block-size',
  },
  {
    about: 'inline-size, auto → 90px, allow-keywords',
    id: 'inline',
    opt: 'interpolate-size: allow-keywords',
    to: '90px',
    watch: 'inline-size',
  },
  {
    about: 'min-content → max-content, allow-keywords',
    from: 'min-content',
    id: 'keywordpair',
    opt: 'interpolate-size: allow-keywords',
    to: 'max-content',
    watch: 'width',
  },
  {
    about: 'fit-content → 240px, allow-keywords',
    from: 'fit-content',
    id: 'fit',
    opt: 'interpolate-size: allow-keywords',
    to: '240px',
    watch: 'width',
  },
  {
    about: 'calc-size(auto, size + 40px) → 200px, nothing opt-in',
    from: 'calc-size(auto, size + 40px)',
    id: 'calcsize',
    to: '200px',
  },
  {
    about: 'calc-size with a percentage, nothing opt-in',
    from: 'calc-size(any, 50% - 20px)',
    id: 'calcpct',
    to: '200px',
  },
  {
    about: 'var(--jumi-width) → auto, allow-keywords',
    id: 'carried',
    opt: 'interpolate-size: allow-keywords',
    to: 'auto',
    var: '200px',
  },
]

/** The same document twice, differing only in where the opt-in is written. */
const htmlFor = ({ root = false } = {}) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  :root { --jumi-width: 200px;${root ? ' interpolate-size: allow-keywords;' : ''} }
  body { margin: 0; font: 12px/1.4 system-ui; }
  #board { width: 400px; }
  #board > * { display: block; background: #333; margin: 4px 0; }
${CASES.map(item => `  #${item.id} { ${item.watch ?? 'width'}: ${item.from ?? 'auto'}; ${item.opt ? `${item.opt}; ` : ''}animation: move-${item.id} 1s linear both; }`).join('\n')}
${CASES.map(item => `  @keyframes move-${item.id} { from { ${item.watch ?? 'width'}: ${item.var ? 'var(--jumi-width)' : (item.from ?? 'auto')} } to { ${item.watch ?? 'width'}: ${item.to} } }`).join('\n')}
  /* A transition rather than a keyframe: the classic reveal, height 0 to auto. */
  #transitioned { height: 0; interpolate-size: allow-keywords; overflow: hidden; transition: height 1s linear; }
  #transitioned.open { height: auto; }
</style></head>
<body>
<div id="board">
${CASES.map(item => `  <div id="${item.id}">${item.id === 'keywordpair' ? 'min to max content text that is long enough to differ' : 'content, so that auto has a size to be'}</div>`).join('\n')}
  <div id="transitioned">a line of text, so auto has something to be</div>
</div>
<script>
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  window.__support = () => ({
    calcSize: CSS.supports('width', 'calc-size(auto, size)'),
    interpolateSize: CSS.supports('interpolate-size', 'allow-keywords'),
    interpolateSizeValue: CSS.supports('interpolate-size: allow-keywords'),
  })

  /** The animations targeting an element, with the timeline kind, so nothing is assumed. */
  window.__animations = (id) => {
    const node = document.getElementById(id)

    return [...document.getAnimations()]
      .filter(animation => animation.effect?.target === node)
      .map(animation => ({
        class: animation.constructor.name,
        keyframes: animation.effect.getKeyframes().map(keyframe => ({ offset: keyframe.offset, width: keyframe.width ?? null })),
        timeline: animation.timeline?.constructor?.name ?? 'none',
      }))
  }

  /** Paused seeks across the active interval; every value is read as the computed string it resolves to. */
  window.__sample = async (id, fractions, watch) => {
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
      samples.push({ at: fraction, value: getComputedStyle(node)[watch] })
    }

    return { samples, timeline: animations[0].timeline?.constructor?.name ?? 'none' }
  }

  /**
   * A transition cannot be seeked the way an animation can without the reading lagging behind the seek,
   * so it is measured the other way round: let it run, and record the value against the progress the
   * platform reports at that same instant. Slower, and honest — the pair is what makes it self-checking.
   */
  window.__transition = async (id, watch) => {
    const node = document.getElementById(id)
    const before = getComputedStyle(node)[watch]
    node.classList.add('open')
    const samples = []

    await new Promise(resolve => {
      const tick = () => {
        const running = [...document.getAnimations()].filter(animation => animation.effect?.target === node)
        if (!running.length || samples.length > 80) return resolve()

        const progress = running[0].effect.getComputedTiming().progress
        samples.push({
          at: typeof progress === 'number' ? Math.round(progress * 100) / 100 : String(progress),
          value: getComputedStyle(node)[watch],
        })

        requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    })

    return { before, samples }
  }

  window.__ready = true
</script>
</body></html>`

const server = (await import('node:http'))
  .createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(htmlFor({ root: request.url.includes('root') }))
  })
  .listen(0)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${server.address().port}/plain`)
await page.waitForFunction(() => window.__ready === true)

const rooted = await browser.newPage()
await rooted.goto(`http://127.0.0.1:${server.address().port}/root`)
await rooted.waitForFunction(() => window.__ready === true)

const FRACTIONS = [0, 0.25, 0.5, 0.75, 1]
const line = (label, value) => console.log(`  ${label.padEnd(52)} ${value}`)
const curve = samples =>
  samples.map(sample => `${sample.at}:${sample.value}`).join(' ')

const support = await page.evaluate(() => window.__support())

console.log('\n0 · the version and what it advertises')
console.log('─'.repeat(100))
line(
  'browser',
  await page.evaluate(() =>
    navigator.userAgent.replace(/^.*(Chrome\/[\d.]+).*$/, '$1'),
  ),
)
line(
  'interpolate-size: allow-keywords',
  support.interpolateSize ? 'supported' : 'unsupported',
)
line('calc-size(auto, size)', support.calcSize ? 'supported' : 'unsupported')

console.log(
  '\n1 · a keyword as one end of a length, and what turns interpolation on',
)
console.log('─'.repeat(100))

for (const item of CASES) {
  const watch = item.watch ?? 'width'
  const sampled = await page.evaluate(
    ({ fractions, id, watch }) => window.__sample(id, fractions, watch),
    { fractions: FRACTIONS, id: item.id, watch },
  )

  const moved = new Set(sampled.samples.map(sample => sample.value)).size
  const verdict = !sampled.samples.length
    ? 'no Animation −'
    : moved <= 2
      ? `snaps (${moved} value${moved === 1 ? '' : 's'})`
      : `interpolates (${moved} values)`

  line(item.about, `${verdict} · ${curve(sampled.samples)}`)
}

console.log(
  '\n2 · inheritance, and the same motion as a transition rather than a keyframe',
)
console.log('─'.repeat(100))

const inherited = await rooted.evaluate(
  ({ fractions }) => window.__sample('plain', fractions, 'width'),
  { fractions: FRACTIONS },
)

line('nothing opt-in, opt-in on the root instead', curve(inherited.samples))
line(
  'the same element with no opt-in anywhere',
  curve(
    (
      await page.evaluate(
        ({ fractions }) => window.__sample('plain', fractions, 'width'),
        { fractions: FRACTIONS },
      )
    ).samples,
  ),
)

const viaTransition = await page.evaluate(() =>
  window.__transition('transitioned', 'height'),
)

line(
  'height 0 → auto, transition, allow-keywords',
  `${viaTransition.before} → ${viaTransition.samples
    .filter(
      (sample, index) =>
        index % 8 === 0 || index === viaTransition.samples.length - 1,
    )
    .map(sample => `${sample.at}:${sample.value}`)
    .join(' ')}`,
)
line(
  'height line-height → auto, keyframe, allow-keywords',
  curve(
    (
      await page.evaluate(
        ({ fractions }) => window.__sample('height', fractions, 'height'),
        { fractions: FRACTIONS },
      )
    ).samples,
  ),
)

console.log('\n3 · Jumi, read rather than assumed')
console.log('─'.repeat(100))

const { build, compiler, root: project } = await import('./lib/compile.mjs')
const entry = `
@import "tailwindcss";
@plugin "${path.join(project, 'dist', 'index.js')}";
`
const wanted = [
  'animate-width-auto',
  'animate-width-[auto]',
  'animate-height-auto',
  'animate-block-size-auto',
  'animate-inline-size-auto',
  'animate-min-width-auto',
]
const css = build(await compiler(entry, project), wanted).css

/**
 * A candidate that emits nothing at all is a refusal, and the cheapest way to tell one from an emission
 * is to build without it: identical bytes means this candidate produced no rule, which is a different
 * fact from "it produced a rule that happens not to write a size". A fresh compiler each time, so no
 * state from a previous build can make the diff look non-zero.
 */
const baseline = build(await compiler(entry, project), []).css
const emits = async candidate =>
  (
    await build(
      await compiler(entry, project),
      typeof candidate === 'string' ? [candidate] : candidate,
    )
  ).css
const postcss = (await import('postcss')).default

for (const candidate of wanted) {
  const alone = await emits(candidate)

  if (alone.length === baseline.length) {
    line(candidate, 'refused — emitted nothing at all')
    continue
  }

  const written = []
  postcss.parse(alone).walkDecls(declaration => {
    if (
      /^(width|height|block-size|inline-size|min-width)$/.test(declaration.prop)
    ) {
      written.push(`${declaration.prop}: ${declaration.value}`)
    }
  })

  line(
    candidate,
    written.length
      ? [...new Set(written)].join('; ')
      : 'emitted a rule, but no size declaration',
  )
}

// The size family, swept the way the CTO asked for it: the browser's own grammar as the authority on
// whether `auto` is a legal value, against Jumi's vocabulary and the spelling it is reachable under. A
// `DEFAULT` key in a value map is Tailwind's bare-utility convention, so `{ DEFAULT: 'auto' }` answers to
// `animate-block-size` and *not* to `animate-block-size-auto` — which is a spelling difference, not a
// capability one, and this table is what tells the two apart.
const FAMILY = [
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'inline-size',
  'block-size',
  'min-inline-size',
  'min-block-size',
  'max-inline-size',
  'max-block-size',
  'size',
]
const grammar = await page.evaluate(
  properties =>
    properties.map(property => ({
      acceptsAuto: CSS.supports(property, 'auto'),
      property,
    })),
  FAMILY,
)

for (const { acceptsAuto, property } of grammar) {
  const named = await emits(`animate-${property}-auto`)
  const bare = await emits(`animate-${property}`)

  line(
    `animate-${property}[-auto]`,
    [
      acceptsAuto ? 'CSS accepts auto' : 'CSS does not use auto',
      named.length === baseline.length ? 'named refused' : 'named emitted',
      bare.length === baseline.length ? 'bare refused' : 'bare emitted',
    ].join(' · '),
  )
}

line(
  'interpolate-size: allow-keywords in the output',
  /interpolate-size:\s*allow-keywords/.test(css) ? 'yes' : 'no',
)

if (/interpolate-size:\s*allow-keywords/.test(css)) {
  const at = css.indexOf('interpolate-size: allow-keywords')
  line(
    '  …and it comes from here',
    css
      .slice(Math.max(0, at - 70), at + 34)
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

line('calc-size(...) in the output', /calc-size\(/.test(css) ? 'yes' : 'no')

// Can Jumi express the opt-in itself, rather than leaving it to the author? The property is modelled, so
// the question is which spelling reaches it — and whether it lands on the base style or only a keyframe.
for (const spelling of [
  'animate-interpolate-size-allow-keywords',
  'animate-interpolate-size-[allow-keywords]',
]) {
  const alone = await emits(spelling)
  line(
    spelling,
    alone.length === baseline.length
      ? 'refused'
      : `${/interpolate-size:\s*var\(--jumi-interpolate-size\)/.test(alone) ? 'accepted, written as a declaration' : 'accepted, but not written'}`,
  )
}

const control = await emits('animation-interpolate-size-allow-keywords')
line(
  'animation-interpolate-size-allow-keywords',
  control.length === baseline.length ? 'refused' : 'accepted',
)

const carried = await page.evaluate(
  ({ fractions }) => window.__sample('carried', fractions, 'width'),
  { fractions: FRACTIONS },
)
line('var(--jumi-width) → auto on the element', curve(carried.samples))

// ── 4 · end to end, on Jumi's own emitted utilities rather than a hand-written fixture ────────────────
console.log("\n4 · the same motion through Jumi's real output, in the browser")
console.log('─'.repeat(100))

const jumiCss = await emits([
  'animate-width-auto',
  'animate-opacity-50',
  'interpolate-size-allow-keywords',
])
const jumiHtml = `<!doctype html>
<html><head><meta charset="utf-8"><style>
${jumiCss}
  body { margin: 0; font: 12px/1.4 system-ui; }
  #board { width: 400px; }
  /* A motion whose target is a keyword, with and without the opt-in the platform requires. */
  #box, #opted { width: 200px; background: #333; }
  #plain { width: 200px; }
  /* Locality: the same ordinary transition, once under a carrier and once outside one. */
  #parent, #control, #opted-parent { width: 400px; }
  .width-transition { width: 200px; background: #555; transition: width 600ms linear; }
  .width-transition.wide { width: auto; }
</style></head>
<body>
<div id="board">
  <div id="box" class="animate-width-auto">content, so auto resolves to the board</div>
  <div id="opted" class="interpolate-size-allow-keywords animate-width-auto">content, so auto resolves to the board</div>
</div>
<div id="plain">content</div>
<div id="parent" class="animate-opacity-50"><div id="child" class="width-transition">content</div></div>
<div id="control"><div id="control-child" class="width-transition">content</div></div>
<div id="opted-parent" class="interpolate-size-allow-keywords animate-opacity-50"><div id="opted-child" class="width-transition">content</div></div>
<script>
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  window.__read = () => ({
    carrier: getComputedStyle(document.getElementById('box')).getPropertyValue('interpolate-size'),
    opted: getComputedStyle(document.getElementById('opted')).getPropertyValue('interpolate-size'),
    plain: getComputedStyle(document.getElementById('plain')).getPropertyValue('interpolate-size'),
  })

  /**
   * The locality question, measured rather than inferred: what does a descendant of a carrier compute,
   * and does its own transition then behave differently from an identical one outside that subtree?
   */
  window.__locality = async () => {
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')
    const siblingControl = document.getElementById('control-child')
    const optedParent = document.getElementById('opted-parent')
    const optedChild = document.getElementById('opted-child')
    const read = node => ({
      animationName: getComputedStyle(node).animationName,
      interpolateSize: getComputedStyle(node).getPropertyValue('interpolate-size'),
    })
    const before = {
      child: read(child),
      control: read(siblingControl),
      opted: read(optedChild),
      optedParent: read(optedParent),
      parent: read(parent),
    }

    child.classList.add('wide')
    siblingControl.classList.add('wide')
    optedChild.classList.add('wide')
    await frame()

    // Whether a transition exists at all is the sharpest reading there is: a keyword pair that cannot be
    // interpolated does not get a transition object, so 1 against 0 is the difference between the two.
    const started = {
      child: [...document.getAnimations()].filter(animation => animation.effect?.target === child).length,
      control: [...document.getAnimations()].filter(animation => animation.effect?.target === siblingControl).length,
      opted: [...document.getAnimations()].filter(animation => animation.effect?.target === optedChild).length,
    }
    const pairs = []

    await new Promise(resolve => {
      const tick = () => {
        const running = [...document.getAnimations()].filter(animation => animation.effect?.target === optedChild)
        if (!running.length || pairs.length > 90) return resolve()

        const progress = running[0].effect.getComputedTiming().progress
        pairs.push({
          at: typeof progress === 'number' ? Math.round(progress * 100) / 100 : String(progress),
          child: getComputedStyle(child).width,
          control: getComputedStyle(siblingControl).width,
          opted: getComputedStyle(optedChild).width,
        })

        requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    })

    return {
      after: {
        child: getComputedStyle(child).width,
        control: getComputedStyle(siblingControl).width,
        opted: getComputedStyle(optedChild).width,
      },
      before,
      pairs,
      started,
    }
  }

  window.__seek = async (id, fractions) => {
    const node = document.getElementById(id)
    const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)
    if (!animations.length) return { samples: [] }

    const raw = animations[0].effect.getComputedTiming().duration
    const duration = typeof raw === 'number' ? raw : raw?.value ?? 1000
    const samples = []

    for (const fraction of fractions) {
      for (const animation of animations) {
        animation.pause()
        animation.currentTime = Math.round(fraction * duration)
      }

      await frame()
      samples.push({ at: fraction, value: getComputedStyle(node).width })
    }

    return { samples, timeline: animations[0].timeline?.constructor?.name ?? 'none' }
  }

  window.__ready = true
</script>
</body></html>`

const jumiServer = (await import('node:http'))
  .createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(jumiHtml)
  })
  .listen(0)

const jumiPage = await browser.newPage()
await jumiPage.goto(`http://127.0.0.1:${jumiServer.address().port}`)
await jumiPage.waitForFunction(() => window.__ready === true)

const read = await jumiPage.evaluate(() => window.__read())
line(
  'interpolate-size, an element with a motion',
  read.carrier || 'not declared',
)
line('interpolate-size, the same plus the opt-in', read.opted || 'not declared')
line(
  'interpolate-size, an element with no motion',
  read.plain || 'not declared',
)

const jumiMotion = await jumiPage.evaluate(
  ({ fractions }) => window.__seek('box', fractions),
  { fractions: FRACTIONS },
)
line('animate-width-auto alone, 200px → auto', curve(jumiMotion.samples))

const optedMotion = await jumiPage.evaluate(
  ({ fractions }) => window.__seek('opted', fractions),
  { fractions: FRACTIONS },
)
line('…with interpolate-size-allow-keywords', curve(optedMotion.samples))

// ── 5 · locality: does a carrier opt its whole subtree in? ───────────────────────────────────────────
console.log(
  '\n5 · locality — a carrier, its child, and a control outside the subtree',
)
console.log('─'.repeat(100))

const locality = await jumiPage.evaluate(() => window.__locality())
const pair = (samples, key) =>
  samples
    .filter((sample, index) => index % 8 === 0 || index === samples.length - 1)
    .map(sample => `${sample.at}:${sample[key]}`)
    .join(' ')

line(
  'parent — carrier, no opt-in',
  `animation-name: ${locality.before.parent.animationName} · interpolate-size: ${locality.before.parent.interpolateSize || 'not declared'}`,
)
line(
  'child, no motion of its own',
  `animation-name: ${locality.before.child.animationName} · interpolate-size: ${locality.before.child.interpolateSize || 'not declared'}`,
)
line(
  'control-child, no carrier above it',
  `animation-name: ${locality.before.control.animationName} · interpolate-size: ${locality.before.control.interpolateSize || 'not declared'}`,
)
line(
  'opted-parent, opted in explicitly',
  `animation-name: ${locality.before.optedParent.animationName} · interpolate-size: ${locality.before.optedParent.interpolateSize || 'not declared'}`,
)
line(
  'opted-child, under the opted-in parent',
  `animation-name: ${locality.before.opted.animationName} · interpolate-size: ${locality.before.opted.interpolateSize || 'not declared'}`,
)
line(
  'child 200px → auto, no opt-in anywhere',
  `${locality.started.child} transition(s) started · ${pair(locality.pairs, 'child') || `settled at ${locality.after.child}`}`,
)
line(
  'control-child 200px → auto',
  `${locality.started.control} transition(s) started · ${pair(locality.pairs, 'control') || `settled at ${locality.after.control}`}`,
)
line(
  'opted-child 200px → auto, opted in above',
  `${locality.started.opted} transition(s) started · ${pair(locality.pairs, 'opted') || `settled at ${locality.after.opted}`}`,
)

await jumiServer.close()

await browser.close()
server.close()

console.log('')
