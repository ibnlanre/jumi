#!/usr/bin/env node
/**
 * Behaviour check — does the emitted CSS actually animate a real element?
 *
 * Every other harness here reads CSS *text*: the byte snapshot compares it, the structure
 * table counts it, the incremental harness watches a list grow. None of them can tell
 * whether a browser resolves it, and that gap has cost us twice: an aggregate published on
 * `:root` referenced slot variables that only exist on the element, and a `*:animations`
 * carrier leaves the aggregate on the parent while the slots are on the children. Both had a
 * green snapshot, a green incremental harness and 100+ passing unit tests. **Computed
 * behaviour is the truth for this part of Jumi, not emitted CSS shape.**
 *
 * So this compiles two corpora — through the same two steps a real build runs, Tailwind
 * emitting and Jumi finalizing — loads them in a real browser, and asserts every activation
 * context Jumi promises:
 *
 *   the utility itself             must animate
 *   *:animate-* descendant         must animate
 *   before:animate-* pseudo        must animate, substrate included
 *   @apply animate-*               must animate
 *
 * There is no opt-in class any more: an element animates because it carries a motion utility, so
 * every one of these is an *inference* this pass makes from the emitted CSS rather than a marker it
 * follows. The three non-obvious ones are the ones a marker could not reach — a descendant, a
 * pseudo-element, and a rule `@apply` inlined.
 *
 * It also asserts the substrate's precedence triangle, because the architecture now depends on it:
 * a default written at the top of the layer, a Jumi control over it, and an arbitrary custom
 * property over both. And it asserts the finalizer did its job: the payload is gone, and running
 * the pass over its own output changes nothing.
 *
 * Finally it asserts the one promise that is not about an element opting in: a slot activation name
 * is registered `inherits: false`, so an ancestor's activation cannot reach an animating
 * descendant. The emitted CSS for that case looks entirely reasonable, which is the whole reason it
 * belongs here — see the `property` sink, and section 6.
 *
 * And it asserts the composed-property path in computed style, because a constituent phrase can emit
 * every correct name and still not move: `animate-scale-x-[0:1|100:0]` writes
 * `--jumi-scale-x-<id>-0: 1` and `<id>-100: 0`, and the composed `scale` keyframe has to read *those*
 * per frame. With the frame-first lookup missing, both frames resolve `var(--jumi-scale-x)`, the sheet
 * contains every name it should, and the animation holds one value at every offset. That shipped for a
 * month behind a green snapshot, a green audit and this harness, so the arm below reads the *computed*
 * `scale` and then strips the lookups from the same sheet to prove it can fail.
 *
 * Run: pnpm behaviour:check
 */
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { ensureBundle } from './bundle.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

ensureBundle()

// Bundling comes first because the helper loads the finalizer out of `dist/`: the harness
// exercises the artifact that ships, not the source it was built from.
const { build, compiler, corpus, finalizeCss } =
  await import('./lib/compile.mjs')

/**
 * An entry for a build whose candidates are supplied here rather than scanned from a fixture —
 * needed by the naming section, which has to compile the *same* page in two candidate orders and a
 * fixture is one fixed list.
 */
const ENTRY = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

/** Compile a corpus, finalize it, and say what the finalizer did. */
const compile = async name => {
  const built = await corpus(name)

  console.log(
    `· ${name} — ${built.animations + built.transitions} selectors composed,` +
      ` ${built.staging} payload rules consumed, ${built.css.length} bytes`,
  )

  return built
}

/**
 * The finalizer's own contract, checked before the browser is asked anything.
 *
 * `finalize` is idempotent and the payload is consumed, so running it over its own output must
 * find nothing left to do — nothing to derive, nothing to remove — and must not rewrite a byte.
 * That is a stronger statement than `staging === 0`, which only says the first pass removed what
 * it found: this says a second pass finds no work at all.
 */
const settled = (built, name) => {
  const again = finalizeCss(built.css)

  if (again.staging !== 0)
    failures.push(
      `${name}: ${again.staging} payload rules survived finalization`,
    )
  if (again.animations !== 0 || again.transitions !== 0)
    failures.push(`${name}: a composition was derived twice`)
  if (again.css !== built.css)
    failures.push(`${name}: finalizing the finalized CSS changed it`)
}

/**
 * The slot name a utility declares, read out of the CSS rather than hard-coded, so the
 * expectation follows the emission. Matches by selector *containing* the escaped class,
 * because a prefixed form wraps it (`… > *` for a descendant, `::before` for a pseudo).
 */
const slotReader = css => utility => {
  // Escape the way the host escapes a class selector: every character that is not a word character
  // or a dash. A hand-rolled character class kept missing one (`>`, then `&`), and a miss reads as
  // "this utility is not in the sheet" rather than as a harness bug.
  const escaped = utility.replace(/[^\w-]/g, character => `\\${character}`)
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!m[1].includes(escaped)) continue

    const name = /--jumi-[\w-]+-animation-name:\s*([\w-]+);/.exec(m[2])?.[1]

    if (name) return name
  }

  return null
}

const longhands = [
  'animationName',
  'animationDuration',
  'animationDelay',
  'animationComposition',
  'animationDirection',
  'animationFillMode',
  'animationIterationCount',
  'animationPlayState',
  'animationTimeline',
  'animationTimingFunction',
]

const browser = await chromium.launch()

const load = async (css, body) => {
  const page = await browser.newPage()

  await page.setContent(`<!doctype html>
<html>
  <head><style>${css}</style></head>
  <body>
    ${body}
  </body>
</html>`)

  return page
}

const entry = (page, selector, pseudo = null) =>
  page.evaluate(
    ({ parts, pseudo: pseudoElement, selector: query }) => {
      const element = document.querySelector(query)

      if (!element) return null

      const style = getComputedStyle(element, pseudoElement)
      const lists = Object.fromEntries(
        parts.map(part => [
          part,
          style[part].split(',').map(value => value.trim()),
        ]),
      )

      return {
        duration: style.animationDuration,
        lengths: [...new Set(Object.values(lists).map(list => list.length))],
        name: style.animationName,
      }
    },
    { parts: longhands, pseudo, selector },
  )

const failures = []

/* ------------------------------------------------------------------------------------
 * 1. The carrier contexts. Product behaviour: each of these must animate.
 * ---------------------------------------------------------------------------------- */

const variantBuild = await compile('variant.css')
const variantCss = variantBuild.css
const slots = slotReader(variantCss)

settled(variantBuild, 'variant.css')

if (variantBuild.animations === 0) {
  failures.push('variant.css: the finalizer derived no composition')
}

const contexts = [
  {
    detail: 'the utility itself',
    key: 'direct',
    selector: '#ctx-direct',
    utility: 'animate-rotate-45',
  },
  {
    detail: '*:animate-* descendant',
    key: 'descendant',
    selector: '#ctx-descendant > i',
    utility: '*:animate-rotate-45',
  },
  {
    detail: 'before:animate-* pseudo',
    key: 'pseudo',
    pseudo: '::before',
    selector: '#ctx-pseudo',
    utility: 'before:animate-scale-110',
  },
]

const variantPage = await load(
  variantCss,
  `
    <div id="ctx-direct" class="animate-rotate-45"></div>
    <div id="ctx-descendant" class="*:animate-rotate-45"><i></i></div>
    <div id="ctx-pseudo" class="before:content-[''] before:animate-scale-110"></div>
`,
)

console.log('\n  activation contexts\n')

for (const context of contexts) {
  const measured = await entry(variantPage, context.selector, context.pseudo)
  const expected = slots(context.utility)

  if (measured === null) {
    failures.push(
      `${context.detail}: ${context.selector} not found in the page`,
    )
    console.log(`    ✗ ${context.detail}`)
    continue
  }

  const resolving = measured.name
    .split(',')
    .map(name => name.trim())
    .filter(name => name !== 'none')
  const works = expected !== null && measured.name.includes(expected)

  console.log(
    `    ${works ? '✓' : '✗'} ${context.detail.padEnd(28)}${context.utility.padEnd(26)}` +
      `${resolving.length ? resolving.join(' + ') : 'none'}`,
  )

  if (!works) {
    failures.push(
      `${context.detail}: resolved "${measured.name.slice(0, 40)}" for ${context.utility},` +
        ` expected to include ${expected ?? '(no slot in the CSS)'}`,
    )
  }

  if (measured.lengths.length !== 1) {
    failures.push(
      `${context.detail}: longhand lists disagree on length (${measured.lengths.join(' vs ')})`,
    )
  }
}

/* ------------------------------------------------------------------------------------
 * 2. The substrate on a pseudo-element, and the precedence triangle over it.
 * ---------------------------------------------------------------------------------- */

console.log('\n  substrate\n')

// The case that falsified `:where()`. A pseudo-element cannot appear inside it, so the defaults rule
// was dropped as invalid, the substrate never arrived, and `var(--jumi-animation-name)` inside the
// composition's list made the whole declaration invalid at computed-value time — the name read
// `none` rather than reading wrong. The duration is asserted too, because that is the substrate
// itself arriving rather than something else making the name resolve.
//
// Read at the **live** position. The aggregate publishes one shallow reference per slot and only
// the activated ones resolve to a slot's value; the rest fall back, and their computed longhands are
// bookkeeping rather than contract — `engineering/research/style-cost.md` records the ruling, and
// asserting them here would pin the old representation on positions that never run.
const pseudo = await variantPage.evaluate(() => {
  const style = getComputedStyle(
    document.querySelector('#ctx-pseudo'),
    '::before',
  )
  const names = style.animationName.split(',').map(part => part.trim())
  const durations = style.animationDuration.split(',').map(part => part.trim())

  return names
    .map((name, index) => (name === 'none' ? null : durations[index]))
    .filter(Boolean)
})
const pseudoOk =
  pseudo.length > 0 && pseudo.every(duration => duration === '1s')

console.log(
  `    ${pseudoOk ? '✓' : '✗'} pseudo-element substrate  ${pseudo.join(', ') || '(nothing live)'}`,
)

if (!pseudoOk)
  failures.push(
    `pseudo-element: the live position resolved "${pseudo.join(', ') || 'nothing'}", expected the 1s substrate`,
  )

/* ------------------------------------------------------------------------------------
 * 3. The contexts that are not a variant, and the mechanisms a selector reaches
 *    (canonical corpus).
 * ---------------------------------------------------------------------------------- */

const canonicalBuild = await compile('input.css')
const canonicalCss = canonicalBuild.css
const canonicalSlots = slotReader(canonicalCss)

settled(canonicalBuild, 'input.css')

/**
 * Three things can set `--jumi-animation-duration`, and each has to beat the one before it:
 *
 *   the default the finalizer wrote at the top of the layer    1s
 *   a Jumi control utility                                     500ms
 *   an arbitrary custom property                               750ms
 *
 * Read as the *resolved* duration rather than as a count of declarations, so this is the cascade
 * end to end: the composition's `animation-duration` is a `var()` chain over that variable, and a
 * browser that applied the wrong one shows it here.
 */
const precedence = await load(
  canonicalCss,
  `
    <div id="precedence-default" class="animate-rotate-45"></div>
    <div id="precedence-controlled" class="animate-rotate-45 animation-duration-500"></div>
    <div id="precedence-arbitrary" class="animate-rotate-45 [--jumi-animation-duration:750ms]"></div>
`,
)

for (const [id, expected] of [
  ['precedence-default', '1s'],
  ['precedence-controlled', '0.5s'],
  ['precedence-arbitrary', '0.75s'],
]) {
  // The control has to reach the position that runs. Inactive positions carry no animation, and
  // under the ruling in `engineering/research/style-cost.md` their longhands are implementation
  // bookkeeping — reading them would be asserting the old representation's behaviour on values no
  // browser reads. Reading the live position tests the same cascade end to end and tests the thing
  // that actually matters.
  const live = await precedence.evaluate(selector => {
    const style = getComputedStyle(document.querySelector(selector))
    const names = style.animationName.split(',').map(part => part.trim())
    const durations = style.animationDuration
      .split(',')
      .map(part => part.trim())

    return names
      .map((name, index) => (name === 'none' ? null : durations[index]))
      .filter(Boolean)
  }, `#${id}`)
  const works = live.length > 0 && live.every(duration => duration === expected)

  console.log(
    `    ${works ? '✓' : '✗'} ${id.padEnd(22)}${expected.padEnd(8)}${live.join(', ').slice(0, 44)}`,
  )

  if (!works)
    failures.push(
      `precedence: #${id} resolved "${live.join(', ') || 'nothing live'}", expected ${expected}`,
    )
}

const utilities = [
  'animate-rotate-45',
  'animate-scale-110',
  'animate-bounce-in',
  'animate-background-color-red-500',
]

const directPage = await load(
  canonicalCss,
  `
    ${utilities.map((utility, index) => `<div id="c${index}" class="${utility}"></div>`).join('\n    ')}
    <div id="bare" class="animation-duration-500"></div>
    <div id="applied" class="applied-motion"></div>
    <div id="spacing" class="animate-padding-4 animate-margin-2"></div>
    <div id="radius" class="animate-border-radius-sm"></div>
    <h1 id="sel-is" class="[&:is(h1)]:animate-fade-in"></h1>
    <div class="[&:is(h1)]:animate-fade-in"><h1 id="sel-is-descendant"></h1></div>
    <div id="sel-has" class="has-[>button]:animate-scale-110"><button></button></div>
`,
)

const direct = []

for (const [index, utility] of utilities.entries()) {
  const measured = await entry(directPage, `#c${index}`)
  const expected = canonicalSlots(utility)

  direct.push({ measured, utility })

  if (expected === null) {
    failures.push(`${utility}: no slot name found in the emitted CSS`)
    continue
  }

  if (!measured.name.includes(expected)) {
    failures.push(
      `${utility}: resolved "${measured.name.slice(0, 60)}", expected to include ${expected}`,
    )
  }

  if (measured.lengths.length !== 1) {
    failures.push(
      `${utility}: longhand lists disagree on length (${measured.lengths.join(' vs ')})`,
    )
  }
}

const bare = await entry(directPage, '#bare')

// The bare carrier has no slot of its own: the aggregate still lists every slot in the
// sheet, each resolving to `none`, so nothing may animate there.
const bareNames = bare.name.split(',').map(name => name.trim())

if (bareNames.some(name => name !== 'none')) {
  failures.push(
    `a carrier with no slot resolved something other than nones: "${bare.name.slice(0, 60)}"`,
  )
}

/* ------------------------------------------------------------------------------------
 * 4. The theme batch: a spacing name resolves through `--spacing`, not a build-time literal
 * ---------------------------------------------------------------------------------- */

// The corpus overrides `--spacing` (0.3rem), so this is the batch's claim measured where it
// matters: the emitted value is a *reference* the browser resolves against the page's theme. A
// resolved literal — `1rem` — would compile, animate, and ignore the override entirely.
const spacingProperty =
  /(--jumi-padding-[\w-]+):\s*calc\(var\(--spacing\) \* 4\)/.exec(
    canonicalCss,
  )?.[1]
const spacingValue = spacingProperty
  ? await directPage.evaluate(
      property =>
        getComputedStyle(document.querySelector('#spacing')).getPropertyValue(
          property,
        ),
      spacingProperty,
    )
  : '(no formula in the CSS)'

const spacingResolved =
  typeof spacingValue === 'string' && spacingValue.includes('0.3rem')

if (!spacingResolved) {
  failures.push(
    `theme: the padding utility resolved to "${String(spacingValue).slice(0, 60)}", expected the corpus's 0.3rem`,
  )
}

/* ------------------------------------------------------------------------------------
 * 5. The partial-namespace batch: a token-backed name resolves through the token
 * ---------------------------------------------------------------------------------- */

// Same claim as the spacing one above, for a name that is not arithmetic: the corpus overrides
// `--radius-sm` (0.9rem), and the utility is emitted as `var(--radius-sm)` either way. Only the
// browser shows whether the value is a reference or a literal baked in at build time — and a
// literal is exactly what the table would produce if a namespace were only guessed at.
const radiusProperty =
  /(--jumi-border-radius-[\w-]+):\s*var\(--radius-sm\)/.exec(canonicalCss)?.[1]
const radiusValue = radiusProperty
  ? await directPage.evaluate(
      property =>
        getComputedStyle(document.querySelector('#radius')).getPropertyValue(
          property,
        ),
      radiusProperty,
    )
  : '(no token reference in the CSS)'

const radiusResolved =
  typeof radiusValue === 'string' && radiusValue.includes('0.9rem')

if (!radiusResolved) {
  failures.push(
    `theme: the border-radius utility resolved to "${String(radiusValue).slice(0, 60)}", expected the corpus's 0.9rem`,
  )
}

// `@apply animations` inlines the carrier — longhands, slot references *and* the marker that
// says what the rule is. So the copied rule is a carrier like any other, and the finalizer
// writes the aggregate into it after the build. It used to resolve nothing, because the only
// place the data could be published was a selector that could not name this element; the
// marker is what removed that limit, and this is the assertion that holds it.
const applied = await entry(directPage, '#applied')
const appliedSlot = canonicalSlots('animate-rotate-45')
const appliedNames = applied.name
  .split(',')
  .map(name => name.trim())
  .filter(name => name !== 'none')
const appliedWorks = appliedSlot !== null && applied.name.includes(appliedSlot)

if (!appliedWorks) {
  failures.push(
    `@apply animations: resolved "${applied.name.slice(0, 60)}",` +
      ` expected to include ${appliedSlot ?? '(no slot in the CSS)'}`,
  )
}

if (applied.lengths.length !== 1) {
  failures.push(
    `@apply animations: longhand lists disagree on length (${applied.lengths.join(' vs ')})`,
  )
}

/* ------------------------------------------------------------------------------------
 * 6. Relationship variants: same element, not a descendant
 * ---------------------------------------------------------------------------------- */

// These three are chosen so a descendant selector fails them. `is-[h1]:x` used to be Jumi's own
// variant, and it emitted `.is-\[h1\]\:x :is(h1)` — a *descendant* — which would have matched the
// carrier h1 inside the div below, and would not have matched the h1 carrying the class at all.
// The variant is gone now (Jumi does not occupy `is-*`), and `[&:is(h1)]` is the host's arbitrary
// form, so this pins the semantics Jumi recommends instead.
const sameElement = await entry(directPage, '#sel-is')
const descendant = await entry(directPage, '#sel-is-descendant')
const hasChild = await entry(directPage, '#sel-has')

const isSlot = canonicalSlots('[&:is(h1)]:animate-fade-in')
const hasSlot = canonicalSlots('has-[>button]:animate-scale-110')
const isResolved = isSlot !== null && sameElement.name.includes(isSlot)
const descendantResolved = descendant.name
  .split(',')
  .some(name => name.trim() !== 'none')
const hasResolved = hasSlot !== null && hasChild.name.includes(hasSlot)

if (!isResolved) {
  failures.push(
    `[&:is(h1)]: the element carrying the class resolved "${sameElement.name.slice(0, 40)}", expected ${isSlot ?? '(no slot)'}`,
  )
}

if (descendantResolved) {
  failures.push(
    `[&:is(h1)]: a descendant resolved "${descendant.name.slice(0, 40)}" — the variant is not same-element`,
  )
}

if (!hasResolved) {
  failures.push(
    `has-[>button]: the element with a direct child button resolved "${hasChild.name.slice(0, 40)}", expected ${hasSlot ?? '(no slot)'}`,
  )
}

/* ------------------------------------------------------------------------------------
 * 7. Non-inheritance: an ancestor's activation must not reach an animating descendant
 * ---------------------------------------------------------------------------------- */

// A slot activation name is *state*, not configuration, so it is registered `inherits: false` (see
// the `property` sink in `@/helpers/create`). Left unregistered, a custom property inherits like
// any other — and a descendant that also animates, which is exactly what puts it in the composition
// set, then resolves the ancestor's token at that slot's position and re-runs the ancestor's
// animation with its own timing. The declared defaults do not cover this: `--jumi-animation-name:
// none` is a different property, and a `var()` fallback applies only when a property is *unset*,
// which an inherited value is not.
//
// This is the recorded failure in miniature — the hero orbit's `animate-rotate-[360deg]` leaking
// into nested petals, which then spun at the petal's duration instead of the orbit's. Deleting
// `inherits: false` from the sink leaves every other harness here green, because none of them can
// see inheritance at all.
const nesting = await load(
  canonicalCss,
  `
    <div id="nest-outer" class="animate-rotate-45">
      <div id="nest-inner" class="animate-fade-in"></div>
    </div>
`,
)

const outerSlot = canonicalSlots('animate-rotate-45')
const innerSlot = canonicalSlots('animate-fade-in')
const outerNames =
  (await entry(nesting, '#nest-outer'))?.name
    .split(',')
    .map(name => name.trim()) ?? []
const innerNames =
  (await entry(nesting, '#nest-inner'))?.name
    .split(',')
    .map(name => name.trim()) ?? []

const outerAnimates = outerSlot !== null && outerNames.includes(outerSlot)
const innerAnimates = innerSlot !== null && innerNames.includes(innerSlot)
const innerInherits = outerSlot !== null && innerNames.includes(outerSlot)
const nestingOk = outerAnimates && innerAnimates && !innerInherits

if (!nestingOk) {
  failures.push(
    'non-inheritance:' +
      ` the outer ${outerAnimates ? 'animated' : `resolved no ${outerSlot}`},` +
      ` the inner ${innerAnimates ? 'animated' : `resolved no ${innerSlot}`},` +
      ` and the inner ${innerInherits ? `ran the ancestor's ${outerSlot}` : 'stayed clear of the ancestor'}`,
  )
}

/* ------------------------------------------------------------------------------------
 * 9. A name addresses one motion, on the element that declared it.
 *
 * The differential the CTO asked for, and it is the reason this section exists at all: the first
 * implementation of naming attached the name to the slot in the **aggregate**, so a name seen
 * anywhere in the build became an address everywhere — measured, `animation-duration-900/loop`
 * reached an element whose fade-in was named `reveal`, and which of the two names won depended on
 * the order the candidates happened to be compiled in.
 *
 * The fix is that the name is installed on the rule that declared it, so this runs the whole page
 * twice, in opposite candidate orders, and requires the same answer both times.
 * ---------------------------------------------------------------------------------- */
const NAMED_ARMS = [
  [
    'a',
    'animate-fade-in/reveal animation-duration-300/reveal animation-duration-900/loop',
  ],
  ['b', 'animate-fade-in/loop animation-duration-700/loop'],
  [
    'c',
    'animate-fade-in/reveal animate-scale-110/loop animation-duration-900/loop',
  ],
  // Names its own motion, and is named by nothing: every name in the sheet must miss it.
  [
    'd',
    'animate-fade-in animation-duration-900/loop animation-duration-500/elsewhere',
  ],
  // A name shared by two *phrases* — the motion source whose slot key carries a hash, so this is where
  // a name and a slot key could part company — plus one phrase that took no name, which must stay out.
  [
    'e',
    'animate-opacity-[0:0|100:1]/enter animate-rotate-[0:0deg|100:90deg]/enter animation-duration-500/enter animate-scale-[0:1|100:2]',
  ],
  // A name that is also a property, which is the one token that could be read twice. `scale` is a
  // property Jumi animates *and* the name given to the rotate motion, so the two readings have to stay
  // apart: `/scale` is the property's (the scale motion takes 1s) and the rotate motion keeps its own
  // `/rotate` control at 400ms. Sharing one namespace, one class set both and this arm read `1s, 1s` —
  // which is the failure, and it is silent, because both motions still animate.
  [
    'f',
    'animate-rotate-45/scale animate-scale-110 animation-duration-1000/scale animation-duration-400/rotate',
  ],
  // The three parts an `animation` shorthand cannot carry, all three addressed by the motion's own name.
  // They are the parts that stay *assigned separately*, and the reason is structural: the composition
  // declares them in one rule for every activating selector, so it cannot name a motion, and a name
  // reaches them through a link the naming rule fills. An unfilled link falls back or drops — silently,
  // because the motion still runs — so it is asserted rather than assumed.
  //
  // This arm names a **value**, whose slot key spells the name, so its chain reads the label directly.
  [
    'g',
    'animate-rotate-45/spin animation-composition-add/spin animation-timeline-scroll/spin animation-range-[25%_75%]/spin',
  ],
  // The same three parts on a **named effect** — the shape arm `g` cannot cover, and the one that was
  // nearly lost. An effect keys its slot by the *definition* (`--jumi-slot-fade-in`), because every name of
  // that effect shares one slot, so its chain cannot read a label at all: a name written into the shared
  // composition would be whichever name was recorded last. It keeps the slot-keyed hop, and the fill that
  // writes it, on the rule that named the motion.
  //
  // Measured on the commit that removed the fills unconditionally: this reads
  // `{"composition":"replace","range":"0%","timeline":"auto"}` — every control gone while the motion
  // still runs — and the whole gate stayed green, because arm `g` is value-shaped and was the only cover.
  [
    't',
    'animate-fade-in/reveal animation-composition-add/reveal animation-timeline-scroll/reveal animation-range-[25%_75%]/reveal',
  ],
  // The destructive spelling, which must leave the motion **running**: a phrase written into a part the
  // `animation` shorthand carries makes the whole shorthand invalid at computed-value time, and the element
  // then reports `animation-name: none` — no animations at all, which reads as a page that never animated
  // rather than as one that is broken. The shape is unsupported, so it emits nothing at all; asserted here
  // because the failure it prevents is invisible in text and catastrophic in effect.
  [
    'h',
    'animate-fade-in/hphrase animation-timing-function-[0:ease-out]/hphrase',
  ],
  // Segment easing, against real emitted keyframes. `jumi-shake` is the fixture the sharp edges need: it
  // groups selectors — `10%, 30%, 50%, 70%, 90%` — and writes `from, to`, so partial targeting and
  // normalization are exercised on what Jumi actually emits rather than on a synthetic keyframe.
  [
    'j',
    'animate-shake/shakey animation-timing-function-[10:step-start]/shakey animation-duration-1000',
  ],
  [
    'k',
    'animate-shake/split animation-timing-function-[0:step-start]/split animation-duration-1000',
  ],
  // An offset the definition does not have: this phrase has 0 and 100, not 50. Unsupported, so silence —
  // and the base definition untouched.
  [
    'l',
    'animate-rotate-[0:0deg|100:90deg]/unmatched animation-timing-function-[50:linear]/unmatched animation-duration-1000',
  ],
  // Two names over ONE definition, each with its own phrase: the case instance-keyed selection exists for,
  // and the one a definition-keyed selection would move together.
  [
    'm',
    'animate-rotate-[0:0deg|100:90deg]/alpha animate-rotate-[0:0deg|100:90deg]/beta animation-timing-function-[0:step-start]/alpha animation-timing-function-[0:step-end]/beta animation-duration-1000',
  ],
  // A name that reads like a section of the shorthand. The slot key spells the name first, so an instance may
  // legitimately be called `flick-animation-duration` — and the pass has to tell that name from the part that
  // follows it in the variable. The reader that used to do so read the instance out of the staged **chain**,
  // and one that took the first part-shaped suffix inside the variable read `flick`, published the hoist under
  // a key nothing activates, and left the motion running with only its control missing — silently.
  //
  // That reader is gone (2026-09-17: the instance travels as data, see the note above `hoist`), so the guess
  // cannot recur in that form. The arm stays because the hazard it names is unchanged in its new one: the key
  // still spells the name, the rule still answers to the definition, and `publishedKey` has to produce exactly
  // the string the rule declared.
  [
    'n',
    'animate-scale-110/flick-animation-duration animation-duration-600/flick-animation-duration',
  ],
  // A name the stylesheet has to **escape**, which is where the length prefix earns its keep: the count is of
  // the text that ships (`foo.bar` occupies eight characters as `foo\.bar`), so a reader that slices by it has
  // to be reading the emitted text and not the author's word. A reader that counted what the author typed
  // takes one character too many and lands inside the name.
  ['o', 'animate-scale-110/[foo.bar] animation-duration-600/[foo.bar]'],
  // A timing phrase with **no address**: the shape is unsupported without a name to select it, so the model
  // emits nothing at all and the motion must be indistinguishable from one that never wrote the phrase. The
  // failure this prevents is a phrase that looks accepted while doing nothing — or worse, one that leaks to
  // every element animating the definition.
  [
    'q',
    'animate-rotate-[0:0deg|100:90deg]/first animation-timing-function-[0:step-start]',
  ],
  // A **scalar** easing under a name, which is the control that must keep working exactly as it did: the
  // phrase path is the new one, and the value path it grew out of has to stay untouched beside it.
  ['r', 'animate-scale-110/scalar animation-timing-function-[ease-in]/scalar'],
  // The third spelling of an address, and the widest reach: `/rotate` is a **property** scope, so it reaches
  // every instance of that property on the element rather than one name. Two instances over one definition
  // are the case that tells the two apart — a name would specialize only one of them.
  [
    's',
    'animate-rotate-[0:0deg|100:90deg]/alpha animate-rotate-[0:0deg|100:90deg]/beta animation-timing-function-[0:step-start]/rotate animation-duration-1000',
  ],
]

const NAMED_CANDIDATES = [
  ...new Set(
    NAMED_ARMS.flatMap(([, classes]) => classes.split(/\s+/).filter(Boolean)),
  ),
]

/** The duration each live animation resolves to, per element, by name position. */
const namedDurations = async candidates => {
  const built = build(await compiler(ENTRY, root), candidates)
  const page = await load(
    built.css,
    NAMED_ARMS.map(
      ([id, classes]) => `<div id="named-${id}" class="${classes}"></div>`,
    ).join('\n'),
  )

  const readings = {}

  for (const [id] of NAMED_ARMS) {
    const reading = await page.evaluate(selector => {
      const style = getComputedStyle(document.querySelector(selector))
      const names = style.animationName.split(',').map(name => name.trim())
      const durations = style.animationDuration
        .split(',')
        .map(value => value.trim())

      return Object.fromEntries(
        names.map((name, at) => [name, durations[at] ?? '?']),
      )
    }, `#named-${id}`)

    readings[id] = reading
  }

  await page.close()

  return readings
}

const forward = await namedDurations(NAMED_CANDIDATES)
const reversed = await namedDurations([...NAMED_CANDIDATES].reverse())
const durationOf = (readings, id, prefix) =>
  Object.entries(readings[id] ?? {}).find(([name]) =>
    name.startsWith(prefix),
  )?.[1]

/** Every reading that differs between the two builds, named, so a failure says what moved. */
const orderDrift = Object.entries(forward).flatMap(([id, reading]) =>
  Object.entries(reading)
    .filter(([name, duration]) => reversed[id]?.[name] !== duration)
    .map(
      ([name, duration]) =>
        `#${id} ${name}: ${duration} vs ${reversed[id]?.[name] ?? 'absent'}`,
    ),
)

/**
 * The three properties the `animation` shorthand cannot carry, read on the element that named them.
 *
 * These are the parts a name still reaches through a link: `animation-composition`, `animation-range`
 * and `animation-timeline` have no shorthand section, so the composition declares them — and the
 * composition is one rule for every activating selector, which is why it cannot name a motion itself.
 * The naming rule fills the slot-keyed link the composition reads, and this is the only place that fill
 * is asserted: if it went missing the three would fall back or drop, and the motion would still run.
 *
 * The live motion is found by position rather than by index 0: the element's `animation` list carries a
 * position for every slot in the stylesheet, and only the one this element activated is named.
 */
const separateParts = async () => {
  const built = build(await compiler(ENTRY, root), NAMED_CANDIDATES)
  const classes = NAMED_ARMS.find(([id]) => id === 'g')[1]
  const page = await load(
    built.css,
    `<div id="named-g" class="${classes}"></div>`,
  )

  const reading = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector('#named-g'))
    const names = style.animationName.split(',').map(value => value.trim())
    const at = names.findIndex(name => name.startsWith('jumi-rotate-'))
    const pick = value => value.split(',')[at]?.trim() ?? 'absent'

    return {
      composition: pick(style.animationComposition),
      duration: pick(style.animationDuration),
      range: pick(style.animationRange),
      timeline: pick(style.animationTimeline),
    }
  })

  await page.close()

  return reading
}

/**
 * A **scalar** easing control, read on the element that named it.
 *
 * The phrase path is the new one; this is the value path it grew out of, and it has to keep working beside it.
 * A `/scalar` easing writes `--jumi-label-scalar-animation-timing-function`, and the motion's hoist reads that
 * link for its timing section exactly as it does for a duration — which is the whole of what "scalar easing is
 * unchanged" means in a browser, rather than in a unit test.
 */
const scalarEasing = async () => {
  const built = build(await compiler(ENTRY, root), NAMED_CANDIDATES)
  const classes = NAMED_ARMS.find(([id]) => id === 'r')[1]
  const page = await load(
    built.css,
    `<div id="named-r" class="${classes}"></div>`,
  )

  const easing = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector('#named-r'))
    const names = style.animationName.split(',').map(value => value.trim())
    const at = names.findIndex(name => name.startsWith('jumi-scale-'))

    return style.animationTimingFunction.split(',')[at]?.trim() ?? 'absent'
  })

  await page.close()

  return { easing }
}

const scalar = await scalarEasing()

/**
 * A **property** address — `/rotate` — read on the element that wrote it.
 *
 * The third spelling, and the one with the widest reach: a name specializes one instance, and a property
 * specializes every instance of that property on the element. Two instances over one definition are the case
 * that tells them apart, so this reads both animations rather than one, and checks the literal the
 * specialization wrote into their frames. Read on its own page for the reason the scalar reader is: the
 * combined page is shared by eight arms whose motions all land on the same property, and a reading that
 * wanders between arms is a harness bug that looks like a product one.
 */
const propertyAddress = async () => {
  const built = build(await compiler(ENTRY, root), NAMED_CANDIDATES)
  const classes = NAMED_ARMS.find(([id]) => id === 's')[1]
  const page = await load(
    built.css,
    `<div id="named-s" class="${classes}"></div>`,
  )

  const reading = await page.evaluate(() =>
    [...document.querySelector('#named-s').getAnimations()].map(animation => {
      const base = animation.effect?.getTiming?.().easing ?? 'linear'

      return {
        eased: (animation.effect?.getKeyframes?.() ?? [])
          .filter(frame => frame.easing && frame.easing !== base)
          .map(
            frame => `${Math.round((frame.offset ?? 0) * 100)}:${frame.easing}`,
          ),
        name: animation.animationName,
      }
    }),
  )

  await page.close()

  return reading
}

const property = await propertyAddress()

/**
 * The two directions of the inheritance rule, measured on **nested** elements.
 *
 * A property **scope** inherits: `animation-duration-500/rotate` on a wrapper is how an author times every
 * rotate motion in a subtree, so the motion inside it must read `0.5s`. An instance **address** does not:
 * `animation-duration-500/flick` on the same wrapper writes a label, the label is registered
 * `inherits: false`, and a nested motion that named *itself* `flick` must therefore still read the substrate
 * default rather than its ancestor's value. Naming the inner motion the same word is what makes the second
 * arm sharp — an unnamed inner motion would read the same thing either way.
 *
 * Both are load-bearing and neither was asserted. Section 7 covers the other direction (an ancestor's
 * *activation* must not reach a descendant), which left the scope's propagation — the whole reason
 * `--jumi-rotate-animation-duration` is deliberately left unregistered — resting on a code comment and a
 * one-off probe. Registering that variable is the cheapest way to watch this arm fail.
 *
 * Both runs are compared, for the reason every naming arm is: which link wins must not depend on the order
 * the candidates were compiled in.
 */
const SCOPE_CANDIDATES = [
  'animation-duration-500/rotate',
  'animation-duration-500/flick',
  'animate-rotate-45',
  'animate-rotate-45/flick',
]

const scopeReadings = async candidates => {
  const built = build(await compiler(ENTRY, root), [
    ...new Set([...candidates, ...SCOPE_CANDIDATES]),
  ])
  const page = await load(
    built.css,
    '<div id="scope-rotate" class="animation-duration-500/rotate">' +
      '<i id="scope-rotate-inner" class="animate-rotate-45"></i></div>' +
      '<div id="scope-flick" class="animation-duration-500/flick">' +
      '<i id="scope-flick-inner" class="animate-rotate-45/flick"></i></div>',
  )

  const reading = await page.evaluate(() => {
    const duration = selector => {
      const style = getComputedStyle(document.querySelector(selector))
      const names = style.animationName.split(',').map(value => value.trim())
      const at = names.findIndex(name => name.startsWith('jumi-rotate-'))

      return style.animationDuration.split(',')[at]?.trim() ?? 'absent'
    }

    return {
      instance: duration('#scope-flick-inner'),
      scope: duration('#scope-rotate-inner'),
    }
  })

  await page.close()

  return reading
}

/**
 * The three separate parts on a **named effect** — the shape whose slot key is the definition.
 *
 * `separateParts()` above names a *value*, and a value's key spells its name, so its chain reads the label
 * directly and the link layer is gone from it. An effect cannot be named that way: one slot is shared by
 * every name of that effect, so the composition could only ever hold whichever name was recorded last.
 * Those three parts are still filled, on the rule that named the motion, and this is what says so in a
 * browser rather than in text.
 */
const namedEffectParts = async () => {
  const built = build(await compiler(ENTRY, root), NAMED_CANDIDATES)
  const classes = NAMED_ARMS.find(([id]) => id === 't')[1]
  const page = await load(
    built.css,
    `<div id="named-t" class="${classes}"></div>`,
  )

  const reading = await page.evaluate(() => {
    const style = getComputedStyle(document.querySelector('#named-t'))
    const names = style.animationName.split(',').map(value => value.trim())
    // An effect's animation is `jumi-fade-in` — the whole name, with no value hash after it — so this
    // prefix stops there. A `jumi-fade-in-` prefix matches nothing and reads as "no animation at all",
    // which is the failure shape this arm is meant to report rather than the one it should have.
    const at = names.findIndex(name => name.startsWith('jumi-fade-in'))
    const pick = value => value.split(',')[at]?.trim() ?? 'absent'

    return {
      composition: pick(style.animationComposition),
      range: pick(style.animationRange),
      timeline: pick(style.animationTimeline),
    }
  })

  await page.close()

  return reading
}

const effectParts = await namedEffectParts()

const scope = await scopeReadings(NAMED_CANDIDATES)
const scopeReversed = await scopeReadings([...NAMED_CANDIDATES].reverse())

const separate = await separateParts()

/**
 * Segment easing as the browser sees it: the definition each animation selected, and the easing written into
 * its frames.
 *
 * Per animation rather than per element, for two reasons. Two motions on one element compose onto the same
 * property, so a computed value can only ever show the winner; and text cannot tell a specialization from a
 * clone that changed nothing. Where a frame carries a literal, this reads it.
 */
const segmentReadings = async () => {
  const built = build(await compiler(ENTRY, root), NAMED_CANDIDATES)
  const classes = Object.fromEntries(NAMED_ARMS)
  const page = await load(
    built.css,
    ['j', 'k', 'l', 'm', 'q', 'r']
      .map(id => `<div id="named-${id}" class="${classes[id]}"></div>`)
      .concat(
        '<div id="named-nocontrol" class="animate-shake/shakey animation-duration-1000"></div>',
      )
      .join('\n'),
  )

  const reading = await page.evaluate(
    ids =>
      Object.fromEntries(
        ids.map(id => [
          id,
          [...document.querySelector(`#${id}`).getAnimations()].map(
            animation => {
              // Every keyframe reports the animation's own timing function when it declares none, so the
              // literal a specialization wrote is what *differs* from it — not what differs from `linear`.
              // Reading it the other way made a correct split look like it had injected `ease` everywhere.
              const base = animation.effect?.getTiming?.().easing ?? 'linear'

              return {
                eased: (animation.effect?.getKeyframes?.() ?? [])
                  .filter(frame => frame.easing && frame.easing !== base)
                  .map(
                    frame =>
                      `${Math.round((frame.offset ?? 0) * 100)}:${frame.easing}`,
                  ),
                name: animation.animationName,
              }
            },
          ),
        ]),
      ),
    [
      'named-j',
      'named-k',
      'named-l',
      'named-m',
      'named-nocontrol',
      'named-q',
      'named-r',
    ],
  )

  await page.close()

  return reading
}

const segment = await segmentReadings()
const only = id => segment[`named-${id}`] ?? []

/**
 * The easings the arms' phrases actually wrote.
 *
 * Every keyframe reports the animation's own timing function when it declares none — `ease`, from the
 * substrate — so "the frame that differs from `linear`" counted all ten unaffected frames as eased, and
 * diffing against the effect's own timing (which the engine reports as `linear`) counted them again. These
 * arms write step functions, which is how the harness finds what it wrote; a general reader would diff
 * against the base definition's frames.
 */
const written = id =>
  only(id).flatMap(entry => entry.eased.filter(easing => /step/.test(easing)))

const naming = [
  [
    'the name it declared reaches its own motion',
    durationOf(forward, 'a', 'jumi-fade-in') === '0.3s',
  ],
  [
    'and a name declared on another element never does',
    durationOf(forward, 'b', 'jumi-fade-in') === '0.7s',
  ],
  [
    'a motion nothing named stays unreachable',
    durationOf(forward, 'd', 'jumi-fade-in') === '1s',
  ],
  [
    'one name reaches both motions that declared it, and only those',
    durationOf(forward, 'c', 'jumi-scale-') === '0.9s' &&
      durationOf(forward, 'c', 'jumi-fade-in') === '1s',
  ],
  [
    'and it does the same for two phrases, whose slots carry hashed keys',
    durationOf(forward, 'e', 'jumi-opacity-') === '0.5s' &&
      durationOf(forward, 'e', 'jumi-rotate-') === '0.5s' &&
      durationOf(forward, 'e', 'jumi-scale-') === '1s',
  ],
  [
    "a name a property already owns cannot take that property's control",
    durationOf(forward, 'f', 'jumi-scale-') === '1s' &&
      durationOf(forward, 'f', 'jumi-rotate-') === '0.4s',
  ],
  [
    'candidate order cannot decide which name wins',
    orderDrift.length === 0,
    orderDrift.join(' | '),
  ],
  [
    'a timing phrase specializes one offset inside a grouped keyframe rule, and splits it',
    only('j').length === 1 &&
      only('j')[0].name.includes('-segment-') &&
      written('j').length === 1 &&
      written('j')[0].startsWith('10:'),
    JSON.stringify(only('j')),
  ],
  [
    'and normalizes `from`, so a `from, to` rule splits at 0 only',
    only('k').length === 1 &&
      only('k')[0].name.includes('-segment-') &&
      written('k').length === 1 &&
      written('k')[0].startsWith('0:'),
    JSON.stringify(only('k')),
  ],
  [
    'an offset the definition does not have leaves the base definition alone',
    only('l').length === 1 &&
      !only('l')[0].name.includes('-segment-') &&
      written('l').length === 0,
    JSON.stringify(only('l')),
  ],
  [
    'two names over one definition take different easings',
    only('m').length === 2 &&
      only('m').every(entry => entry.name.includes('-segment-')) &&
      only('m')[0].name !== only('m')[1].name &&
      written('m').length === 2 &&
      written('m')[0].startsWith('0:') &&
      written('m')[1].startsWith('0:') &&
      written('m')[0] !== written('m')[1],
    JSON.stringify(only('m')),
  ],
  [
    'and an element without the timing phrase keeps the base definition',
    only('nocontrol').length === 1 &&
      !only('nocontrol')[0].name.includes('-segment-') &&
      written('nocontrol').length === 0,
    JSON.stringify(only('nocontrol')),
  ],
  [
    'a phrase on a shorthand part leaves the motion running',
    durationOf(forward, 'h', 'jumi-fade-in') === '1s',
    `read ${durationOf(forward, 'h', 'jumi-fade-in') ?? 'no animation at all'} — the default duration is 1s`,
  ],
  [
    'a name reaches the parts the shorthand cannot carry',
    separate.composition === 'add' &&
      separate.timeline.includes('scroll') &&
      separate.range !== 'normal',
    JSON.stringify(separate),
  ],
  [
    'and reaches them on an effect too, whose slot key is the definition',
    effectParts.composition === 'add' &&
      effectParts.timeline.includes('scroll') &&
      effectParts.range !== 'normal',
    JSON.stringify(effectParts),
  ],
  [
    'a name that reads like a part still addresses its own motion',
    durationOf(forward, 'n', 'jumi-scale-') === '0.6s',
    `read ${durationOf(forward, 'n', 'jumi-scale-') ?? 'no animation at all'} — the control is ` +
      '/flick-animation-duration, and an instance read as "flick" would fill no key at all',
  ],
  [
    'a name CSS escapes is counted as the stylesheet spells it',
    durationOf(forward, 'o', 'jumi-scale-') === '0.6s',
    `read ${durationOf(forward, 'o', 'jumi-scale-') ?? 'no animation at all'} — the control is ` +
      "/[foo.bar], and a count taken from the author's word is one character short",
  ],
  [
    'a timing phrase with no address specializes nothing',
    only('q').length === 1 &&
      !only('q')[0].name.includes('-segment-') &&
      written('q').length === 0,
    JSON.stringify(only('q')),
  ],
  [
    'and a scalar easing under a name still reaches its motion',
    scalar.easing.includes('ease-in'),
    JSON.stringify(scalar),
  ],
  [
    'a property address specializes every instance of that property, not one name',
    property.length === 2 &&
      property.every(entry => entry.name.includes('-segment-')) &&
      new Set(property.map(entry => entry.name)).size === 1 &&
      property.every(
        entry =>
          entry.eased.filter(easing => /step/.test(easing)).length === 1 &&
          entry.eased.some(easing => easing.startsWith('0:')),
      ),
    JSON.stringify(property),
  ],
  [
    'a property scope reaches a nested motion',
    scope.scope === '0.5s',
    `read ${scope.scope} — a wrapper's /rotate control must time the motion inside it`,
  ],
  [
    'and an instance address does not, even when the nested motion uses the same name',
    scope.instance === '1s',
    `read ${scope.instance} — the wrapper declares /flick and the inner motion named itself flick`,
  ],
  [
    'candidate order cannot decide either direction',
    scope.scope === scopeReversed.scope &&
      scope.instance === scopeReversed.instance,
    `${JSON.stringify(scope)} vs ${JSON.stringify(scopeReversed)}`,
  ],
]

for (const [claim, ok] of naming) if (!ok) failures.push(`naming: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 10. A constituent phrase moves the composed property.
 * ---------------------------------------------------------------------------------- */

// Three constituent phrases over one frame list, which is the case the id-sharing design exists for:
// the id hashes the frames and not the surface, so all three write keys the *one* composed `scale`
// keyframe reads, per frame.
const constituentEntry = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const constituentCss = finalizeCss(
  (await compiler(constituentEntry, root)).build([
    'animate-scale-x-[0:1|100:0]',
    'animate-scale-y-[0:1|100:0]',
    'animate-scale-z-[0:1|100:0]',
  ]),
).css

/**
 * The composed property as it computes at five offsets, on a page given nothing but those utilities.
 *
 * Paused and stepped by `currentTime`, not sampled live: a live read takes whatever moment the machine
 * happened to reach, and two models compared that way differ by timing rather than by chain — measured
 * on the harness this replaces.
 */
/**
 * A page stepped to five offsets, sampled for the properties asked of it.
 *
 * Paused and stepped by `currentTime`, not sampled live: a live read takes whatever moment the machine
 * happened to reach, and two models compared that way differ by timing rather than by chain — measured
 * on the harness this replaces. `prefix` selects the animations under test, so one page can carry more
 * than one motion without the two being read for each other.
 */
const stepped = async ({ body, css, prefix, properties }) => {
  const page = await load(css, body)

  const reading = await page.evaluate(
    async ({ prefix: startsWith, properties: parts }) => {
      const element = document.querySelector('div')
      const own = element
        .getAnimations()
        .filter(animation =>
          (animation.animationName ?? '').startsWith(startsWith),
        )

      if (!own.length) return { names: [], samples: {} }

      own.forEach(animation => animation.pause())

      const duration = own[0].effect?.getTiming?.().duration ?? 0
      const samples = Object.fromEntries(parts.map(part => [part, []]))

      for (const share of [0, 0.25, 0.5, 0.75, 1]) {
        own.forEach(animation => {
          animation.currentTime = duration * share
        })

        await new Promise(resolve => requestAnimationFrame(resolve))

        const style = getComputedStyle(element)

        for (const part of parts) samples[part].push(style[part])
      }

      return { names: own.map(animation => animation.animationName), samples }
    },
    { prefix, properties },
  )

  await page.close()

  return reading
}

/**
 * The same sheet with every frame-first lookup rewritten to the element-level value it falls back to —
 * the shape `bb39449` shipped, reconstructed by text so each arm falsifies against its own build rather
 * than a remembered one. `--jumi-<component>-<id>-<offset>` is matched with a lazy base because the
 * instance hash is 5–8 word characters and a `-` cannot be part of it.
 */
const withoutFrameLookups = css =>
  css.replace(
    /var\((--jumi-[\w-]+?)-[A-Za-z0-9]{5,8}-\d+, var\(--jumi-[\w-]+\)\)/g,
    'var($1)',
  )

const SCALE_BODY = `<div class="animate-scale-x-[0:1|100:0] animate-scale-y-[0:1|100:0] animate-scale-z-[0:1|100:0]"></div>`

const moved = await stepped({
  body: SCALE_BODY,
  css: constituentCss,
  prefix: 'jumi-scale',
  properties: ['scale'],
})

const flattened = withoutFrameLookups(constituentCss)

const held = await stepped({
  body: SCALE_BODY,
  css: flattened,
  prefix: 'jumi-scale',
  properties: ['scale'],
})

/** Five values, and the two questions asked of them: did every offset differ, or none of them. */
const stepped5 = values => values.length === 5 && new Set(values).size === 5
const changes = values => values.length === 5 && new Set(values).size > 1
const constant = values => values.length === 5 && new Set(values).size === 1

const scaleOf = reading => reading.samples.scale ?? []

const constituent = [
  [
    'a constituent phrase moves the composed property at every offset',
    stepped5(scaleOf(moved)) && !!moved.names.length,
    `read ${scaleOf(moved).join(' | ') || 'no animation'} from ${moved.names.join(' + ') || 'no slot'}`,
  ],
  [
    'and the assertion can fail: without the frame-first lookups it holds one value',
    constant(scaleOf(held)) && flattened !== constituentCss,
    `read ${scaleOf(held).join(' | ') || 'no animation'} — the same sheet with the lookups stripped`,
  ],
]

for (const [claim, ok] of constituent)
  if (!ok) failures.push(`composed: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 11. Two declarations that named the wrong property (corrected 2026-09-16).
 * ---------------------------------------------------------------------------------- */

// `animate-outline-offset` and `animate-transform-style` were declared as parts of `outline` and
// `transform`. Neither part belongs to the property it was declared under, so the keyframe animated
// *that* property: a phrase on `animate-outline-offset` emitted `outline: <width> <style> <color>` and
// never touched `outline-offset` at all, and `animate-transform-style` emitted the whole `transform`
// composition. Worse than inert — a page asking for an outline offset got the outline shorthand
// animating.
//
// So each arm asserts both halves: the named property moves, and the property that used to move does
// not. The second half is the correction itself; without it, "something animates" would pass the wrong
// declaration as readily as the right one.
const OWN_PROPERTY_ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const ownPropertyCss = finalizeCss(
  (await compiler(OWN_PROPERTY_ENTRY, root)).build([
    'animate-outline-offset-[0:0px|100:8px]',
    'animate-transform-style-[0:flat|100:preserve-3d]',
  ]),
).css

const OWN_PROPERTY_BODY =
  '<div class="animate-outline-offset-[0:0px|100:8px] ' +
  'animate-transform-style-[0:flat|100:preserve-3d]"></div>'

const offsetMoved = await stepped({
  body: OWN_PROPERTY_BODY,
  css: ownPropertyCss,
  prefix: 'jumi-outline-offset',
  properties: ['outlineOffset', 'outline'],
})

const styleMoved = await stepped({
  body: OWN_PROPERTY_BODY,
  css: ownPropertyCss,
  prefix: 'jumi-transform-style',
  properties: ['transformStyle', 'transform'],
})

const offsetHeld = await stepped({
  body: OWN_PROPERTY_BODY,
  css: withoutFrameLookups(ownPropertyCss),
  prefix: 'jumi-outline-offset',
  properties: ['outlineOffset'],
})

const ownProperty = [
  [
    'animate-outline-offset moves outline-offset at every offset',
    stepped5(offsetMoved.samples.outlineOffset ?? []),
    `read ${(offsetMoved.samples.outlineOffset ?? []).join(' | ') || 'no animation'}`,
  ],
  [
    'and does not animate the outline shorthand',
    constant(offsetMoved.samples.outline ?? []),
    `outline read ${(offsetMoved.samples.outline ?? []).join(' | ') || 'nothing'}`,
  ],
  [
    'animate-transform-style moves transform-style',
    changes(styleMoved.samples.transformStyle ?? []),
    `read ${(styleMoved.samples.transformStyle ?? []).join(' | ') || 'no animation'}`,
  ],
  [
    'and does not animate transform',
    constant(styleMoved.samples.transform ?? []),
    `transform read ${(styleMoved.samples.transform ?? []).join(' | ') || 'nothing'}`,
  ],
  [
    'and the assertion can fail: without the frame-first lookups outline-offset holds',
    constant(offsetHeld.samples.outlineOffset ?? []),
    `read ${(offsetHeld.samples.outlineOffset ?? []).join(' | ') || 'no animation'}`,
  ],
]

for (const [claim, ok] of ownProperty)
  if (!ok) failures.push(`own property: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 12. Compositions declared late: gap, and the two logical border widths.
 * ---------------------------------------------------------------------------------- */

// `gap` is the one worth reading twice: `src/composition/gap.ts` had existed with **no importer at
// all**, so a phrase on `animate-column-gap` wrote a key nothing read and the property itself was never
// built from its parts — the value form was as inert as the phrase form, which is what makes this
// unfinished wiring rather than a compiler defect. The border widths are the same omission with the
// model's own radius siblings already doing it correctly beside them.
const COMPOSITION_ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const compositionCss = finalizeCss(
  (await compiler(COMPOSITION_ENTRY, root)).build([
    'animate-row-gap-[0:0px|100:10px]',
    'animate-column-gap-[0:0px|100:10px]',
    'animate-border-block-width-[0:0px|100:8px]',
    'animate-border-inline-width-[0:0px|100:4px]',
  ]),
).css

// The border arms need a style for a width to compute at all: CSS reports every border-width as `0px`
// while the border-style is `none`, so the author's own declaration is part of the fixture rather than
// a convenience. The gap pair shares one frame list on purpose — the frame key's id hashes the frames,
// so identical frames are what let two constituent phrases reach one keyframe.
const COMPOSITION_BODY =
  '<div style="border-block-style: solid; border-inline-style: solid" ' +
  'class="animate-row-gap-[0:0px|100:10px] animate-column-gap-[0:0px|100:10px] ' +
  'animate-border-block-width-[0:0px|100:8px] animate-border-inline-width-[0:0px|100:4px]"></div>'

const gapMoved = await stepped({
  body: COMPOSITION_BODY,
  css: compositionCss,
  prefix: 'jumi-gap',
  properties: ['gap', 'rowGap', 'columnGap'],
})

const blockWidthMoved = await stepped({
  body: COMPOSITION_BODY,
  css: compositionCss,
  prefix: 'jumi-border-block-width',
  properties: ['borderBlockStartWidth', 'borderBlockEndWidth'],
})

const inlineWidthMoved = await stepped({
  body: COMPOSITION_BODY,
  css: compositionCss,
  prefix: 'jumi-border-inline-width',
  properties: ['borderInlineStartWidth', 'borderInlineEndWidth'],
})

const gapHeld = await stepped({
  body: COMPOSITION_BODY,
  css: withoutFrameLookups(compositionCss),
  prefix: 'jumi-gap',
  properties: ['gap'],
})

const compositions = [
  [
    'gap is built from row-gap and column-gap per frame',
    changes(gapMoved.samples.gap ?? []),
    `gap read ${(gapMoved.samples.gap ?? []).join(' | ') || 'no animation'}`,
  ],
  [
    'and each axis follows its own written key',
    changes(gapMoved.samples.rowGap ?? []) &&
      changes(gapMoved.samples.columnGap ?? []),
    `row ${(gapMoved.samples.rowGap ?? []).join(' | ') || 'nothing'}`,
  ],
  [
    'border-block-width reaches both logical edges',
    changes(blockWidthMoved.samples.borderBlockStartWidth ?? []) &&
      changes(blockWidthMoved.samples.borderBlockEndWidth ?? []),
    `start ${(blockWidthMoved.samples.borderBlockStartWidth ?? []).join(' | ') || 'not exposed'}`,
  ],
  [
    'border-inline-width reaches both logical edges',
    changes(inlineWidthMoved.samples.borderInlineStartWidth ?? []) &&
      changes(inlineWidthMoved.samples.borderInlineEndWidth ?? []),
    `start ${(inlineWidthMoved.samples.borderInlineStartWidth ?? []).join(' | ') || 'not exposed'}`,
  ],
  [
    'and the assertion can fail: without the frame-first lookups gap holds',
    constant(gapHeld.samples.gap ?? []),
    `read ${(gapHeld.samples.gap ?? []).join(' | ') || 'no animation'}`,
  ],
]

for (const [claim, ok] of compositions)
  if (!ok) failures.push(`composition: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 13. transform-origin: three components, and the grammar that needs all of them.
 * ---------------------------------------------------------------------------------- */

// Not a shorthand, and that is the whole difference from `gap` beside it. The platform accepts
// `transform-origin: <x> <y> <z>` only when both positions are present, so a composition that let a
// lone `z` reach the frame would emit a declaration the browser drops — and the motion would be inert
// in exactly the way this track exists to remove. Every frame therefore states all three, with each
// part's own default filling whatever the phrase did not write.
//
// So the arms assert the grammar rather than the names: a z-only phrase must still compute to a value
// whose first two components are the defaults, at every offset.
const ORIGIN_ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

// Identical frame lists, because the frame key's id hashes the frames: it is what lets the two
// constituent phrases share one keyframe instead of running two animations over one property.
const ORIGIN_X_AND_Z =
  'animate-transform-origin-x-[0:0px|100:20px] ' +
  'animate-transform-origin-z-[0:0px|100:20px]'
const ORIGIN_Z_ONLY = 'animate-transform-origin-z-[0:0px|100:20px]'

const originCss = finalizeCss(
  (await compiler(ORIGIN_ENTRY, root)).build(ORIGIN_X_AND_Z.split(' ')),
).css

const originZOnlyCss = finalizeCss(
  (await compiler(ORIGIN_ENTRY, root)).build([ORIGIN_Z_ONLY]),
).css

const originMoved = await stepped({
  body: `<div class="${ORIGIN_X_AND_Z}"></div>`,
  css: originCss,
  prefix: 'jumi-transform-origin',
  properties: ['transformOrigin'],
})

const zOnlyMoved = await stepped({
  body: `<div class="${ORIGIN_Z_ONLY}"></div>`,
  css: originZOnlyCss,
  prefix: 'jumi-transform-origin',
  properties: ['transformOrigin'],
})

const zOnlyHeld = await stepped({
  body: `<div class="${ORIGIN_Z_ONLY}"></div>`,
  css: withoutFrameLookups(originZOnlyCss),
  prefix: 'jumi-transform-origin',
  properties: ['transformOrigin'],
})

/**
 * Chromium resolves a percentage position into a length in the computed value (`50%` on a 1280px box
 * is `640px`), so "valid" here is two or three components, and "the defaults are still there" is the
 * positions *not moving* while the length animates — which is the platform's grammar stated as an
 * observable rather than as the spelling this build happens to emit.
 */
const componentsOf = value =>
  String(value ?? '')
    .trim()
    .split(/\s+/)
const positionsOf = value => componentsOf(value).slice(0, 2).join(' ')
const lengthOf = value => componentsOf(value)[2] ?? ''

const positionsNeverAlone = values =>
  values.length === 5 && values.every(value => componentsOf(value).length > 1)
const positionsHold = values =>
  values.length === 5 && new Set(values.map(positionsOf)).size === 1
const lengthMoves = values =>
  values.length === 5 && new Set(values.map(lengthOf)).size === 5

const origins = [
  [
    'a phrase writing x and z moves transform-origin',
    changes(originMoved.samples.transformOrigin ?? []) &&
      positionsNeverAlone(originMoved.samples.transformOrigin ?? []),
    `read ${(originMoved.samples.transformOrigin ?? []).join(' | ') || 'no animation'}`,
  ],
  [
    'and a z-only phrase moves the length with the positions untouched',
    changes(zOnlyMoved.samples.transformOrigin ?? []) &&
      positionsHold(zOnlyMoved.samples.transformOrigin ?? []) &&
      lengthMoves(zOnlyMoved.samples.transformOrigin ?? []),
    `read ${(zOnlyMoved.samples.transformOrigin ?? []).join(' | ') || 'no animation'}`,
  ],
  [
    'and the assertion can fail: without the frame-first lookups it holds',
    constant(zOnlyHeld.samples.transformOrigin ?? []),
    `read ${(zOnlyHeld.samples.transformOrigin ?? []).join(' | ') || 'no animation'}`,
  ],
]

for (const [claim, ok] of origins)
  if (!ok) failures.push(`transform origin: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 14. A phrase of properties: the logical corner radii.
 * ---------------------------------------------------------------------------------- */

// `animate-border-block-start-radius` addresses `border-start-start-radius` and
// `border-start-end-radius` — longhands the browser resolves against direction and writing mode — so
// Jumi emits them as themselves instead of composing them into the physical `border-radius` shorthand.
// Composing would mean deciding the mapping at build time, and measured, the mapping is contextual.
//
// The arms read *physical* corners, which is where that resolution becomes visible. Two candidates with
// different values keep the pairs unequal: block-start 20px, block-end 40px. Under `ltr` they land on
// {top-left, top-right} and {bottom-left, bottom-right}; under `vertical-rl` the same animation lands on
// the diagonals. RTL is deliberately absent — with these groupings the RTL permutation swaps each pair
// for itself, so the physical sets would be identical and an assertion there would prove nothing.
//
// Sampling at the last offset is safe here for the reason the probe's lesson pointed at: Jumi's
// composition declares `animation-fill-mode: forwards`, so the end value is held rather than released.
const RADIUS_ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const RADIUS_CANDIDATES = [
  'animate-border-block-start-radius-[0:0px|100:20px]',
  'animate-border-block-end-radius-[0:0px|100:40px]',
]

const radiusCss = finalizeCss(
  (await compiler(RADIUS_ENTRY, root)).build(RADIUS_CANDIDATES),
).css

// The corner set is the fixture's own size, so the arms compare like with like.
const RADIUS_CORNERS = [
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
]

const radiusBody = context =>
  `<div style="${context}; width: 120px; height: 80px" class="${RADIUS_CANDIDATES.join(' ')}"></div>`

const radiusLtr = await stepped({
  body: radiusBody('direction: ltr'),
  css: radiusCss,
  prefix: 'jumi-border-radius',
  properties: RADIUS_CORNERS,
})

const radiusVertical = await stepped({
  body: radiusBody('writing-mode: vertical-rl'),
  css: radiusCss,
  prefix: 'jumi-border-radius',
  properties: RADIUS_CORNERS,
})

const radiusHeld = await stepped({
  body: radiusBody('direction: ltr'),
  css: withoutFrameLookups(radiusCss),
  prefix: 'jumi-border-radius',
  properties: RADIUS_CORNERS,
})

/** The four physical corners at the last offset, as one comparable string. */
const cornersAt = (reading, at) =>
  RADIUS_CORNERS.map(part => (reading.samples[part] ?? [])[at] ?? 'none').join(
    ' ',
  )

const radius = [
  [
    'a phrase of properties drives the physical corners it names (ltr)',
    cornersAt(radiusLtr, 4) === '20px 20px 40px 40px' &&
      RADIUS_CORNERS.every(part => changes(radiusLtr.samples[part] ?? [])),
    `read ${cornersAt(radiusLtr, 4)}`,
  ],
  [
    'and the same animation lands on the diagonals under vertical-rl',
    cornersAt(radiusVertical, 4) === '40px 20px 20px 40px',
    `read ${cornersAt(radiusVertical, 4)} — the browser resolved, Jumi did not`,
  ],
  [
    'and the assertion can fail: without the frame-first lookups every corner holds',
    RADIUS_CORNERS.every(part => constant(radiusHeld.samples[part] ?? [])),
    `read ${cornersAt(radiusHeld, 4)} at the end and ${cornersAt(radiusHeld, 0)} at the start`,
  ],
]

for (const [claim, ok] of radius) if (!ok) failures.push(`radius: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 15. The url filter slots, and a fallback that is load-bearing.
 * ---------------------------------------------------------------------------------- */

// `filter` and `backdrop-filter` each carry a `url()` slot, and the writer that fills it is a phrase
// whose frame key nothing used to read. The slot is what makes the authored url reach the chain.
//
// What the slot needs is a fallback, and the measurement that says so is narrower than the first probe
// claimed. Measured 2026-09-16, in Chromium:
//
//   `grayscale(1) url()`          → the chain resolves, the url is inert
//   `grayscale(1) url(#missing)`  → the chain resolves, the url is inert
//   `grayscale(1) var(--unset)`   → the chain VOIDS — computed `filter: none`, nothing applies
//
// So an empty or unresolved url is **ignored**, not fatal; what voids the declaration is a read that
// references nothing. The reason the first probe reached the opposite conclusion is a design flaw worth
// keeping: its sibling filter and its baseline were both `blur(0px)`, the identity, so "looks the same
// as plain" could not tell "voided" from "inert". The arms below read a pixel that can only mean one
// thing — `grayscale(1)` on a red box is grey when the chain resolves and red when it does not — and the
// pixel is also what caught the error, because the arm written from the old reading failed.
const URL_FILTER_ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const FILTER_URL = 'animate-filter-url-[0:#black|100:#black]'

// The candidate that makes the fallback observable on its own: `grayscale(1)` on a red box is grey when
// the chain resolves and red when it does not, so the pixel is an answer with no timing in it.
const FILTER_GRAYSCALE = 'animate-filter-grayscale-[0:1|100:1]'
const BACKDROP_URL = 'animate-backdrop-filter-url-[0:#black|100:#black]'

const urlFilterCss = finalizeCss(
  (await compiler(URL_FILTER_ENTRY, root)).build([
    FILTER_URL,
    FILTER_GRAYSCALE,
    BACKDROP_URL,
  ]),
).css

// An SVG filter that drives every channel to zero, so "the url applied" is a colour and not a
// near-miss.
const URL_FILTER_SVG = `<svg width="0" height="0"><filter id="black" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter></svg>`

const urlFilterBody = classes =>
  `${URL_FILTER_SVG}<div style="width: 40px; height: 40px; background: rgb(255, 0, 0)" class="${classes}"></div>`

/**
 * The box as pixels, with the animation paused at the first offset so the reading is an offset rather
 * than a race. A pixel is the assertion because the computed string is what lied in the probe: it
 * listed the whole chain after the box had already stopped being filtered.
 */
const filtered = async ({ classes, css }) => {
  const page = await load(css, urlFilterBody(classes))

  await page.evaluate(async () => {
    document
      .querySelector('div')
      .getAnimations()
      .forEach(animation => {
        animation.pause()
        animation.currentTime = 0
      })

    await new Promise(resolve => requestAnimationFrame(resolve))
  })

  const shot = await page.locator('div').screenshot()
  await page.close()

  return shot
}

/**
 * The slot with no fallback and no resting declaration, which is what a writer that never ran leaves
 * behind: the read references nothing, and an unresolved `var()` voids the whole declaration.
 */
const withoutUrlFallback = css =>
  css
    .replaceAll('var(--jumi-filter-url, opacity(1))', 'var(--jumi-filter-url)')
    .replaceAll(
      'var(--jumi-backdrop-filter-url, opacity(1))',
      'var(--jumi-backdrop-filter-url)',
    )
    .replaceAll('--jumi-filter-url: opacity(1);', '')
    .replaceAll('--jumi-backdrop-filter-url: opacity(1);', '')

/** The frame-first url read removed, so the slot can only reach its fallback. */
const withoutUrlFrameRead = css =>
  css.replace(
    /var\(--jumi-(backdrop-)?filter-url-[\w-]+-\d+, var\(--jumi-(?:backdrop-)?filter-url, opacity\(1\)\)\)/g,
    'var(--jumi-$1filter-url, opacity(1))',
  )

const red = await filtered({ classes: '', css: urlFilterCss })
const urlApplied = await filtered({ classes: FILTER_URL, css: urlFilterCss })
const urlUnhooked = await filtered({
  classes: FILTER_URL,
  css: withoutUrlFrameRead(urlFilterCss),
})
const grey = await filtered({ classes: FILTER_GRAYSCALE, css: urlFilterCss })
const greyVoided = await filtered({
  classes: FILTER_GRAYSCALE,
  css: withoutUrlFallback(urlFilterCss),
})

/** `false` when the box is the untouched red reference, i.e. nothing filtered it. */
const pixelsDiffer = shot => Buffer.compare(shot, red) !== 0

const backdropOf = async css => {
  const instance = await load(css, urlFilterBody(BACKDROP_URL))
  const reading = await instance.evaluate(
    () => getComputedStyle(document.querySelector('div')).backdropFilter,
  )
  await instance.close()
  return reading
}

// The authorable form of the url slot: the candidate supplies `url(…)`, so the fragment inside is a
// bare reference. A quoted fragment with a comma and angle brackets is the case that decides whether
// the value is carried verbatim or re-parsed on the way through the composition.
const quotedCss = finalizeCss(
  (await compiler(URL_FILTER_ENTRY, root)).build([
    'animate-filter-url-[0:"data:image/svg+xml,<svg/>"|100:"data:image/svg+xml,<svg/>"]',
  ]),
).css

const quotedVerbatim =
  /--jumi-filter-url-[\w-]+-0:\s*url\("data:image\/svg\+xml,<svg\/>"\)/.test(
    quotedCss,
  )

const backdropUrl = await backdropOf(urlFilterCss)
const backdropUnhooked = await backdropOf(withoutUrlFrameRead(urlFilterCss))

const urls = [
  [
    'an authored url filter reaches the composed chain',
    pixelsDiffer(urlApplied),
    `the box rendered ${pixelsDiffer(urlApplied) ? 'black' : 'still the red reference'}`,
  ],
  [
    'and it arrives through the frame, not the resting value',
    !pixelsDiffer(urlUnhooked),
    `with the frame read removed the box is ${pixelsDiffer(urlUnhooked) ? 'still black' : 'the red reference again'}`,
  ],
  [
    'and a chain with no url authored keeps its other filters',
    pixelsDiffer(grey),
    `grayscale(1) rendered the box ${pixelsDiffer(grey) ? 'grey' : 'still red — the chain voided'}`,
  ],
  [
    'and the assertion can fail: a slot with no fallback voids the chain',
    !pixelsDiffer(greyVoided),
    `with the fallback and the resting value gone the box is ${pixelsDiffer(greyVoided) ? 'still grey' : 'red, so grayscale never applied'}`,
  ],
  [
    'backdrop-filter carries its url slot the same way',
    backdropUrl.includes('url("#black")') &&
      !backdropUnhooked.includes('url("#black")'),
    `read ${backdropUrl.slice(0, 44)}…`,
  ],
  [
    'and the author fragment reaches the slot verbatim, quoting included',
    quotedVerbatim,
    quotedVerbatim
      ? 'quote, comma and angle brackets intact'
      : 'the value was rewritten',
  ],
]

for (const [claim, ok] of urls) if (!ok) failures.push(`url filter: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 16. The typed path's composition bridge, and the curves the pins exist to keep straight
 *     (added 2026-09-17).
 * ---------------------------------------------------------------------------------- */

// C.5 executed `scale` as typed leaves with the **candidate** owning the static substrate,
// and the close was wrong. A declined motion's keyframe writes the property — that is what
// the native escape hatch is — and a keyframe beats a rule, so it beat the candidate's
// substrate outright and the typed motion's leaf contribution stopped reaching computed
// style: measured `1` where the pre-C.5 baseline computes `5 1`. Every structural audit was
// green, because every name was still in the sheet. Only computed style could tell, which is
// this file's whole reason to exist.
//
// The fix (`c4f2ffb`) is a bridge: every typed keyframe re-asserts `scale: var(--jumi-scale)`
// at `from` **and** `to`, beside the leaves it writes. The pin at both ends is load-bearing
// rather than tidy. With `scale` named only at `to` it becomes a second animation whose
// implicit `from` is the *un-animated* underlying value, and that composes to
// `1 + p(x(p) - 1)` — a quadratic curve, which still looks like a curve. Measured on `lone
// scale-x-[5]`, `1 | 1.25 1 | 2 1 | 3.25 1 | 5 1` in place of a straight line.
//
// So these arms assert five samples of computed `scale` rather than "the property moves",
// and they do it in both candidate orders: the precedence the bridge restores is
// animation-list precedence, and if that ever starts depending on discovery order, this is
// the arm that says so.
const typedReplay = async candidates => {
  const css = finalizeCss(
    (await compiler(constituentEntry, root)).build(candidates),
  ).css

  const reading = await stepped({
    // Linear, so the five samples read the composition chain rather than the theme's default
    // easing. Unset, `animation-timing-function` is `ease`, which bends every curve the same
    // way and would make these arms assert the theme — measured `1 | 2.63404 1 | 4.20961 1 |
    // 4.84184 1 | 5 1` for a line that is straight by construction.
    body: `<div class="${candidates.join(' ')}" style="animation-timing-function: linear"></div>`,
    css,
    prefix: 'jumi-scale',
    properties: ['scale'],
  })

  const values = scaleOf(reading)

  return {
    detail: values.join(' | ') || 'no animation',
    names: reading.names,
    values,
  }
}

const DECLINED_BESIDE_TYPED = ['animate-scale-[none]', 'animate-scale-x-[5]']

const declinedBesideTyped = await typedReplay(DECLINED_BESIDE_TYPED)
const declinedBesideTypedReversed = await typedReplay(
  [...DECLINED_BESIDE_TYPED].reverse(),
)
const loneTypedConstituent = await typedReplay(['animate-scale-x-[5]'])
const loneTypedWhole = await typedReplay(['animate-scale-[2]'])

/**
 * The two straight lines, ascending through the animation.
 *
 * The first is the bridge's reason: the declined whole's `none` must not swallow the
 * constituent's leaf. The second is the pin's reason: a typed whole is three leaves moving
 * at once, and a one-ended pin flattens all three into `1 + p^2` — close enough at the ends
 * to pass anything that only samples them.
 */
const STRAIGHT_TO_FIVE = ['1', '2 1', '3 1', '4 1', '5 1']
const STRAIGHT_TO_TWO = [
  '1',
  '1.25 1.25 1.25',
  '1.5 1.5 1.5',
  '1.75 1.75 1.75',
  '2 2 2',
]

const readsAs = (read, expected) =>
  read.values.length === expected.length &&
  read.values.every((value, index) => value === expected[index])

const typed = [
  [
    'a declined whole beside a typed constituent computes a straight line',
    readsAs(declinedBesideTyped, STRAIGHT_TO_FIVE),
    `read ${declinedBesideTyped.detail} from ${
      declinedBesideTyped.names.join(' + ') || 'no slot'
    }`,
  ],
  [
    'and reversing candidate discovery computes the same curve',
    readsAs(declinedBesideTypedReversed, STRAIGHT_TO_FIVE),
    `read ${declinedBesideTypedReversed.detail}`,
  ],
  [
    'and both motions are live, so neither is winning the property outright',
    declinedBesideTyped.names.length === 2,
    `ran ${declinedBesideTyped.names.join(' + ') || 'nothing'}`,
  ],
  [
    'a lone typed constituent is a straight line, not the quadratic of a one-ended pin',
    readsAs(loneTypedConstituent, STRAIGHT_TO_FIVE),
    `read ${loneTypedConstituent.detail}`,
  ],
  [
    'a lone typed whole is a straight line in all three leaves',
    readsAs(loneTypedWhole, STRAIGHT_TO_TWO),
    `read ${loneTypedWhole.detail}`,
  ],
]

for (const [claim, ok] of typed) if (!ok) failures.push(`typed: ${claim}`)

/* --------------------------------------------------------------------------------
 * 18. A shell-shaped typed constituent animates its **argument**, and the property is only the bridge
 *     (added 2026-09-17, closing D.3.6).
 * -------------------------------------------------------------------------------- */

// This arm is structural, and deliberately so: D.3.6 moved the animated subject of this pair from the
// *property* to its registered argument, and a sampled curve does not hold that on its own. A later refactor
// could write the endpoint back into the property — `math-depth: add(...)` inside the frames — and a browser
// series could still look plausible while the subject quietly reverted. So what is asserted is which leaf the
// animated stop writes, and that every write of the property inside the motion is its composition and nothing
// else, which is the same statement as "no endpoint slot, and no `add(...)`".
const typedArgumentSheet = finalizeCss(
  (await compiler(COMPOSITION_ENTRY, root)).build([
    'animate-math-depth-add-[2]',
  ]),
).css
const typedArgumentFrames =
  /@keyframes jumi-math-depth-add\s*\{([\s\S]*?)\n\}/.exec(
    typedArgumentSheet,
  )?.[1] ?? ''
const typedArgumentProperties = [
  ...typedArgumentFrames.matchAll(/math-depth:\s*([^;]+);/g),
].map(match => match[1].trim())

const subject = [
  [
    'the composition owns the shell, statically',
    typedArgumentSheet.includes(
      '--jumi-math-depth: add(var(--jumi-math-depth-add))',
    ),
    'the composition spells the shell itself',
  ],
  [
    'the frames animate the argument, not the property',
    typedArgumentFrames.includes(
      '--jumi-math-depth-add: var(--jumi-math-depth-add-100)',
    ),
    'the keyframe writes the registered leaf through its endpoint slot',
  ],
  [
    'and every write of the property inside the motion is the bridge alone',
    typedArgumentProperties.length > 0 &&
      typedArgumentProperties.every(
        value => value === 'var(--jumi-math-depth)',
      ),
    `the motion writes math-depth as ${typedArgumentProperties.join(' | ') || 'nothing'}`,
  ],
]

for (const [claim, ok, detail] of subject)
  if (!ok) failures.push(`subject: ${claim} — ${detail}`)

/* ------------------------------------------------------------------------------------------------
 * 19. A compound constituent resolves its authoring surface into execution, or declines the whole
 *     route (added 2026-09-17, landing D.3.7).
 * ------------------------------------------------------------------------------------------------ */

// The family whose public components are authoring vocabulary rather than execution slots, and the first
// whose composition had to change shape rather than gain a leaf. Measured on the **shipped** build, through
// the real compiler, because the spike this was designed in is not the thing that ships: the arms are the
// four readings the ruling named — the composition, the paired write, the resolved edge, and the decline —
// plus the resting state, which is a browser claim rather than a text one.
const compoundSheet = finalizeCss(
  (await compiler(COMPOSITION_ENTRY, root)).build([
    'animate-offset-anchor-x-edge-[left]',
  ]),
).css
const compoundFrames =
  /@keyframes jumi-offset-anchor-x-edge\s*\{([\s\S]*?)\n\}/.exec(
    compoundSheet,
  )?.[1] ?? ''

const declinedSheet = finalizeCss(
  (await compiler(COMPOSITION_ENTRY, root)).build([
    'animate-offset-anchor-x-[left]',
  ]),
).css

const declinedFrames =
  /@keyframes jumi-offset-anchor-x\s*\{([\s\S]*?)\n\}/.exec(declinedSheet)?.[1] ?? ''

const restingPage = await load(
  compoundSheet,
  '<div id="rest" class="animate-offset-anchor-x-edge-[left]"></div>',
)
// Read **with the motion applied and paused at zero**, which is the reading D.3.7 used to find the defect and
// the only one that means anything here: with nothing applied, `offset-anchor` reads the property's own initial
// value on every element in the library, so an unanimated element would have reported `auto` whether the
// emission was right or not.
const restingAnchor = await restingPage.evaluate(async () => {
  const element = document.getElementById('rest')

  element.getAnimations().forEach(animation => {
    animation.pause()
    animation.currentTime = 0
  })

  await new Promise(requestAnimationFrame)

  return getComputedStyle(element).offsetAnchor
})

const compound = [
  [
    'the composition composes the two resolved components',
    compoundSheet.includes(
      '--jumi-offset-anchor: var(--jumi-offset-anchor-x-position) var(--jumi-offset-anchor-y-position)',
    ),
    'the property reads the pair the browser interpolates, not the four authoring tokens',
  ],
  [
    'a compound constituent writes both leaves, from one definition',
    compoundFrames.includes(
      '--jumi-offset-anchor-x-position: var(--jumi-offset-anchor-x-position-100)',
    ) &&
      compoundFrames.includes(
        '--jumi-offset-anchor-y-position: var(--jumi-offset-anchor-y-position-100)',
      ),
    'one keyframe assigns both axes, so a motion cannot move one and strand the other',
  ],
  [
    'and the authored edge resolves into the component the browser interpolates',
    compoundSheet.includes('--jumi-offset-anchor-x-position-100: 0%') &&
      compoundSheet.includes('--jumi-offset-anchor-y-position-100: 50%'),
    '`left` over a zero offset is `0%`, and the untouched `center` over a zero offset is `50%`',
  ],
  [
    'a component with no measured mapping takes the composed representation',
    /(^|\s)offset-anchor:/.test(declinedFrames) &&
      !declinedFrames.includes('--jumi-offset-anchor-x-position:'),
    // The per-axis group is authoring surface the resolver does not read, so its motion stays on the property.
    // **Measured, and recorded as a finding rather than as a working route**: the frame writes the composition
    // verbatim — `offset-anchor: var(--jumi-offset-anchor-x-position) var(--jumi-offset-anchor-y-position)` —
    // which is the same value at both stops, because the composition no longer names the group's own leaves for
    // `hookSlot` to replace. The group's motion is therefore inert, which is a property of the reshaped
    // composition rather than of the resolver, and it is stated here so it cannot be mistaken for coverage.
    `the declined motion writes ${declinedFrames.replaceAll('\n', ' ').trim()}`,
  ],
  [
    'and the resting composition computes, where the four-token one did not',
    restingAnchor !== 'auto' && restingAnchor.includes('50%'),
    `the unanimated element reads \`offset-anchor: ${restingAnchor}\``,
  ],
]

for (const [claim, ok, detail] of compound)
  if (!ok) failures.push(`compound: ${claim} — ${detail}`)

/* ------------------------------------------------------------------------------------
 * 17. A typed constituent definition is value-free, and shared by every authored value
 *     (added 2026-09-17).
 * ---------------------------------------------------------------------------------- */

// The defect this guards, found while grounding the definition-identity correction: a typed
// constituent emitted a definition **named** for the component — `jumi-scale-x`, no value in the
// name — over a body that **baked** the canonical value. `emitKeyframe` is
// `if (seen.has(name)) return`, so two authored values of one component collided on that name and
// the first candidate compiled won: `animate-scale-x-[5]` beside `[7]` produced one definition and
// **both** elements settled at `5 1`; reversed, both settled at `7 1`. Silent and order-dependent,
// and uncovered, because every arm above uses one value per constituent.
//
// The two halves have to be read together, or a regression that trades one for the other passes:
// **one** definition (the reuse) and **each element resolving its own value** (the correctness).
// Re-hashing the value into the name would restore correctness by giving up the reuse, which is the
// trade the typed path exists to remove — and it is the move this section is here to refuse.
const reusable = async ({ body, candidates, prefix, property, transform }) => {
  const compiled = finalizeCss(
    (await compiler(constituentEntry, root)).build(candidates),
  ).css

  const css = transform ? transform(compiled) : compiled

  const page = await load(css, body)

  const reading = await page.evaluate(
    async ({ ids, prefix: startsWith, property: name }) => {
      const out = {}

      for (const id of ids) {
        const element = document.getElementById(id)
        const own = element
          .getAnimations()
          .filter(animation =>
            (animation.animationName ?? '').startsWith(startsWith),
          )

        if (!own.length) {
          out[id] = { names: [], values: [] }
          continue
        }

        own.forEach(animation => animation.pause())

        const duration = own[0].effect?.getTiming?.().duration ?? 0
        const values = []

        for (const share of [0, 0.5, 1]) {
          own.forEach(animation => {
            animation.currentTime = duration * share
          })

          await new Promise(resolve => requestAnimationFrame(resolve))

          values.push(getComputedStyle(element)[name])
        }

        out[id] = {
          names: own.map(animation => animation.animationName),
          values,
        }
      }

      return out
    },
    { ids: ['a', 'b'], prefix, property },
  )

  await page.close()

  return { css, reading }
}

/** How many definitions the sheet declares for one name — the reuse half of the contract. */
const definitionsOf = (css, name) =>
  (css.match(new RegExp(`@keyframes ${name}\\b`, 'g')) ?? []).length

/** Where an element settled — the correctness half. */
const settledAt = (measured, id) => measured.reading[id].values.at(-1)

const TWO_VALUES = (utility, first, second) =>
  ['a', 'b']
    .map(
      (id, index) =>
        `<div id="${id}" class="${index === 0 ? first : second}" style="animation-timing-function: linear"></div>`,
    )
    .join('')

const scaleReuse = await reusable({
  body: TWO_VALUES('scale-x', 'animate-scale-x-[5]', 'animate-scale-x-[7]'),
  candidates: ['animate-scale-x-[5]', 'animate-scale-x-[7]'],
  prefix: 'jumi-scale-x',
  property: 'scale',
})

/**
 * The pre-fix shape, reconstructed by text so the falsification tests this build rather than a
 * remembered one — the same device `withoutFrameLookups` uses above. Baking the **first** candidate's
 * endpoint back into the body is exactly what the shared definition used to contain, so the second
 * element should stop resolving its own value.
 */
const bakedIntoBody = (css, leaf) => {
  const baked = css.match(new RegExp(`--jumi-${leaf}-100:\\s*([^;]+);`))

  if (!baked) return css

  return css.replace(
    new RegExp(`--jumi-${leaf}:\\s*var\\(--jumi-${leaf}-100\\)`, 'g'),
    `--jumi-${leaf}: ${baked[1].trim()}`,
  )
}

const scaleReuseBaked = await reusable({
  body: TWO_VALUES('scale-x', 'animate-scale-x-[5]', 'animate-scale-x-[7]'),
  candidates: ['animate-scale-x-[5]', 'animate-scale-x-[7]'],
  prefix: 'jumi-scale-x',
  property: 'scale',
  transform: css => bakedIntoBody(css, 'scale-x'),
})

const scaleReuseReversed = await reusable({
  body: TWO_VALUES('scale-x', 'animate-scale-x-[5]', 'animate-scale-x-[7]'),
  candidates: ['animate-scale-x-[7]', 'animate-scale-x-[5]'],
  prefix: 'jumi-scale-x',
  property: 'scale',
})

const translateReuse = await reusable({
  body: TWO_VALUES(
    'translate-x',
    'animate-translate-x-[10px]',
    'animate-translate-x-[30px]',
  ),
  candidates: ['animate-translate-x-[10px]', 'animate-translate-x-[30px]'],
  prefix: 'jumi-translate-x',
  property: 'translate',
})

const reuse = [
  [
    'two authored values of one typed constituent share ONE definition',
    definitionsOf(scaleReuse.css, 'jumi-scale-x') === 1,
    `${definitionsOf(scaleReuse.css, 'jumi-scale-x')} definitions for jumi-scale-x`,
  ],
  [
    'and each element resolves its own value',
    settledAt(scaleReuse, 'a') === '5 1' &&
      settledAt(scaleReuse, 'b') === '7 1',
    `read ${settledAt(scaleReuse, 'a')} / ${settledAt(scaleReuse, 'b')}`,
  ],
  [
    'and reversing candidate discovery changes nothing',
    settledAt(scaleReuseReversed, 'a') === '5 1' &&
      settledAt(scaleReuseReversed, 'b') === '7 1',
    `read ${settledAt(scaleReuseReversed, 'a')} / ${settledAt(scaleReuseReversed, 'b')}`,
  ],
  [
    'the same contract holds for the translate prototype',
    definitionsOf(translateReuse.css, 'jumi-translate-x') === 1 &&
      settledAt(translateReuse, 'a') === '10px' &&
      settledAt(translateReuse, 'b') === '30px',
    `${definitionsOf(translateReuse.css, 'jumi-translate-x')} definitions, read ${settledAt(translateReuse, 'a')} / ${settledAt(translateReuse, 'b')}`,
  ],
  [
    'and the assertion can fail: baking the value back into the body collides',
    definitionsOf(scaleReuseBaked.css, 'jumi-scale-x') === 1 &&
      settledAt(scaleReuseBaked, 'b') === '5 1',
    `read ${settledAt(scaleReuseBaked, 'a')} / ${settledAt(scaleReuseBaked, 'b')}`,
  ],
]

for (const [claim, ok] of reuse) if (!ok) failures.push(`reuse: ${claim}`)

/* ------------------------------------------------------------------------------------
 * 18. Timing precedence and instance identity are two separate facts (added 2026-09-17).
 * ---------------------------------------------------------------------------------- */

// Found by bisecting a *named* constituent phrase that had stopped animating, and the culprit was not the
// typed-leaf work it was first blamed on — the arms below are on `backdrop-filter-blur`, which has no typed
// leaves at all. The pass used to work out which *instance* a composition position belonged to by reading the
// **head** of that position's timing entry, because the addressed slot link was written outermost there. So
// `component → slot → property → global` and `this position is instance K` were one fact, and the chain's order
// was load-bearing for something it has nothing to do with. Building the component rung outermost — so a
// `/part` control could time a part phrase at all — moved the slot link off the head, the pass read the
// position as the *definition*, no hoist was published, and the element read `animation-name: none` with zero
// live animations: measured against the identical phrase **unnamed**, which ran.
//
// The repair is **not** to reorder the chain. Precedence is the author-facing fact of the two — a control
// naming the part is narrower than one naming the property, and a name is a rung inside both — so the reader
// was changed to stop inferring, and the instance now travels as data: the composition publishes the slot at
// each position (`--jumi-staging-positions-slot`) and the pass matches it against what each rule declares.
// See the note above `hoist` in `@/helpers/carriers`.
//
// That gives a **falsification triangle**, and all three arms are needed because they fail in different
// directions. A repair that moves the label outward passes the first and third and fails the second; a
// repair that reads the instance by searching the chain passes the first and second and is exactly the
// coupling this section exists to refuse. The pair in the first two arms is what makes the third feasible at
// all: the unnamed element is the control which says the labelled one's silence was a regression rather than
// an unsupported shape, and both constituents are covered, one typed and one not.
const timingChains = async ({ body, candidates, ids = ['a', 'b'] }) => {
  const css = finalizeCss(
    (await compiler(constituentEntry, root)).build(candidates),
  ).css

  const page = await load(css, body)

  // The element's own animations, unfiltered, and **not** matched by name prefix. A definition's name is
  // either the attribute plus a hash (`jumi-scale-1vrwYE`) or the component (`jumi-scale-x`), so a prefix
  // test is a guess about which route a candidate took — and `none` is not an animation at all, so a count
  // of the element's live animations is the whole assertion.
  const reading = await page.evaluate(
    ({ ids }) =>
      Object.fromEntries(
        ids.map(id => {
          const element = document.getElementById(id)

          if (!element) return [id, { count: 0, duration: '', names: '' }]

          const style = getComputedStyle(element)

          return [
            id,
            {
              count: element.getAnimations().length,
              duration: style.animationDuration,
              names: style.animationName,
            },
          ]
        }),
      ),
    { ids },
  )

  await page.close()

  return { css, reading }
}

const BLUR = 'animate-backdrop-filter-blur-[0:1px|100:5px]'
const SCALE_X = 'animate-scale-x-[0:1|100:5]'
const PART_CONTROL = 'animation-duration-3000/backdrop-filter-blur'
const NAME_CONTROL = 'animation-duration-400/drift'

const blurPair = await timingChains({
  body: `<div id="a" class="${BLUR}/drift"></div><div id="b" class="${BLUR}"></div>`,
  candidates: [`${BLUR}/drift`, BLUR],
})

const scalePair = await timingChains({
  body: `<div id="a" class="${SCALE_X}/drift"></div><div id="b" class="${SCALE_X}"></div>`,
  candidates: [`${SCALE_X}/drift`, SCALE_X],
})

const partOnly = await timingChains({
  body: `<div id="a" class="${BLUR}/drift ${PART_CONTROL}"></div>`,
  candidates: [`${BLUR}/drift`, PART_CONTROL],
  ids: ['a'],
})

const bothControls = await timingChains({
  body: `<div id="a" class="${BLUR}/drift ${NAME_CONTROL} ${PART_CONTROL}"></div>`,
  candidates: [`${BLUR}/drift`, NAME_CONTROL, PART_CONTROL],
  ids: ['a'],
})

const nameOnly = await timingChains({
  body: `<div id="a" class="${BLUR}/drift ${NAME_CONTROL}"></div>`,
  candidates: [`${BLUR}/drift`, NAME_CONTROL],
  ids: ['a'],
})

const chains = [
  [
    'a named phrase on an untyped constituent animates',
    blurPair.reading.a.count >= 1,
    `${blurPair.reading.a.count} instances, names [${blurPair.reading.a.names}]`,
  ],
  [
    'and the identical phrase unnamed animates, so the label is the only difference',
    blurPair.reading.b.count >= 1,
    `${blurPair.reading.b.count} instances, names [${blurPair.reading.b.names}]`,
  ],
  [
    'a named phrase on a composed constituent animates, which is the typed-leaf route',
    scalePair.reading.a.count >= 1,
    `${scalePair.reading.a.count} instances, names [${scalePair.reading.a.names}]`,
  ],
  [
    'the /part control reaches a named part phrase, so the rung is not dead weight',
    partOnly.reading.a.duration === '3s',
    `read ${partOnly.reading.a.duration}`,
  ],
  [
    'and the component wins over the name, which is the precedence the chain states',
    bothControls.reading.a.duration === '3s',
    `read ${bothControls.reading.a.duration}`,
  ],
  [
    'while the name is still reachable on its own, so neither control is swallowed',
    nameOnly.reading.a.duration === '0.4s',
    `read ${nameOnly.reading.a.duration}`,
  ],
]

for (const [claim, ok, detail] of chains)
  if (!ok) failures.push(`chains: ${claim} — ${detail}`)

await browser.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

console.log('\n  direct carriers\n')

for (const { measured, utility } of direct) {
  const broken = failures.some(failure => failure.startsWith(`${utility}:`))

  console.log(
    `    ${broken ? '✗' : '✓'} ${utility.padEnd(32)} ${measured.name.slice(0, 52)}`,
  )
}

console.log(
  `    ✓ a carrier with no slot resolves to nones only (${bareNames.length} slots in the sheet)`,
)
console.log(
  `    ${appliedWorks ? '✓' : '✗'} @apply animations -> ${appliedNames.join(' + ') || 'resolves nothing'}`,
)
console.log(
  `    ${spacingResolved ? '✓' : '✗'} spacing follows --spacing -> ${String(spacingValue).slice(0, 40)}`,
)
console.log(
  `    ${radiusResolved ? '✓' : '✗'} radius follows --radius-sm -> ${String(radiusValue).slice(0, 40)}`,
)
console.log(
  `    ${isResolved ? '✓' : '✗'} [&:is(h1)] matches the element -> ${sameElement.name.slice(0, 34)}`,
)
console.log(
  `    ${descendantResolved ? '✗' : '✓'} [&:is(h1)] does not match a descendant (${descendantResolved ? 'it did' : 'nones only'})`,
)
console.log(
  `    ${hasResolved ? '✓' : '✗'} has-[>button] matches the element -> ${hasChild.name.slice(0, 34)}`,
)
console.log(
  `    ${nestingOk ? '✓' : '✗'} a nested animation runs its own slot only` +
    ` (outer ${outerNames.filter(name => name !== 'none').length},` +
    ` inner ${innerNames.filter(name => name !== 'none').length} live)`,
)
console.log(
  `    ✓ finalization settles: ${variantBuild.staging + canonicalBuild.staging} payload rules` +
    ` consumed, a second pass a no-op`,
)

console.log('\n  naming')

for (const [claim, ok, detail] of naming)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  composed')

for (const [claim, ok, detail] of constituent)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  own property')

for (const [claim, ok, detail] of ownProperty)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  compositions')

for (const [claim, ok, detail] of compositions)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  transform origin')

for (const [claim, ok, detail] of origins)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  logical corners')

for (const [claim, ok, detail] of radius)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  url filters')

for (const [claim, ok, detail] of urls)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  typed composition')

for (const [claim, ok, detail] of typed)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  typed constituent definition reuse')

for (const [claim, ok, detail] of reuse)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

console.log('\n  instance identity, apart from timing precedence')

for (const [claim, ok, detail] of chains)
  console.log(
    `    ${ok ? '✓' : '✗'} ${claim}${ok || !detail ? '' : ` — ${detail}`}`,
  )

// Every assertion above that can fail, so the summary line is the count it claims to be: the three
// activation contexts, the pseudo substrate, the direct carriers, bare, applied, spacing, radius,
// the three relationship-variant cases, non-inheritance, the six composed sets, the five typed
// composition curves section 16 adds, the four definition-reuse arms section 17 adds, and the six
// timing-chain arms section 18 adds.
const required =
  contexts.length +
  utilities.length +
  9 +
  naming.length +
  constituent.length +
  ownProperty.length +
  compositions.length +
  origins.length +
  radius.length +
  urls.length +
  typed.length +
  subject.length +
  compound.length +
  reuse.length +
  chains.length
const passing = required - failures.length

console.log(`\n  ${passing}/${required} required contexts and carriers behave`)

if (failures.length) {
  console.error('\n✗ the emitted CSS does not animate in a browser:')

  for (const failure of failures) console.error(`  ${failure}`)

  console.error(
    '\n  Every other harness here reads text. This one is the only one that knows.',
  )
  process.exit(1)
}

console.log(
  '\n✓ every carrier context resolves, on stock Tailwind, including the applied one',
)
