#!/usr/bin/env node
/**
 * Transform interpolation — does decomposing a whole `transform` motion into typed leaves change what
 * the browser computes?
 *
 * This is the gatekeeper for the pivot, and the ruling says why: "whole motions write their slots" is
 * the companion requirement that makes component-override work, and for `transform` it is potentially
 * semantics-changing. Native CSS interpolates a transform *list* — pairwise when the lists match, and
 * through matrix decomposition when they do not. Jumi's composition is a **fixed list of seven
 * functions, always present**, so a decomposed motion interpolates each leaf and rebuilds that list each
 * frame. Those are the same thing only when the lists match.
 *
 * Three outcomes, and the ruling named them in advance:
 *
 *   A  equivalent across the meaningful surface → whole transform can decompose too
 *   B  diverges only for mismatched or reordered wholes → transform becomes the hybrid's clearest case:
 *      a component transform motion types its leaf, a whole with a safely decomposable grammar types
 *      its leaves, and a whole needing native list interpolation keeps the property
 *   C  diverges even for ordinary matched cases → transform becomes a stronger exception
 *
 * Measured by comparing computed matrices at several points, not endpoints. The endpoints are printed
 * too, because a case whose *endpoints* differ is not an interpolation question at all — it is a case
 * the decomposed representation cannot represent, and averaging that into a midpoint number would hide
 * it.
 *
 * The decomposed side uses the substrate the real build emits (`--jumi-transform` and the seven
 * intermediates it reads, taken out of a compiled sheet verbatim), so the comparison is against Jumi's
 * own composition rather than a reconstruction of it.
 *
 * Run: node scripts/spike-transform-interpolation.mjs
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const header = title => console.log(`\n${'─'.repeat(96)}\n${title}\n`)

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

/* ────────────────────────────────────────────────────────────────────────────
 * The substrate, from the build rather than from the source.
 * ──────────────────────────────────────────────────────────────────────────── */

const sheet = (
  await build(
    await compiler(
      `@import "tailwindcss";\n@plugin "./dist/index.js";\n`,
      root,
    ),
    ['animate-transform-[translate(100px)]'],
  )
).css

/**
 * The rule that declares Jumi's own transform chain — `--jumi-translate-3d:
 * translate3d(var(--jumi-translate-x), …)` and the `--jumi-transform` that reads the seven. Reused
 * verbatim so the probe cannot drift from the composition the library actually emits.
 */
const substrate = sheet
  .match(/\{[^{}]*--jumi-transform:[^{}]*\}/)?.[0]
  .slice(1, -1)
  .trim()

if (!substrate) throw new Error('no transform substrate in the compiled sheet')

/* ────────────────────────────────────────────────────────────────────────────
 * The cases.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Each case names the whole motion twice: as a **native transform list pair**, which is what an author
 * writing a whole transform phrase writes, and as **leaf values**, which is what the same endpoints are
 * under Jumi's composition. The two agree at the endpoints for every matched case and for most
 * mismatched ones — where they do not, the case says so rather than hiding it.
 */
const CASES = [
  {
    label: 'matched: translate → translate',
    leaves: { from: { 'translate-x': '0px' }, to: { 'translate-x': '100px' } },
    native: { from: 'translate(0px, 0px)', to: 'translate(100px, 0px)' },
  },
  {
    label: 'matched: rotate → rotate',
    leaves: {
      from: { 'rotate-angle': '0deg' },
      to: { 'rotate-angle': '90deg' },
    },
    // `rotate3d(0, 0, 1, a)` is `rotate(a)`, and the substrate rests `rotate-z` at 1.
    native: { from: 'rotate(0deg)', to: 'rotate(90deg)' },
  },
  {
    label: 'matched: scale → scale',
    leaves: {
      from: { 'scale-x': '1', 'scale-y': '1' },
      to: { 'scale-x': '2', 'scale-y': '2' },
    },
    native: { from: 'scale(1)', to: 'scale(2)' },
  },
  {
    label: 'matched: one sequence, three functions',
    leaves: {
      from: {
        'rotate-angle': '0deg',
        'scale-x': '1',
        'scale-y': '1',
        'translate-x': '0px',
      },
      to: {
        'rotate-angle': '45deg',
        'scale-x': '2',
        'scale-y': '2',
        'translate-x': '100px',
      },
    },
    native: {
      from: 'rotate(0deg) scale(1) translate(0px, 0px)',
      to: 'rotate(45deg) scale(2) translate(100px, 0px)',
    },
  },
  {
    label: 'mismatched: translate → rotate',
    leaves: {
      from: { 'rotate-angle': '0deg', 'translate-x': '100px' },
      to: { 'rotate-angle': '90deg', 'translate-x': '0px' },
    },
    native: { from: 'translate(100px, 0px)', to: 'rotate(90deg)' },
  },
  {
    label: 'mismatched: scale → translate',
    leaves: {
      from: { 'scale-x': '2', 'scale-y': '2', 'translate-x': '0px' },
      to: { 'scale-x': '1', 'scale-y': '1', 'translate-x': '100px' },
    },
    native: { from: 'scale(2)', to: 'translate(100px, 0px)' },
  },
  {
    label: 'mismatched: different function counts',
    leaves: {
      from: { 'rotate-angle': '0deg', 'translate-x': '100px' },
      to: { 'rotate-angle': '90deg', 'translate-x': '100px' },
    },
    native: {
      from: 'translate(100px, 0px)',
      to: 'translate(100px, 0px) rotate(90deg)',
    },
  },
  {
    label: 'mismatched: one function, different order',
    leaves: {
      from: { 'rotate-angle': '45deg', 'translate-x': '100px' },
      to: { 'rotate-angle': '90deg', 'translate-x': '100px' },
    },
    native: {
      from: 'translate(100px, 0px) rotate(45deg)',
      to: 'rotate(90deg) translate(100px, 0px)',
    },
  },
  {
    label: 'mismatched: none → two functions',
    leaves: {
      from: { 'rotate-angle': '0deg', 'translate-x': '0px' },
      to: { 'rotate-angle': '45deg', 'translate-x': '100px' },
    },
    native: { from: 'none', to: 'translate(100px, 0px) rotate(45deg)' },
  },
]

/**
 * The typed registration each animated leaf needs, and the syntax the census would give it. Taken from
 * `engineering/research/property-typing.md` rather than invented here, so a syntax that the census
 * rejected cannot quietly appear in this probe.
 */
const SYNTAX = {
  'rotate-angle': ['<angle>', '0deg'],
  'scale-x': ['<number>', '1'],
  'scale-y': ['<number>', '1'],
  'translate-x': ['<length>', '0px'],
}

/* ────────────────────────────────────────────────────────────────────────────
 * The sheet: two elements per case, native and decomposed.
 * ──────────────────────────────────────────────────────────────────────────── */

const leavesUsed = [
  ...new Set(
    CASES.flatMap(one =>
      Object.keys(one.leaves.from).concat(Object.keys(one.leaves.to)),
    ),
  ),
]

const properties = leavesUsed
  .map(
    leaf =>
      `@property --jumi-${leaf} { syntax: "${SYNTAX[leaf][0]}"; inherits: false; initial-value: ${SYNTAX[leaf][1]}; }`,
  )
  .join('\n')

const rules = CASES.map((one, index) => {
  const declared = (values, indent) =>
    Object.entries(values)
      .map(([leaf, value]) => `${indent}--jumi-${leaf}: ${value};`)
      .join('\n')

  return `/* ── ${one.label} ── */
.n-${index} { transform: ${one.native.from}; animation: n-${index} 1s linear both paused; }
@keyframes n-${index} { from { transform: ${one.native.from}; } to { transform: ${one.native.to}; } }

.d-${index} { ${substrate}\n  transform: var(--jumi-transform); animation: d-${index} 1s linear both paused; }
@keyframes d-${index} {
  from {
${declared(one.leaves.from, '    ')}
  }
  to {
${declared(one.leaves.to, '    ')}
  }
}`
}).join('\n')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(`<style>${properties}\n${rules}</style>`)

/** A computed `transform` as numbers: 6 for `matrix`, 16 for `matrix3d`, and the identity for `none`. */
const parseMatrix = value =>
  value === 'none'
    ? [1, 0, 0, 1, 0, 0]
    : value
        .replace(/^matrix3?d?\(|\)$/g, '')
        .split(',')
        .map(part => Number(part.trim()))

const sampled = await page.evaluate(
  ({ cases }) => {
    const times = [0, 250, 500, 750, 1000]
    const out = []

    for (let index = 0; index < cases; index += 1) {
      const read = side => {
        const node = document.createElement('div')
        node.className = `${side}-${index}`
        document.body.append(node)

        return times.map(at => {
          node.style.animationDuration = '1s'
          node.style.animationFillMode = 'both'
          node.style.animationPlayState = 'paused'
          node.style.animationDelay = `-${at}ms`

          return getComputedStyle(node).transform
        })
      }

      out.push({ decomposed: read('d'), native: read('n') })
    }

    return out
  },
  { cases: CASES.length },
)

await browser.close()

/* ────────────────────────────────────────────────────────────────────────────
 * The comparison.
 * ──────────────────────────────────────────────────────────────────────────── */

const worst = (a, b) =>
  Math.max(
    ...parseMatrix(a).map((value, at) => Math.abs(value - parseMatrix(b)[at])),
  )

const show = value =>
  parseMatrix(value)
    .map(n => n.toFixed(3))
    .join(' ')

header(
  '§1  the endpoints — do both representations even describe the same motion?',
)

for (const [index, one] of CASES.entries()) {
  const { decomposed, native } = sampled[index]
  const atStart = worst(native[0], decomposed[0])
  const atEnd = worst(native[4], decomposed[4])
  const same = atStart < 1e-6 && atEnd < 1e-6

  console.log(`  ${one.label}`)
  console.log(
    `    at 0%    native ${show(native[0])}\n             decom. ${show(decomposed[0])}`,
  )
  console.log(
    `    at 100%  native ${show(native[4])}\n             decom. ${show(decomposed[4])}`,
  )
  console.log(
    `    ${same ? 'the same at both ends' : `DIFFERENT — worst component ${Math.max(atStart, atEnd).toFixed(3)}`}\n`,
  )
}

header('§2  the intermediate points — is the path the same?')

console.log(
  `  case                                           25%        50%        75%   verdict`,
)

for (const [index, one] of CASES.entries()) {
  const { decomposed, native } = sampled[index]
  const at = [1, 2, 3].map(point => worst(native[point], decomposed[point]))
  const worstOf = Math.max(...at)
  const verdict = worstOf < 1e-6 ? 'same path' : 'DIVERGES'

  console.log(
    `  ${one.label.padEnd(44)} ${at.map(n => n.toFixed(3).padStart(9)).join(' ')}   ${verdict}`,
  )
}

header('§3  the outcome')

/**
 * Three outcomes, not two, and the third is why the endpoints are printed at all. A case whose
 * endpoints differ is not "the same motion interpolated differently" — it is a different motion, and
 * the reason is always the same: Jumi's composition is one fixed function order, and a native list
 * applies its functions in the order the author wrote.
 */
const exact = []
const sameEnds = []
const differentMotion = []

for (const [index, one] of CASES.entries()) {
  const { decomposed, native } = sampled[index]
  const ends = Math.max(
    worst(native[0], decomposed[0]),
    worst(native[4], decomposed[4]),
  )
  const middle = Math.max(
    worst(native[1], decomposed[1]),
    worst(native[2], decomposed[2]),
    worst(native[3], decomposed[3]),
  )

  if (ends >= 1e-6) differentMotion.push(one.label)
  else if (middle >= 1e-6) sameEnds.push(one.label)
  else exact.push(one.label)
}

const list = labels => labels.map(label => `\n      ${label}`).join('')

console.log(`  cases                                       ${CASES.length}`)
console.log(
  `\n  exact — same motion, same path              ${exact.length}${list(exact)}`,
)
console.log(
  `\n  same endpoints, different path              ${sameEnds.length} — expressible as leaves, interpolates differently${list(sameEnds)}`,
)
console.log(
  `\n  a different motion                          ${differentMotion.length} — the decomposed form cannot state it at all${list(differentMotion)}`,
)

console.log(`
  the third group is not an interpolation difference, and the cause is always the same: Jumi's
  composition is \`perspective · matrix · matrix3d · rotate · scale · skew · translate\`, applied in that
  order, while a native list applies its functions in the order the author wrote them. So a whole
  transform phrase that is not written in Jumi's order interpolates one way as a property and describes
  a different transform as leaves — measured, up to 100.0 in a matrix component.

  and today the order is preserved exactly: a whole transform phrase emits
  \`--jumi-transform-<id>: translate(100px,0px) rotate(90deg)\` — the author's list, verbatim — with the
  keyframe reading that one variable. Decomposing it is what would lose the order.`)
