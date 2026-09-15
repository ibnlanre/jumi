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

import { samplePixel } from './lib/png.mjs'

import path from 'node:path'
import postcss from 'postcss'

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

const ALL = [
  ...ROOT_PSEUDOS,
  ...HERO_PSEUDOS,
  '::view-transition-group(card)',
  '::view-transition-new(card)',
]

/* ------------------------------------------------------------------ fixtures */

/**
 * The fixture server. Two pages are templated rather than duplicated: `{{TYPES}}` is the
 * `@view-transition` type list and `{{SHEET}}` is which pseudo-element stylesheet the pair links.
 * The chosen variant is remembered, so a plain link click between the two pages keeps it — the
 * pages themselves stay free of JavaScript and the zero-JS claim survives.
 *
 * `sheets=<from>,<to>` gives the two documents *different* stylesheets. That is the only way to ask
 * which document governs a pseudo-element: with one shared sheet, "the outgoing document styled it"
 * and "the incoming document styled it" are the same stylesheet and the question cannot be put.
 */
let variant = { sheet: '/cross-manual.css', sheetTo: null, types: '' }
let crossJumi = ''

/**
 * Marker rules written by one document, for P18.
 *
 * Four distinct property names per side rather than one shared property set twice: two rules setting
 * the *same* property would be settled by cascade order, which the measurement cannot observe, so it
 * would answer "which document won" instead of "which document applied". Distinct names let both
 * documents' rules be visible at once when both apply.
 */
const ownership = side => `
  ${['old', 'new', 'pair', 'group'].map(part => `@property --probe-${side}-${part} { syntax: "*"; inherits: false; }`).join('\n  ')}
  :root { --probe-${side}-loaded: yes; }
  @keyframes probe-${side} { from { opacity: 0.5 } to { opacity: 0.5 } }
  /* A custom property observed through a standard one. Opacity is readable everywhere, and the value
     it resolves to is the variable's with 1 as the fallback — so this says whether the declaration
     reached the cascade, which reading the variable back does not manage here. */
  @keyframes probe-${side}-var {
    from { opacity: var(--probe-${side}-varvalue, 1) }
    to { opacity: var(--probe-${side}-varvalue, 1) }
  }
  /* Three signals from the same rule, because one is not enough. The marker says the custom property
     reads back. The plain animation says the rule applied at all. The variable-driven animation says
     a custom property reached the cascade, observed through opacity rather than by reading the
     variable. Without the third, "the rule did not apply" and "the property did not read" are the
     same observation — and they are not the same finding. */
  ::view-transition-old(root) {
    --probe-${side}-old: yes;
    --probe-${side}-varvalue: 0.25;
    animation: probe-${side}-var 900ms both;
  }
  ::view-transition-new(root) { --probe-${side}-new: yes; }
  ::view-transition-image-pair(root) { --probe-${side}-pair: yes; }
  ::view-transition-group(root) { --probe-${side}-group: yes; }
`

const routes = new Map([
  [
    '/cross-group.css',
    () => ({
      body: readFileSync(path.join(fixtures, 'cross-group.css'), 'utf8'),
      type: 'text/css',
    }),
  ],
  ['/cross-jumi.css', () => ({ body: crossJumi, type: 'text/css' })],
  [
    '/cross-manual.css',
    () => ({
      body: readFileSync(path.join(fixtures, 'cross-manual.css'), 'utf8'),
      type: 'text/css',
    }),
  ],
  [
    '/jumi.css',
    () => ({ body: readFileSync(snapshot, 'utf8'), type: 'text/css' }),
  ],
  [
    '/lab.html',
    () => ({
      body: readFileSync(path.join(fixtures, 'lab.html'), 'utf8'),
      type: 'text/html',
    }),
  ],
  [
    '/lab.js',
    () => ({
      body: readFileSync(path.join(fixtures, 'lab.js'), 'utf8'),
      type: 'text/javascript',
    }),
  ],
  ['/own-from.css', () => ({ body: ownership('from'), type: 'text/css' })],
  ['/own-to.css', () => ({ body: ownership('to'), type: 'text/css' })],
])

for (const name of ['cross-from.html', 'cross-to.html']) {
  routes.set(`/${name}`, url => {
    if (
      url.searchParams.has('sheet') ||
      url.searchParams.has('sheets') ||
      url.searchParams.has('types')
    ) {
      const pair = url.searchParams.get('sheets')?.split(',')

      variant = {
        sheet: pair?.[0] ?? url.searchParams.get('sheet') ?? variant.sheet,
        // A pair replaces both sides, so the second sheet is cleared when only one is given: carrying
        // a previous run's `to` sheet into a single-sheet run would silently test the wrong thing.
        sheetTo: pair ? (pair[1] ?? pair[0]) : null,
        types: url.searchParams.get('types') ?? (pair ? '' : variant.types),
      }
    }

    const sheet =
      name === 'cross-to.html'
        ? (variant.sheetTo ?? variant.sheet)
        : variant.sheet

    const body = readFileSync(path.join(fixtures, name), 'utf8')
      .replaceAll('{{TYPES}}', variant.types)
      .replaceAll('{{SHEET}}', sheet)

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

  response
    .writeHead(200, { 'cache-control': 'no-store', 'content-type': type })
    .end(body)
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

const base = `http://127.0.0.1:${server.address().port}`

/* ------------------------------------------------------------------ reporting */

const probes = []

/** A per-slot `animation-name` list is hundreds of entries long; keep only what a reader can use. */
const names = value => {
  if (typeof value !== 'string' || value === '') return { empty: true }

  const parts = value.split(',').map(part => part.trim())
  const real = parts.filter(part => part !== 'none')

  return {
    animate: real.length,
    entries: parts.length,
    jumi: [...new Set(real.filter(part => part.startsWith('jumi-')))].slice(
      0,
      6,
    ),
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
  animations: measured.animations.map(
    animation =>
      `${animation.pseudo} → ${animation.name}${animation.frames ? ` (${animation.frames} frames)` : ''}`,
  ),
  pseudos: Object.fromEntries(
    Object.entries(measured.pseudos).map(([pseudo, value]) => [
      pseudo,
      {
        direction: value.animationDirection?.includes('reverse')
          ? value.animationDirection
          : undefined,
        live: measured.animations.some(
          animation => animation.pseudo === pseudo,
        ),
        name: names(value.animationName),
        opacity: value.opacity,
        resolved: value.exists,
        transform: value.transform,
      },
    ]),
  ),
  root: measured.root,
})

async function probe(id, title, run) {
  try {
    const data = await run()

    probes.push({ data, id, title })
    console.log(`\n── ${id}  ${title}`)
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    probes.push({ error: String(error?.message ?? error), id, title })
    console.log(`\n── ${id}  ${title}\n   ⚠️  ${error?.message ?? error}`)
  }
}

/* ------------------------------------------------------------------ session */

const browser = await chromium.launch()

const context = await browser.newContext({
  reducedMotion: 'no-preference',
  viewport: { height: 600, width: 900 },
})
const page = await context.newPage()
const console_ = []

page.on('console', message =>
  console_.push(`${message.type()}: ${message.text()}`),
)
page.on('pageerror', error => console_.push(`pageerror: ${error.message}`))

await page.goto(`${base}/lab.html`)
await page.waitForFunction(() => window.__vtReady === true)

const lab = (fn, arg) => page.evaluate(fn, arg)

const mountHero = () =>
  lab(({ items }) => window.__vt.mount(items), {
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
      } catch {
        return null
      }
    }
    const selector = value => {
      try {
        return CSS.supports(`selector(${value})`)
      } catch (error) {
        return String(error)
      }
    }

    return {
      'selector(::view-transition-group(*.card))': selector(
        '::view-transition-group(*.card)',
      ),
      'selector(::view-transition-group(.card))': selector(
        '::view-transition-group(.card)',
      ),
      'selector(::view-transition-old(root))': selector(
        '::view-transition-old(root)',
      ),
      'selector(:active-view-transition)': selector(':active-view-transition'),
      'selector(:active-view-transition-type(slide))': selector(
        ':active-view-transition-type(slide)',
      ),
      'startViewTransition': typeof document.startViewTransition,
      'view-transition-class': test('view-transition-class', 'card'),
      'view-transition-name': test('view-transition-name', 'hero'),
    }
  })

  return { chromium: browser.version(), ...supports }
})

/* ------------------------------------------------------------------ 1. the tree and its defaults */

await probe(
  'P1',
  'The generated pseudo tree, and the UA animations on it',
  async () => {
    await mountHero()

    const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })

    if (!started.ready) return { started }

    const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), {
      pseudos: ALL,
    })

    return { started, ...view(measured) }
  },
)

/* ------------------------------------------------------------------ 2. author CSS replaces the defaults */

await probe(
  'P2',
  'Author animations replace the UA defaults at every level',
  async () => {
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

    const at0 = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), {
      pseudos: ALL,
      t: 0,
    })
    const mid = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), {
      pseudos: ALL,
      t: DURATION / 2,
    })
    const end = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), {
      pseudos: ALL,
      t: DURATION,
    })

    return {
      drivenAt0: at0.driven,
      end: view(end),
      middle: view(mid),
      start: view(at0),
    }
  },
)

/* ------------------------------------------------------------------ 3a. reachability */

/**
 * The two halves of the emitted composition, plus the activation rule for a slot, extracted from the
 * snapshot **in Node** rather than read back out of CSSOM in the page.
 *
 * That is a correction, and the reason is worth recording. The composition's `animation` declaration
 * carries a `var()`, and a shorthand with a pending-substitution value cannot be expanded into
 * longhands — so `rule.style.getPropertyValue('animation')` returns the empty string for exactly the
 * rule being looked for, and `rule.style.cssText` omits the declaration entirely. A page-side reader
 * therefore reports "no composition in the stylesheet" about a stylesheet whose composition is
 * demonstrably running (`P3a` reads 33 entries on the element from the same rule).
 *
 * The file is the artifact anyway, and parsing it with the same structural predicate the gate uses
 * means the two cannot drift apart — which is the failure this extractor had already suffered once,
 * when the composition stopped declaring `animation-name` and its finder went quietly to `null`.
 */
const sheetRoot = postcss.parse(readFileSync(snapshot, 'utf8'))
const sheetRules = []
let keyframeCount = 0

sheetRoot.walkRules(rule => sheetRules.push(rule))
sheetRoot.walkAtRules(/^keyframes$/, () => {
  keyframeCount += 1
})

/**
 * A rule's declarations as replayable CSS text.
 *
 * The trailing `;` is not cosmetic. Two blocks are pasted next to each other to build a retarget, and
 * without a terminator the last declaration of the first block **absorbs** the first declaration of
 * the second: `--jumi-animation-range: normal` followed by `animation: var(…)` parses as one custom
 * property whose value happens to contain the text `animation: …`. The symptom is precise and was
 * exactly what this cost: `animation-composition` and `animation-timeline` applied, the `animation`
 * shorthand vanished, and the edge fell back to the UA's own cross-fade while everything looked
 * present and correct.
 */
const declarationsOf = rule =>
  (rule.nodes ?? [])
    .filter(node => node.type === 'decl')
    .map(node => `${node.prop}: ${node.value};`)
    .join(' ')

const substrateRule = sheetRules.find(rule =>
  rule.nodes?.some(
    node =>
      node.type === 'decl' &&
      node.prop === '--jumi-animation-name' &&
      node.value === 'none',
  ),
)

const compositionRule = sheetRules.find(rule => {
  const decls = (rule.nodes ?? []).filter(node => node.type === 'decl')
  const props = decls.map(node => node.prop)
  const shorthand = decls.find(node => node.prop === 'animation')
  const lastReset = Math.max(
    props.indexOf('animation-composition'),
    props.indexOf('animation-timeline'),
  )

  return (
    shorthand !== undefined &&
    props.indexOf('animation') < lastReset &&
    decls.some(node => node.prop === 'animation-composition') &&
    decls.some(node => node.prop === 'animation-timeline') &&
    shorthand.value.includes('var(--jumi-slot-')
  )
})

/** The declaration block of the rule that activates `selector`'s slot — its publication included. */
const activationRule = selector =>
  sheetRules.find(
    rule =>
      rule.selector === selector &&
      rule.nodes?.some(
        node => node.type === 'decl' && node.prop.startsWith('--jumi-slot-'),
      ),
  )

const extracted = {
  aggregate: compositionRule ? declarationsOf(compositionRule) : null,
  sub: substrateRule ? declarationsOf(substrateRule) : null,
}

let jumiRules = {
  activations: Object.fromEntries(
    ['.animate-fade-in', '.animate-bounce-in'].map(selector => [
      selector,
      activationRule(selector)
        ? declarationsOf(activationRule(selector))
        : null,
    ]),
  ),
  aggregate: extracted.aggregate,
  hoistedRules: sheetRules.filter(rule =>
    rule.nodes?.some(
      node => node.type === 'decl' && node.prop.startsWith('--jumi-slot-'),
    ),
  ).length,
  substrate: extracted.sub,
}

let retarget = ''

/** The activation block for a utility, or a loud marker if the extraction failed. */
const activationOf = selector =>
  jumiRules.activations[selector] ?? '/* ACTIVATION NOT EXTRACTED */'

const retargetCss = (durations = DURATION) => `
  /* The two halves of the emitted composition, unchanged, under a view-transition selector. */
  ::view-transition-old(hero), ::view-transition-new(hero) {
    ${jumiRules.substrate}
    ${jumiRules.aggregate}
    --jumi-animation-duration: ${durations}ms;
  }
  /* The activation rule's own body, replayed: it carries the slot activation *and* the publication
     the hoist moved onto it. A per-slot control is added on top, declared on the pseudo. */
  ::view-transition-old(hero) {
    ${activationOf('.animate-fade-in')}
    --jumi-fade-in-animation-direction: reverse;
  }
  ::view-transition-new(hero) { ${activationOf('.animate-fade-in')} }
`

await probe(
  'P3a',
  'Can a utility on the source element reach the pseudo tree',
  async () => {
    // No view-transition CSS of the harness's own: the only thing that could put a value on the
    // pseudo is the utility on the element.
    await lab(({ css }) => window.__vt.style(css), { css: '' })

    await mountHero()
    await lab(() => {
      document.querySelector('#hero').className = 'tile animate-fade-in'
    })

    const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
    const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), {
      pseudos: HERO_PSEUDOS,
    })

    return {
      extracted: {
        activationBytes: Object.fromEntries(
          Object.entries(jumiRules.activations).map(([selector, value]) => [
            selector,
            value?.length ?? 0,
          ]),
        ),
        aggregateAnimationHead: (jumiRules.aggregate?.match(
          /(?<![\w-])animation:[^;]{0,80}/,
        ) ?? [''])[0],
        aggregateBytes: jumiRules.aggregate?.length ?? 0,
        // Declared properties, so a reader can see the shape the retarget replays rather than trusting
        // that the string is the right one.
        aggregateDeclares: compositionRule
          ? (compositionRule.nodes ?? [])
              .filter(node => node.type === 'decl')
              .map(node => node.prop)
          : [],
        aggregateSelectors: compositionRule
          ? compositionRule.selectors.length
          : 0,
        aggregateSlotRefs: (
          jumiRules.aggregate?.match(/var\(--jumi-slot-/g) ?? []
        ).length,
        hoistedRules: jumiRules.hoistedRules,
        keyframesInSnapshot: keyframeCount,
        substrateAnimationHead: (jumiRules.substrate?.match(
          /(?<![\w-])animation:[^;]{0,80}/,
        ) ?? [''])[0],
        substrateBytes: jumiRules.substrate?.length ?? 0,
        substrateDeclares: substrateRule
          ? (substrateRule.nodes ?? [])
              .filter(node => node.type === 'decl')
              .map(node => node.prop).length
          : 0,
        substrateSelectors: substrateRule ? substrateRule.selectors.length : 0,
      },
      pseudo: {
        animations: measured.animations.map(
          animation => `${animation.pseudo} → ${animation.name}`,
        ),
        live: measured.animations.some(
          animation => animation.pseudo === '::view-transition-new(hero)',
        ),
        name: names(
          measured.pseudos['::view-transition-new(hero)']?.animationName ?? '',
        ),
        slotOnNew: await lab(
          () =>
            getComputedStyle(
              document.documentElement,
              '::view-transition-new(hero)',
            )
              .getPropertyValue('--jumi-fade-in-animation-name')
              .trim() || null,
        ),
      },
      sourceElement: {
        animationNameEntries: await lab(
          () =>
            getComputedStyle(
              document.querySelector('#hero'),
            ).animationName.split(',').length,
        ),
        animationNameJumi: await lab(() =>
          [
            ...new Set(
              getComputedStyle(document.querySelector('#hero'))
                .animationName.split(',')
                .map(part => part.trim())
                .filter(part => part.startsWith('jumi-')),
            ),
          ].slice(0, 4),
        ),
        classes: await lab(() => document.querySelector('#hero').className),
        rulesSettingAnimationName: await lab(() =>
          window.__vt.matching('#hero'),
        ),
        slot: await lab(() =>
          getComputedStyle(document.querySelector('#hero'))
            .getPropertyValue('--jumi-fade-in-animation-name')
            .trim(),
        ),
      },
      started,
    }
  },
)

/* ------------------------------------------------------------------ 3b. the retarget */

await probe(
  'P3b',
  'The emitted Jumi composition, replayed verbatim under a view-transition selector',
  async () => {
    retarget = retargetCss()

    await lab(({ css }) => window.__vt.style(css), { css: retarget })

    await mountHero()

    const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
    const at0 = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), {
      pseudos: HERO_PSEUDOS,
      t: 0,
    })
    const mid = await lab(({ pseudos, t }) => window.__vt.advance(t, pseudos), {
      pseudos: HERO_PSEUDOS,
      t: DURATION / 2,
    })

    /**
     * What the page actually received.
     *
     * A retarget that is silently dropped and a retarget that applies but resolves to `none` look the
     * same from `getAnimations()` — both leave the UA's own animations running. These four readings
     * separate them: the rule is present, the declaration is present, the slot publication reached the
     * pseudo, and the computed list has the right length.
     */
    const applied = await lab(() => {
      const sheet = document.querySelector('#vt').sheet
      const rules = [...sheet.cssRules]
      const heroOld = rules.find(rule =>
        (rule.selectorText ?? '').includes('view-transition-old(hero)'),
      )
      const text = heroOld?.style.cssText ?? ''
      const at = text.indexOf('animation:')
      const cs = getComputedStyle(
        document.documentElement,
        '::view-transition-old(hero)',
      )

      return {
        animationAt: at,
        animationDeclared: [...(heroOld?.style ?? [])].filter(name =>
          name.startsWith('animation'),
        ),
        declarations: heroOld?.style.length ?? 0,
        pseudoDuration: cs.animationDuration.slice(0, 32),
        pseudoNameEntries: cs.animationName.split(',').length,
        pseudoSlotHead: cs.getPropertyValue('--jumi-slot-fade-in').slice(0, 60),
        ruleCount: rules.length,
        shorthand: at < 0 ? null : text.slice(at, at + 90),
      }
    })

    return {
      applied,
      atStart: Object.fromEntries(
        Object.entries(view(at0).pseudos).map(([k, v]) => [
          k,
          { name: v.name, opacity: v.opacity, transform: v.transform },
        ]),
      ),
      started,
      ...view(mid),
    }
  },
)

/* ------------------------------------------------------------------ 4. inheritance into the tree */

await probe(
  'P4',
  'What reaches the pseudo tree from the root element',
  async () => {
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

    const found = await lab(
      ({ pseudos }) => {
        const read = pseudo => {
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
      },
      {
        pseudos: [
          '::view-transition',
          '::view-transition-group(root)',
          '::view-transition-old(hero)',
          '::view-transition-new(hero)',
        ],
      },
    )

    // Read the root while the values are still set, otherwise this row is a measurement of nothing.
    const set = await lab(() => {
      const cs = getComputedStyle(document.documentElement)

      return {
        globalDuration:
          cs.getPropertyValue('--jumi-animation-duration').trim() || null,
        globalName: cs.getPropertyValue('--jumi-animation-name').trim() || null,
        probe: cs.getPropertyValue('--not-registered-probe').trim() || null,
        slotName:
          cs.getPropertyValue('--jumi-fade-in-animation-name').trim() || null,
      }
    })

    await lab(() =>
      window.__vt.vars({
        '--jumi-animation-duration': null,
        '--jumi-animation-name': null,
        '--jumi-fade-in-animation-name': null,
        '--not-registered-probe': null,
      }),
    )
    await lab(() => window.__vt.finish())

    return { onPseudo: found, onRoot: set }
  },
)

/* ------------------------------------------------------------------ 5. two groups, two animations */

await probe(
  'P5',
  'Two named groups animating different Jumi effects at once',
  async () => {
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
    const measured = await lab(({ t }) => window.__vt.advance(t, []), {
      t: DURATION / 2,
    })

    return {
      animations: measured.animations.map(
        animation => `${animation.pseudo} → ${animation.name}`,
      ),
      cardSlot: await lab(() =>
        getComputedStyle(
          document.documentElement,
          '::view-transition-new(card)',
        )
          .getPropertyValue('--jumi-shake-animation-name')
          .trim(),
      ),
      heroSlot: await lab(() =>
        getComputedStyle(
          document.documentElement,
          '::view-transition-new(hero)',
        )
          .getPropertyValue('--jumi-fade-in-animation-name')
          .trim(),
      ),
      started,
    }
  },
)

/* ------------------------------------------------------------------ 6. view-transition-class */

await probe(
  'P6',
  'view-transition-class: does one rule reach several names',
  async () => {
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
      for (const el of document.querySelectorAll('.tile'))
        el.style.viewTransitionClass = 'shared'
    })

    const started = await lab(({ op }) => window.__vt.start(op), { op: 'move' })
    const measured = await lab(({ t }) => window.__vt.advance(t, []), {
      t: DURATION / 2,
    })

    await lab(() => window.__vt.finish())

    // `CSS.supports` accepts both spellings, so parsing is not the question — matching is. Re-run with
    // only the bare class and see whether it reaches the groups at all.
    await lab(({ css }) => window.__vt.style(css), {
      css: `
      ::view-transition-group(.shared) { animation: lab-bare ${DURATION}ms both; }
      @keyframes lab-bare { from { transform: scale(1) } to { transform: scale(1.8) } }
    `,
    })

    const bareStarted = await lab(({ op }) => window.__vt.start(op), {
      op: 'move',
    })
    const bare = await lab(({ t }) => window.__vt.advance(t, []), {
      t: DURATION / 2,
    })

    await lab(() => window.__vt.finish())

    return {
      bareStarted,
      classes: await lab(() =>
        [...document.querySelectorAll('.tile')].map(
          el => getComputedStyle(el).viewTransitionClass,
        ),
      ),
      started,
      withoutUniversal: {
        reached: bare.animations
          .filter(animation => animation.name === 'lab-bare')
          .map(animation => animation.pseudo),
        supports: await lab(() =>
          CSS.supports('selector(::view-transition-group(.shared))'),
        ),
      },
      withUniversal: measured.animations.map(
        animation => `${animation.pseudo} → ${animation.name}`,
      ),
    }
  },
)

/* ------------------------------------------------------------------ 6b. arbitrary names */

await probe(
  'P6b',
  'Arbitrary names survive into the pseudo selector',
  async () => {
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
    const measured = await lab(({ t }) => window.__vt.advance(t, []), {
      t: DURATION / 2,
    })

    await lab(() => window.__vt.finish())

    return {
      animations: measured.animations
        .filter(animation => animation.name.startsWith('jumi-'))
        .map(animation => `${animation.pseudo} → ${animation.name}`),
      declared: await lab(() =>
        [...document.querySelectorAll('.tile')].map(
          el => getComputedStyle(el).viewTransitionName,
        ),
      ),
      note: `asked for ${list.join(', ')}`,
      started,
    }
  },
)

/* ------------------------------------------------------------------ 7. duplicate names */

await probe('P7', 'Duplicate view-transition-name', async () => {
  await lab(({ css }) => window.__vt.style(css), { css: '' })
  await mountHero()
  console_.length = 0

  const started = await lab(
    async ({ items, op }) => {
      window.__vt.mount([...items.current, ...items.duplicate])

      return window.__vt.start(op)
    },
    {
      items: {
        current: [{ id: 'hero', name: 'hero', text: 'hero' }],
        duplicate: [{ id: 'hero2', name: 'hero', text: 'dup' }],
      },
      op: 'move',
    },
  )

  await page.waitForTimeout(200)

  const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), {
    pseudos: HERO_PSEUDOS,
  })

  return {
    animations: measured.animations.map(
      animation => `${animation.pseudo} → ${animation.name}`,
    ),
    console: console_.slice(0, 6),
    pseudos: Object.fromEntries(
      Object.entries(view(measured).pseudos).map(([k, v]) => [
        k,
        v.exists ? v.name : 'absent',
      ]),
    ),
    started,
  }
})

/* ------------------------------------------------------------------ 8. the selector-list trap */

await probe(
  'P8',
  'An unrecognised pseudo invalidates the whole comma list',
  async () => {
    await lab(({ css }) => window.__vt.style(css), { css: '' })
    await lab(({ css }) => window.__vt.style(css), {
      css: `
      #plain, ::definitely-not-a-pseudo-element { --probe-merged: yes; }
      #hero { --probe-alone: yes; }
    `,
    })

    await mountHero()

    return {
      alone: await lab(
        () =>
          getComputedStyle(document.querySelector('#hero'))
            .getPropertyValue('--probe-alone')
            .trim() || null,
      ),
      guardSupported: await lab(() =>
        CSS.supports('selector(::view-transition-old(root))'),
      ),
      guardUnsupported: await lab(() =>
        CSS.supports('selector(::definitely-not-a-pseudo-element)'),
      ),
      merged: await lab(
        () =>
          getComputedStyle(document.querySelector('#plain'))
            .getPropertyValue('--probe-merged')
            .trim() || null,
      ),
    }
  },
)

/* ------------------------------------------------------------------ 9. old without new, new without old */

await probe('P9', 'Old side without a new side, and the reverse', async () => {
  await lab(({ css }) => window.__vt.style(css), { css: '' })

  const shape = measured => {
    const seen = view(measured)

    return {
      active: seen.active,
      animations: seen.animations,
      live: Object.entries(seen.pseudos)
        .filter(([, value]) => value.live)
        .map(([pseudo]) => pseudo),
      resolvedOnly: Object.entries(seen.pseudos)
        .filter(([, value]) => value.resolved && !value.live)
        .map(([pseudo]) => pseudo),
    }
  }

  await mountHero()

  const removed = await lab(({ arg, op }) => window.__vt.start(op, arg), {
    arg: 'hero',
    op: 'remove',
  })
  const afterRemove = await lab(({ pseudos }) => window.__vt.measure(pseudos), {
    pseudos: HERO_PSEUDOS,
  })

  // A fresh document for the other direction, so "new without old" is not measured through the tail
  // of the transition that just ran — that is what produced a spurious `Animation start failed`.
  await page.reload()
  await page.waitForFunction(() => window.__vtReady === true)
  await lab(({ items }) => window.__vt.mount(items), {
    items: [{ id: 'plain', text: 'plain' }],
  })

  const added = await lab(({ arg, op }) => window.__vt.start(op, arg), {
    arg: [{ id: 'hero', name: 'hero', text: 'hero' }],
    op: 'mount',
  })
  const afterAdd = await lab(({ pseudos }) => window.__vt.measure(pseudos), {
    pseudos: HERO_PSEUDOS,
  })

  await lab(() => window.__vt.finish())

  return {
    added: { started: added, ...shape(afterAdd) },
    removed: { started: removed, ...shape(afterRemove) },
  }
})

/* ------------------------------------------------------------------ 10. reduced motion */

await probe(
  'P10',
  'prefers-reduced-motion: does the platform clamp for us',
  async () => {
    const reduced = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { height: 600, width: 900 },
    })
    const reducedPage = await reduced.newPage()

    await reducedPage.goto(`${base}/lab.html`)
    await reducedPage.waitForFunction(() => window.__vtReady === true)
    await reducedPage.evaluate(({ items }) => window.__vt.mount(items), {
      items: [{ id: 'hero', name: 'hero', text: 'hero' }],
    })

    const before = await reducedPage.evaluate(
      ({ op }) => window.__vt.start(op),
      { op: 'move' },
    )
    const measured = await reducedPage.evaluate(
      ({ pseudos, t }) => window.__vt.advance(t, pseudos),
      { pseudos: ROOT_PSEUDOS, t: 60 },
    )

    const after = await reducedPage.evaluate(
      ({ css }) => {
        window.__vt.finish()
        window.__vt.style(css)

        return true
      },
      {
        css: `
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
      }
    `,
      },
    )

    const clamped = await reducedPage.evaluate(
      ({ op }) => window.__vt.start(op),
      { op: 'move' },
    )
    const clampedMeasure = await reducedPage.evaluate(
      ({ pseudos }) => window.__vt.measure(pseudos),
      { pseudos: ROOT_PSEUDOS },
    )

    await reduced.close()

    return {
      clampApplied: after,
      clamped: {
        animations: clampedMeasure.animations.map(
          a => `${a.pseudo} → ${a.name}`,
        ),
        started: clamped,
      },
      mediaMatches: true,
      unclamped: { started: before, ...view(measured) },
    }
  },
)

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
    ${activationOf('.animate-fade-in')}
  }
  ::view-transition-old(root) { --jumi-fade-in-animation-direction: reverse; }
  ::view-transition-old(hero), ::view-transition-new(hero) {
    ${jumiRules.substrate}
    ${jumiRules.aggregate}
    --jumi-animation-duration: 900ms;
    ${activationOf('.animate-bounce-in')}
  }
  ${group ? `::view-transition-group(hero) { animation: lab-group 900ms ease both; } @keyframes lab-group { from { transform: scale(1) } to { transform: scale(1.8) } }` : ''}
`

async function crossDocument({ label, sheet, sheets, types = '' }) {
  const fresh = await context.newPage()

  // The fixture pages carry no JavaScript of their own, so the navigation between them is a plain
  // link click — which is also the only kind of navigation that starts a cross-document transition
  // here. A CDP-driven `page.goto()` produces a `pageswap`/`pagereveal` pair with no transition at
  // all, and the negative control (the same click with the at-rule removed) produces the same empty
  // pair, so the at-rule is the opt-in and the navigation source is what differs.
  const query = sheets
    ? `sheets=${encodeURIComponent(sheets)}&types=${encodeURIComponent(types)}`
    : `sheet=${encodeURIComponent(sheet)}&types=${encodeURIComponent(types)}`

  await fresh.goto(`${base}/cross-from.html?${query}`)
  await fresh.waitForLoadState('load')
  await fresh.click('#go')
  await fresh.waitForTimeout(1600)

  const trace = await fresh.evaluate(() => window.__vtTrace ?? [])

  // Which sheets the destination document actually linked. A run whose markers are all empty is
  // ambiguous on its own — "the other document's rules do not reach" and "the fixture never linked a
  // sheet that writes markers" look identical — so this is recorded next to the result.
  const linked = await fresh.evaluate(() =>
    [...document.styleSheets].map(sheet => sheet.href),
  )

  const trimmed = trace.map(entry => ({
    active: entry.active,
    animations: entry.animations,
    at: entry.at,
    hasTransition: entry.hasTransition,
    heroGroup: entry.pseudos?.['::view-transition-group(hero)'],
    heroOld: entry.pseudos?.['::view-transition-old(hero)'],
    // The whole object, not only the three fields read below. Dropping it emptied every marker map
    // downstream and made three consecutive runs say "nothing reached the pseudo tree" while the
    // field being read for the animation said otherwise.
    pseudos: entry.pseudos,
    rootOld: entry.pseudos?.['::view-transition-old(root)'],
    sheets: entry.sheets,
    typed: entry.typed,
  }))

  await fresh.close()

  return {
    entries: trimmed.length,
    first: trimmed[0],
    label,
    linked,
    ready: trimmed.find(entry => entry.at === 'ready'),
    // Early, middle and late samples: enough to show motion without a wall of text.
    samples: [
      trimmed[2],
      trimmed[Math.floor(trimmed.length / 2)],
      trimmed[trimmed.length - 1],
    ].filter(Boolean),
  }
}

await probe('P11', 'Cross-document, zero JavaScript: the baseline', () =>
  crossDocument({
    label: 'manual (author keyframes replace both UA defaults)',
    sheet: '/cross-manual.css',
    types: '',
  }),
)

await probe(
  'P12',
  'Cross-document: an author animation on the group replaces the shared-element travel',
  () =>
    crossDocument({
      label: 'group overridden',
      sheet: '/cross-group.css',
      types: '',
    }),
)

await probe(
  'P13',
  'Cross-document: the retargeted Jumi composition, no JavaScript',
  () => {
    crossJumi = crossJumiSheet()

    return crossDocument({
      label: 'jumi retargeted',
      sheet: '/cross-jumi.css',
      types: '',
    })
  },
)

await probe('P14', 'Cross-document: view-transition types', () =>
  crossDocument({
    label: 'types: slide',
    sheet: '/cross-manual.css',
    types: 'types: slide;',
  }),
)

/* ------------------------------------------------------------------ 18. which document styles which side */

/**
 * Both documents link a sheet that writes its own four marker properties on the root pseudo tree, and
 * on `:root` a marker saying which sheet arrived. Distinct property names per side, so "both applied"
 * and "one won the cascade" cannot be confused.
 *
 * The run is done twice with the two sheets *swapped*. That is the control: if the governing markers
 * follow the sheet the destination linked rather than the name of the file, then the incoming
 * document governs, and the finding cannot be an artefact of which file happened to hold which
 * markers.
 */
const markerMap = run =>
  Object.fromEntries(
    Object.entries(run.ready?.pseudos ?? {})
      .map(([pseudo, value]) => [pseudo, value?.markers ?? {}])
      .filter(([, markers]) => Object.keys(markers).length),
  )

/**
 * Whether the run could have answered the question at all.
 *
 * This is a statement about the **method**, not about the result — an empty result is a finding, and a
 * method that cannot read a marker makes it indistinguishable from no finding. So it is defined by
 * the control arm, which declares the same kind of marker in a document known to apply, and reads it
 * back with the same call.
 */
const controlReads = control =>
  control.raw === 'yes' &&
  control.registered === 'yes' &&
  control.root === 'yes'

await probe(
  'P18',
  'Cross-document: which document styles the pseudo tree',
  async () => {
    /**
     * The control, and it is not optional.
     *
     * A negative result — "no marker reached the pseudo tree" — is indistinguishable from "a marker
     * declared on a pseudo rule cannot be read back at all" unless the second is measured separately.
     * So both are declared on the same pseudo rule here, one registered `@property` and one raw, and
     * both are read from the same computed style.
     */
    const control = await (async () => {
      await lab(({ css }) => window.__vt.style(css), {
        css: `
        @property --probe-ctl-registered { syntax: "*"; inherits: false; }
        ::view-transition-old(hero), ::view-transition-new(hero) {
          --probe-ctl-registered: yes;
          --probe-ctl-raw: yes;
        }
        /* The same declaration on the root's pseudo, because that is the one the ownership markers
           use — and "a marker on a pseudo rule reads back" and "a marker on the *root* pseudo rule
           reads back" are two different claims. */
        ::view-transition-old(root), ::view-transition-new(root) {
          --probe-ctl-root: yes;
        }
      `,
      })

      await mountHero()
      await lab(({ op }) => window.__vt.start(op), { op: 'move' })

      const read = await lab(() => {
        const get = (pseudo, name) =>
          getComputedStyle(document.documentElement, pseudo)
            .getPropertyValue(name)
            .trim()

        return {
          liveHeroOld: document
            .getAnimations()
            .some(
              a => a.effect?.pseudoElement === '::view-transition-old(hero)',
            ),
          liveRootOld: document
            .getAnimations()
            .some(
              a => a.effect?.pseudoElement === '::view-transition-old(root)',
            ),
          raw: get('::view-transition-old(hero)', '--probe-ctl-raw'),
          registered: get(
            '::view-transition-old(hero)',
            '--probe-ctl-registered',
          ),
          root: get('::view-transition-old(root)', '--probe-ctl-root'),
        }
      })

      await lab(() => window.__vt.finish())

      return read
    })()

    const forward = await crossDocument({
      label: 'destination links /own-to.css',
      sheets: '/own-from.css,/own-to.css',
    })
    const swapped = await crossDocument({
      label: 'destination links /own-from.css',
      sheets: '/own-to.css,/own-from.css',
    })

    return {
      // Conclusive when the control reads, not when a marker turns up: the control is what makes an
      // empty result mean something.
      conclusive: controlReads(control),
      control,
      forward: {
        animations: forward.ready?.animations,
        label: forward.label,
        linked: forward.linked,
        markers: markerMap(forward),
        rootMarkers: forward.ready?.sheets,
        // `opacity` on the root's old pseudo: 0.25 means the custom property its keyframes read was
        // applied; 1 means the fallback was taken and it was not.
        rootOld: forward.ready?.rootOld,
      },
      swapped: {
        animations: swapped.ready?.animations,
        label: swapped.label,
        linked: swapped.linked,
        markers: markerMap(swapped),
        rootMarkers: swapped.ready?.sheets,
        rootOld: swapped.ready?.rootOld,
      },
    }
  },
)

/* ------------------------------------------------------------------ 19. the cross-fade the UA was doing */

/**
 * Pure green, and every tile colour is far from it, so a bleed is a *green channel rising*. Naming
 * the direction in advance is what keeps this a measurement rather than a description.
 */
const PAGE_BG = '#00ff00'
const TILE_OLD = '#4f46e5'
const TILE_NEW = '#db2777'

/**
 * The emitted composition on old/new, with the blend mode as the one variable.
 *
 * `mix-blend-mode` is the whole question: the UA runs `-ua-mix-blend-mode-plus-lighter` on both
 * snapshots so that two half-transparent layers composite additively. An author `animation` replaces
 * that UA animation (P3b), and whatever `mix-blend-mode` falls back to is what the cross-fade now
 * composites under.
 */
const crossFadeCss = ({ blend = null, durations = 1200 } = {}) => `
  html { background: ${PAGE_BG}; }
  ::view-transition-old(hero), ::view-transition-new(hero) {
    ${jumiRules.substrate}
    ${jumiRules.aggregate}
    --jumi-animation-duration: ${durations}ms;
    ${blend ? `mix-blend-mode: ${blend};` : ''}
  }
  ::view-transition-old(hero) {
    ${activationOf('.animate-fade-in')}
    --jumi-fade-in-animation-direction: reverse;
  }
  ::view-transition-new(hero) { ${activationOf('.animate-fade-in')} }
`

/** Park the tile, seek, and read the pixel at its centre. */
async function crossFade({ blend = null, label, style }) {
  // The tile colour is a root variable that a previous variant may have moved; put it back, or the
  // second variant starts from pink and its "old" side is the first variant's "new".
  await lab(({ map }) => window.__vt.vars(map), { map: { '--tile-bg': null } })
  await lab(({ css }) => window.__vt.style(css), { css: style })
  await mountHero()

  const point = await lab(() => {
    const rect = document.querySelector('#hero').getBoundingClientRect()

    return {
      // Far from every tile, so whatever is here is backdrop. Reading it in the *same* frame is what
      // makes the tile reading interpretable: a variant that lets the backdrop through is pulled
      // towards this colour, and one that does not stays where the other variant is.
      backdrop: { x: 820, y: 540 },
      devicePixelRatio: window.devicePixelRatio,
      tile: {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      },
    }
  })

  const started = await lab(({ op }) => window.__vt.start(op), {
    op: 'recolor',
  })
  const measured = await lab(({ pseudos }) => window.__vt.measure(pseudos), {
    pseudos: HERO_PSEUDOS,
  })
  const durations = measured.animations
    .map(animation => animation.duration)
    .filter(value => typeof value === 'number')
  const mid = Math.max(...durations) / 2

  // Seek to zero first: with the old side fully opaque the pixel is the *old tile colour*, which is
  // the control. If green is already high at zero, the sample point or the decoder is wrong and the
  // midpoint reading below means nothing.
  const at = async t => {
    const state = await lab(
      ({ pseudos, t }) => window.__vt.advance(t, pseudos),
      { pseudos: HERO_PSEUDOS, t },
    )
    const shot = await page.screenshot()

    return {
      backdropPixel: samplePixel(shot, point.backdrop.x, point.backdrop.y, 3),
      blend: state.pseudos['::view-transition-old(hero)']?.mixBlendMode,
      newBlend: state.pseudos['::view-transition-new(hero)']?.mixBlendMode,
      newOpacity: state.pseudos['::view-transition-new(hero)']?.opacity,
      oldOpacity: state.pseudos['::view-transition-old(hero)']?.opacity,
      t,
      tilePixel: samplePixel(shot, point.tile.x, point.tile.y, 3),
    }
  }

  return {
    animations: measured.animations.map(
      animation => `${animation.pseudo} → ${animation.name}`,
    ),
    atMid: await at(mid),
    atZero: await at(0),
    label,
    mid,
    point,
    started,
  }
}

await probe(
  'P19',
  'The image pair: does overriding the cross-fade bleed the backdrop through',
  async () => {
    // `style`, not `css`: an option the callee does not read is silently `undefined`, and the variant
    // then runs with no stylesheet at all while looking like a valid case.
    const bare = { style: `html { background: ${PAGE_BG}; }` }

    return {
      expected: { tileNew: TILE_NEW, tileOld: TILE_OLD },
      jumi: await crossFade({
        label: 'jumi composition on old/new',
        style: crossFadeCss(),
      }),
      jumiBlend: await crossFade({
        label: 'jumi composition + mix-blend-mode: plus-lighter',
        style: crossFadeCss({ blend: 'plus-lighter' }),
      }),
      ua: await crossFade({ ...bare, label: 'ua default cross-fade' }),
    }
  },
)

/* ------------------------------------------------------------------ 20. reduced motion, with the real rules */

/**
 * P10 established that the platform does not clamp for us. This asks the follow-up the emission
 * depends on: with the *emitted* composition on old/new, which shape of rule actually stops it?
 *
 * Three shapes, in both preferences:
 *   bare      the composition as the finalizer would emit it, no media query
 *   wrapped   the composition inside `@media (prefers-reduced-motion: no-preference)`
 *   clamped   the composition plus an explicit `@media (prefers-reduced-motion: reduce)` off-switch
 */
await probe(
  'P20',
  'prefers-reduced-motion: which emitted shape actually stops the animation',
  async () => {
    const composition = `
    ::view-transition-old(hero), ::view-transition-new(hero) {
      ${jumiRules.substrate}
      ${jumiRules.aggregate}
      --jumi-animation-duration: 900ms;
      ${activationOf('.animate-fade-in')}
    }
  `

    const shapes = {
      bare: composition,
      clamped: `${composition}
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-old(hero), ::view-transition-new(hero) { animation: none !important; }
      }`,
      wrapped: `@media (prefers-reduced-motion: no-preference) { ${composition} }`,
    }

    const results = {}

    for (const preference of ['no-preference', 'reduce']) {
      const own = await browser.newContext({
        reducedMotion: preference,
        viewport: { height: 600, width: 900 },
      })
      const ownPage = await own.newPage()

      await ownPage.goto(`${base}/lab.html`)
      await ownPage.waitForFunction(() => window.__vtReady === true)

      const on = {
        advance: (t, pseudos) =>
          ownPage.evaluate(
            ({ pseudos, t }) => window.__vt.advance(t, pseudos),
            { pseudos, t },
          ),
        measure: pseudos =>
          ownPage.evaluate(({ pseudos }) => window.__vt.measure(pseudos), {
            pseudos,
          }),
        mount: items =>
          ownPage.evaluate(({ items }) => window.__vt.mount(items), { items }),
        start: op =>
          ownPage.evaluate(({ op }) => window.__vt.start(op), { op }),
        style: css =>
          ownPage.evaluate(({ css }) => window.__vt.style(css), { css }),
      }

      const measured = {}
      const matches = await ownPage.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      )

      for (const [name, css] of Object.entries(shapes)) {
        await on.style(css)
        await on.mount([{ id: 'hero', name: 'hero', text: 'hero' }])
        await on.start('move')

        const driven = await on.advance(450, HERO_PSEUDOS)

        measured[name] = {
          // `jumi-fade-in` present means the emitted composition ran; only the UA names means it did not
          // and the browser's own cross-fade is what the user sees.
          names: driven.animations.map(
            animation => `${animation.pseudo} → ${animation.name}`,
          ),
          newName: names(
            driven.pseudos['::view-transition-new(hero)']?.animationName ?? '',
          ),
          ran: driven.animations.some(animation =>
            String(animation.name ?? '').startsWith('jumi-'),
          ),
        }

        await ownPage.evaluate(() => window.__vt.finish())
      }

      results[preference] = { matches, shapes: measured }
      await own.close()
    }

    return results
  },
)

/* ------------------------------------------------------------------ 21. identity serialization */

/**
 * An identity is author-supplied and ends up concatenated into two places: a declaration
 * (`view-transition-name: <identity>`) and a pseudo-element selector
 * (`::view-transition-old(<identity>)`). So it is hostile input, and the question is which values are
 * a usable identity rather than which ones "look" wrong.
 *
 * Both directions are measured, because `CSS.supports` accepting a selector does not prove it matches
 * the pseudo the browser actually built for the same name. So each value is also *run*: mount a tile
 * with that name, start a transition, and read the pseudo-elements the browser really created. The
 * test a finalizer needs is that the string it constructs by concatenation appears in that set.
 */
const IDENTITIES = [
  ['hero', 'a plain identifier'],
  ['my-card-2', 'hyphenated'],
  [
    '--foo',
    'leading double hyphen — a valid custom-ident, though it reads like a custom property',
  ],
  ['HERO', 'uppercase'],
  ['_x', 'leading underscore'],
  ['1hero', 'leading digit — not a valid ident unless escaped'],
  ['none', 'the property keyword: means "no name", not a name'],
  ['auto', 'a keyword'],
  ['initial', 'a CSS-wide keyword'],
  ['inherit', 'a CSS-wide keyword'],
  ['unset', 'a CSS-wide keyword'],
  ['revert', 'a CSS-wide keyword'],
  [
    'hero)',
    'contains a closing paren — would break the selector by concatenation',
  ],
  ['hero{', 'contains a brace'],
  ['a b', 'contains a space'],
]

await probe(
  'P21',
  'identity serialization: which values are a usable transition identity',
  async () => {
    const rows = []

    for (const [identity, note] of IDENTITIES) {
      const declared = await lab(
        ({ value }) => ({
          // The declaration, and the pseudo-element selector built by naive concatenation.
          asName: CSS.supports('view-transition-name', value),
          asPseudo: CSS.supports(
            'selector(::view-transition-old(' + value + '))',
          ),
        }),
        { value: identity },
      )

      await lab(
        ({ name }) => window.__vt.mount([{ id: 'hero', name, text: 'hero' }]),
        { name: identity },
      )

      const started = await lab(({ op }) => window.__vt.start(op), {
        op: 'move',
      })
      const built = await lab(() => ({
        // A group for a *named* participant only exists if the name took effect.
        group: [
          ...new Set(
            document
              .getAnimations()
              .map(animation => animation.effect?.pseudoElement)
              .filter(pseudo => pseudo?.startsWith('::view-transition-group(')),
          ),
        ],
        old: [
          ...new Set(
            document
              .getAnimations()
              .map(animation => animation.effect?.pseudoElement)
              .filter(pseudo => pseudo?.startsWith('::view-transition-old(')),
          ),
        ],
      }))

      await lab(() => window.__vt.finish())

      // What a finalizer would construct, and whether the browser built exactly that.
      const constructed = `::view-transition-old(${identity})`
      const named = built.group.filter(
        pseudo => pseudo !== '::view-transition-group(root)',
      )

      rows.push({
        builtGroup: named,
        constructed,
        identity,
        matchesBuilt: built.old.includes(constructed),
        // The reserved words are rejected explicitly: they are *valid values* that are not names.
        note,
        reserved: [
          'auto',
          'inherit',
          'initial',
          'none',
          'revert',
          'unset',
        ].includes(identity),
        started: started.ready ?? started.error,
        ...declared,
      })
    }

    return rows
  },
)

/* ------------------------------------------------------------------ 22. participation vs motion */

/**
 * The question the emitter cannot be written without: does a transferable wrapper condition
 * **participation** or only **Jumi's motion**?
 *
 * `motion-safe:` compiles to `@media (prefers-reduced-motion: no-preference)`. If the finalizer keeps
 * that wrapper when it emits `view-transition-name`, then under reduced motion the element is
 * unnamed — and an unnamed element has no `::view-transition-group(name)`, so the shared element stops
 * travelling. That is more than suppressing Jumi's animation: it removes a browser-owned feature.
 *
 * Measured in a `reduce` context, three shapes, by whether the named group exists at all and whether
 * its transform actually moves.
 */
await probe(
  'P22',
  'does a wrapped identity cost the browser shared-element travel',
  async () => {
    const reduced = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { height: 600, width: 900 },
    })
    const reducedPage = await reduced.newPage()

    await reducedPage.goto(`${base}/lab.html`)
    await reducedPage.waitForFunction(() => window.__vtReady === true)

    const on = {
      advance: (t, pseudos) =>
        reducedPage.evaluate(
          ({ pseudos, t }) => window.__vt.advance(t, pseudos),
          { pseudos, t },
        ),
      measure: pseudos =>
        reducedPage.evaluate(({ pseudos }) => window.__vt.measure(pseudos), {
          pseudos,
        }),
      mount: items =>
        reducedPage.evaluate(({ items }) => window.__vt.mount(items), {
          items,
        }),
      start: op =>
        reducedPage.evaluate(({ op }) => window.__vt.start(op), { op }),
      style: css =>
        reducedPage.evaluate(({ css }) => window.__vt.style(css), { css }),
    }

    const shapes = {
      bare: `
      .tile.hero { view-transition-name: hero; }
    `,
      identityWrapped: `
      @media (prefers-reduced-motion: no-preference) {
        .tile.hero { view-transition-name: hero; }
      }
    `,
      motionWrapped: `
      .tile.hero { view-transition-name: hero; }
      @media (prefers-reduced-motion: no-preference) {
        ::view-transition-old(hero), ::view-transition-new(hero) { --jumi-animation-name: none; }
      }
    `,
    }

    const measured = {}
    const matches = await reducedPage.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    )

    for (const [name, css] of Object.entries(shapes)) {
      await on.style(css)

      /*
       * Mounted **without** a name on purpose. `window.__vt.mount` sets `view-transition-name` as an
       * inline style when an item carries `name`, and an inline style is not inside any media query — so
       * the first version of this probe measured the harness's own declaration and reported that a
       * wrapped identity still travelled. The name has to come from the stylesheet for the wrapper to be
       * the thing under test.
       */
      await on.mount([{ cls: 'hero', id: 'hero', text: 'hero' }])
      await on.start('move')

      const early = await on.advance(0, HERO_PSEUDOS)
      const late = await on.advance(200, HERO_PSEUDOS)

      const groupOf = state =>
        Object.entries(state.pseudos).find(
          ([pseudo]) => pseudo === '::view-transition-group(hero)',
        )?.[1]

      measured[name] = {
        // Both the existence of the group and its transform: a group that exists and never moves is
        // still a lost travel.
        earlyTransform: groupOf(early)?.transform ?? null,
        groupBuilt: early.animations.some(
          animation => animation.pseudo === '::view-transition-group(hero)',
        ),
        lateTransform: groupOf(late)?.transform ?? null,
        travelled: groupOf(early)?.transform !== groupOf(late)?.transform,
      }

      await reducedPage.evaluate(() => window.__vt.finish())
    }

    await reduced.close()

    /*
     * And the same question about a wrapper that is the *author's* rather than Jumi's.
     *
     * `motion-safe:` is special because Jumi already owns that policy — P20 established that Jumi wraps
     * its own contribution in exactly that media query. `sm:` is the author talking about their layout,
     * so the expectation is the opposite, and the only honest way to say so is to measure it. Narrow
     * enough that `width >= 40rem` does not match.
     */
    const narrow = await browser.newContext({
      viewport: { height: 600, width: 500 },
    })
    const narrowPage = await narrow.newPage()

    await narrowPage.goto(`${base}/lab.html`)
    await narrowPage.waitForFunction(() => window.__vtReady === true)
    await narrowPage.evaluate(({ css }) => window.__vt.style(css), {
      css: '@media (width >= 40rem) { .tile.hero { view-transition-name: hero; } }',
    })
    await narrowPage.evaluate(({ items }) => window.__vt.mount(items), {
      items: [{ cls: 'hero', id: 'hero', text: 'hero' }],
    })

    // Read the query itself rather than assuming it: if it had matched, the probe would be measuring
    // nothing.
    const narrowMatched = await narrowPage.evaluate(
      () => matchMedia('(width >= 40rem)').matches,
    )

    await narrowPage.evaluate(({ op }) => window.__vt.start(op), { op: 'move' })

    const narrowBuilt = await narrowPage.evaluate(
      ({ pseudos, t }) => window.__vt.advance(t, pseudos),
      {
        pseudos: HERO_PSEUDOS,
        t: 0,
      },
    )

    await narrow.close()

    return {
      matches,
      shapes: measured,
      // No group here means the author's own condition removed the element's participation, which is
      // what they asked for — as distinct from Jumi removing it on their behalf.
      smUnmatched: {
        groupBuilt: narrowBuilt.animations.some(
          a => a.pseudo === '::view-transition-group(hero)',
        ),
        queryMatched: narrowMatched,
      },
    }
  },
)

/* ------------------------------------------------------------------ done */

await browser.close()
server.close()

const failed = probes.filter(entry => entry.error)

console.log(`\n${'─'.repeat(72)}`)
console.log(`${probes.length} probes, ${failed.length} failed`)
if (failed.length)
  console.log(failed.map(entry => `  ${entry.id}: ${entry.error}`).join('\n'))
