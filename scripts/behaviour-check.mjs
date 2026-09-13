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
 * Run: pnpm behaviour:check
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

// Bundling comes first because the helper loads the finalizer out of `dist/`: the harness
// exercises the artifact that ships, not the source it was built from.
const { corpus, finalizeCss } = await import('./lib/compile.mjs')

/** Compile a corpus, finalize it, and say what the finalizer did. */
const compile = async (name) => {
  const built = await corpus(name)

  console.log(`· ${name} — ${built.animations + built.transitions} selectors composed,`
    + ` ${built.staging} payload rules consumed, ${built.css.length} bytes`)

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

  if (again.staging !== 0) failures.push(`${name}: ${again.staging} payload rules survived finalization`)
  if (again.animations !== 0 || again.transitions !== 0) failures.push(`${name}: a composition was derived twice`)
  if (again.css !== built.css) failures.push(`${name}: finalizing the finalized CSS changed it`)
}

/**
 * The slot name a utility declares, read out of the CSS rather than hard-coded, so the
 * expectation follows the emission. Matches by selector *containing* the escaped class,
 * because a prefixed form wraps it (`… > *` for a descendant, `::before` for a pseudo).
 */
const slotReader = css => (utility) => {
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

const entry = (page, selector, pseudo = null) => page.evaluate(
  ({ parts, pseudo: pseudoElement, selector: query }) => {
    const element = document.querySelector(query)

    if (!element) return null

    const style = getComputedStyle(element, pseudoElement)
    const lists = Object.fromEntries(parts.map(part => [part, style[part].split(',').map(value => value.trim())]))

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
  { detail: 'the utility itself', key: 'direct', selector: '#ctx-direct', utility: 'animate-rotate-45' },
  { detail: '*:animate-* descendant', key: 'descendant', selector: '#ctx-descendant > i', utility: '*:animate-rotate-45' },
  { detail: 'before:animate-* pseudo', key: 'pseudo', pseudo: '::before', selector: '#ctx-pseudo', utility: 'before:animate-scale-110' },
]

const variantPage = await load(variantCss, `
    <div id="ctx-direct" class="animate-rotate-45"></div>
    <div id="ctx-descendant" class="*:animate-rotate-45"><i></i></div>
    <div id="ctx-pseudo" class="before:content-[''] before:animate-scale-110"></div>
`)

console.log('\n  activation contexts\n')

for (const context of contexts) {
  const measured = await entry(variantPage, context.selector, context.pseudo)
  const expected = slots(context.utility)

  if (measured === null) {
    failures.push(`${context.detail}: ${context.selector} not found in the page`)
    console.log(`    ✗ ${context.detail}`)
    continue
  }

  const resolving = measured.name.split(',').map(name => name.trim()).filter(name => name !== 'none')
  const works = expected !== null && measured.name.includes(expected)

  console.log(
    `    ${works ? '✓' : '✗'} ${context.detail.padEnd(28)}${context.utility.padEnd(26)}`
    + `${resolving.length ? resolving.join(' + ') : 'none'}`,
  )

  if (!works) {
    failures.push(
      `${context.detail}: resolved "${measured.name.slice(0, 40)}" for ${context.utility},`
      + ` expected to include ${expected ?? '(no slot in the CSS)'}`,
    )
  }

  if (measured.lengths.length !== 1) {
    failures.push(`${context.detail}: longhand lists disagree on length (${measured.lengths.join(' vs ')})`)
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
const pseudo = await entry(variantPage, '#ctx-pseudo', '::before')
const pseudoOk = Boolean(pseudo) && pseudo.duration.split(',').every(part => part.trim() === '1s')

console.log(`    ${pseudoOk ? '✓' : '✗'} pseudo-element substrate  ${pseudo?.duration.slice(0, 44) ?? '(missing)'}`)

if (!pseudoOk) failures.push(`pseudo-element: substrate resolved "${pseudo?.duration.slice(0, 44) ?? 'none'}", expected 1s per slot`)

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
const precedence = await load(canonicalCss, `
    <div id="precedence-default" class="animate-rotate-45"></div>
    <div id="precedence-controlled" class="animate-rotate-45 animation-duration-500"></div>
    <div id="precedence-arbitrary" class="animate-rotate-45 [--jumi-animation-duration:750ms]"></div>
`)

for (const [id, expected] of [['precedence-default', '1s'], ['precedence-controlled', '0.5s'], ['precedence-arbitrary', '0.75s']]) {
  const value = await precedence.evaluate(
    selector => getComputedStyle(document.querySelector(selector)).animationDuration,
    `#${id}`,
  )
  const works = value.split(',').every(part => part.trim() === expected)

  console.log(`    ${works ? '✓' : '✗'} ${id.padEnd(22)}${expected.padEnd(8)}${value.slice(0, 44)}`)

  if (!works) failures.push(`precedence: #${id} resolved "${value.slice(0, 44)}", expected ${expected}`)
}

const utilities = [
  'animate-rotate-45',
  'animate-scale-110',
  'animate-bounce-in',
  'animate-background-color-red-500',
]

const directPage = await load(canonicalCss, `
    ${utilities.map((utility, index) => `<div id="c${index}" class="${utility}"></div>`).join('\n    ')}
    <div id="bare" class="animation-duration-500"></div>
    <div id="applied" class="applied-motion"></div>
    <div id="spacing" class="animate-padding-4 animate-margin-2"></div>
    <div id="radius" class="animate-border-radius-sm"></div>
    <h1 id="sel-is" class="[&:is(h1)]:animate-fade-in"></h1>
    <div class="[&:is(h1)]:animate-fade-in"><h1 id="sel-is-descendant"></h1></div>
    <div id="sel-has" class="has-[>button]:animate-scale-110"><button></button></div>
`)

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
    failures.push(`${utility}: resolved "${measured.name.slice(0, 60)}", expected to include ${expected}`)
  }

  if (measured.lengths.length !== 1) {
    failures.push(`${utility}: longhand lists disagree on length (${measured.lengths.join(' vs ')})`)
  }
}

const bare = await entry(directPage, '#bare')

// The bare carrier has no slot of its own: the aggregate still lists every slot in the
// sheet, each resolving to `none`, so nothing may animate there.
const bareNames = bare.name.split(',').map(name => name.trim())

if (bareNames.some(name => name !== 'none')) {
  failures.push(`a carrier with no slot resolved something other than nones: "${bare.name.slice(0, 60)}"`)
}

/* ------------------------------------------------------------------------------------
 * 4. The theme batch: a spacing name resolves through `--spacing`, not a build-time literal
 * ---------------------------------------------------------------------------------- */

// The corpus overrides `--spacing` (0.3rem), so this is the batch's claim measured where it
// matters: the emitted value is a *reference* the browser resolves against the page's theme. A
// resolved literal — `1rem` — would compile, animate, and ignore the override entirely.
const spacingProperty = /(--jumi-padding-[\w-]+):\s*calc\(var\(--spacing\) \* 4\)/.exec(canonicalCss)?.[1]
const spacingValue = spacingProperty
  ? await directPage.evaluate(
      property => getComputedStyle(document.querySelector('#spacing')).getPropertyValue(property),
      spacingProperty,
    )
  : '(no formula in the CSS)'

const spacingResolved = typeof spacingValue === 'string' && spacingValue.includes('0.3rem')

if (!spacingResolved) {
  failures.push(`theme: the padding utility resolved to "${String(spacingValue).slice(0, 60)}", expected the corpus's 0.3rem`)
}

/* ------------------------------------------------------------------------------------
 * 5. The partial-namespace batch: a token-backed name resolves through the token
 * ---------------------------------------------------------------------------------- */

// Same claim as the spacing one above, for a name that is not arithmetic: the corpus overrides
// `--radius-sm` (0.9rem), and the utility is emitted as `var(--radius-sm)` either way. Only the
// browser shows whether the value is a reference or a literal baked in at build time — and a
// literal is exactly what the table would produce if a namespace were only guessed at.
const radiusProperty = /(--jumi-border-radius-[\w-]+):\s*var\(--radius-sm\)/.exec(canonicalCss)?.[1]
const radiusValue = radiusProperty
  ? await directPage.evaluate(
      property => getComputedStyle(document.querySelector('#radius')).getPropertyValue(property),
      radiusProperty,
    )
  : '(no token reference in the CSS)'

const radiusResolved = typeof radiusValue === 'string' && radiusValue.includes('0.9rem')

if (!radiusResolved) {
  failures.push(`theme: the border-radius utility resolved to "${String(radiusValue).slice(0, 60)}", expected the corpus's 0.9rem`)
}

// `@apply animations` inlines the carrier — longhands, slot references *and* the marker that
// says what the rule is. So the copied rule is a carrier like any other, and the finalizer
// writes the aggregate into it after the build. It used to resolve nothing, because the only
// place the data could be published was a selector that could not name this element; the
// marker is what removed that limit, and this is the assertion that holds it.
const applied = await entry(directPage, '#applied')
const appliedSlot = canonicalSlots('animate-rotate-45')
const appliedNames = applied.name.split(',').map(name => name.trim()).filter(name => name !== 'none')
const appliedWorks = appliedSlot !== null && applied.name.includes(appliedSlot)

if (!appliedWorks) {
  failures.push(
    `@apply animations: resolved "${applied.name.slice(0, 60)}",`
    + ` expected to include ${appliedSlot ?? '(no slot in the CSS)'}`,
  )
}

if (applied.lengths.length !== 1) {
  failures.push(`@apply animations: longhand lists disagree on length (${applied.lengths.join(' vs ')})`)
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
const descendantResolved = descendant.name.split(',').some(name => name.trim() !== 'none')
const hasResolved = hasSlot !== null && hasChild.name.includes(hasSlot)

if (!isResolved) {
  failures.push(`[&:is(h1)]: the element carrying the class resolved "${sameElement.name.slice(0, 40)}", expected ${isSlot ?? '(no slot)'}`)
}

if (descendantResolved) {
  failures.push(`[&:is(h1)]: a descendant resolved "${descendant.name.slice(0, 40)}" — the variant is not same-element`)
}

if (!hasResolved) {
  failures.push(`has-[>button]: the element with a direct child button resolved "${hasChild.name.slice(0, 40)}", expected ${hasSlot ?? '(no slot)'}`)
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
const nesting = await load(canonicalCss, `
    <div id="nest-outer" class="animate-rotate-45">
      <div id="nest-inner" class="animate-fade-in"></div>
    </div>
`)

const outerSlot = canonicalSlots('animate-rotate-45')
const innerSlot = canonicalSlots('animate-fade-in')
const outerNames = (await entry(nesting, '#nest-outer'))?.name.split(',').map(name => name.trim()) ?? []
const innerNames = (await entry(nesting, '#nest-inner'))?.name.split(',').map(name => name.trim()) ?? []

const outerAnimates = outerSlot !== null && outerNames.includes(outerSlot)
const innerAnimates = innerSlot !== null && innerNames.includes(innerSlot)
const innerInherits = outerSlot !== null && innerNames.includes(outerSlot)
const nestingOk = outerAnimates && innerAnimates && !innerInherits

if (!nestingOk) {
  failures.push(
    'non-inheritance:'
    + ` the outer ${outerAnimates ? 'animated' : `resolved no ${outerSlot}`},`
    + ` the inner ${innerAnimates ? 'animated' : `resolved no ${innerSlot}`},`
    + ` and the inner ${innerInherits ? `ran the ancestor's ${outerSlot}` : 'stayed clear of the ancestor'}`,
  )
}

await browser.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

console.log('\n  direct carriers\n')

for (const { measured, utility } of direct) {
  const broken = failures.some(failure => failure.startsWith(`${utility}:`))

  console.log(`    ${broken ? '✗' : '✓'} ${utility.padEnd(32)} ${measured.name.slice(0, 52)}`)
}

console.log(`    ✓ a carrier with no slot resolves to nones only (${bareNames.length} slots in the sheet)`)
console.log(`    ${appliedWorks ? '✓' : '✗'} @apply animations -> ${appliedNames.join(' + ') || 'resolves nothing'}`)
console.log(`    ${spacingResolved ? '✓' : '✗'} spacing follows --spacing -> ${String(spacingValue).slice(0, 40)}`)
console.log(`    ${radiusResolved ? '✓' : '✗'} radius follows --radius-sm -> ${String(radiusValue).slice(0, 40)}`)
console.log(`    ${isResolved ? '✓' : '✗'} [&:is(h1)] matches the element -> ${sameElement.name.slice(0, 34)}`)
console.log(`    ${descendantResolved ? '✗' : '✓'} [&:is(h1)] does not match a descendant (${descendantResolved ? 'it did' : 'nones only'})`)
console.log(`    ${hasResolved ? '✓' : '✗'} has-[>button] matches the element -> ${hasChild.name.slice(0, 34)}`)
console.log(`    ${nestingOk ? '✓' : '✗'} a nested animation runs its own slot only`
  + ` (outer ${outerNames.filter(name => name !== 'none').length},`
  + ` inner ${innerNames.filter(name => name !== 'none').length} live)`)
console.log(`    ✓ finalization settles: ${variantBuild.staging + canonicalBuild.staging} payload rules`
  + ` consumed, a second pass a no-op`)

// Every assertion above that can fail, so the summary line is the count it claims to be: the three
// activation contexts, the pseudo substrate, the direct carriers, bare, applied, spacing, radius,
// the three relationship-variant cases, and non-inheritance.
const required = contexts.length + utilities.length + 9
const passing = required - failures.length

console.log(`\n  ${passing}/${required} required contexts and carriers behave`)

if (failures.length) {
  console.error('\n✗ the emitted CSS does not animate in a browser:')

  for (const failure of failures) console.error(`  ${failure}`)

  console.error('\n  Every other harness here reads text. This one is the only one that knows.')
  process.exit(1)
}

console.log('\n✓ every carrier context resolves, on stock Tailwind, including the applied one')
