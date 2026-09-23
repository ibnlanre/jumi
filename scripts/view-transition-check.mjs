#!/usr/bin/env node
/**
 * View-transition check — is the *emitted* path a working view transition?
 *
 * The syntax spike proved the design against a hand-written stylesheet. That is not the same claim as
 * "the library emits it", and the difference is exactly where the two decisions this pass makes
 * become observable: which candidates name an element, and which wrappers survive onto the pseudo
 * tree. Neither is visible in text that looks plausible — a wrong identity rule produces a stylesheet
 * that parses, a page that renders, and a shared element that never travels.
 *
 * So this runs the real two steps a build runs. Tailwind emits from candidates the author would
 * write; the finalizer that ships completes it; the result is served to Chromium and the transition
 * is started by a link click. Then it asks the browser three questions no text check can answer:
 *
 *   does the element participate      `::view-transition-group(hero)` exists only if an identity was
 *                                     actually written onto the element, so this is the assertion
 *                                     that `view-transition-name` came out of the finalizer rather
 *                                     than out of the fixture — and the fixture names nothing
 *   does Jumi's motion run on it      the pseudo animation's name is a Jumi keyframe rather than the
 *                                     browser's own cross-fade
 *   does a control alone cause it     it must not. This is Jumi's oldest invariant — controls
 *                                     configure motion, they do not create it — and it is why the pass
 *                                     separates motion-bearing candidates from control-only ones.
 *                                     Proven in a browser because `animation-duration-300` on its own
 *                                     produces CSS that looks entirely reasonable.
 *
 * Two more arms, both of which would pass for the wrong reason if they were only asserted in text:
 *
 *   `reduce`                          the hero's candidates are `motion-safe:`-wrapped, so under
 *                                     reduced motion the identity must still be emitted — the element
 *                                     travels — while Jumi's animation must not run. Getting that
 *                                     backwards is silent in either direction: strip too much and
 *                                     nothing participates, strip too little and `reduce` deletes the
 *                                     transition instead of quieting it.
 *   `@supports` guard                 every arm above runs through `@supports selector(…)`. A guard
 *                                     that evaluated false would take the whole emission with it, and
 *                                     the pages would still render perfectly.
 *
 * The fixtures carry no JavaScript and name no transition: the observation is injected with
 * `addInitScript`, so what is under test is a document a build produced and nothing else.
 *
 * Run: pnpm view-transition:check
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { ensureBundle } from './bundle.mjs'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const fixtures = path.join(here, 'view-transition-check')

/**
 * Bundle first, and this is not a formality.
 *
 * Everything below loads `dist/`, so a check that skips this step tests whatever was last built — which
 * is how a stale artifact reported a bug that had already been fixed, in this very file, once. The
 * carrier instrument bundles for the same reason.
 *
 * It is `ensureBundle()` rather than the `pnpm run bundle` that used to be here because the *gate*
 * builds, not the stages below it: under `check.mjs` nine stages used to bundle concurrently, and `tsup`
 * is `clean: true`, so each one deleted the artifact its peers were reading. Run this file alone and
 * nothing has built for it, so it still bundles — the stale artifact this comment is about is exactly
 * what the standalone path must not lose.
 */
ensureBundle()

const { build, compiler, finalizeCss } = await import('./lib/compile.mjs')

/**
 * The candidates, which are the author's whole contribution.
 *
 * `motion-safe:` is on the hero and nowhere else, on purpose: it is the wrapper Jumi strips from the
 * identity while keeping it on the motion, and the only way to see the difference is a document that
 * carries it and a browser asked for `reduce`. `sm:` is on the card for the opposite reason — it is the
 * wrapper that must be kept on both — and the widths below are what tell a kept condition from an
 * ignored one. It is on **both** of the card's candidates, because a pair with one unconditional side
 * is unconditional by construction: each motion-bearing candidate names the element, so the
 * unconditional one would name it outside the query. `mixed` is that pair on purpose — `sm:` on the
 * outgoing side and nothing on the incoming one — and the two viewport arms below are what tell a
 * wrapper that reached the motion from one that only reached the name. `inert` carries a duration
 * control and no motion, and is the one candidate here that must produce nothing at all.
 */
const CANDIDATES = [
  'motion-safe:view-transition-old/hero:animate-fade-out',
  'motion-safe:view-transition-new/hero:animate-fade-in',
  'sm:view-transition-old/card:animate-fade-out',
  'sm:view-transition-new/card:animate-fade-in',
  'sm:view-transition-old/mixed:animate-fade-out',
  'view-transition-new/mixed:animate-fade-in',
  'view-transition-old/inert:animation-duration-300',
]

const instance = await compiler(
  `@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist/index.js')}";\n`,
  root,
)

const emitted = build(instance, CANDIDATES)

// A second *pass*, not a second build. Over its own output the finalizer has to be a no-op, because
// Vite runs it on every transform — and a fresh build would prove nothing, since Tailwind would simply
// have staged the candidates again.
const again = finalizeCss(emitted.css)

/* ------------------------------------------------------------------ the emitted text */

const checks = []

const check = (label, pass, detail = '') => {
  checks.push({ detail, label, pass })
}

/**
 * Read the emission structurally rather than by pattern.
 *
 * The same lesson the carrier instruments learned: `view-transition-name: hero` appearing somewhere is
 * not the fact that matters. What matters is which conditions sit around it, and a regex over a
 * generated stylesheet cannot answer that reliably enough to be trusted with the one decision that
 * separates a travelling element from a deleted transition.
 */
const parsed = postcss.parse(emitted.css)
const identities = []
const pseudos = []

parsed.walkRules(rule => {
  const conditions = []

  for (
    let node = rule.parent;
    node && node.type !== 'root';
    node = node.parent
  ) {
    if (node.type === 'atrule')
      conditions.unshift(`@${node.name} ${node.params}`.trim())
  }

  const declarations = (rule.nodes ?? []).filter(node => node.type === 'decl')

  if (declarations.some(node => node.prop === 'view-transition-name')) {
    identities.push({
      conditions,
      name: declarations.find(node => node.prop === 'view-transition-name')
        .value,
      selector: rule.selector,
    })
  }

  if (rule.selector.includes('::view-transition-')) {
    pseudos.push({
      conditions,
      declarations: declarations.map(node => node.prop),
      selector: rule.selector,
    })
  }
})

check(
  'the pass wrote products',
  emitted.viewTransitions > 0,
  `${emitted.viewTransitions} rules`,
)

/**
 * The per-side rules, told from the owning rules by **what they declare** rather than by how many
 * selectors they have.
 *
 * Counting selectors looks equivalent and is not: an owning rule lists every side that shares its
 * condition set, and a condition set can hold exactly one — so a one-selector owning rule would be
 * classified as a side rule, and the blend assertion below would read a rule that carries no blend.
 * The owning rules are the ones that declare `animation`; a side rule never does.
 */
const sides = pseudos.filter(entry => !entry.declarations.includes('animation'))

// The staging marker is a build-time name with the same zero-occurrence invariant the carrier
// protocol has: surviving it means the pages carry a class that matches nothing.
check(
  'no staging marker survives',
  !emitted.css.includes('jumi-vt-'),
  'zero occurrences of `.jumi-vt-`',
)

for (const identity of ['hero', 'card']) {
  const found = identities.filter(entry => entry.name === identity)

  check(
    `the identity for \`${identity}\` was emitted`,
    found.length > 0,
    `${found.length} rule(s): ${found.map(entry => entry.selector).join(', ') || 'none'}`,
  )
}

// The invariant, read off the text. A control-only candidate produces no identity — and if it did, the
// element carrying it would participate in a transition nothing asked for.
check(
  'a control alone names no element',
  !identities.some(entry => entry.name === 'inert'),
  identities.map(entry => entry.name).join(', ') || 'no identities',
)

// The strip. `motion-safe:` must not survive as a condition on an identity, because a
// `view-transition-name` under `no-preference` is exactly the shape that deletes participation under
// `reduce` rather than quieting the motion — measured, P22.
check(
  "no identity is wrapped in Jumi's own query",
  !identities.some(entry =>
    entry.conditions.some(condition =>
      condition.includes('prefers-reduced-motion'),
    ),
  ),
  identities
    .map(
      entry =>
        `${entry.name} ${entry.conditions.join(' › ') || '(unconditional)'}`,
    )
    .join(' | '),
)

// And the other half of the rule: the wrapper is kept where the author asked for it, which is what
// makes the `motion-safe:` in the fixture meaningful rather than merely ignored.
check(
  'the motion keeps the condition its identity dropped',
  pseudos.some(entry =>
    entry.conditions.some(condition => condition.includes('no-preference')),
  ),
  pseudos[0]?.conditions.join(' › ') ?? 'no pseudo rules',
)

// An author's own condition is kept on the identity, which is the claim the narrow-viewport arm below
// then tests in a browser: a condition that is written down but never honoured looks identical in text
// to one that is honoured, and only a viewport that fails it can tell them apart.
check(
  "an author's own condition is kept on the identity",
  identities.some(
    entry =>
      entry.name === 'card' &&
      entry.conditions.some(c => c.includes('width >= 40rem')),
  ),
  identities
    .filter(entry => entry.name === 'card')
    .map(entry => entry.conditions.join(' › ') || '(unconditional)')
    .join(' | '),
)

check(
  'the pseudos are guarded',
  pseudos.length > 0 &&
    pseudos.every(entry =>
      entry.conditions.some(condition =>
        condition.startsWith('@supports selector('),
      ),
    ),
  pseudos[0]?.conditions.join(' › ') ?? 'none',
)

check(
  'the UA blend is re-declared on both sides',
  // The shared rule carries the substrate and the aggregate and lists every side, so it is the one
  // pseudo rule that must *not* have a blend; the per-side rules are the ones that must.
  sides.length > 0 &&
    sides.every(entry => entry.declarations.includes('mix-blend-mode')),
  sides.map(entry => entry.selector).join(' | ') || 'no per-side rules',
)

// The group is the browser's, and reaching it replaces the shared element's travel with whatever Jumi
// wrote (measured, P12). Nothing in the emission may name it.
check(
  'the group is left alone',
  !pseudos.some(entry => entry.selector.includes('::view-transition-group(')),
  pseudos.map(entry => entry.selector).join(' | ') || 'no pseudo rules',
)

// The pass runs on every Vite transform, so a second pass over its own output has to be a no-op. It
// is, by construction: the marker is what it collects, and the marker is gone.
check(
  'the emitted stylesheet finalizes to itself',
  again.css === emitted.css && again.viewTransitions === 0,
  `${again.viewTransitions} rules on a second pass`,
)

/* ------------------------------------------------------------------ the browser */

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const name = url.pathname === '/' ? '/from.html' : url.pathname

  if (name === '/jumi.css') {
    response
      .writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/css',
      })
      .end(emitted.css)

    return
  }

  // The runtime the wrapper arms below drive, served from the bundle rather than re-imported, so what runs
  // in the browser is what a project installs.
  if (name === '/jumi-runtime.js') {
    response
      .writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/javascript',
      })
      .end(readFileSync(path.join(root, 'dist/view-transition.js'), 'utf8'))

    return
  }

  try {
    const body = readFileSync(path.join(fixtures, path.basename(name)), 'utf8')

    response
      .writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/html',
      })
      .end(body)
  } catch {
    response.writeHead(404).end('no fixture')
  }
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

const base = `http://127.0.0.1:${server.address().port}`

/**
 * The observation, injected rather than authored.
 *
 * `pagereveal` is the only place a cross-document transition can be observed from inside the page: the
 * outgoing document has no script by design, and the pseudo tree is not in the DOM. This listener
 * reads and never writes, and the fixture it runs in is HTML and CSS only — which is the claim being
 * checked.
 *
 * Existence is read from `document.getAnimations()`, not from `getComputedStyle`: the latter returns a
 * declaration object for any pseudo-element, including one that was never created, so it cannot answer
 * whether a group exists. That mistake has already cost this investigation a pass.
 */
const RECORDER = () => {
  window.__vt = []

  const snapshot = names => ({
    animations: document
      .getAnimations()
      .filter(animation =>
        (animation.effect?.pseudoElement ?? '').startsWith('::view-transition'),
      )
      .map(animation =>
        `${animation.effect.pseudoElement} ${animation.animationName ?? ''}`.trim(),
      ),
    named: Object.fromEntries(
      names.map(name => {
        const element = document.querySelector(`.${name}`)

        return [
          name,
          element
            ? getComputedStyle(element)
                .getPropertyValue('view-transition-name')
                .trim()
            : null,
        ]
      }),
    ),
  })

  window.addEventListener('pagereveal', event => {
    window.__vt.push({
      at: 'reveal',
      hasTransition: Boolean(event.viewTransition),
      ...snapshot(['hero', 'card', 'inert']),
    })

    if (!event.viewTransition) return

    void event.viewTransition.ready.then(() => {
      window.__vt.push({ at: 'ready', ...snapshot(['hero', 'card', 'inert']) })
    })
  })
}

/** One navigation: a plain link click, which is the only kind that starts a cross-document one. */
const navigate = async (browser, reducedMotion, width = 900) => {
  const context = await browser.newContext({
    reducedMotion,
    viewport: { height: 600, width },
  })
  const page = await context.newPage()

  await page.addInitScript(RECORDER)
  await page.goto(`${base}/from.html`)
  await page.waitForLoadState('load')
  await page.click('#go')
  await page.waitForTimeout(1400)

  const trace = await page.evaluate(() => window.__vt ?? [])

  await context.close()

  return trace
}

/** The last state that still held live pseudo animations, which is where the transition is readable. */
const live = trace =>
  [...trace]
    .reverse()
    .find(entry =>
      entry.animations.some(animation =>
        animation.startsWith('::view-transition'),
      ),
    ) ?? [...trace].reverse().find(entry => entry.hasTransition)

const browser = await chromium.launch()

const trace = await navigate(browser, 'no-preference')
const settled = live(trace)
const animations = settled?.animations ?? []
const named = name => animations.filter(entry => entry.includes(`(${name})`))

/** The animation name a given pseudo runs, which is the whole question for the motion arms. */
const ran = prefix => {
  const [target] = animations.filter(entry => entry.startsWith(prefix))

  return target ? target.slice(prefix.length).trim() : ''
}

check(
  'a cross-document transition started',
  // Read from the whole trace, not from the entry `live()` picks: `hasTransition` is a fact about
  // `pagereveal`, and the entry that still held animations is often a later one that never saw it.
  trace.some(entry => entry.hasTransition),
  `${trace.length} trace entries, ${trace.filter(entry => entry.hasTransition).length} with a transition`,
)

check(
  'the emitted identity named the hero',
  named('hero').some(entry =>
    entry.startsWith('::view-transition-group(hero)'),
  ),
  named('hero').join(' | ') || 'no hero pseudo animations',
)

check(
  'the emitted identity named the card',
  named('card').some(entry =>
    entry.startsWith('::view-transition-group(card)'),
  ),
  named('card').join(' | ') || 'no card pseudo animations',
)

check(
  'the identity reached the element as a declaration',
  settled?.named.hero === 'hero',
  `computed on .hero: \`${settled?.named.hero || 'empty'}\``,
)

check(
  "Jumi's motion runs on the outgoing side",
  ran('::view-transition-old(hero)').startsWith('jumi-fade-out'),
  ran('::view-transition-old(hero)') || 'none',
)

check(
  "Jumi's motion runs on the incoming side",
  ran('::view-transition-new(hero)').startsWith('jumi-fade-in'),
  ran('::view-transition-new(hero)') || 'none',
)

// The invariant, in a browser. `inert` carries a duration control and no motion, so no identity was
// emitted for it and the browser builds nothing for it.
check(
  'a control alone did not make the element participate',
  named('inert').length === 0,
  named('inert').join(' | ') || 'no `inert` pseudo animations',
)

// The group is the browser's own travel. If the emission had aimed at it, the animation name here
// would be a Jumi keyframe — and the shared element would animate in place instead of moving (P12).
check(
  "the browser's own travel was not replaced",
  named('hero')
    .filter(entry => entry.startsWith('::view-transition-group(hero)'))
    .every(entry => !entry.includes(' jumi-')),
  named('hero')
    .filter(entry => entry.startsWith('::view-transition-group'))
    .join(' | ') || 'no group animation',
)

/* ------------------------------------------------------------------ an author's own condition */

/**
 * The narrow viewport.
 *
 * `sm:` is the wrapper that must be kept — on both the identity and the motion — and this is the arm
 * that tells a kept condition from an ignored one. At a width the query fails, the card must not
 * participate at all, because that is what the author asked for. In text the two cases are identical:
 * `view-transition-name: card` inside `@media (width >= 40rem)` and the same declaration without the
 * wrapper both read as present, and only a viewport that fails the query distinguishes them.
 *
 * The hero, whose wrapper was `motion-safe:` and was stripped, must still participate here — the same
 * point from the other direction.
 */
const narrow = live(await navigate(browser, 'no-preference', 500))
const narrowAnimations = narrow?.animations ?? []

check(
  "an author's condition is honoured, not just written down",
  narrowAnimations.some(entry =>
    entry.startsWith('::view-transition-group(hero)'),
  ) &&
    !narrowAnimations.some(entry =>
      entry.startsWith('::view-transition-group(card)'),
    ),
  `hero ${narrowAnimations.filter(e => e.includes('group(hero)')).length},` +
    ` card ${narrowAnimations.filter(e => e.includes('group(card)')).length} at 500px`,
)

/**
 * The differential for the mixed pair: same document, same stylesheet, two viewports, and the only
 * thing that changes is whether one side is Jumi's.
 *
 * This is the arm that pins a wrapper reaching the *motion* rather than only the name. Both sides were
 * wrapped the same way in the emitted CSS in an earlier version of this pass, and at 500px the outgoing
 * side would still have run Jumi's keyframe while claiming to be conditioned — a difference visible
 * only by comparing the two viewports against each other.
 */
const mixedRan = trace => {
  const state = live(trace)
  const side = name => {
    const [found] = (state?.animations ?? []).filter(entry =>
      entry.startsWith(`::view-transition-${name}(mixed)`),
    )

    return found
      ? found.slice(`::view-transition-${name}(mixed)`.length).trim()
      : ''
  }

  return { new: side('new'), old: side('old') }
}

const wide = mixedRan(trace)
const narrowMixed = mixedRan(await navigate(browser, 'no-preference', 500))

check(
  'a wrapper reaches the motion, not only the name',
  // Above the breakpoint both sides are Jumi's; below it, only the unconditioned one is, and the
  // conditioned side goes back to the browser's own cross-fade rather than vanishing.
  [wide.old, wide.new].every(name => name.startsWith('jumi-fade-')) &&
    narrowMixed.new.startsWith('jumi-fade-in') &&
    !narrowMixed.old.startsWith('jumi-fade-'),
  `900px old=${wide.old || 'none'} new=${wide.new || 'none'};` +
    ` 500px old=${narrowMixed.old || 'none'} new=${narrowMixed.new || 'none'}`,
)

check(
  'a conditioned side falls back to the browser rather than to nothing',
  narrowMixed.old.startsWith('-ua-view-transition-'),
  `500px, outgoing side: ${narrowMixed.old || 'no animation at all'}`,
)

/* ------------------------------------------------------------------ reduced motion */

const reduced = live(await navigate(browser, 'reduce'))
const reducedAnimations = reduced?.animations ?? []

check(
  'under `reduce` the element still participates',
  reducedAnimations.some(entry =>
    entry.startsWith('::view-transition-group(hero)'),
  ),
  reducedAnimations.filter(entry => entry.includes('(hero)')).join(' | ') ||
    'no hero pseudo animations',
)

check(
  "under `reduce` Jumi's motion does not run",
  reducedAnimations.every(entry => !entry.includes(' jumi-')),
  reducedAnimations.join(' | ') || 'no pseudo animations',
)

/* ------------------------------------------------------------------ the loud channel */

/**
 * A refusal has to reach the person building, and the pass cannot do that itself: `finalize` is pure
 * and returns its warnings, so each adapter translates them into its host's channel. That translation
 * is the whole difference between "Jumi refused your candidate" and a page that quietly does something
 * else — so it is asserted here rather than assumed, through the adapter that ships.
 *
 * The PostCSS adapter is the one that can be driven in-process. The Vite adapter reports the same
 * returned list through `this.warn`; that it wires them is visible in one line of `src/vite.ts`, and
 * the list itself is the part with logic in it.
 */
const refused = await compiler(
  `@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist/index.js')}";\n`,
  root,
)

const REFUSED = ['motion-reduce:view-transition-old/hero:animate-fade-out']
const refuses = build(refused, REFUSED)

check(
  'a refusal is reported rather than silently dropped',
  refuses.warnings.length === 1 &&
    refuses.warnings[0].includes('never runs there'),
  refuses.warnings[0] ?? 'no warning',
)

const { jumiFinalizer } = await import(path.join(root, 'dist/postcss.js'))

/**
 * The adapter alone, over what Tailwind emitted — **not** over the finalized stylesheet.
 *
 * The distinction is the test. The warning is produced by the pass that reads the staging, so running
 * a second finalizer over its own output finds nothing to refuse and would report nothing; the arm
 * would pass for the wrong reason or fail for one. `instance.build` is the raw emission, which is
 * exactly what an adapter is handed in a real build.
 */
const raw = refused.build(REFUSED)
const result = await postcss([jumiFinalizer()]).process(raw, {
  from: 'refused.css',
})

check(
  'the PostCSS adapter surfaces it as a warning',
  result.warnings().some(warning => warning.text.includes('never runs there')),
  result
    .warnings()
    .map(warning => warning.text)
    .join(' | ') || 'no warnings on the result',
)

/* ------------------------------------------------------------------ incremental builds */

/**
 * The lifetimes that could betray this pass, and the one that does not belong to it.
 *
 * The risk worth testing is compiler-lifetime state: Jumi holds one model per plugin instance, and its
 * `values`, `phrases`, `registered` and `seen` registries accumulate for as long as that compiler lives,
 * so a stale identity would be exactly the kind of thing to survive a rebuild unnoticed. The pass is
 * built to hold **nothing** about view transitions and to read every fact out of the emitted stylesheet,
 * which makes staleness impossible in principle — these arms are what make it a fact.
 *
 * The scenario "remove the candidate and rebuild" cannot be expressed through `Compiler.build()`, and
 * that is a finding rather than a limitation of the arms: measured below, a long-lived compiler's build
 * is **additive**. `inst.build([])` after `inst.build([old])` returns byte-identical output, because
 * Tailwind carries the candidate set forward — the same property `incremental:check` already relies on,
 * and the same reason a dev session keeps a class until it is reloaded. So the arms here test the two
 * things that are actually Jumi's:
 *
 *   a fresh build with a smaller candidate set     has no trace of what is not in it
 *   the pass, across changing inputs               has no memory between them
 *
 * and one measurement that is Tailwind's, pinned so that the next person does not spend an afternoon
 * writing an "incremental removal" scenario that quietly tests the wrong component.
 */
const entry = `@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist/index.js')}";\n`

const OLD = 'view-transition-old/hero:animate-fade-out'
const NEW = 'view-transition-new/hero:animate-fade-in'

const fresh = async candidates =>
  finalizeCss((await compiler(entry, root)).build(candidates)).css

/**
 * What a build says about one identity, read from the **rules** rather than from the text.
 *
 * Substring tests are wrong here for a reason this file has already paid for once: the `@supports`
 * guard names a pseudo-element, so `css.includes('::view-transition-old(hero)')` is true for an
 * emission that contains no old-side rule at all — the guard alone satisfies it. A side is a rule whose
 * selector starts with the pseudo, and nothing else in the output looks like that.
 */
const shape = css => {
  const selectors = []

  postcss.parse(css).walkRules(rule => {
    selectors.push(rule.selector.replace(/\s+/g, ' ').trim())
  })

  return {
    identity: selectors.some(
      selector =>
        selector === '.view-transition-old\\/hero\\:animate-fade-out' ||
        selector === '.view-transition-new\\/hero\\:animate-fade-in',
    ),
    marked: selectors.some(selector => selector.includes('.jumi-vt-')),
    new: selectors.some(selector =>
      selector.startsWith('::view-transition-new(hero)'),
    ),
    old: selectors.some(selector =>
      selector.startsWith('::view-transition-old(hero)'),
    ),
  }
}

const onlyOld = shape(await fresh([OLD]))
const onlyNew = shape(await fresh([NEW]))
const neither = shape(await fresh(['animate-fade-in']))

check(
  'a build with one side emits that side and no other',
  onlyOld.identity && onlyOld.old && !onlyOld.new,
  JSON.stringify(onlyOld),
)

check(
  'a build whose candidate set lacks a side leaves no trace of it',
  // The identity survives — the incoming side asks for it — and the outgoing side goes back to being
  // the browser's, rather than being left behind by a build that no longer names it.
  onlyNew.identity && onlyNew.new && !onlyNew.old,
  JSON.stringify(onlyNew),
)

check(
  'a build with no view-transition candidate at all emits nothing',
  !neither.identity && !neither.marked && !neither.old && !neither.new,
  JSON.stringify(neither),
)

/**
 * Statelessness, which is the property all of the above rest on.
 *
 * Finalize the full stylesheet, then a smaller one, then the full one again. If the pass remembered
 * anything between calls — a name, a selector, a slot — the third result would differ from the first,
 * and no amount of testing a single build would have found it.
 */
const full = instance.build(CANDIDATES)
const smaller = instance.build([OLD])

const first = finalizeCss(full)
const middle = finalizeCss(smaller)
const last = finalizeCss(full)

check(
  'the pass carries no state between inputs',
  last.css === first.css &&
    last.viewTransitions === first.viewTransitions &&
    middle.css !== first.css,
  `full ${first.css.length} → smaller ${middle.css.length} → full ${last.css.length}`,
)

check(
  "a long-lived compiler's build is additive, and that is the host's, not the pass's",
  // Pinned deliberately. It reads like a bug in the finalizer the first time it is met — a removed
  // candidate keeps its identity — and it is not: the candidate is still in the stylesheet, and the
  // finalizer faithfully emits what it is given. Anything that wants a genuine shrink has to build on a
  // fresh compiler, which is what every arm above does.
  (() => {
    const instance_ = instance

    return instance_.build([OLD]) === instance_.build([])
  })(),
  'Tailwind carries the candidate set forward, so a dev session keeps a class until it reloads',
)

/* ------------------------------------------------------------------ the published examples */

/**
 * Every class every documentation page names has to exist.
 *
 * `docs:build` is not in the gate, and Tailwind ignores a class it cannot resolve — so a page whose
 * examples have drifted from the library renders perfectly while teaching a feature that does not exist.
 * That is the failure `stories:check` exists for on the Storybook side; this is the same claim for the
 * pages that have no coverage.
 *
 * The classes are **read out of the pages**, not copied here. A hand-kept list catches the library moving
 * away from the page and misses the page moving away from the library, which is the direction that
 * actually happens. Every page under `docs/src/pages/docs/` is read rather than the one page this feature
 * owns, for the same reason: an arm that watches a single file is one page away from being that list.
 */
const docRoot = path.join(root, 'docs/src/pages/docs')

// The README is read alongside the guide pages: it is the text the npm page renders, it carries the same kind
// of examples, and it was the one surface whose classes nothing checked until an example in it went stale.
// `SKILL.md` is read for the same reason and one more: it is written for an agent, so a class it names that
// does not compile is an agent writing markup that never moves.
const docPages = [
  ...readdirSync(docRoot)
    .filter(name => name.endsWith('.md'))
    .sort()
    .map(name => [name, readFileSync(path.join(docRoot, name), 'utf8')]),
  ['README.md', readFileSync(path.join(root, 'README.md'), 'utf8')],
  ['SKILL.md', readFileSync(path.join(root, 'SKILL.md'), 'utf8')],
]

/**
 * Compile one candidate alone, on a compiler of its own, and hand back **both** sides of the pipeline.
 *
 * A compiler per call, because a long-lived one's build is additive: the second class would be measured
 * inside the first one's stylesheet and every class would appear to resolve.
 *
 * Both sides, because resolving and emitting are different questions. A lone duration control resolves
 * perfectly well and emits nothing — the page's claim about it is the second of those.
 */
const compileAlone = async candidates => {
  const raw = (await compiler(entry, root)).build(candidates)

  return { raw, ...finalizeCss(raw) }
}

/** How a class reaches the selector: every character an identifier cannot hold is escaped. */
const asSelector = candidate =>
  `.${candidate.replace(/[^A-Za-z0-9_-]/g, character => `\\${character}`)}`

const blocksIn = source =>
  [...source.matchAll(/```html\n([\s\S]*?)```/g)].map(block => block[1])
const classesNamedIn = source =>
  [...source.matchAll(/class="([^"]+)"/g)].map(match => match[1])

/**
 * A class in an example resolves in one of two ways, and the arm has to know both.
 *
 * Jumi's, compiled alone: the utilities and property animations, the controls, the view transition variant —
 * and Tailwind's own, which a page is also entitled to use and which resolve the same way. Or the **site's
 * own**, which is what `controls.md` needs for `petal-position`: the page's hero is real markup styled by
 * `docs/src/styles/global.css`, and asserting that Tailwind knows about it would be the arm confusing two
 * different questions. A token defined there is reported as the site's rather than dropped, so the output says
 * which classes are not being tested.
 */
const siteClasses = new Set(
  readdirSync(path.join(root, 'docs/src/styles'), {
    encoding: 'utf8',
    recursive: true,
  })
    .filter(name => name.endsWith('.css'))
    .flatMap(name =>
      [
        ...readFileSync(
          path.join(root, 'docs/src/styles', name),
          'utf8',
        ).matchAll(/\.([A-Za-z_][\w-]*)/g),
      ].map(match => match[1]),
    ),
)

// The stem, so a page-local class used behind a variant is still recognised. A `:` that follows a path segment
// — a marker's identity — is deliberately left alone.
const stemOf = token => token.replace(/^(?:[a-z-]+:)+/, '')

const docUnknown = []
const docSiteOwned = []
const docSkipped = []
let docChecked = 0
let docExamples = 0

for (const [name, source] of docPages) {
  const blocks = blocksIn(source)
  const attributes = classesNamedIn(source)
  const found = blocks.flatMap(classesNamedIn)
  const tokens = [
    ...new Set(found.flatMap(value => value.split(/\s+/).filter(Boolean))),
  ]

  // Every `class` attribute in the page has to sit inside a block this extractor understood, so a fence it
  // fails to recognise shows up as a mismatch rather than as a quietly shorter list. Without it the arm could
  // pass while reading half a page.
  if (attributes.length !== found.length)
    docSkipped.push(`${name} ${found.length}/${attributes.length}`)

  docExamples += blocks.length

  for (const token of tokens) {
    if (siteClasses.has(stemOf(token))) {
      docSiteOwned.push(`${name}: ${token}`)

      continue
    }

    docChecked += 1

    const { raw } = await compileAlone([token])

    // The selector is the signal, and the obvious alternatives are both wrong. `--jumi-` is published in
    // the carrier payload for *any* input, including a class that does not exist; and the finalized output
    // has had the staging removed, which is where a lone control keeps the only name it writes.
    if (!raw.includes(asSelector(token))) docUnknown.push(`${name}: ${token}`)
  }
}

check(
  'every class the documentation names resolves',
  docPages.length > 0 &&
    docChecked > 0 &&
    !docUnknown.length &&
    !docSkipped.length,
  docUnknown.length
    ? `${docUnknown.length} unknown: ${docUnknown.join(', ')}`
    : `${docChecked} classes in ${docExamples} examples across ${docPages.length} pages` +
        (docSiteOwned.length
          ? `; the site's own: ${docSiteOwned.join(', ')}`
          : '') +
        (docSkipped.length
          ? ` (class attributes outside recognised blocks: ${docSkipped.join(', ')})`
          : ''),
)

/**
 * The crawler-facing index the site publishes at its root.
 *
 * `llms.txt` is generated by `scripts/llms.mjs` in the `prepare` stage, so this arm is not asking whether
 * it is current: generation cannot leave it behind. What a generator cannot promise is that what it wrote
 * reaches something, so the two questions here are coverage and reach. Every guide on the site has to
 * appear in the index of the site, and every link in it has to resolve to a page or an asset that exists,
 * because a crawler that follows a dead link has no way to tell it apart from a page that is simply empty.
 */
const siteAddress = readFileSync(
  path.join(root, 'docs/astro.config.ts'),
  'utf8',
).match(/^\s{2}site:\s*'([^']+)'/m)?.[1]

check(
  'the site declares the address its llms.txt is written in',
  Boolean(siteAddress),
  siteAddress ?? 'docs/astro.config.ts declares no `site`',
)

const llms = readFileSync(path.join(root, 'docs/public/llms.txt'), 'utf8')
const llmsFull = readFileSync(
  path.join(root, 'docs/public/llms-full.txt'),
  'utf8',
)
const linked = [...llms.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1])

/** The link's path, resolved the way the build would: a page source, or a file in `public/`. */
const reachable = href => {
  if (!href.startsWith(siteAddress)) return true

  const target = href.slice(siteAddress.length).replace(/^\/|\/$/g, '')

  return [
    path.join(root, 'docs/src/pages', `${target}.md`),
    path.join(root, 'docs/src/pages', `${target}.astro`),
    path.join(root, 'docs/src/pages', target, 'index.md'),
    path.join(root, 'docs/src/pages', target, 'index.astro'),
    path.join(root, 'docs/public', target),
  ].some(candidate => existsSync(candidate))
}

const guideNames = readdirSync(docRoot).filter(name => name.endsWith('.md'))
const guidesMissing = guideNames.filter(name => {
  const href =
    name === 'index.md' ? '/docs/' : `/docs/${name.replace(/\.md$/, '')}/`

  return !linked.includes(`${siteAddress}${href}`)
})
const dangling = linked.filter(href => !reachable(href))

check(
  'every guide is listed in the published llms.txt, and every link in it resolves',
  llms.startsWith('# Jumi') &&
    guideNames.length > 0 &&
    !guidesMissing.length &&
    !dangling.length &&
    linked.some(href => href.endsWith('/llms-full.txt')),
  guidesMissing.length
    ? `missing from the index: ${guidesMissing.join(', ')}`
    : dangling.length
      ? `dead links: ${dangling.join(', ')}`
      : `${guideNames.length} guides, ${linked.length} links`,
)

// The full corpus is only worth its size if it is actually full: the guides, and the skill.
const fullMissing = guideNames.filter(name => {
  const source = readFileSync(path.join(docRoot, name), 'utf8')
  const title = source.match(/^title:\s*(.+)$/m)?.[1].trim()

  return title ? !llmsFull.includes(title) : false
})

check(
  'llms-full.txt carries every guide and the agent skill',
  !fullMissing.length && llmsFull.includes('# The agent skill'),
  fullMissing.length
    ? `missing: ${fullMissing.join(', ')}`
    : `${(llmsFull.length / 1024).toFixed(0)} KB of guides and skill`,
)

/**
 * And the two the page names as things that do **not** work.
 *
 * Asserted separately because resolving and emitting are different questions: a lone duration control
 * resolves perfectly well, and the page's claim about it is that it leaves the element out of the
 * transition. A check that only asked "does it compile" would agree with the page while the page was
 * wrong.
 */
for (const [claim, candidate] of [
  [
    'a control alone does not make the element participate',
    'view-transition-old/hero:animation-duration-300',
  ],
  [
    'a source-state variant is refused',
    'hover:view-transition-old/hero:animate-fade-out',
  ],
]) {
  const { viewTransitions } = await compileAlone([candidate])

  check(
    `the page's claim holds: ${claim}`,
    viewTransitions === 0,
    `${candidate} → ${viewTransitions} rules`,
  )
}

/**
 * And the claim the installation page makes about where the runtime lives.
 *
 * `transition.run` is the only thing in the package that touches the DOM, and the docs say so — the root
 * stays CSS and build-time, and the page imports the subpath when it needs to drive a transition. That is one
 * import away from being false: a helper pulled into `src/index.ts` that happens to reach for `document` would
 * break it, and nothing else in the gate examines the root entry's bytes, so it would break quietly.
 */
const entrySources = ['index', 'postcss', 'vite'].map(name => [
  name,
  readFileSync(path.join(root, 'dist', `${name}.js`), 'utf8'),
])

const domGlobal = /\b(addEventListener|document|requestAnimationFrame|window)\b/

check(
  'and the runtime is the only entry that reaches for the DOM',
  entrySources.every(([, source]) => !domGlobal.test(source)),
  entrySources
    .filter(([, source]) => domGlobal.test(source))
    .map(([name]) => name)
    .join(', ') ||
    'the root, Vite and PostCSS entries are free of browser globals',
)

/* ------------------------------------------------------------------ the two adapters */

/**
 * Byte equivalence between the pass and the two hosts that call it.
 *
 * The finalizer is where this feature lives, so "Vite and PostCSS agree" is not a formality: they hand
 * it different things — PostCSS an AST it already parsed, Vite a string — and a difference between them
 * would show up as a feature that works in development and not in a build. The carrier protocol has
 * this assertion already; the view-transition emission is new code on the same path.
 */
const { jumiFinalizer: postcssFinalizer } = await import(
  path.join(root, 'dist/postcss.js')
)
const { jumiFinalizer: viteFinalizer } = await import(
  path.join(root, 'dist/vite.js')
)

const emission = instance.build(CANDIDATES)
const expected = finalizeCss(emission).css
const viaPostcss = (
  await postcss([postcssFinalizer()]).process(emission, {
    from: 'adapters.css',
  })
).css

const viteWarnings = []
const transformed = viteFinalizer().transform.call(
  { warn: message => viteWarnings.push(message) },
  emission,
  'adapters.css',
)

check(
  'Vite and PostCSS produce the same bytes as the pass',
  viaPostcss === expected && transformed?.code === expected,
  `pass ${expected.length}, postcss ${viaPostcss.length}, vite ${transformed?.code?.length ?? -1}`,
)

check(
  'the Vite adapter reports a refusal too',
  (() => {
    const refusedRaw = refused.build(REFUSED)
    const warnings = []

    viteFinalizer().transform.call(
      { warn: message => warnings.push(message) },
      refusedRaw,
      'x.css',
    )

    return warnings.some(message => message.includes('never runs there'))
  })(),
  'the same returned list, through the other host',
)

/* ------------------------------------------------------------------ the runtime wrapper */

/**
 * `transition.run`, against the platform it stands in front of.
 *
 * A fake cannot answer these, and this was tried first: the whole reason the wrapper exists is that the real
 * `startViewTransition` defers its callback, aborts whatever is in flight without stopping the aborted call's
 * callback, and — handed a promise — waits for it forever. The unit suite that modelled it was wrong about two
 * of those and produced unhandled rejections of its own, which is what a fake does at the boundary it is
 * guessing at. The type contract is still asserted at compile time in `src/view-transition.test.ts`; the
 * behaviour is asserted here.
 */
const runtime = await browser.newContext({
  reducedMotion: 'no-preference',
  viewport: { height: 900, width: 1200 },
})
const runtimePage = await runtime.newPage()

const runtimeErrors = []

runtimePage.on('pageerror', error => runtimeErrors.push(String(error)))

await runtimePage.goto(`${base}/runtime.html`)
await runtimePage.waitForLoadState('load')

const coalesced = await runtimePage.evaluate(() =>
  (async () => {
    const { counts, reset, run } = window.__probe

    reset()

    let updates = 0

    const one = run(() => {
      updates += 1
    })
    const two = run(() => {
      updates += 1
    })
    const outcomes = await Promise.all([one, two])

    return { calls: counts.calls, outcomes, updates }
  })(),
)

/**
 * The default, on the shape it exists for: two calls in one task.
 *
 * That shape is the measured hazard — the platform aborts the first transition, the aborted call's callback
 * still runs, and the survivor can animate a boundary it did not fill in. It is also the shape that cannot be
 * a second human gesture, since nobody clicks twice inside one task, so it is the one the default refuses.
 * Neither update is dropped: the caller's state is always right, and only the animation is given up.
 */
check(
  'the default coalesces two calls in one task: one transition, and neither update dropped',
  coalesced.calls === 1 &&
    coalesced.updates === 2 &&
    coalesced.outcomes[0].transitioned === true &&
    coalesced.outcomes[1].reason === 'in-flight',
  `${coalesced.calls} transition(s), ${coalesced.updates} update(s): ${JSON.stringify(coalesced.outcomes)}`,
)

/**
 * And the default on the shape it is *for* letting through: a later task.
 *
 * A second click is a later task, which is why this is asserted with a timer rather than by asking for it —
 * `transition.run(change)` with no options is what the demo calls, and the second click has to supersede
 * without the page saying so. `demo:check` makes the same claim end to end, through a real mouse.
 */
const deferred = await runtimePage.evaluate(() =>
  (async () => {
    const { counts, reset, run } = window.__probe

    reset()

    await new Promise(resolve => setTimeout(resolve, 20))

    const one = run(() => {})
    const two = await new Promise(resolve =>
      setTimeout(() => resolve(run(() => {})), 0),
    )
    const outcomes = await Promise.all([one, two])

    return { calls: counts.calls, outcomes }
  })(),
)

check(
  'a call from a later task supersedes without being asked to, and names what it cut short',
  deferred.calls === 2 &&
    deferred.outcomes.some(outcome => outcome.reason === 'aborted') &&
    deferred.outcomes.some(outcome => outcome.transitioned === true),
  `${deferred.calls} transitions: ${JSON.stringify(deferred.outcomes)}`,
)

/**
 * The case the marker had to be measured for, and the reason it is a task and not a microtask.
 *
 * A promise-deferred echo is still an echo: `queueMicrotask` runs before the task is over, so a marker that
 * cleared in a microtask would read this as a new interaction and supersede — aborting a transition the
 * reader is watching, for a duplicate write of the same gesture.
 */
const microtask = await runtimePage.evaluate(() =>
  (async () => {
    const { counts, reset, run } = window.__probe

    reset()

    await new Promise(resolve => setTimeout(resolve, 20))

    const one = run(() => {})
    const two = await new Promise(resolve =>
      queueMicrotask(() => resolve(run(() => {}))),
    )
    const outcomes = await Promise.all([one, two])

    return { calls: counts.calls, outcomes }
  })(),
)

check(
  'a call deferred by a microtask is still the same interaction, so it coalesces',
  microtask.calls === 1 && microtask.outcomes[1].reason === 'in-flight',
  `${microtask.calls} transition(s): ${JSON.stringify(microtask.outcomes)}`,
)

const overridden = await runtimePage.evaluate(() =>
  (async () => {
    const { counts, reset, run } = window.__probe

    reset()

    await new Promise(resolve => setTimeout(resolve, 20))

    const one = run(() => {}, { concurrency: 'coalesce' })
    const two = await new Promise(resolve =>
      setTimeout(() => resolve(run(() => {}, { concurrency: 'coalesce' })), 0),
    )
    const outcomes = await Promise.all([one, two])

    return { calls: counts.calls, outcomes }
  })(),
)

check(
  'and `coalesce` still means coalesce, whatever the timing',
  overridden.calls === 1 && overridden.outcomes[1].reason === 'in-flight',
  `${overridden.calls} transition(s): ${JSON.stringify(overridden.outcomes)}`,
)

const forced = await runtimePage.evaluate(() =>
  (async () => {
    const { counts, reset, run } = window.__probe

    reset()

    await new Promise(resolve => setTimeout(resolve, 20))

    const one = run(() => {}, { concurrency: 'supersede' })
    const two = run(() => {}, { concurrency: 'supersede' })
    const outcomes = await Promise.all([one, two])

    return { calls: counts.calls, outcomes }
  })(),
)

check(
  'and `supersede` still supersedes, even for two calls in one task',
  forced.calls === 2 &&
    forced.outcomes.some(outcome => outcome.reason === 'aborted') &&
    forced.outcomes.some(outcome => outcome.transitioned === true),
  `${forced.calls} transitions: ${JSON.stringify(forced.outcomes)}`,
)

const refusal = await runtimePage.evaluate(() =>
  (async () => {
    const { counts, reset, run } = window.__probe

    reset()

    let message = ''

    try {
      await run(async () => {})
    } catch (error) {
      message = String(error && error.message)
    }

    // The point of refusing: the promise is never handed to the platform, so the transition is abandoned rather
    // than waiting for a rendering update it is itself holding. If it were handed over, this next call would
    // never settle — measured, `await requestAnimationFrame()` inside an update wedges it permanently.
    const after = await run(() => {})

    await new Promise(resolve => setTimeout(resolve, 50))

    return {
      after,
      calls: counts.calls,
      message,
      unhandled: [...window.__unhandled],
    }
  })(),
)

check(
  'an async update is refused rather than handed to the browser',
  /requires a synchronous update/.test(refusal.message),
  refusal.message.slice(0, 64) || 'no error at all',
)

check(
  'and the transition is not left wedged, so the next call still runs one',
  refusal.after.transitioned === true,
  `the call after the refusal: ${JSON.stringify(refusal.after)} (${refusal.calls} transition(s) started)`,
)

check(
  'with no unhandled rejection from the refusal',
  refusal.unhandled.length === 0,
  refusal.unhandled.join(' | ') || 'none',
)

// Operation hooks and invocation outcomes are checked against the shipped runtime in a real browser.
const wrapped = await runtimePage.evaluate(async () => {
  const { createViewTransition } = await import('/jumi-runtime.js')
  const events = []
  const values = []
  const controller = createViewTransition({ concurrency: 'coalesce' })
  const open = controller.wrap(
    value => {
      values.push(value)
    },
    {
      onDecline: reason => events.push(reason),
      onError: () => events.push('error'),
      onTransitionEnd: () => events.push('end'),
      onTransitionStart: () => events.push('start'),
    },
  )
  const outcomes = await Promise.all([open(true), open(false)])
  const error = new Error('wrapped update failed')
  let observed = 0
  let rejected = false
  const fail = controller.wrap(
    () => {
      throw error
    },
    {
      onError: value => {
        if (value === error) observed++
      },
    },
  )
  try {
    await fail()
  } catch (value) {
    rejected = value === error
  }
  const otherEvents = []
  const other = controller.wrap(() => {}, {
    onTransitionEnd: () => otherEvents.push('end'),
    onTransitionStart: () => otherEvents.push('start'),
  })
  await other()
  return { events, observed, otherEvents, outcomes, rejected, values }
})
check(
  'wrapped overlapping invocations retain independent outcomes and operation hooks',
  JSON.stringify(wrapped.values) === '[false,true]' &&
    wrapped.outcomes[0].transitioned &&
    wrapped.outcomes[1].reason === 'in-flight' &&
    JSON.stringify(wrapped.events) === '["in-flight","start","end"]',
  JSON.stringify(wrapped),
)
check(
  'wrapped update errors reject and are observed exactly once',
  wrapped.rejected && wrapped.observed === 1,
  JSON.stringify(wrapped),
)
check(
  'a second operation owns its lifecycle and recovery remains usable',
  JSON.stringify(wrapped.otherEvents) === '["start","end"]',
  JSON.stringify(wrapped.otherEvents),
)

const stopped = await runtimePage.evaluate(async () => {
  const { createViewTransition } = await import('/jumi-runtime.js')
  const events = []
  let native
  const original = document.startViewTransition
  document.startViewTransition = function (update) {
    native = original.call(this, update)
    return native
  }
  try {
    const operation = createViewTransition().wrap(() => {}, {
      onDecline() {
        events.push('decline')
      },
      onTransitionEnd() {
        events.push('end')
      },
      onTransitionStart() {
        events.push('start')
        native.skipTransition()
      },
    })
    const outcome = await operation()
    let errors = 0
    const invalid = createViewTransition().wrap(async () => {}, {
      onError() {
        errors++
      },
    })
    let rejected = false
    try {
      await invalid()
    } catch {
      rejected = true
    }
    return { errors, events, outcome, rejected }
  } finally {
    document.startViewTransition = original
  }
})
check(
  'skipping a started wrapped transition ends its lifecycle without declining',
  JSON.stringify(stopped.events) === '["start","end"]' &&
    stopped.outcome.transitioned,
  JSON.stringify(stopped),
)
check(
  'JavaScript async wrappers are refused and observed without wedging playback',
  stopped.errors === 1 && stopped.rejected,
  JSON.stringify(stopped),
)

const controllers = await runtimePage.evaluate(async () => {
  const api = await import('/jumi-runtime.js')
  const { counts, reset } = window.__probe
  reset()
  const first = api.createViewTransition({ concurrency: 'supersede' })
  const second = api.createViewTransition({ concurrency: 'coalesce' })
  let updates = 0
  const one = first.run(() => {
    updates++
  })
  const two = second.wrap(() => {
    updates++
  })()
  const shared = await Promise.all([one, two])
  const calls = counts.calls
  reset()
  const three = second.run(() => {
    updates++
  })
  const four = second.run(
    () => {
      updates++
    },
    { concurrency: 'supersede' },
  )
  const overridden = await Promise.all([three, four])
  return {
    calls,
    exports: Object.keys(api),
    overridden,
    overrideCalls: counts.calls,
    shared,
    updates,
  }
})
check(
  'controllers coordinate across run and wrap using the incoming policy',
  controllers.calls === 1 &&
    controllers.shared[0].transitioned &&
    controllers.shared[1].reason === 'in-flight',
  JSON.stringify(controllers),
)
check(
  'run overrides controller policy without dropping either update',
  controllers.overrideCalls === 2 &&
    controllers.updates === 4 &&
    controllers.overridden[0].reason === 'aborted' &&
    controllers.overridden[1].transitioned,
  JSON.stringify(controllers),
)
check(
  'the constructor is the only public runtime export',
  JSON.stringify(controllers.exports) === '["createViewTransition"]',
  JSON.stringify(controllers.exports),
)

const unsupported = await runtimePage.evaluate(() =>
  (async () => {
    const { reset, run } = window.__probe

    reset()

    const real = document.startViewTransition

    document.startViewTransition = undefined

    let updates = 0
    const outcome = await run(() => {
      updates += 1
    })

    document.startViewTransition = real

    return { outcome, updates }
  })(),
)

check(
  'without the platform it is an ordinary update, and says so',
  unsupported.updates === 1 && unsupported.outcome.reason === 'unsupported',
  JSON.stringify(unsupported.outcome),
)

const hidden = await runtimePage.evaluate(() =>
  (async () => {
    const { reset, run } = window.__probe

    reset()

    Object.defineProperty(Document.prototype, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })

    let updates = 0
    const outcome = await run(() => {
      updates += 1
    })

    delete Document.prototype.visibilityState

    return { outcome, updates }
  })(),
)

check(
  'and in a hidden document it applies the update instead of rejecting `ready`',
  hidden.updates === 1 && hidden.outcome.reason === 'hidden',
  JSON.stringify(hidden.outcome),
)

/**
 * Why the wrapper consumes a promise nobody asked about.
 *
 * The platform republishes the update callback's error on every promise it hands out, and one of them left
 * unobserved is an unhandled rejection in the host's console — which is what the wrapper was doing before this
 * arm existed: it consumed `ready` and `finished`, the two it had a reason to look at, and leaked the third.
 * Nothing here goes through the wrapper, because the claim is about the platform and would otherwise read as
 * the wrapper's own bookkeeping. This page is deliberately not listened to for page errors: it causes one.
 */
const probePage = await runtime.newPage()

await probePage.goto(`${base}/runtime.html`)
await probePage.waitForLoadState('load')

const leaks = await probePage.evaluate(() =>
  (async () => {
    const probe = async consumed => {
      window.__unhandled.length = 0

      const transition = document.startViewTransition(() => {
        throw new TypeError('probe')
      })

      for (const name of consumed) transition[name].catch(() => {})

      await new Promise(resolve => setTimeout(resolve, 100))

      return window.__unhandled.length
    }

    return {
      all: await probe(['ready', 'updateCallbackDone', 'finished']),
      two: await probe(['ready', 'finished']),
    }
  })(),
)

check(
  "consuming two of the update error's three promises is not enough",
  leaks.all === 0 && leaks.two >= 1,
  `all three consumed → ${leaks.all} unhandled; only \`ready\` and \`finished\` consumed → ${leaks.two} unhandled`,
)

check(
  'the runtime arms throw nothing',
  runtimeErrors.length === 0,
  runtimeErrors.slice(0, 3).join(' | ') || 'clean',
)

await runtime.close()

// The fixture server and the browser outlive the earlier sections now, because the runtime arms need both.
await browser.close()
server.close()

/* ------------------------------------------------------------------ report */

for (const { detail, label, pass } of checks) {
  console.log(`${pass ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`)
}

if (emitted.warnings.length) {
  console.log(
    `\n· the finalizer reported ${emitted.warnings.length} refusal(s):`,
  )
  for (const warning of emitted.warnings) console.log(`  ${warning}`)
}

const failed = checks.filter(entry => !entry.pass).length

console.log(`\n${checks.length - failed}/${checks.length} assertions passed`)

if (failed) process.exit(1)
