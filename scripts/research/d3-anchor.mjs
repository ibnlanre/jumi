import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import path from 'node:path'

/**
 * D.3.7 · `offset-anchor` — falsifying the "two `<length-percentage>` axes" hypothesis, from the native grammar.
 *
 * The current model decomposes the property into four leaves (`x-edge`, `x-offset`, `y-edge`, `y-offset`) and
 * D.3.5 measured that this decomposition composes to a value the native grammar **rejects** — `center 0 center
 * 0` reads back as `auto`. So the question is not how to normalize those four leaves. It is what native
 * `offset-anchor` already treats as its independently interpolable state, and the leading hypothesis — two
 * resolved positional components — is what this pass exists to **falsify** rather than to confirm.
 *
 * Nothing here uses Jumi. The animation is hand-written and the reading is `getComputedStyle`, because the
 * claim under test is about the browser's grammar and not about this repository's model of it. A pass that
 * started from the four leaves would be answering a different question.
 *
 * The arms are chosen so that the hypothesis has somewhere to fail:
 *
 *   `50% 50% → 20% 80%`            a purely resolved pair, the shape the hypothesis predicts
 *   `left top → right bottom`      edge keywords, whose meaning is relative to the box
 *   `left 10px top 20px → …`       edge plus offset, the form the model composes and the grammar rejects
 *   `center → 20% 80%`             the shorthand's own centre against a resolved pair
 *
 * And one **canary**, because observing equal endpoints is not the same as observing a resolved
 * representation: `0% 0% → 100% 100%` is the resolved spelling of the edge arm, so if native interpolation
 * happens in resolved space the two series are the same, and if edge-relative semantics survive anywhere they
 * are not. A fixture that could not tell those apart would report the hypothesis as confirmed either way.
 *
 * Per arm, recorded rather than asserted: the authored endpoints, what each of them **computes** to (which is
 * where serialization normalization shows up — `left 0 top 0` reads `0px 0px`), the held-wall series, and
 * whether that series is discrete or interpolated.
 *
 * Run: `pnpm research:d3-anchor`.
 */
const DURATION = 1000
const WALL = [0, 250, 500, 750, 1000]

const ARMS = [
  {
    from: '50% 50%',
    hypothesis: 'a purely resolved pair',
    label: 'resolved percentages',
    to: '20% 80%',
  },
  {
    from: 'left top',
    hypothesis: 'edges, which are relative to the box',
    label: 'edge keywords',
    to: 'right bottom',
  },
  {
    from: 'left 10px top 20px',
    hypothesis: 'the form the model composes and the grammar rejects',
    label: 'edge plus offset',
    to: 'right 10px bottom 20px',
  },
  {
    from: 'center',
    hypothesis: 'the shorthand centre against a resolved pair',
    label: 'center to resolved',
    to: '20% 80%',
  },
]

/** The resolved spelling of the edge arm, so equal series are evidence rather than coincidence. */
const CANARY = {
  from: '0% 0%',
  hypothesis: 'the resolved spelling of the edge arm above',
  label: 'canary: edges spelled as percentages',
  to: '100% 100%',
}

const browser = await chromium.launch()
const page = await browser.newPage()

/** What one authored value computes to with nothing moving. */
const resting = async value => {
  await page.setContent(
    `<style>#e { offset-anchor: ${value}; }</style><div id="e">x</div>`,
  )

  return page.evaluate(() =>
    getComputedStyle(document.querySelector('#e')).getPropertyValue(
      'offset-anchor',
    ),
  )
}

/** The property's computed value at each instant of a held wall, on a linear hand-written animation. */
const series = async (from, to) => {
  await page.setContent(
    `<style>
      @keyframes native { from { offset-anchor: ${from}; } to { offset-anchor: ${to}; } }
      #e { animation: native ${DURATION}ms linear both; }
    </style><div id="e">x</div>`,
  )

  return page.evaluate(async at => {
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

    return { animations: animations.length, values }
  }, WALL)
}

const measured = []
const arms = [...ARMS, CANARY]

for (const arm of arms) {
  const [computedFrom, computedTo] = [
    await resting(arm.from),
    await resting(arm.to),
  ]
  const { animations, values } = await series(arm.from, arm.to)
  const distinct = new Set(values).size

  measured.push({
    ...arm,
    animations,
    computedFrom: computedFrom.trim(),
    computedTo: computedTo.trim(),
    distinct,
    kind: distinct <= 2 ? 'discrete' : 'interpolated',
    series: values,
  })
}

const edge = measured.find(one => one.label === 'edge keywords')
const canary = measured.find(one => one.label === CANARY.label)

/**
 * The hypothesis, stated as the test that can refute it.
 *
 * Native interpolation is in resolved space when the edge arm and its resolved spelling produce the *same*
 * series, because the two differ only in how the value is written. If they differ, edge-relative semantics
 * survive interpolation and two scalar axes cannot express the subject.
 */
const sameSeries =
  edge !== undefined &&
  canary !== undefined &&
  edge.series.join('|') === canary.series.join('|')

console.log('native `offset-anchor`, hand-written, no Jumi involved\n')

for (const one of measured) {
  console.log(`── ${one.label}   (${one.hypothesis})`)
  console.log(
    `   authored   ${one.from}  →  ${one.to}            ${one.animations} animation(s)`,
  )
  console.log(`   computed   ${one.computedFrom}  →  ${one.computedTo}`)
  console.log(`   series     ${one.series.join(' · ')}   (${one.kind})`)
  console.log()
}

console.log('the hypothesis, as a test that can refute it:')
console.log(
  `  edge arm and its resolved spelling produce the same series   ${sameSeries ? 'yes' : 'NO'}`,
)
console.log(
  sameSeries
    ? '  ⇒ native interpolates in resolved space: two components is the subject'
    : '  ⇒ edge-relative semantics survive interpolation, or the arm is not interpolating at all — read the series above before concluding either way',
)
console.log()

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-falsification.json'),
  `${JSON.stringify(
    {
      arms: measured,
      canary: canary?.label ?? null,
      sameSeries,
      source: 'D.3.7 · scripts/research/d3-anchor.mjs',
    },
    null,
    2,
  )}\n`,
)

await browser.close()
