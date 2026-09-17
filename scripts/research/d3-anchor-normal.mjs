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
    label: 'offset leaves move under directional edges',
    // Static keywords, registered offsets: the four-value form is valid precisely because these edges are
    // directional, which is what the resting `center` cannot be.
    compose: 'left var(--ox) top var(--oy)',
    leaves: [
      ['--ox', '10px', '30px'],
      ['--oy', '20px', '40px'],
    ],
    native: ['left 10px top 20px', 'left 30px top 40px'],
  },
  {
    label: 'edge leaf moves on its own',
    // An edge is a keyword, so it cannot be registered: this arm exists to show what that costs.
    compose: 'var(--ex) 10px top 20px',
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
  return page.evaluate(async ({ at, property }) => {
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
  }, { at: WALL, property })
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
      class: group.label,
      authoredFrom: from,
      authoredTo: to,
      computedFrom,
      computedTo,
      nativeKind: nativeDistinct <= 2 ? 'discrete' : 'interpolated',
      nativeSeries,
      representable,
      representedSeries,
      equivalent,
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
    kind: distinct <= 2 ? 'discrete' : 'interpolated',
    nativeSeries,
    series,
    equal: series.join('|') === nativeSeries.join('|'),
  })
}

console.log('native `offset-anchor` vs two registered <length-percentage> leaves\n')

for (const one of results) {
  console.log(`── ${one.class}:  ${one.authoredFrom}  →  ${one.authoredTo}`)
  console.log(`   computed     ${one.computedFrom}  →  ${one.computedTo}`)
  console.log(`   native       ${one.nativeSeries.join(' · ')}   (${one.nativeKind})`)
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
  console.log(`   leaves       ${one.leaves.map(([name, from, to]) => `${name} ${from} → ${to}`).join(', ')}`)
  console.log(`   series       ${one.series.join(' · ')}   (${one.kind})`)
  console.log(`   native       ${one.nativeSeries.join(' · ')}`)
  console.log(`   equal        ${one.equal ? 'yes' : 'no'}`)
  console.log()
}

const byClass = new Map()

for (const one of results)
  byClass.set(one.class, [
    ...(byClass.get(one.class) ?? []),
    one.equivalent ? 'equivalent' : one.nativeKind === 'discrete' ? 'discrete natively' : 'differs',
  ])

console.log('the class table:')
for (const [label, outcomes] of byClass)
  console.log(`  ${label.padEnd(26)} ${outcomes.join(', ')}`)

console.log()

for (const one of controls)
  console.log(
    `  ${one.label.padEnd(40)} ${one.equal ? 'preserves native motion' : 'does not reproduce native motion'} (${one.kind})`,
  )

if (failures.length) {
  console.log('\n✗ arm defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-normalization.json'),
  `${JSON.stringify(
    {
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
