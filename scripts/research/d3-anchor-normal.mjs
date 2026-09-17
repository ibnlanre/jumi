import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import path from 'node:path'

/**
 * D.3.7 · `offset-anchor` — can every intended form be reduced to two `<length-percentage>` leaves?
 *
 * The previous pass settled that the *subject* is two resolved positional components for the forms it tested.
 * It did **not** settle that the representation is two `<length-percentage>` leaves, and the difference is the
 * whole of this pass: a form that only becomes meaningful after custom-property substitution, or whose
 * arithmetic cannot be written down statically, may force a richer representation or a declined path.
 *
 * So the question here is normalizability, not implementation, and it is asked mechanically rather than by
 * hand-deriving spellings. For every arm:
 *
 *   authored from → to          what an author writes
 *   computed from → to          what the browser reports for each of them, at rest
 *   native series               the authored pair animated natively (hand-written, no Jumi)
 *   represented series          two registered `<length-percentage>` leaves animated between those **computed**
 *                               values, composed statically as `offset-anchor: var(--x) var(--y)`
 *   equivalent                  the two series are equal
 *
 * Deriving nothing by hand is the point. If the representation is expressible as two leaves, then animating
 * the leaves between the computed endpoints reproduces the native motion; if a class cannot, the mismatch shows
 * up as a series difference rather than as a judgement call. A native arm that is **discrete** is not a
 * failure of the representation — it says the browser does not interpolate that authored pair at all, which is
 * its own answer and is recorded as such.
 *
 * The second question is separate and is asked in section B: whether the current **edge** and **offset**
 * utilities can remain independently meaningful once both feed one resolved axis. Two arms, because they have
 * different answers by construction — an offset is a value and can be registered, an edge keyword is not a
 * value at all.
 *
 * Section C pins the one arm the previous pass could not account for: `top 20px → bottom 10px` was discrete
 * while its x-axis twin interpolated, and both compute to the same shape of pair. The question is whether that
 * is an **axis** asymmetry or an **ambiguous short spelling** — `top 20px` alone leaves the other axis implicit
 * at `center` — and the two are told apart by running each transition twice, once in the four-value form with
 * the other axis explicit and directional, and once in the already-resolved spelling. Each arm therefore gets a
 * twin, so "the authored grammar is discrete while the representation is not" is distinguishable from "this
 * pair does not interpolate at all".
 *
 * Run: `pnpm research:d3-anchor-normal`.
 */
const DURATION = 1000
const WALL = [0, 250, 500, 750, 1000]

/** The four classes the ruling named, with the forms this pass can actually write. */
const CLASSES = [
  {
    arms: [
      ['50% 50%', '20% 80%'],
      ['10px 20px', '30px 40px'],
    ],
    label: 'directly resolved',
  },
  {
    arms: [
      ['left 10px', 'right 10px'],
      ['left 10%', 'right 25%'],
      ['top 20px', 'bottom 10px'],
      ['center', '20% 80%'],
    ],
    label: 'physical edge-relative',
  },
  {
    arms: [
      ['calc(50% + 10px) calc(25% - 4px)', 'calc(20% + 2px) calc(80% + 8px)'],
      ['var(--ax) var(--ay)', 'var(--bx) var(--by)'],
    ],
    label: 'arithmetic / unresolved',
  },
  {
    arms: [
      ['start top', 'end bottom'],
      ['inline-start', 'inline-end'],
    ],
    label: 'logical / grammar-sensitive',
  },
]

/** Section B: the existing constituents, and which of them can still move on their own. */
const CONTROL = [
  {
    // Static keywords, registered offsets: the four-value form is valid precisely because these edges are
    // directional, which is what the resting `center` cannot be.
    compose: 'left var(--ox) top var(--oy)',
    label: 'offset leaves move under directional edges',
    leaves: [
      ['--ox', '10px', '30px'],
      ['--oy', '20px', '40px'],
    ],
    native: ['left 10px top 20px', 'left 30px top 40px'],
  },
  {
    // An edge is a keyword, so it cannot be registered: this arm exists to show what that costs.
    compose: 'var(--ex) 10px top 20px',
    label: 'edge leaf moves on its own',
    leaves: [['--ex', 'left', 'right']],
    native: ['left 10px top 20px', 'right 10px top 20px'],
  },
]

const browser = await chromium.launch()
const page = await browser.newPage()

const LINEAR = '#e { animation-timing-function: linear; }'

/**
 * A position split into its components, at **top-level** spaces only.
 *
 * Splitting on every space was this book's own first defect: `calc(50% + 10px)` became `calc(50%` and `+`, the
 * leaf registration then had an initial value the syntax rejects, and every `calc()` arm read `auto` — which
 * looks exactly like a finding that the representation cannot carry arithmetic, and said nothing of the kind.
 */
const splitPosition = value => {
  const parts = []
  let depth = 0
  let part = ''

  for (const char of value) {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1

    if (char === ' ' && depth === 0) {
      if (part) parts.push(part)

      part = ''

      continue
    }

    part += char
  }

  if (part) parts.push(part)

  return parts
}

/** What one authored value computes to with nothing moving. */
const resting = async (value, defines = '') => {
  await page.setContent(
    `<style>${defines}\n#e { offset-anchor: ${value}; }</style><div id="e">x</div>`,
  )

  return page.evaluate(() =>
    getComputedStyle(document.querySelector('#e'))
      .getPropertyValue('offset-anchor')
      .trim(),
  )
}

/** The property's computed value at each instant of a held wall, over hand-written native keyframes. */
const native = async (from, to, defines = '') => {
  await page.setContent(
    `<style>
      ${defines}
      @keyframes native { from { offset-anchor: ${from}; } to { offset-anchor: ${to}; } }
      #e { animation: native 1000ms linear both; }
    </style><div id="e">x</div>`,
  )

  return read('offset-anchor')
}

/**
 * The candidate representation: registered `<length-percentage>` leaves, composed statically.
 *
 * The composition is static text the element carries, and the animation moves only the leaves — which is the
 * shape D.3.6 proved for a function argument, one property further out.
 */
const represented = async (pairs, compose) => {
  const registration = (name, syntax, initial) =>
    `@property ${name} { syntax: '${syntax}'; inherits: false; initial-value: ${initial}; }`

  const definitions = pairs
    .map(([name, from, to, syntax = '<length-percentage>']) => {
      const initial =
        syntax === '<length-percentage>'
          ? from
          : syntax === '<length>'
            ? '0px'
            : from

      return (
        `${registration(name, syntax, initial)}\n` +
        `@keyframes move-${name.slice(2)} { from { ${name}: ${from}; } to { ${name}: ${to}; } }`
      )
    })
    .join('\n')

  const animations = pairs
    .map(([name]) => `move-${name.slice(2)} 1000ms linear both`)
    .join(', ')

  await page.setContent(
    `<style>
      ${definitions}
      #e { offset-anchor: ${compose}; animation: ${animations}; }
    </style><div id="e">x</div>`,
  )

  return read('offset-anchor')
}

/** One reading per instant of the wall, animations paused and stepped. */
const read = async property => {
  return page.evaluate(
    async ({ at, property }) => {
      const node = document.querySelector('#e')
      const animations = node.getAnimations()

      animations.forEach(animation => animation.pause())

      const values = []

      for (const instant of at) {
        animations.forEach(animation => {
          animation.currentTime = instant
        })

        await new Promise(resolve => requestAnimationFrame(resolve))
        values.push(getComputedStyle(node).getPropertyValue(property).trim())
      }

      return values
    },
    { at: WALL, property },
  )
}

const results = []
const failures = []

for (const group of CLASSES) {
  for (const [from, to] of group.arms) {
    // A definition the authored value needs in order to mean anything, written once and shared by every arm
    // that reads this form: a `var()` is unresolved without it, at rest as well as in motion.
    const defines = `:root { --ax: 30%; --ay: 20%; --bx: 70%; --by: 60%; }`

    const [computedFrom, computedTo] = [
      await resting(from, defines),
      await resting(to, defines),
    ]

    const nativeSeries = await native(from, to, defines)
    const nativeDistinct = new Set(nativeSeries).size

    const [fromX, fromY = ''] = splitPosition(computedFrom)
    const [toX, toY = ''] = splitPosition(computedTo)

    // A value the browser reports as `auto` has no resolved spelling to animate between, and inventing one
    // would be measuring the fixture. Recorded as such rather than tested.
    const representable = fromY !== '' && toY !== ''

    const representedSeries = representable
      ? await represented(
          [
            ['--x', fromX, toX],
            ['--y', fromY, toY],
          ],
          'var(--x) var(--y)',
        )
      : []

    const equivalent =
      representable &&
      nativeSeries.join('|') === representedSeries.join('|') &&
      nativeDistinct > 2

    results.push({
      authoredFrom: from,
      authoredTo: to,
      class: group.label,
      computedFrom,
      computedTo,
      equivalent,
      nativeKind: nativeDistinct <= 2 ? 'discrete' : 'interpolated',
      nativeSeries,
      representable,
      representedSeries,
    })

    // The fixture has to be able to see something before equality means anything: a computed form the reader
    // cannot read, or two arms that agree for every candidate, would report normalizability it never tested.
    if (computedFrom === '' || computedTo === '')
      failures.push(
        `${group.label}: \`${from}\` → \`${to}\` computes to nothing, so the arm measured the fixture`,
      )
  }
}

const controls = []

for (const arm of CONTROL) {
  const pairs = arm.leaves.map(([name, from, to]) => {
    // An edge keyword is not a value of any syntax, so it is left unregistered on purpose: that is what the
    // arm is asking about.
    const isKeyword = /^[a-z-]+$/.test(from)

    return isKeyword ? [name, from, to] : [name, from, to, '<length>']
  })

  const series = await represented(pairs, arm.compose)
  const nativeSeries = await native(arm.native[0], arm.native[1])
  const distinct = new Set(series).size

  controls.push({
    ...arm,
    equal: series.join('|') === nativeSeries.join('|'),
    kind: distinct <= 2 ? 'discrete' : 'interpolated',
    nativeSeries,
    series,
  })
}

console.log(
  'native `offset-anchor` vs two registered <length-percentage> leaves\n',
)

for (const one of results) {
  console.log(`── ${one.class}:  ${one.authoredFrom}  →  ${one.authoredTo}`)
  console.log(`   computed     ${one.computedFrom}  →  ${one.computedTo}`)
  console.log(
    `   native       ${one.nativeSeries.join(' · ')}   (${one.nativeKind})`,
  )
  console.log(
    `   represented  ${one.representable ? one.representedSeries.join(' · ') : 'not attempted — the computed form is not a position'}`,
  )
  console.log(
    `   equivalent   ${one.equivalent ? 'yes' : 'no'}${one.nativeKind === 'discrete' ? ' — the browser does not interpolate this pair natively' : ''}`,
  )
  console.log()
}

console.log('independent constituent control:\n')

for (const one of controls) {
  console.log(`── ${one.label}`)
  console.log(`   composed     offset-anchor: ${one.compose}`)
  console.log(
    `   leaves       ${one.leaves.map(([name, from, to]) => `${name} ${from} → ${to}`).join(', ')}`,
  )
  console.log(`   series       ${one.series.join(' · ')}   (${one.kind})`)
  console.log(`   native       ${one.nativeSeries.join(' · ')}`)
  console.log(`   equal        ${one.equal ? 'yes' : 'no'}`)
  console.log()
}

const byClass = new Map()

for (const one of results)
  byClass.set(one.class, [
    ...(byClass.get(one.class) ?? []),
    one.equivalent
      ? 'equivalent'
      : one.nativeKind === 'discrete'
        ? 'discrete natively'
        : 'differs',
  ])

console.log('the class table:')
for (const [label, outcomes] of byClass)
  console.log(`  ${label.padEnd(26)} ${outcomes.join(', ')}`)

console.log()

for (const one of controls)
  console.log(
    `  ${one.label.padEnd(40)} ${one.equal ? 'preserves native motion' : 'does not reproduce native motion'} (${one.kind})`,
  )

/**
 * Section C: axis asymmetry or short-spelling ambiguity.
 *
 * Every arm states both spellings, so the pair `authored`/`resolved` is the experiment: they differ in how the
 * value is written and in nothing else, which is the same criterion the opening falsification used. The
 * previous pass could not account for `top 20px → bottom 10px` being discrete while its x-axis twin
 * interpolated, and the discriminator is whether the four-value form — both axes explicit and directional —
 * behaves differently from the short one, which leaves the other axis implicit at `center`.
 */
const AXIS = [
  {
    authored: ['left 10px top 0', 'right 10px top 0'],
    axis: 'x',
    label: 'x changes, y explicit and directional',
    resolved: ['10px 0', 'calc(100% - 10px) 0'],
  },
  {
    authored: ['left 0 top 20px', 'left 0 bottom 10px'],
    axis: 'y',
    label: 'y changes, x explicit and directional',
    resolved: ['0 20px', '0 calc(100% - 10px)'],
  },
  {
    authored: ['left 10px', 'right 10px'],
    axis: 'x',
    label: 'x changes, short spelling (y implicit at center)',
    resolved: ['10px', 'calc(100% - 10px)'],
  },
  {
    authored: ['top 20px', 'bottom 10px'],
    axis: 'y',
    label: 'y changes, short spelling (x implicit at center)',
    resolved: ['50% 20px', '50% calc(100% - 10px)'],
  },
  {
    authored: ['left 10px top 20px', 'right 10px bottom 20px'],
    axis: 'both',
    label: 'both change, explicit and directional',
    resolved: ['10px 20px', 'calc(100% - 10px) calc(100% - 20px)'],
  },
]

const axis = []

for (const arm of AXIS) {
  const authoredSeries = await native(arm.authored[0], arm.authored[1])
  const resolvedSeries = await native(arm.resolved[0], arm.resolved[1])
  const [computedFrom, computedTo] = [
    await resting(arm.authored[0]),
    await resting(arm.authored[1]),
  ]
  const authoredInterpolates = new Set(authoredSeries).size > 2
  const resolvedInterpolates = new Set(resolvedSeries).size > 2

  /**
   * The reading, as one of four outcomes rather than a score. The third is the one that would matter most for
   * the reshape: it would mean the resolved rule itself is wrong on that axis.
   */
  const reading =
    !authoredInterpolates && resolvedInterpolates
      ? 'the authored spelling is discrete while the representation is not — a grammar-level cost, not a representation one'
      : authoredInterpolates && resolvedInterpolates
        ? 'both interpolate, so the short spelling was never the issue'
        : authoredInterpolates && !resolvedInterpolates
          ? 'the representation is discrete where the authored form is not — the resolved rule is wrong'
          : 'neither interpolates, so this pair is not a motion at all'

  axis.push({
    ...arm,
    authoredInterpolates,
    authoredSeries,
    computedFrom,
    computedTo,
    reading,
    resolvedInterpolates,
    resolvedSeries,
  })
}

console.log('\nthe axis / spelling matrix:\n')

for (const one of axis) {
  console.log(`── ${one.axis} · ${one.label}`)
  console.log(`   authored     ${one.authored[0]}  →  ${one.authored[1]}`)
  console.log(`   computed     ${one.computedFrom}  →  ${one.computedTo}`)
  console.log(`   authored     ${one.authoredSeries.join(' · ')}`)
  console.log(`   resolved     ${one.resolvedSeries.join(' · ')}`)
  console.log(`   reading      ${one.reading}`)
  console.log()
}

console.log('  authored interpolates   resolved interpolates   arms')
for (const one of axis)
  console.log(
    `  ${String(one.authoredInterpolates).padEnd(23)} ${String(one.resolvedInterpolates).padEnd(22)} ${one.axis}: ${one.label}`,
  )

if (failures.length) {
  console.log('\n✗ arm defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-normalization.json'),
  `${JSON.stringify(
    {
      axis,
      classes: results,
      controls,
      source: 'D.3.7 · scripts/research/d3-anchor-normal.mjs',
    },
    null,
    2,
  )}\n`,
)

await browser.close()

if (failures.length) process.exitCode = 1
