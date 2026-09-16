#!/usr/bin/env node
/**
 * Aggregate ordering — can Jumi make the final animation list deterministically whole-before-component,
 * and does that give the ownership semantics?
 *
 * The list order *is* the CSS precedence order: with two animations on one property the later one wins.
 * The pivot wants
 *
 *   whole motion      establishes the base animated value
 *   component motion  overrides only the component it owns
 *
 * and if that ordering is guaranteed, the whole-plus-constituent case stops being a shared-identity
 * problem and becomes ordinary CSS conflict resolution that Jumi can explain.
 *
 * Two halves, measured differently because they are different questions.
 *
 *   §1  Is the emitted list the same whatever order the candidates compile in? A property of the
 *       compiler, so it is read off the real build — Tailwind emitting, the shipping finalizer
 *       completing — with no browser.
 *   §2  Does component-after-whole give the ownership semantics? A property of CSS, so it is measured in
 *       the browser with the list forced each way.
 *   §3  Where the rule stops. The whole motion is *not* always writing a slot: when it writes a composed
 *       value, a component nested inside that value is bypassed and no ordering can recover it.
 *
 * Run: node scripts/spike-aggregate-order.mjs   (bundles first; needs `dist/`)
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const header = title => console.log(`\n${'─'.repeat(96)}\n${title}\n`)

/* ────────────────────────────────────────────────────────────────────────────
 * §1 The emitted list, against the candidate order.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The four pairs the ruling names, spelled with arbitrary values — the earlier attempt used theme keys
 * and three of the eight emitted nothing at all, which reads as "no animation" rather than "that utility
 * does not exist". An arbitrary value is always a utility.
 */
const PAIRS = [
  {
    component: 'animate-scale-x-[3]',
    label: 'scale + scale-x',
    whole: 'animate-scale-[2]',
  },
  {
    component: 'animate-rotate-x-[30]',
    label: 'rotate + rotate-x',
    whole: 'animate-rotate-[45deg]',
  },
  {
    component: 'animate-skew-x-[10deg]',
    label: 'skew + skew-x',
    whole: 'animate-skew-[10deg]',
  },
  {
    component: 'animate-filter-drop-shadow-blur-[12px]',
    label: 'filter-drop-shadow + drop-shadow-blur',
    whole: 'animate-filter-drop-shadow-[0_4px_8px_red]',
  },
]

/** The two controls: a pair that must not conflict, and a second component beside the first. */
const CONTROLS = [
  {
    label: 'two components of one attribute',
    members: ['animate-scale-x-[3]', 'animate-scale-y-[4]'],
  },
  {
    label: 'two phrases with identical frames',
    members: ['animate-scale-[0:1|100:2]', 'animate-scale-x-[0:1|100:2]'],
  },
]

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const compile = async candidates =>
  build(
    await compiler(
      `@import "tailwindcss";\n@plugin "./dist/index.js";\n`,
      root,
    ),
    candidates,
  )

/**
 * The composed list: the `animation` declaration the finalizer wrote, which is the one the browser
 * resolves. Read from `--jumi-slot-*` because that is what identifies a composition rather than a
 * utility's own activation, and there are two other `animation-name` declarations per utility.
 */
const listOf = css =>
  [...css.matchAll(/animation:\s*([^;}]+)/g)]
    .map(match => match[1].trim().replace(/\s+/g, ' '))
    .filter(value => /--jumi-slot/.test(value))

const slotsOf = css => [
  ...new Set(
    [...css.matchAll(/--jumi-slot-([\w-]+?)(?:,|\))/g)].map(m => m[1]),
  ),
]

/**
 * Two phrases of one attribute with **different** frames, which is the case the grouping in
 * `computeSlots()` does not order: a whole-value motion becomes a `values` instance and a part motion
 * the attribute's shared slot, and `values` is emitted before `shared` — but two phrases are both in
 * `phrases`, so their order is the order they were inserted, which is the order Tailwind compiled them.
 */
const WORDING = {
  component: 'animate-scale-x-[0:1|100:5]',
  label: 'two phrases of scale, different frames',
  whole: 'animate-scale-[0:1|100:2]',
}

/** The composed list's slot keys, in order, as the browser sees them. */
const keyOf = value =>
  value?.match(/--jumi-slot-([\w-]+?)(?:,|\))/)?.[1] ?? null

/**
 * The slot one candidate resolves on its own. Comparing these against the composed list is what
 * attributes a list entry to a candidate: the whole writes an instance slot
 * (`--jumi-slot-scale-<id>`) and the component a shared one, which is a property of the current
 * representation rather than a rule, and is worth seeing plainly.
 *
 * Read off the composed declaration and not the first `animation:` in the file: `--jumi-animation`
 * is itself an `animation:`-shaped declaration and comes first, so a naive match reads that one.
 */
const soloSlot = async candidate =>
  keyOf(listOf((await compile([candidate])).css)[0])

header('§1  the emitted list, against the candidate order')

for (const pair of [...PAIRS, ...CONTROLS, WORDING]) {
  const members = pair.members ?? [pair.whole, pair.component]
  const forward = await compile(members)
  const reverse = await compile([...members].reverse())

  const a = listOf(forward.css)
  const b = listOf(reverse.css)
  const entries = a[0]?.split(/,\s*(?=var\()/) ?? []

  console.log(`  ${pair.label}`)
  console.log(`    the list        ${a[0] ?? '(nothing)'}`)
  console.log(
    `    entries         ${entries.length}${entries.length === 1 ? '  — one slot, so there is no order question' : ''}`,
  )

  if (entries.length > 1) {
    const keys = entries.map(keyOf)
    const positions = []

    for (const member of members) {
      const key = await soloSlot(member)
      // Exact, never a prefix: `--jumi-slot-scale` is a prefix of `--jumi-slot-scale-O`.
      const at = keys.indexOf(key)

      positions.push({ at, key, member })
      console.log(`    ${member.padEnd(44)} → \`${key}\` is entry ${at + 1}`)
    }

    console.log(
      `    order           ${
        positions[0].at < positions[1].at
          ? 'whole before component'
          : 'component before whole'
      }`,
    )
  }

  console.log(
    `    reversed order  ${
      JSON.stringify(a) === JSON.stringify(b)
        ? 'the same list'
        : `DIFFERENT: ${b.join(' | ')}`
    }`,
  )
  console.log()
}

/* ────────────────────────────────────────────────────────────────────────────
 * §2 Does component-after-whole buy the ownership semantics?
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Three representations of the same pair, and they are not variations on a theme:
 *
 *   today     the keyframes write the **composed property** — what the build emits now
 *   pivot     the keyframes write **typed slots**, and the whole writes every slot it owns
 *
 * each forced into both list orders. If `pivot` + whole-first reads the component's value for the
 * component's slot while the whole keeps the others, that is the ownership rule.
 */
const CSS = String.raw`
/* ── today: the keyframes write the composed property ──────────────────────── */

@keyframes t-whole { from { scale: 1 1 1 } to { scale: 2 2 1 } }
@keyframes t-part  { from { scale: 1 1 1 } to { scale: 3 1 1 } }

.t-whole-first { scale: 1 1 1; animation: t-whole 1s linear both paused, t-part 1s linear both paused; }
.t-part-first  { scale: 1 1 1; animation: t-part 1s linear both paused, t-whole 1s linear both paused; }

/* ── pivot: the keyframes write typed slots, the property is composed once ─── */

@property --p-x { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p-y { syntax: "<number>"; inherits: false; initial-value: 1; }
@property --p-z { syntax: "<number>"; inherits: false; initial-value: 1; }

/* the whole writes every slot it owns */
@keyframes p-whole { from { --p-x: 1; --p-y: 1; --p-z: 1 } to { --p-x: 2; --p-y: 2; --p-z: 1 } }
/* the component writes only its own */
@keyframes p-part  { from { --p-x: 1 } to { --p-x: 3 } }
/* a second component, to show the two do not meet */
@keyframes p-part-y { from { --p-y: 1 } to { --p-y: 4 } }

.p-whole-first { scale: var(--p-x) var(--p-y) var(--p-z); animation: p-whole 1s linear both paused, p-part 1s linear both paused; }
.p-part-first  { scale: var(--p-x) var(--p-y) var(--p-z); animation: p-part 1s linear both paused, p-whole 1s linear both paused; }
.p-two-parts   { scale: var(--p-x) var(--p-y) var(--p-z); animation: p-part 1s linear both paused, p-part-y 1s linear both paused; }

/* ── §3 the boundary: a whole that writes a composed value ─────────────────── */

@property --n-amount { syntax: "<length>"; inherits: false; initial-value: 0px; }

/* the whole writes the *function*, so nothing reads the component's slot */
@keyframes n-whole { from { filter: drop-shadow(0 0 0px red) } to { filter: drop-shadow(0 0 20px red) } }
/* and the component writes the argument the reshaped function would read */
@keyframes n-part  { from { --n-amount: 0px } to { --n-amount: 40px } }

.n-whole-first { filter: drop-shadow(0 0 var(--n-amount) red); animation: n-whole 1s linear both paused, n-part 1s linear both paused; }
.n-part-first  { filter: drop-shadow(0 0 var(--n-amount) red); animation: n-part 1s linear both paused, n-whole 1s linear both paused; }

/* the same pair where the whole writes the *slot* instead */
@keyframes n-whole-slot { from { --n-amount: 0px } to { --n-amount: 20px } }
.n-slot-whole-first { filter: drop-shadow(0 0 var(--n-amount) red); animation: n-whole-slot 1s linear both paused, n-part 1s linear both paused; }
.n-slot-part-first  { filter: drop-shadow(0 0 var(--n-amount) red); animation: n-part 1s linear both paused, n-whole-slot 1s linear both paused; }
`

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(`<style>${CSS}</style>`)

const sampled = await page.evaluate(() => {
  const out = {}

  for (const rule of [
    't-whole-first',
    't-part-first',
    'p-whole-first',
    'p-part-first',
    'p-two-parts',
    'n-whole-first',
    'n-part-first',
    'n-slot-whole-first',
    'n-slot-part-first',
  ]) {
    const node = document.createElement('div')
    node.className = rule
    document.body.append(node)

    const read = at => {
      node.style.animationDelay = `${at}ms`

      const style = getComputedStyle(node)

      return { filter: style.filter, scale: style.scale }
    }

    out[rule] = { at500: read(-500), at1000: read(-1000) }
  }

  return out
})

header('§2  which animation owns the component, by list order')

const row = (label, key, field) => {
  const one = sampled[key]

  return `    ${label.padEnd(22)} 50% ${one.at500[field].padEnd(10)} 100% ${one.at1000[field]}`
}

console.log(`  today — the keyframes write the composed property\n`)
console.log(row('whole → component', 't-whole-first', 'scale'))
console.log(row('component → whole', 't-part-first', 'scale'))

console.log(
  `\n  pivot — the keyframes write typed slots, the whole writing all of them\n`,
)
console.log(row('whole → component', 'p-whole-first', 'scale'))
console.log(row('component → whole', 'p-part-first', 'scale'))
console.log(row('two components', 'p-two-parts', 'scale'))

console.log(`
  the whole motion is scale: 1 1 1 → 2 2 1     (it owns x, y and z)
  the component is scale-x: 1 → 3              (it owns x alone)
  so the component owning x while the whole keeps y is \`3 2 1\` at 100%.`)

header('§3  where the rule stops: a whole that writes a composed value')

console.log(
  `  the whole animates \`filter\`; the component animates the argument of the reshaped one\n`,
)
console.log(row('whole → component', 'n-whole-first', 'filter'))
console.log(row('component → whole', 'n-part-first', 'filter'))

console.log(
  `\n  the same pair, with the whole writing the **slot** instead of the function\n`,
)
console.log(row('whole → component', 'n-slot-whole-first', 'filter'))
console.log(row('component → whole', 'n-slot-part-first', 'filter'))

console.log(`
  the whole motion is drop-shadow blur: 0px → 20px
  the component is drop-shadow blur: 0px → 40px
  so the component owning the argument reads 40px, and the whole keeping it 20px.`)

/* ────────────────────────────────────────────────────────────────────────────
 * §4 The same markup, two discovery orders, run for real.
 *
 * §1 shows the list differs. This shows that the difference is *observable* — that the same element
 * with the same two classes computes a different value depending only on the order Tailwind happened
 * to compile the two candidates in, which is not an order an author wrote or can see.
 * ──────────────────────────────────────────────────────────────────────────── */

const forward = (await compile([WORDING.whole, WORDING.component])).css
const reverse = (await compile([WORDING.component, WORDING.whole])).css

const stage = await browser.newPage()

header('§4  the same two classes, two discovery orders')

for (const [label, sheet] of [
  ['whole compiled first', forward],
  ['component compiled first', reverse],
]) {
  await stage.setContent(
    `<style>${sheet}</style><div id="a" class="${WORDING.whole} ${WORDING.component}"></div>`,
  )

  const read = await stage.evaluate(() => {
    const node = document.getElementById('a')

    // Inline, so the value is not read at whatever time the sampler arrived: the shorthand in the
    // carrier sets duration through a var chain, and an inline declaration outranks it.
    node.style.animationDuration = '1s'
    node.style.animationFillMode = 'both'
    node.style.animationPlayState = 'paused'
    node.style.animationDelay = '-1000ms'

    return getComputedStyle(node).scale
  })

  console.log(`  ${label.padEnd(26)} scale reads ${read}`)
}

console.log(`
  the whole phrase is scale: 1 → 2
  the component is scale-x: 1 → 5
  so the component winning x reads \\\`5\\\`, and the whole winning everything reads \\\`2\\\`.`)

await stage.close()
await browser.close()
