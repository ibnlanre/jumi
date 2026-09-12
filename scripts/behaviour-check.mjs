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
 * emitting and Jumi finalizing — loads them in a real browser, and asserts every carrier
 * context Jumi promises:
 *
 *   direct carrier                 must animate
 *   *:animations descendant        must animate
 *   before:animations pseudo       must animate
 *   @apply animations              must animate
 *
 * The fourth is the interesting one. It used to be refused, and refusing it was wrong: there
 * was nothing about `@apply` that Jumi could not support, only a publication site it could
 * not reach. The carrier now marks itself, `@apply` copies that marker along with the rest of
 * the body, and the finalizer writes the aggregate into every marked rule after the build.
 * The context that could not be named is found the same way as the ones that can.
 *
 * It also asserts the finalizer did its job: staging is gone, and something was finalized.
 * A green browser with a leaked staging rule would mean the data is being read from a rule
 * that is not supposed to be there.
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

  console.log(`· ${name} — ${built.carriersFound} carriers found, ${built.carriersChanged} written,`
    + ` ${built.staging} staging removed, ${built.css.length} bytes`)

  return built
}

/**
 * The finalizer's own contract, checked before the browser is asked anything.
 *
 * `finalize` is idempotent and staging is consumed, so running it over its own output must
 * find nothing left to do — nothing to inject, nothing to remove — and must not rewrite a
 * byte. That is a stronger statement than `staging === 0`, which only says the first pass
 * removed what it found: this says a second pass finds no work at all.
 */
const settled = (built, name) => {
  const again = finalizeCss(built.css)

  if (again.staging !== 0) failures.push(`${name}: ${again.staging} staging rules survived finalization`)
  if (again.carriersFound !== 0) failures.push(`${name}: ${again.carriersFound} carriers were re-finalized`)
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

if (variantBuild.carriersFound === 0) {
  failures.push('variant.css: the finalizer found no carrier to write the aggregate into')
}

const contexts = [
  { detail: 'direct carrier', key: 'direct', selector: '#ctx-direct', utility: 'animate-rotate-45' },
  { detail: '*:animations descendant', key: 'descendant', pseudo: null, selector: '#ctx-descendant > i', utility: 'animate-rotate-45' },
  { detail: 'before:animations pseudo', key: 'pseudo', pseudo: '::before', selector: '#ctx-pseudo', utility: 'before:animate-scale-110' },
]

const variantPage = await load(variantCss, `
    <div id="ctx-direct" class="animations animate-rotate-45"></div>
    <div id="ctx-descendant" class="*:animations"><i class="animate-rotate-45"></i></div>
    <div id="ctx-pseudo" class="before:animations before:content-[''] before:animate-scale-110"></div>
`)

console.log('\n  carrier contexts\n')

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
 * 2. The direct carriers, the bare carrier, and the refused path (canonical corpus).
 * ---------------------------------------------------------------------------------- */

const canonicalBuild = await compile('input.css')
const canonicalCss = canonicalBuild.css
const canonicalSlots = slotReader(canonicalCss)

settled(canonicalBuild, 'input.css')

const utilities = [
  'animate-rotate-45',
  'animate-scale-110',
  'animate-bounce-in',
  'animate-background-color-red-500',
]

const directPage = await load(canonicalCss, `
    ${utilities.map((utility, index) => `<div id="c${index}" class="animations ${utility}"></div>`).join('\n    ')}
    <div id="bare" class="animations"></div>
    <div id="applied" class="applied-motion"></div>
    <div id="spacing" class="animations animate-padding-4 animate-margin-2"></div>
    <div id="radius" class="animations animate-border-radius-sm"></div>
    <h1 id="sel-is" class="animations [&:is(h1)]:animate-fade-in"></h1>
    <div class="[&:is(h1)]:animate-fade-in"><h1 id="sel-is-descendant" class="animations"></h1></div>
    <div id="sel-has" class="animations has-[>button]:animate-scale-110"><button></button></div>
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
 * 3. The theme batch: a spacing name resolves through `--spacing`, not a build-time literal
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
 * 4. The partial-namespace batch: a token-backed name resolves through the token
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
 * 5. Relationship variants: same element, not a descendant
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
console.log(`    ✓ finalization settles: ${variantBuild.staging + canonicalBuild.staging} staging rules`
  + ` removed, ${variantBuild.carriersFound + canonicalBuild.carriersFound} carriers found, a second pass a no-op`)

const required = contexts.length + utilities.length + 6
const passing = required - failures.length

console.log(`\n  ${passing}/${required} required contexts and carriers behave`)

if (failures.length) {
  console.error('\n✗ the emitted CSS does not animate in a browser:')

  for (const failure of failures) console.error(`  ${failure}`)

  console.error('\n  Every other harness here reads text. This one is the only one that knows.')
  process.exit(1)
}

console.log('\n✓ every carrier context resolves, on stock Tailwind, including the applied one')
