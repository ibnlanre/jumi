import { chromium } from 'playwright'

import { compiler, finalizeCss, root } from '../lib/compile.mjs'

/**
 * D.3 · reach — the eligibility gate, measured in the browser.
 *
 * D.3 asks how much of the constituent surface can move onto value-free per-leaf typed execution. The
 * census enumerates the surface; one split of it is not a fact about the declaration at all, because it
 * is a fact about what the browser does with it:
 *
 *   A leaf can be registered typed only if the value it RESTS at survives the syntax that leaf would
 *   register. If it does not, the declaration carrying the resting value is invalid under the
 *   registration, and the property falls to the registration's initial value on every element that
 *   never asked for a motion.
 *
 * So the reading is the **property's computed value at rest**, taken twice: with the leaf registered
 * typed, and without.
 *
 * What that reading is, and what it is not — both halves matter, and the first draft got the second
 * wrong:
 *
 *   registration-unsafe at rest   sufficient to keep the leaf on the property/native path
 *   registration-safe at rest     ELIGIBLE for the next test, and not typed
 *
 * Preserving the rest is an **eligibility gate**, not proof that the leaf can own interpolation. It says
 * nothing yet about every authored spelling, or about whether an animation through the typed
 * representation agrees with native interpolation. That is a second, separate differential —
 * `native property interpolation` against `typed-leaf interpolation`, for representative authored
 * values — and until both stages hold the honest verdict is `movable`, which nothing here claims.
 *
 * Two things about the fixture are load-bearing, and both were learned by getting them wrong first:
 *
 *   - The element animates a **sibling** component, not the leaf under test. Animating the leaf puts the
 *     animated value in front of the resting one, so both readings come back identical and the gate is
 *     never exercised — measured: all five arms read `registration-safe`, including three that plainly
 *     are not.
 *   - It reads the **property**, not the leaf's custom property. `background-position-x` resting at
 *     `left` and at `0%` are the same rendering, and only the property says so; the custom property
 *     reports a difference no author can see. That is the difference between a registration that is
 *     *invalid* and one that is merely *respellable*.
 *
 * The set is the **decisive** one rather than a sample: each entry is a resting value whose shape
 * suggests it cannot move (`normal`, `auto`, `medium`, `left`) or a control that plainly can (`0px`).
 * A criterion that restated the shape of the text would sort every one of them the same way.
 *
 * Run: `pnpm bundle && node scripts/research/d3-reach.mjs` (exits non-zero on failure).
 */
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${root}/dist/index.js";\n`

const compile = async candidates =>
  finalizeCss((await compiler(ENTRY, root)).build(candidates)).css

const ARMS = [
  {
    expectation: 'unsafe',
    leaf: 'column-gap',
    parent: 'gap',
    property: 'gap',
    registration: { initial: '0px', syntax: '<length>' },
    sibling: 'row-gap',
  },
  {
    expectation: 'unsafe',
    leaf: 'aspect-ratio-width',
    parent: 'aspect-ratio',
    property: 'aspect-ratio',
    registration: { initial: '1', syntax: '<number>' },
    sibling: 'aspect-ratio-height',
  },
  {
    expectation: 'unsafe',
    leaf: 'background-size-width',
    parent: 'background-size',
    property: 'background-size',
    registration: { initial: '0px', syntax: '<length>' },
    sibling: 'background-size-height',
  },
  {
    expectation: 'unsafe',
    leaf: 'border-bottom-width',
    parent: 'border-bottom',
    property: 'border-bottom-width',
    registration: { initial: '0px', syntax: '<length>' },
    sibling: 'border-bottom-color',
    // Kept as a **negative** arm rather than a verdict: a a `border-*-width` resting at `medium`
    // computes to `0px` while the family's style is `none`, and the shorthand resolves all three slots
    // together, so animating a sibling leaves the style slot resting at `none` and the width stays
    // invisible. It read `0px -> 0px` — an arm that was never exercised, looking exactly like a gate
    // that holds. An arm has to be able to *see* the resting value before it can decide anything about
    // it, so this one is reported as `not exercised` and excluded from the verdict.
    undecidable: true,
  },
  {
    // The arm that stops the gate being a restatement of the text. `left` is a keyword, so the *shape*
    // says "unsafe" — and it is also exactly `0%`, so a registration accepting `0%` leaves the resting
    // rendering identical. Shape and behaviour disagree here by construction.
    expectation: 'safe',
    leaf: 'background-position-x-edge',
    parent: 'background-position-x',
    property: 'background-position-x',
    registration: { initial: '0%', syntax: '<length-percentage>' },
    sibling: 'background-position-x-offset',
  },
  {
    expectation: 'safe',
    leaf: 'translate-x',
    parent: 'translate',
    property: 'translate',
    registration: { initial: '0px', syntax: '<length-percentage>' },
    sibling: 'translate-y',
  },
]

const browser = await chromium.launch()
const failures = []
const undecided = ARMS.filter(arm => arm.undecidable).length

for (const arm of ARMS) {
  const classes = `animate-${arm.sibling}-[0:0|100:1]`
  const css = await compile([classes])

  const registration = `@property --jumi-${arm.leaf} {
    syntax: "${arm.registration.syntax}";
    inherits: false;
    initial-value: ${arm.registration.initial};
  }`

  const page = await browser.newPage()

  const read = async sheet =>
    page.evaluate(
      async ({ classes: klass, nodeStyle, property, sheet: style }) => {
        const node = document.createElement('div')
        node.id = 'e'
        node.className = klass
        if (nodeStyle) node.setAttribute('style', nodeStyle)
        const tag = document.createElement('style')
        tag.textContent = style
        document.head.appendChild(tag)
        document.body.appendChild(node)

        await new Promise(resolve => requestAnimationFrame(resolve))

        const computed = getComputedStyle(node)
        const value =
          computed.getPropertyValue(property) || computed[property] || ''

        node.remove()
        tag.remove()

        return value.trim()
      },
      { classes, nodeStyle: arm.style, property: arm.property, sheet },
    )

  const without = await read(css)
  const registered = await read(`${registration}\n${css}`)

  await page.close()

  // Reported, never counted: a reading that cannot see the resting value is not evidence either way.
  if (arm.undecidable) {
    console.log(
      `skip ${arm.leaf.padEnd(26)} ${arm.property.padEnd(22)} ${without.padEnd(14)} -> ${registered.padEnd(14)} not exercised`,
    )

    continue
  }

  const safe = without === registered
  const ok = arm.expectation === 'safe' ? safe : !safe

  if (!ok)
    failures.push(
      `${arm.leaf}: expected ${arm.expectation}, read ${JSON.stringify(without)} -> ${JSON.stringify(registered)}`,
    )

  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${arm.leaf.padEnd(26)} ${arm.property.padEnd(22)} ${without.padEnd(14)} -> ${registered.padEnd(14)} ${safe ? 'registration-safe at rest' : 'registration-unsafe at rest'}`,
  )
}

await browser.close()

if (failures.length) {
  console.error(
    `\n✗ ${failures.length} of ${ARMS.length - undecided} arms disagree:\n`,
  )
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  `\n✓ ${ARMS.length - undecided} arms hold, ${undecided} not exercised\n` +
    '  The verdict is **registration-safe at rest**, which is an eligibility gate. It is not proof\n' +
    '  that the leaf can own interpolation: that needs the second differential, native against\n' +
    '  typed-leaf, for representative authored values. Nothing here claims `movable`.\n',
)
