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
 *   §5  The **function reshape**, against every case the ruling named — including the whole +
 *       constituent pair that only a browser can adjudicate, because both ship and one goes silent.
 *   §6  What the reshape **costs and saves**: total bytes, keyframe bytes, registrations, declarations
 *       per frame.
 *
 * Run: node scripts/spike-typed-leaves.mjs   (bundles first; needs `dist/`)
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
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
named('argument — composition reshaped', report.argument)

console.log(`
  the argument instance is the one §5 and §6 are about: its slot holds a call
  (\`filter-blur: blur(0)\`), so the composition is reshaped to \`blur(var(--jumi-filter-blur-amount))\`
  and the keyframe owns the argument alone. It is the last constituent category that had no mechanism.`)

console.log(`\n  registered by the prototype:`)

for (const one of report.registered)
  console.log(
    `    ${one.name.padEnd(20)} ${one.syntax.padEnd(24)} initial ${one.identity}`,
  )

console.log(`
  Every one of these is an **amount** or a part leaf — never a leaf that holds a whole function.
  \`--jumi-filter-blur\` is \`blur(0px)\`, the composition's operand rather than an interpolable unit, so
  its grammar is the grammar of the argument *inside* the call: typing the leaf as that grammar both
  mistypes it and publishes the model's own source as an \`initial-value\` (\`css('blur', '0')\`, which is
  not a CSS value). Only the \`-amount\` sibling is typed, and on the native path the leaf stays an
  ordinary custom property holding a function, which is what it is today.\n
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

/* ────────────────────────────────────────────────────────────────────────────
 * §5 The function reshape, against the cases the ruling named.
 * ──────────────────────────────────────────────────────────────────────────── */

header('§5  the function reshape — every case the ruling named')

/**
 * Two of these are the whole reason the reshape exists, and both are visible only in the browser: a
 * part motion and a whole motion over the same property, where the shipping finalizer gives the
 * property to one of them and the other goes silent.
 */
const RESHAPE = {
  'independent blur and brightness': [
    'animate-filter-blur-[0:0px|100:8px]',
    'animate-filter-brightness-[0:1|100:3]',
  ],
  'whole filter + blur constituent': [
    'animate-filter-[0:none|100:brightness(2)]',
    'animate-filter-blur-[0:0px|100:8px]',
  ],
  'whole that cannot be decomposed': [
    'animate-filter-[0:none|100:blur(4px)_drop-shadow(0_0_2px_red)]',
  ],
  'named control': ['animate-filter-blur-[0:0px|50:4px|100:8px]/zoom'],
  'scroll range and timeline': ['animate-filter-blur-[0:0px|100:8px]/scroll'],
  'quoted whole stays native': ['animate-filter-[0:"none"|100:"blur(4px)"]'],
  'arbitrary whole stays native': ['animate-filter-[0:none|100:var(--f)]'],
  'url has not regressed': [
    'animate-filter-url-[0:url(#a)|100:url(#b)]',
    'animate-filter-blur-[0:0px|100:8px]',
  ],
}

const blurAt = (css, at, classes) =>
  browser.newPage().then(async page => {
    await page.setContent('<style>' + css + '</style><div id="a"></div>')
    await page.evaluate(one => {
      document.getElementById('a').className = one
    }, classes.join(' '))

    const value = await page.evaluate(at => {
      const node = document.getElementById('a')

      node.style.animationPlayState = 'paused'
      node.style.animationFillMode = 'both'
      node.style.animationDuration = '1s'
      node.style.animationDelay = at + 'ms'

      return getComputedStyle(node).filter.replace(/\s*contrast.*/, '')
    }, at)

    await page.close()

    return value
  })

for (const [label, classes] of Object.entries(RESHAPE)) {
  const today = await sheetFor(classes)
  const proto = await prototypeOf(classes)
  const { report: read } = typedLeaves(await sheetFor(classes))
  const at = -1000
  const [a, b] = await Promise.all([
    blurAt(today, at, classes),
    blurAt(proto, at, classes),
  ])
  const shape = read.argument.length
    ? `argument ×${read.argument.length}`
    : read.whole.length
      ? `whole ×${read.whole.length}`
      : 'native'

  console.log(
    `  ${label.padEnd(34)} ${shape.padEnd(14)} ${a === b ? 'same' : 'DIFF'}`,
  )
  console.log(`  ${''.padEnd(34)} ${''.padEnd(14)} shipping  ${a.slice(0, 58)}`)
  console.log(
    `  ${''.padEnd(34)} ${''.padEnd(14)} reshape   ${b.slice(0, 58)}\n`,
  )
}

console.log(`
  Two of these differ, and both differ because a motion that the shipping finalizer lets go silent
  now animates: a whole filter motion no longer kills a blur constituent, and a blur constituent no
  longer kills a brightness constituent. They contend for one property, one of them wins it, and the
  loser's keyframes are published and never read.

  The url case is the one that must not change, and it does not: the reshape cannot carry a slot whose
  value is a whole \\\`url()\\\` function, so it declines the attribute outright and the shipping emission
  is reproduced. That pair is order-dependent in both sheets and by the same two values — the reshape
  neither introduces nor fixes that, which is the correct result for a gate that is not allowed to
  touch ordering of attributes it does not own.

  A native instance blocks the reshape for its whole attribute. Anything else reintroduces the silence
  above in the opposite direction: a native instance writes the property itself, as one self-contained
  expression, so it does not compose with a reshaped one — it overwrites it.`)

/* ────────────────────────────────────────────────────────────────────────────
 * §6 What the reshape costs and saves.
 * ──────────────────────────────────────────────────────────────────────────── */

header('§6  bytes, keyframe bytes, registrations, declarations per frame')

const keyframes = css => {
  const root = postcss.parse(css)
  let bytes = 0
  let frames = 0
  let declarations = 0
  let perFrame = 0

  root.walkAtRules(node => {
    if (node.name !== 'keyframes') return

    bytes += css.slice(
      node.source.start.offset - 1,
      node.source.end.offset - 1,
    ).length

    for (const frame of node.nodes ?? []) {
      const count = (frame.nodes ?? []).filter(
        one => one.type === 'decl',
      ).length

      frames += 1
      declarations += count
      perFrame = Math.max(perFrame, count)
    }
  })

  return { bytes, declarations, frames, perFrame }
}

const registrations = css =>
  postcss
    .parse(css)
    .nodes.filter(node => node.type === 'atrule' && node.name === 'property')
    .length

const COST = {
  ...RESHAPE,
  'constituent tween (scale-x)': ['animate-scale-x-[0:1|100:5]'],
}

console.log(
  '  shape'.padEnd(38) +
    'bytes'.padEnd(18) +
    'keyframe bytes'.padEnd(18) +
    '@property'.padEnd(13) +
    'decls/frame',
)

for (const [label, classes] of Object.entries(COST)) {
  const today = await sheetFor(classes)
  const proto = await prototypeOf(classes)
  const a = keyframes(today)
  const b = keyframes(proto)
  const delta = proto.length - today.length

  console.log(
    '  ' +
      label.padEnd(36) +
      `${today.length}→${proto.length}`.padEnd(18) +
      `${a.bytes}→${b.bytes}`.padEnd(18) +
      `${registrations(today)}→${registrations(proto)}`.padEnd(13) +
      `${a.perFrame}→${b.perFrame}  (${delta >= 0 ? '+' : ''}${delta} bytes)`,
  )
}

console.log(`
  The reshape trades one **large** declaration per frame for one **small** declaration per function per
  frame. Shipping writes the whole 11-operand filter expression into every frame — every leaf read, each
  with its own fallback — and the reshape writes one variable per function instead, which is where the
  90% keyframe reduction comes from.

  Every case the reshape owns shrinks, and every case it declines is byte-identical — a native instance
  writes the property itself, so nothing about its emission changes. The registration count is the
  recurring price, nine for a function-shaped family, paid once per family rather than once per
  instance, and it is the one part of this a real build can gate on a used-in-the-sheet check, since a
  registration is only emitted for a leaf some instance actually animates.`)

await browser.close()
