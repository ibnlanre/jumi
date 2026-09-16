#!/usr/bin/env node
/**
 * The typed-leaf prototype, measured.
 *
 * The prototype is `scripts/prototype/typed-leaves.mjs` — a **second finalizer** over the sheet the
 * shipping finalizer produces, so everything the pivot does not change (activation chains, variants,
 * named motions, easing, ranges, timelines, reduced motion) is the real machinery rather than a
 * reimplementation. This script runs it and asks the two questions the ruling made mandatory.
 *
 *   §1  Which category does every instance fall into, on a real sheet?
 *   §2  **Independence** — do `skew`+`skew-x` and `drop-shadow`+its blur stop collapsing into one
 *       animation, or is the collapse an aggregation artefact the pivot inherits?
 *   §3  **Ownership** — whole-before-constituent, and is the result the same in both candidate
 *       discovery orders?
 *   §4  Does the rest of the motion surface survive? Named motions, independent duration and easing,
 *       and reduced motion all travel through chains the prototype never touches, so they are the test
 *       of whether this is a first-class path or a second one.
 *
 * Run: node scripts/spike-typed-leaves.mjs   (bundles first; needs `dist/`)
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'
import { typedLeaves } from './prototype/typed-leaves.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const header = title => console.log(`\n${'─'.repeat(96)}\n${title}\n`)

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const sheetFor = async candidates =>
  build(
    await compiler(
      `@import "tailwindcss";\n@plugin "./dist/index.js";\n`,
      root,
    ),
    candidates,
  ).css

/** The prototype applied to the same input, so the two sheets differ in nothing else. */
const prototypeOf = async candidates =>
  typedLeaves(await sheetFor(candidates)).css

/* ────────────────────────────────────────────────────────────────────────────
 * §1 The categories, on a real sheet.
 * ──────────────────────────────────────────────────────────────────────────── */

const SURFACE = [
  'animate-scale-[0:1|100:2]',
  'animate-scale-x-[0:1|100:5]',
  'animate-skew-x-[0:0deg|100:10deg]',
  'animate-filter-blur-[0:0px|100:8px]',
  'animate-filter-brightness-[0:1|100:2]',
  'animate-transform-[translate(100px)_rotate(45deg)]',
]

const { report } = typedLeaves(await sheetFor(SURFACE))

header('§1  the category every instance falls into, read from the model')

const named = (title, rows) =>
  console.log(
    `  ${title.padEnd(28)} ${String(rows.length).padStart(2)}  ${rows
      .map(one => `${one.name}${one.part ? `→${one.part}` : ''}`)
      .join('  ')}`,
  )

named('constituent — writes its leaf', report.constituent)
named('whole — writes every leaf', report.whole)
named('native — keeps the property', report.native)
named('argument — needs the reshape', report.argument)

console.log(`
  the argument category is the one this increment does not build: a slot whose value is a call
  (\`filter-blur: blur(0)\`) needs the composition reshaped to \`blur(var(--jumi-filter-blur-amount))\`
  before an argument exists to animate. It is reported rather than mistyped, and the instances above
  are exactly the ones it will cover.`)

console.log(`\n  registered by the prototype:`)

for (const one of report.registered)
  console.log(
    `    ${one.name.padEnd(20)} ${one.syntax.padEnd(24)} initial ${one.identity}`,
  )

console.log(`
  a leaf is **not registered today** — only the per-instance activation names and slot keys are. A leaf
  has never needed a computed value because every read of one falls through a chain. The pivot is what
  makes a leaf need a value, so these are additions rather than rewrites.`)

/* ────────────────────────────────────────────────────────────────────────────
 * §2 Independence: does a part stop collapsing into its parent's one animation?
 * ──────────────────────────────────────────────────────────────────────────── */

header(
  '§2  independence — one animation per instance, or one per parent property?',
)

const COLLAPSING = [
  {
    component: 'animate-skew-x-[0:0deg|100:10deg]',
    label: 'skew + skew-x',
    whole: 'animate-skew-[0:0deg|100:5deg]',
  },
  {
    component: 'animate-filter-drop-shadow-blur-[0:0px|100:12px]',
    label: 'drop-shadow + blur',
    whole: 'animate-filter-drop-shadow-[0_4px_8px_red]',
  },
]

const slotsOf = css => [
  ...new Set(
    [...css.matchAll(/animation:\s*([^;}]+)/g)]
      .flatMap(match => [
        ...match[1].matchAll(/--jumi-slot-([\w-]+?)(?:,|\))/g),
      ])
      .map(match => match[1]),
  ),
]

for (const one of COLLAPSING) {
  const today = await sheetFor([one.whole, one.component])
  const prototype = typedLeaves(today).css

  console.log(`  ${one.label}`)
  console.log(
    `    today      ${slotsOf(today).length} animation(s)   ${slotsOf(today).join(', ')}`,
  )
  console.log(`    prototype  ${slotsOf(prototype).join(', ')}`)
  console.log()
}

console.log(`
  the collapse is not something the prototype introduces or removes: it happens **upstream**, in how a
  candidate addresses the model. \`animate-skew\` and \`animate-skew-x\` are both *parts of \`transform\`*,
  not a property and its part, so both resolve the one shared \`transform\` slot. Making them independent
  is therefore not a finalizer change at all — it is a change to how a part motion is keyed, and the
  prototype cannot demonstrate it without changing \`computeSlots()\`, which this increment deliberately
  does not.`)

/* ────────────────────────────────────────────────────────────────────────────
 * §3 Ownership, in both discovery orders.
 * ──────────────────────────────────────────────────────────────────────────── */

const OWNERSHIP = ['animate-scale-[0:1|100:2]', 'animate-scale-x-[0:1|100:5]']
const REVERSED = [...OWNERSHIP].reverse()

const sheets = {
  'prototype  · reversed': await prototypeOf(REVERSED),
  'prototype  · whole first': await prototypeOf(OWNERSHIP),
  'today      · reversed': await sheetFor(REVERSED),
  'today      · whole first': await sheetFor(OWNERSHIP),
}

/** The aggregate list each sheet resolves to, which is the thing that must not depend on the input. */
const listOf = css =>
  css
    .match(/^\s*animation:\s*([^;}]+)/m)?.[1]
    ?.replace(/var\(--jumi-slot-([\w-]+?), none\)/g, '$1')
    .replace(/\s+/g, ' ')

header('§3  whole-before-constituent ownership, and whether the order survives')

const browser = await chromium.launch()

for (const [label, css] of Object.entries(sheets)) {
  const page = await browser.newPage()

  await page.setContent(
    `<style>${css}</style><div id="a" class="${OWNERSHIP.join(' ')}"></div>`,
  )

  const read = await page.evaluate(() => {
    const node = document.getElementById('a')
    const out = {}

    // Inline, and deterministic: the carrier sets duration through a var chain, and an inline
    // declaration outranks it, so the value is read at an exact time rather than whenever the sampler
    // arrived.
    node.style.animationDuration = '1s'
    node.style.animationFillMode = 'both'
    node.style.animationPlayState = 'paused'

    for (const at of [0, -1000]) {
      node.style.animationDelay = `${at}ms`
      out[at] = getComputedStyle(node).scale
    }

    return out
  })

  console.log(`  ${label}`)
  console.log(`    the list    ${listOf(css)}`)
  console.log(`    scale       0% ${read['0']}   100% ${read['-1000']}\n`)

  await page.close()
}

console.log(`
  the whole motion is scale: 1 1 1 → 2 2 2   (it owns x, y and z)
  the constituent is scale-x: 1 → 5         (it owns x alone)
  so the component owning x while the whole keeps y and z is \`5 2 2\` at 100%.`)

/* ────────────────────────────────────────────────────────────────────────────
 * §4 Does the rest of the surface survive untouched?
 * ──────────────────────────────────────────────────────────────────────────── */

header('§4  named motions, independent duration, and reduced motion')

const NAMING = [
  'animate-scale-[0:1|100:2]/reveal',
  'animate-scale-x-[0:1|100:5]',
  'animation-duration-500',
  'animation-duration-2000/reveal',
]

const naming = {
  prototype: await prototypeOf(NAMING),
  today: await sheetFor(NAMING),
}

for (const [label, css] of Object.entries(naming)) {
  const page = await browser.newPage()

  await page.setContent(
    `<style>${css}</style>
     <div id="a" class="${NAMING.join(' ')}"></div>
     <div id="b" class="${NAMING.join(' ')}" style="animation-duration:1s"></div>`,
  )

  const durations = await page.evaluate(() =>
    ['a', 'b'].map(id => {
      const style = getComputedStyle(document.getElementById(id))

      return style.animationDuration
    }),
  )

  console.log(
    `  ${label.padEnd(12)} animation-duration on the element   ${durations[0]}`,
  )
  console.log(
    `  ${''.padEnd(12)} with an inline 1s                 ${durations[1]}`,
  )
  console.log(
    `  ${''.padEnd(12)} the named motion is in the list     ${
      /jumi-scale-[\w]+/g.test(css) && listOf(css)?.includes('scale')
        ? 'yes'
        : 'no'
    }\n`,
  )

  await page.close()
}

console.log(`
  none of these values is computed by the prototype. The chains that carry them are the ones the
  shipping finalizer wrote, and the prototype only reorders the lists those chains are entered from —
  which is why the test is whether they still work, not whether they were rebuilt.`)

await browser.close()
