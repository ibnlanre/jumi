#!/usr/bin/env node
import { readFileSync } from 'node:fs'
/**
 * View Transitions spike — what the platform gives us, measured in Chromium.
 *
 * The question this answers is narrow on purpose: **can Jumi's existing animation model target
 * `::view-transition-*` pseudo-elements without special animation semantics?** It is not a design
 * exercise, it does not touch `src/`, and it proposes no utilities. It measures the platform and
 * replays the emitted Jumi composition under a different selector to see whether it holds.
 *
 * Everything here runs against the *finalized* stylesheet in `scripts/css-snapshot/snapshot.css`,
 * so the substrate rule, the aggregate longhand rule, the `@property` registrations and the
 * keyframes under test are the ones a build actually ships.
 *
 * The fixture pages are served over `http://127.0.0.1` rather than opened from `file://`, because a
 * cross-document transition requires a same-origin navigation — the `file:` scheme has no shared
 * origin to navigate within.
 *
 * Run: pnpm spike:view-transitions
 *
 * RESULT (Chromium 153.0.8010.12, 2026-09-13, 17 probes) — the full record, the capability matrix
 * and the recommendation are in `engineering/research/view-transitions.md`. In short:
 *
 *   · The model retargets. The emitted substrate and aggregate rules, replayed verbatim under
 *     `::view-transition-old(name)` / `::view-transition-new(name)`, animate: the slot resolves,
 *     the 33-entry longhand list resolves, the registered keyframes run, and the per-slot
 *     `animation-*` controls compose on the pseudo exactly as on an element — including
 *     `--jumi-fade-in-animation-direction: reverse`, which turns an entrance into an exit. It holds
 *     cross-document too, with no JavaScript in either page.
 *   · It cannot be *reached* from the source element. The pseudo tree hangs off the root element,
 *     not off the named element, and the slot variables are registered `inherits: false`, so no
 *     utility on the source element arrives at the pseudo — measured: the source element resolves
 *     `--jumi-fade-in-animation-name` to `jumi-fade-in`, the pseudo resolves it to nothing and
 *     animates with the UA default. Values have to be declared *on the pseudo selector*.
 *   · Which means no variant can express it. A variant modifies the selector of the element that
 *     carries the class; `::view-transition-old(hero)` is a different selector root, and the name
 *     comes from the element, not from the utility. Emission has to happen once the candidates are
 *     known.
 *   · A view-transition selector must never be merged into the utility rule. An unrecognised
 *     selector in a comma list invalidates the *whole* rule, so a browser without view transitions
 *     would lose the animation along with the transition. `@supports selector(…)` is the guard.
 *   · Never aim a composition at `::view-transition-group(name)`. That pseudo's UA animation is the
 *     shared element's travel between its old and new box; replacing `animation-name` there
 *     replaces the travel (measured: the group stops moving and only scales in place).
 *   · Duplicate `view-transition-name` values do not degrade — they abort the transition.
 *   · The platform does not honour `prefers-reduced-motion` for us; the clamp is ours to emit.
 */
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const fixtures = path.join(here, 'spike-view-transitions')
const snapshot = path.join(here, 'css-snapshot', 'snapshot.css')

const ROOT_PSEUDOS = [
  '::view-transition',
  '::view-transition-group(root)',
  '::view-transition-image-pair(root)',
  '::view-transition-old(root)',
  '::view-transition-new(root)',
]

const HERO_PSEUDOS = [
  '::view-transition-group(hero)',
  '::view-transition-image-pair(hero)',
  '::view-transition-old(hero)',
  '::view-transition-new(hero)',
]

const ALL = [...ROOT_PSEUDOS, ...HERO_PSEUDOS, '::view-transition-group(card)', '::view-transition-new(card)']

/* ------------------------------------------------------------------ fixtures */

/**
 * The fixture server. Two pages are templated rather than duplicated: `{{TYPES}}` is the
 * `@view-transition` type list and `{{SHEET}}` is which pseudo-element stylesheet the pair links.
 * The chosen variant is remembered, so a plain link click between the two pages keeps it — the
 * pages themselves stay free of JavaScript and the zero-JS claim survives.
 */
let variant = { sheet: '/cross-manual.css', types: '' }
let crossJumi = ''

const routes = new Map([
  ['/cross-group.css', () => ({ body: readFileSync(path.join(fixtures, 'cross-group.css'), 'utf8'), type: 'text/css' })],
  ['/cross-jumi.css', () => ({ body: crossJumi, type: 'text/css' })],
  ['/cross-manual.css', () => ({ body: readFileSync(path.join(fixtures, 'cross-manual.css'), 'utf8'), type: 'text/css' })],
  ['/jumi.css', () => ({ body: readFileSync(snapshot, 'utf8'), type: 'text/css' })],
  ['/lab.html', () => ({ body: readFileSync(path.join(fixtures, 'lab.html'), 'utf8'), type: 'text/html' })],
  ['/lab.js', () => ({ body: readFileSync(path.join(fixtures, 'lab.js'), 'utf8'), type: 'text/javascript' })],
])

for (const name of ['cross-from.html', 'cross-to.html']) {
  routes.set(`/${name}`, (url) => {
    if (url.searchParams.has('sheet') || url.searchParams.has('types')) {
      variant = {
        sheet: url.searchParams.get('sheet') ?? variant.sheet,
        types: url.searchParams.get('types') ?? variant.types,
      }
    }

    const body = readFileSync(path.join(fixtures, name), 'utf8')
      .replaceAll('{{TYPES}}', variant.types)
      .replaceAll('{{SHEET}}', variant.sheet)

    return { body, type: 'text/html' }
  })
}

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const route = routes.get(url.pathname)

  if (!route) {
    response.writeHead(404).end('no fixture')

    return
  }

  const { body, type } = route(url)

  response.writeHead(200, { 'cache-control': 'no-store', 'content-type': type }).end(body)
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

const base = `http://127.0.0.1:${server.address().port}`

/* ------------------------------------------------------------------ reporting */

const probes = []

/** A per-slot `animation-name` list is hundreds of entries long; keep only what a reader can use. */
const names = (value) => {
  if (typeof value !== 'string' || value === '') return { empty: true }

  const parts = value.split(',').map(part => part.trim())
  const real = parts.filter(part => part !== 'none')

  return {
    animate: real.length,
    entries: parts.length,
    jumi: [...new Set(real.filter(part => part.startsWith('jumi-')))].slice(0, 6),
    ua: [...new Set(real.filter(part => part.startsWith('-ua-')))].slice(0, 6),
  }
}

/**
 * `live` is the honest existence signal, not `resolved`. `getComputedStyle(element, pseudo)`
 * returns a usable declaration even for a view-transition pseudo-element the browser never built —
 * a missing `::view-transition-new(card)` still reports `animation-name: none`, `opacity: 1` — so
 * the only trustworthy evidence that a pseudo exists is that it appears in `getAnimations()`.
 */
const view = measured => ({
  active: measured.active,
  animations: measured.animations.map(animation => `${animation.pseudo} → ${animation.name}${animation.frames ? ` (${animation.frames} frames)` : ''}`),
  pseudos: Object.fromEntries(Object.entries(measured.pseudos).map(([pseudo, value]) => [pseudo, {
    direction: value.animationDirection?.includes('reverse') ? value.animationDirection : undefined,
    live: measured.animations.some(animation => animation.pseudo === pseudo),
    name: names(value.animationName),
    opacity: value.opacity,
    resolved: value.exists,
    transform: value.transform,
  }])),
  root: measured.root,
})

async function probe(id, title, run) {
  try {
    const data = await run()

    probes.push({ data, id, title })
    console.log(`\n── ${id}  ${title}`)
    console.log(JSON.stringify(data, null, 2))
  }
  catch (error) {
    probes.push({ error: String(error?.message ?? error), id, title })
    console.log(`\n── ${id}  ${title}\n   ⚠️  ${error?.message ?? error}`)
  }
}

/* ------------------------------------------------------------------ session */

const browser = await chromium.launch()

const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { height: 600, width: 900 } })
const page = await context.newPage()
const console_ = []

page.on('console', message => console_.push(`${message.type()}: ${message.text()}`))
page.on('pageerror', error => console_.push(`pageerror: ${error.message}`))

await page.goto(`${base}/lab.html`)
await page.waitForFunction(() => window.__vtReady === true)

const lab = (fn, arg) => page.evaluate(fn, arg)

const mountHero = () => lab(({ items }) => window.__vt.mount(items), {
  items: [
    { id: 'hero', name: 'hero', text: 'hero' },
    { id: 'plain', text: 'plain' },
  ],
})

const DURATION = 3000

/* ------------------------------------------------------------------ 0. environment */

await probe('P0', 'Support surface', async () => {
  const supports = await lab(() => {
    const test = (property, value) => {
      try {
        return CSS.supports(property, value)
      }
      catch {
        return null
      }
    }
    const selector = (value) => {
      try {
        return CSS.supports(`selector(${value})`)
      }
      catch (error) {
        return String(error)
      }
    }

    return {
      'selector(::view-transition-group(*.card))': selector('::view-transition-group(*.card)'),
      'selector(::view-transition-group(.card))': selector('::view-transition-group(.card)'),
      'selector(::view-transition-old(root))': selector('::view-transition-old(root)'),
      'selector(:active-view-transition)': selector(':active-view-transition'),
      'selector(:active-view-transition-type(slide))': selector(':active-view-transition-type(slide)'),
      'startViewTransition': typeof document.startViewTransition,
      'view-transition-class': test('view-transition-class', 'card'),
      'view-transition-name': test('view-transition-name', 'hero'),
    }
  })

  return { chromium: browser.version(), ...supports }
})

/* ------------------------------------------------------------------ 1. the tree and its defaults */

await probe('P1', 'The generated pseudo tree, and the UA animations on it', async () => {
  await mountHero()

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })

  if (!started.ready) return { started }

  const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), { pseudos: ALL })

  return { started, ...view(measured) }
})

/* ------------------------------------------------------------------ 2. author CSS replaces the defaults */

await probe('P2', 'Author animations replace the UA defaults at every level', async () => {
  await lab(({ css }) => window.__vt.style(css), {
    css: `
      ::view-transition-old(root) { animation: lab-out ${DURATION}ms both; }
      ::view-transition-new(root) { animation: lab-in ${DURATION}ms both; }
      ::view-transition-image-pair(hero) { animation: lab-pair ${DURATION}ms both; }
      ::view-transition-old(hero) { animation: lab-hero-out ${DURATION}ms both; }
      ::view-transition-new(hero) { animation: lab-hero-in ${DURATION}ms both; }
      ::view-transition-group(hero) { animation: lab-group ${DURATION}ms both; }
      @keyframes lab-out { from { opacity: 1 } to { opacity: 0; transform: translateX(-80px) } }
      @keyframes lab-in { from { opacity: 0; transform: translateX(80px) } to { opacity: 1 } }
      @keyframes lab-pair { from { filter: blur(0) } to { filter: blur(8px) } }
      @keyframes lab-hero-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.4) } }
      @keyframes lab-hero-in { from { opacity: 0; transform: scale(1.6) } to { opacity: 1 } }
      @keyframes lab-group { from { transform: scale(1) } to { transform: scale(1.8) } }
    `,
  })

  await mountHero()

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })

  if (!started.ready) return { started }

  const at0 = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), { pseudos: ALL, t: 0 })
  const mid = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), { pseudos: ALL, t: DURATION / 2 })
  const end = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), { pseudos: ALL, t: DURATION })

  return {
    drivenAt0: at0.driven,
    end: view(end),
    middle: view(mid),
    start: view(at0),
  }
})

/* ------------------------------------------------------------------ 3a. reachability */

let jumiRules = null
let retarget = ''

const retargetCss = (durations = DURATION) => `
  /* The two halves of the emitted composition, unchanged, under a view-transition selector. */
  ::view-transition-old(hero), ::view-transition-new(hero) {
    ${jumiRules.substrate}
    ${jumiRules.aggregate}
    --jumi-animation-duration: ${durations}ms;
  }
  /* Slot activation and a per-slot control, declared on the pseudo rather than on an element. */
  ::view-transition-old(hero) {
    --jumi-fade-in-animation-name: jumi-fade-in;
    --jumi-fade-in-animation-direction: reverse;
  }
  ::view-transition-new(hero) {
    --jumi-fade-in-animation-name: jumi-fade-in;
  }
`

await probe('P3a', 'Can a utility on the source element reach the pseudo tree', async () => {
  jumiRules = await lab(() => window.__vt.jumi())

  // No view-transition CSS of the harness's own: the only thing that could put a value on the
  // pseudo is the utility on the element.
  await lab(({ css }) => window.__vt.style(css), { css: '' })

  await mountHero()
  await lab(() => {
    document.querySelector('#hero').className = 'tile animate-fade-in'
  })

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
  const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), { pseudos: HERO_PSEUDOS })

  return {
    extracted: {
      aggregateBytes: jumiRules.aggregate?.length ?? 0,
      aggregateSelector: jumiRules.selectors.aggregate,
      aggregateUtilities: jumiRules.selectors.aggregateCount,
      keyframesInSnapshot: jumiRules.keyframes.length,
      substrateBytes: jumiRules.substrate?.length ?? 0,
      substrateSelector: jumiRules.selectors.substrate,
      substrateUtilities: jumiRules.selectors.substrateCount,
    },
    pseudo: {
      animations: measured.animations.map(animation => `${animation.pseudo} → ${animation.name}`),
      live: measured.animations.some(animation => animation.pseudo === '::view-transition-new(hero)'),
      name: names(measured.pseudos['::view-transition-new(hero)']?.animationName ?? ''),
      slotOnNew: await lab(() => getComputedStyle(document.documentElement, '::view-transition-new(hero)').getPropertyValue('--jumi-fade-in-animation-name').trim() || null),
    },
    sourceElement: {
      animationNameEntries: await lab(() => getComputedStyle(document.querySelector('#hero')).animationName.split(',').length),
      animationNameJumi: await lab(() => [...new Set(getComputedStyle(document.querySelector('#hero')).animationName.split(',').map(part => part.trim()).filter(part => part.startsWith('jumi-')))].slice(0, 4)),
      classes: await lab(() => document.querySelector('#hero').className),
      rulesSettingAnimationName: await lab(() => window.__vt.matching('#hero')),
      slot: await lab(() => getComputedStyle(document.querySelector('#hero')).getPropertyValue('--jumi-fade-in-animation-name').trim()),
    },
    started,
  }
})

/* ------------------------------------------------------------------ 3b. the retarget */

await probe('P3b', 'The emitted Jumi composition, replayed verbatim under a view-transition selector', async () => {
  retarget = retargetCss()

  await lab(({ css }) => window.__vt.style(css), { css: retarget })

  await mountHero()

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
  const at0 = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), { pseudos: HERO_PSEUDOS, t: 0 })
  const mid = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), { pseudos: HERO_PSEUDOS, t: DURATION / 2 })

  return {
    started,
    ...view(mid),
    atStart: Object.fromEntries(Object.entries(view(at0).pseudos).map(([k, v]) => [k, { name: v.name, opacity: v.opacity, transform: v.transform }])),
  }
})

/* ------------------------------------------------------------------ 4. inheritance into the tree */

await probe('P4', 'What reaches the pseudo tree from the root element', async () => {
  await lab(({ css }) => window.__vt.style(css), { css: '' })
  await lab(({ map }) => window.__vt.vars(map), {
    map: {
      '--jumi-animation-duration': '700ms',
      '--jumi-animation-name': 'probe-global',
      '--jumi-fade-in-animation-name': 'jumi-fade-in',
      '--not-registered-probe': 'reached',
    },
  })

  await mountHero()
  await lab(({ op }) => window.__vt.start(op), { op: 'move' })

  const found = await lab(({ pseudos }) => {
    const read = (pseudo) => {
      const cs = getComputedStyle(document.documentElement, pseudo)

      if (cs.length === 0) return null

      const get = name => cs.getPropertyValue(name).trim() || null

      return {
        globalDuration: get('--jumi-animation-duration'),
        globalName: get('--jumi-animation-name'),
        probe: get('--not-registered-probe'),
        slotName: get('--jumi-fade-in-animation-name'),
      }
    }

    return Object.fromEntries(pseudos.map(pseudo => [pseudo, read(pseudo)]))
  }, { pseudos: ['::view-transition', '::view-transition-group(root)', '::view-transition-old(hero)', '::view-transition-new(hero)'] })

  // Read the root while the values are still set, otherwise this row is a measurement of nothing.
  const set = await lab(() => {
    const cs = getComputedStyle(document.documentElement)

    return {
      globalDuration: cs.getPropertyValue('--jumi-animation-duration').trim() || null,
      globalName: cs.getPropertyValue('--jumi-animation-name').trim() || null,
      probe: cs.getPropertyValue('--not-registered-probe').trim() || null,
      slotName: cs.getPropertyValue('--jumi-fade-in-animation-name').trim() || null,
    }
  })

  await lab(() => window.__vt.vars({
    '--jumi-animation-duration': null,
    '--jumi-animation-name': null,
    '--jumi-fade-in-animation-name': null,
    '--not-registered-probe': null,
  }))
  await lab(() => window.__vt.finish())

  return { onPseudo: found, onRoot: set }
})

/* ------------------------------------------------------------------ 5. two groups, two animations */

await probe('P5', 'Two named groups animating different Jumi effects at once', async () => {
  const retarget = `
    ::view-transition-old(hero), ::view-transition-new(hero),
    ::view-transition-old(card), ::view-transition-new(card) {
      ${jumiRules.substrate}
      ${jumiRules.aggregate}
      --jumi-animation-duration: ${DURATION}ms;
    }
    ::view-transition-old(hero) { --jumi-fade-in-animation-name: jumi-fade-in; }
    ::view-transition-new(hero) { --jumi-fade-in-animation-name: jumi-fade-in; }
    ::view-transition-old(card) { --jumi-shake-animation-name: jumi-shake; }
    ::view-transition-new(card) { --jumi-shake-animation-name: jumi-shake; }
  `

  await lab(({ css }) => window.__vt.style(css), { css: retarget })

  await lab(({ items }) => window.__vt.mount(items), {
    items: [
      { id: 'hero', name: 'hero', text: 'hero' },
      { id: 'card', name: 'card', text: 'card' },
    ],
  })

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
  const measured = await lab(({ t }) => window.__vt.advance(t, []), { t: DURATION / 2 })

  return {
    animations: measured.animations.map(animation => `${animation.pseudo} → ${animation.name}`),
    cardSlot: await lab(() => getComputedStyle(document.documentElement, '::view-transition-new(card)').getPropertyValue('--jumi-shake-animation-name').trim()),
    heroSlot: await lab(() => getComputedStyle(document.documentElement, '::view-transition-new(hero)').getPropertyValue('--jumi-fade-in-animation-name').trim()),
    started,
  }
})

/* ------------------------------------------------------------------ 6. view-transition-class */

await probe('P6', 'view-transition-class: does one rule reach several names', async () => {
  await lab(({ css }) => window.__vt.style(css), {
    css: `
      ::view-transition-group(*.shared) { animation: lab-group ${DURATION}ms both; }
      @keyframes lab-group { from { transform: scale(1) } to { transform: scale(1.8) } }
    `,
  })

  await lab(({ items }) => window.__vt.mount(items), {
    items: [
      { id: 'hero', name: 'hero', text: 'hero' },
      { id: 'card', name: 'card', text: 'card' },
    ],
  })

  await lab(() => {
    for (const el of document.querySelectorAll('.tile')) el.style.viewTransitionClass = 'shared'
  })

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
  const measured = await lab(({ t }) => window.__vt.advance(t, []), { t: DURATION / 2 })

  await lab(() => window.__vt.finish())

  // `CSS.supports` accepts both spellings, so parsing is not the question — matching is. Re-run with
  // only the bare class and see whether it reaches the groups at all.
  await lab(({ css }) => window.__vt.style(css), {
    css: `
      ::view-transition-group(.shared) { animation: lab-bare ${DURATION}ms both; }
      @keyframes lab-bare { from { transform: scale(1) } to { transform: scale(1.8) } }
    `,
  })

  const bareStarted = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
  const bare = await lab(({ t }) => window.__vt.advance(t, []), { t: DURATION / 2 })

  await lab(() => window.__vt.finish())

  return {
    bareStarted,
    classes: await lab(() => [...document.querySelectorAll('.tile')].map(el => getComputedStyle(el).viewTransitionClass)),
    started,
    withoutUniversal: {
      reached: bare.animations.filter(animation => animation.name === 'lab-bare').map(animation => animation.pseudo),
      supports: await lab(() => CSS.supports('selector(::view-transition-group(.shared))')),
    },
    withUniversal: measured.animations.map(animation => `${animation.pseudo} → ${animation.name}`),
  }
})

/* ------------------------------------------------------------------ 6b. arbitrary names */

await probe('P6b', 'Arbitrary names survive into the pseudo selector', async () => {
  const list = ['hero-tile', 'my-card-2']

  await lab(({ css }) => window.__vt.style(css), {
    css: `
      ::view-transition-old(hero-tile), ::view-transition-new(hero-tile),
      ::view-transition-old(my-card-2), ::view-transition-new(my-card-2) {
        ${jumiRules.substrate}
        ${jumiRules.aggregate}
        --jumi-animation-duration: ${DURATION}ms;
        --jumi-fade-in-animation-name: jumi-fade-in;
      }
    `,
  })

  await lab(({ items }) => window.__vt.mount(items), {
    items: [
      { id: 'one', name: 'hero-tile', text: 'one' },
      { id: 'two', name: 'my-card-2', text: 'two' },
    ],
  })

  const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
  const measured = await lab(({ t }) => window.__vt.advance(t, []), { t: DURATION / 2 })

  await lab(() => window.__vt.finish())

  return {
    animations: measured.animations.filter(animation => animation.name.startsWith('jumi-')).map(animation => `${animation.pseudo} → ${animation.name}`),
    declared: await lab(() => [...document.querySelectorAll('.tile')].map(el => getComputedStyle(el).viewTransitionName)),
    note: `asked for ${list.join(', ')}`,
    started,
  }
})

/* ------------------------------------------------------------------ 7. duplicate names */

await probe('P7', 'Duplicate view-transition-name', async () => {
  await lab(({ css }) => window.__vt.style(css), { css: '' })
  await mountHero()
  console_.length = 0

  const started = await lab(async ({ items, op }) => {
    window.__vt.mount([...items.current, ...items.duplicate])

    return window.__vt.start(op)
  }, {
    items: { current: [{ id: 'hero', name: 'hero', text: 'hero' }], duplicate: [{ id: 'hero2', name: 'hero', text: 'dup' }] },
    op: 'move',
  })

  await page.waitForTimeout(200)

  const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), { pseudos: HERO_PSEUDOS })

  return {
    animations: measured.animations.map(animation => `${animation.pseudo} → ${animation.name}`),
    console: console_.slice(0, 6),
    pseudos: Object.fromEntries(Object.entries(view(measured).pseudos).map(([k, v]) => [k, v.exists ? v.name : 'absent'])),
    started,
  }
})

/* ------------------------------------------------------------------ 8. the selector-list trap */

await probe('P8', 'An unrecognised pseudo invalidates the whole comma list', async () => {
  await lab(({ css }) => window.__vt.style(css), { css: '' })
  await lab(({ css }) => window.__vt.style(css), {
    css: `
      #plain, ::definitely-not-a-pseudo-element { --probe-merged: yes; }
      #hero { --probe-alone: yes; }
    `,
  })

  await mountHero()

  return {
    alone: await lab(() => getComputedStyle(document.querySelector('#hero')).getPropertyValue('--probe-alone').trim() || null),
    guardSupported: await lab(() => CSS.supports('selector(::view-transition-old(root))')),
    guardUnsupported: await lab(() => CSS.supports('selector(::definitely-not-a-pseudo-element)')),
    merged: await lab(() => getComputedStyle(document.querySelector('#plain')).getPropertyValue('--probe-merged').trim() || null),
  }
})

/* ------------------------------------------------------------------ 9. old without new, new without old */

await probe('P9', 'Old side without a new side, and the reverse', async () => {
  await lab(({ css }) => window.__vt.style(css), { css: '' })

  const shape = (measured) => {
    const seen = view(measured)

    return {
      active: seen.active,
      animations: seen.animations,
      live: Object.entries(seen.pseudos).filter(([, value]) => value.live).map(([pseudo]) => pseudo),
      resolvedOnly: Object.entries(seen.pseudos).filter(([, value]) => value.resolved && !value.live).map(([pseudo]) => pseudo),
    }
  }

  await mountHero()

  const removed = await lab(({ arg, op }) => window.__vt.start(op, arg), { arg: 'hero', op: 'remove' })
  const afterRemove = await lab(({ pseudos }) => window.__vt.measure(pseudos), { pseudos: HERO_PSEUDOS })

  // A fresh document for the other direction, so "new without old" is not measured through the tail
  // of the transition that just ran — that is what produced a spurious `Animation start failed`.
  await page.reload()
  await page.waitForFunction(() => window.__vtReady === true)
  await lab(({ items }) => window.__vt.mount(items), { items: [{ id: 'plain', text: 'plain' }] })

  const added = await lab(({ arg, op }) => window.__vt.start(op, arg), { arg: [{ id: 'hero', name: 'hero', text: 'hero' }], op: 'mount' })
  const afterAdd = await lab(({ pseudos }) => window.__vt.measure(pseudos), { pseudos: HERO_PSEUDOS })

  await lab(() => window.__vt.finish())

  return {
    added: { started: added, ...shape(afterAdd) },
    removed: { started: removed, ...shape(afterRemove) },
  }
})

/* ------------------------------------------------------------------ 10. reduced motion */

await probe('P10', 'prefers-reduced-motion: does the platform clamp for us', async () => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { height: 600, width: 900 } })
  const reducedPage = await reduced.newPage()

  await reducedPage.goto(`${base}/lab.html`)
  await reducedPage.waitForFunction(() => window.__vtReady === true)
  await reducedPage.evaluate(({ items }) => window.__vt.mount(items), {
    items: [{ id: 'hero', name: 'hero', text: 'hero' }],
  })

  const before = await reducedPage.evaluate(({ op }) => window.__vt.start(op), { op: 'move' })
  const measured = await reducedPage.evaluate(({ pseudos, t }) => window.__vt.advance(t, pseudos), { pseudos: ROOT_PSEUDOS, t: 60 })

  const after = await reducedPage.evaluate(({ css }) => {
    window.__vt.finish()
    window.__vt.style(css)

    return true
  }, {
    css: `
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
      }
    `,
  })

  const clamped = await reducedPage.evaluate(({ op }) => window.__vt.start(op), { op: 'move' })
  const clampedMeasure = await reducedPage.evaluate(({ pseudos }) => window.__vt.measure(pseudos), { pseudos: ROOT_PSEUDOS })

  await reduced.close()

  return {
    clampApplied: after,
    clamped: { animations: clampedMeasure.animations.map(a => `${a.pseudo} → ${a.name}`), started: clamped },
    mediaMatches: true,
    unclamped: { started: before, ...view(measured) },
  }
})

/* ------------------------------------------------------------------ 11. cross-document */

/**
 * Build the retargeted cross-document sheet once, out of the same extracted blocks the
 * same-document probe used. The old side runs `jumi-fade-in` backwards and the new side forwards,
 * which is the one place a direction control on the pseudo has to be shown to work.
 */
const crossJumiSheet = ({ group = false } = {}) => `
  ::view-transition-old(root), ::view-transition-new(root) {
    ${jumiRules.substrate}
    ${jumiRules.aggregate}
    --jumi-animation-duration: 900ms;
    --jumi-fade-in-animation-name: jumi-fade-in;
  }
  ::view-transition-old(root) { --jumi-fade-in-animation-direction: reverse; }
  ::view-transition-old(hero), ::view-transition-new(hero) {
    ${jumiRules.substrate}
    ${jumiRules.aggregate}
    --jumi-animation-duration: 900ms;
    --jumi-bounce-in-animation-name: jumi-bounce-in;
  }
  ${group ? `::view-transition-group(hero) { animation: lab-group 900ms ease both; } @keyframes lab-group { from { transform: scale(1) } to { transform: scale(1.8) } }` : ''}
`

async function crossDocument({ label, sheet, types }) {
  const fresh = await context.newPage()

  // The fixture pages carry no JavaScript of their own, so the navigation between them is a plain
  // link click — which is also the only kind of navigation that starts a cross-document transition
  // here. A CDP-driven `page.goto()` produces a `pageswap`/`pagereveal` pair with no transition at
  // all, and the negative control (the same click with the at-rule removed) produces the same empty
  // pair, so the at-rule is the opt-in and the navigation source is what differs.
  await fresh.goto(`${base}/cross-from.html?types=${encodeURIComponent(types)}&sheet=${encodeURIComponent(sheet)}`)
  await fresh.waitForLoadState('load')
  await fresh.click('#go')
  await fresh.waitForTimeout(1600)

  const trace = await fresh.evaluate(() => window.__vtTrace ?? [])
  const trimmed = trace.map(entry => ({
    active: entry.active,
    animations: entry.animations,
    at: entry.at,
    hasTransition: entry.hasTransition,
    heroGroup: entry.pseudos?.['::view-transition-group(hero)'],
    heroOld: entry.pseudos?.['::view-transition-old(hero)'],
    rootOld: entry.pseudos?.['::view-transition-old(root)'],
    typed: entry.typed,
  }))

  await fresh.close()

  return {
    entries: trimmed.length,
    first: trimmed[0],
    label,
    ready: trimmed.find(entry => entry.at === 'ready'),
    // Early, middle and late samples: enough to show motion without a wall of text.
    samples: [trimmed[2], trimmed[Math.floor(trimmed.length / 2)], trimmed[trimmed.length - 1]].filter(Boolean),
  }
}

await probe('P11', 'Cross-document, zero JavaScript: the baseline', () => crossDocument({
  label: 'manual (author keyframes replace both UA defaults)',
  sheet: '/cross-manual.css',
  types: '',
}))

await probe('P12', 'Cross-document: an author animation on the group replaces the shared-element travel', () => crossDocument({
  label: 'group overridden',
  sheet: '/cross-group.css',
  types: '',
}))

await probe('P13', 'Cross-document: the retargeted Jumi composition, no JavaScript', () => {
  crossJumi = crossJumiSheet()

  return crossDocument({ label: 'jumi retargeted', sheet: '/cross-jumi.css', types: '' })
})

await probe('P14', 'Cross-document: view-transition types', () => crossDocument({
  label: 'types: slide',
  sheet: '/cross-manual.css',
  types: 'types: slide;',
}))

/* ------------------------------------------------------------------ done */

await browser.close()
server.close()

const failed = probes.filter(entry => entry.error)

console.log(`\n${'─'.repeat(72)}`)
console.log(`${probes.length} probes, ${failed.length} failed`)
if (failed.length) console.log(failed.map(entry => `  ${entry.id}: ${entry.error}`).join('\n'))
