import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import path from 'node:path'

/**
 * D.3.7 · can an **edge-addressed** motion be executed as a resolved-axis animation?
 *
 * The projection concluded that an edge cannot be an independently interpolating leaf — measured, the browser
 * flips a keyword custom property while it moves an offset smoothly. That is a fact about the *execution
 * subject*, and it is not yet a fact about the *authoring surface*: `math-depth-add` taught the same distinction
 * one track earlier, where the thing an author addresses (`add(2)`) and the thing the frames animate (the
 * integer argument) were deliberately not the same.
 *
 * So this pass asks one question, in the smallest form that can answer it:
 *
 *     an author addresses an edge change        x-edge: left → right, over a static y: top 20px
 *     the execution animates the resolved axis  resolved-x: 0% → 100%, resolved-y: 20px
 *     does that reproduce the native motion     offset-anchor: left top 20px → right top 20px
 *
 * Two arms, one per axis, each with the other axis explicit — because the earlier passes established that a
 * short spelling is where this property stops meaning what it looks like. The resolved endpoints are the
 * **static keyword mapping** the normalizer already uses (`left → 0%`, `right → 100%`) applied to the edge the
 * author addressed, so the arm is measuring the mapping rather than restating it.
 *
 * If the series match, the edge candidate can remain an independently addressable **motion control** whose
 * execution subject is the resolved axis, and the API does not have to be demoted to configuration. If they do
 * not, the previous conclusion stands unchanged.
 *
 * Run: `pnpm research:d3-anchor-edge` (exits non-zero only on an arm defect).
 */
const WALL = [0, 250, 500, 750, 1000]

/**
 * The keyword mapping, measured through whole positions rather than asserted.
 *
 * A whole position that uses `left` on its x axis is what tells us `left` resolves to `0%`; the arm below then
 * animates that resolved component instead of the keyword.
 */
const MAPPING = [
  ['left top', 'x edge left, y edge top'],
  ['right bottom', 'x edge right, y edge bottom'],
  ['center center', 'both edges center'],
  ['left 0 top 20px', 'directional edges with offsets'],
  ['right 10px bottom 20px', 'the resolved pair the model composes'],
]

const ARMS = [
  {
    axis: 'x',
    intent: 'x-edge: left → right, over a static y: top 20px',
    /**
     * Spelled explicitly, and that is a correction the first run produced rather than a detail: `left top 20px`
     * — the obvious way to write "x edge with a static y of top 20px" — is **three components**, which
     * `offset-anchor` does not accept, and both endpoints compute to `auto`. The y arm's spelling was already
     * the explicit four-component form, which is why it measured and this one did not.
     */
    native: ['left 0 top 20px', 'right 0 top 20px'],
    resolved: [
      ['--x', '0%', '100%'],
      ['--y', '20px', '20px'],
    ],
  },
  {
    axis: 'y',
    intent: 'y-edge: top → bottom, over a pinned x: left 0',
    native: ['left 0 top 20px', 'left 0 bottom 10px'],
    resolved: [
      ['--x', '0px', '0px'],
      ['--y', '20px', 'calc(100% - 10px)'],
    ],
  },
]

const browser = await chromium.launch()
const page = await browser.newPage()

const resting = async value => {
  await page.setContent(
    `<style>#e { offset-anchor: ${value}; }</style><div id="e">x</div>`,
  )

  return page.evaluate(() =>
    getComputedStyle(document.querySelector('#e'))
      .getPropertyValue('offset-anchor')
      .trim(),
  )
}

const read = () =>
  page.evaluate(async at => {
    const node = document.querySelector('#e')
    const animations = node.getAnimations()

    animations.forEach(animation => animation.pause())

    const values = []

    for (const instant of at) {
      animations.forEach(animation => {
        animation.currentTime = instant
      })

      await new Promise(resolve => requestAnimationFrame(resolve))
      values.push(
        getComputedStyle(node).getPropertyValue('offset-anchor').trim(),
      )
    }

    return values
  }, WALL)

/** The authored edge transition, hand-written, with nothing of Jumi involved. */
const native = async (from, to) => {
  await page.setContent(
    `<style>
      @keyframes native { from { offset-anchor: ${from}; } to { offset-anchor: ${to}; } }
      #e { animation: native 1000ms linear both; }
    </style><div id="e">x</div>`,
  )

  return read()
}

/** The proposed execution: two registered leaves, a static composition, and the animation on the leaves alone. */
const resolved = async pairs => {
  const definitions = pairs
    .map(
      ([name, from, to]) =>
        `@property ${name} { syntax: '<length-percentage>'; inherits: false; initial-value: ${from}; }\n` +
        `@keyframes move${name.slice(2)} { from { ${name}: ${from}; } to { ${name}: ${to}; } }`,
    )
    .join('\n')

  await page.setContent(
    `<style>
      ${definitions}
      #e { offset-anchor: ${pairs.map(([name]) => `var(${name})`).join(' ')}; animation: ${pairs
        .map(([name]) => `move${name.slice(2)} 1000ms linear both`)
        .join(', ')}; }
    </style><div id="e">x</div>`,
  )

  return read()
}

const mapping = []

for (const [value, why] of MAPPING)
  mapping.push({ computed: await resting(value), value, why })

const arms = []
const failures = []

for (const arm of ARMS) {
  const computed = {
    from: await resting(arm.native[0]),
    to: await resting(arm.native[1]),
  }
  const nativeSeries = await native(arm.native[0], arm.native[1])
  const resolvedSeries = await resolved(arm.resolved)
  const equal = nativeSeries.join('|') === resolvedSeries.join('|')

  arms.push({
    ...arm,
    computed,
    equal,
    nativeSeries,
    resolvedSeries,
  })

  // The arm has to be able to see a motion before equality means anything, and a `from` the browser rejected
  // (`auto`) would make the whole comparison a reading of nothing.
  if (new Set(nativeSeries).size <= 2)
    failures.push(
      `${arm.axis}: the native edge transition does not interpolate, so nothing was compared — measured \`${nativeSeries.join(' · ')}\``,
    )

  if (computed.from === 'auto' || computed.to === 'auto')
    failures.push(
      `${arm.axis}: the authored endpoints do not compute to a position (\`${computed.from}\` → \`${computed.to}\`)`,
    )
}

console.log('D.3.7 · an edge-addressed motion, executed as the resolved axis\n')

console.log('the keyword mapping, measured through whole positions:')
for (const one of mapping)
  console.log(
    `  ${one.value.padEnd(24)} → ${one.computed.padEnd(24)} (${one.why})`,
  )

console.log()

for (const one of arms) {
  console.log(`── ${one.axis}: ${one.intent}`)
  console.log(`   native       ${one.native[0]}  →  ${one.native[1]}`)
  console.log(`   computed     ${one.computed.from}  →  ${one.computed.to}`)
  console.log(
    `   executed     ${one.resolved.map(([name, from, to]) => `${name}: ${from} → ${to}`).join(', ')}`,
  )
  console.log(`   native       ${one.nativeSeries.join(' · ')}`)
  console.log(`   executed     ${one.resolvedSeries.join(' · ')}`)
  console.log(`   identical    ${one.equal ? 'yes' : 'NO'}`)
  console.log()
}

const allEqual = arms.every(one => one.equal)

console.log(
  allEqual
    ? '  ⇒ an edge-addressed motion can be executed as the resolved axis, so the edge candidate keeps its\n    independent authoring identity while its execution subject is the resolved component'
    : '  ⇒ the resolved-axis execution does not reproduce native edge motion, so edge motion cannot retain its\n    public semantics under this reshape and must stay on the native path or become configuration',
)
console.log()

if (failures.length) {
  console.log('✗ arm defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-edge.json'),
  `${JSON.stringify(
    {
      arms,
      conclusion: allEqual
        ? 'edge-addressed motion executes as the resolved axis'
        : 'edge motion cannot be executed as the resolved axis',
      mapping,
      source: 'D.3.7 · scripts/research/d3-anchor-edge.mjs',
    },
    null,
    2,
  )}\n`,
)

await browser.close()

if (failures.length) process.exitCode = 1
