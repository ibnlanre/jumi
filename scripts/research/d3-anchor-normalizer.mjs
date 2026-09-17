import { writeFileSync } from 'node:fs'

import { chromium } from 'playwright'

import { normalizeOffsetAnchor } from '../lib/anchor.mjs'

import path from 'node:path'

/**
 * D.3.7 · the normalizer, differentialled end to end against native behaviour.
 *
 * The normalizer returns two resolved axis components or `null`. Returning values that *look* right is not the
 * claim; the claim is that the browser cannot tell the difference between what an author wrote and what the
 * normalizer reconstructed. So every accepted arm runs two native series — the authored pair, and the pair the
 * normalizer produced — and the criterion is that they are **the same series sample for sample**.
 *
 * Three things are measured, and the middle one is the reason this pass exists:
 *
 *   acceptance    what the browser computes for the candidate forms, including the arities the normalizer is
 *                 told **not** to read: `center`, `center center`, `center 20px`, `20px center`, `left center`,
 *                 `center top`. The normalizer's accepted set is justified by this rather than by a reading of
 *                 position syntax, and forms the browser rejects show up as `auto`.
 *
 *   reconstruction  authored pair vs `normalizeOffsetAnchor` of both endpoints joined back into a value — the
 *                 end-to-end proof, and the only acceptance criterion that matters here.
 *
 *   refusal       every declined form, with the browser's own reading beside it. A refusal is not a failure of
 *                 the pass; it is the contract. What would be a failure is declining something the browser
 *                 accepts as the very form the normalizer claims, or accepting something it does not.
 *
 * Run: `pnpm research:d3-anchor-normalizer` (exits non-zero only on a defect in the pass, never on a refusal).
 */
const WALL = [0, 250, 500, 750, 1000]

/** Forms whose acceptance is genuinely in question, so the browser decides rather than an intuition about syntax. */
const ARITIES = [
  'center',
  'center center',
  'center 20px',
  '20px center',
  'left center',
  'center top',
  'left 10px top 20px',
  'left top',
  'top 20px',
  'left 10px',
  'start top',
]

/** Pairs of **accepted** forms: what an author writes, against what the normalizer reconstructs. */
const ACCEPTED = [
  ['50% 50%', '20% 80%'],
  ['10px 20px', '30px 40px'],
  ['calc(50% + 10px) calc(25% - 4px)', 'calc(20% + 2px) calc(80% + 8px)'],
  ['left top', 'right bottom'],
  ['center center', '20% 80%'],
  ['left 10px top 20px', 'right 10px bottom 20px'],
  ['left 10% bottom 25%', 'right 25% top 10%'],
]

/** Forms the normalizer must decline, and why each one is in the list. */
const DECLINED = [
  ['top 20px', 'a short spelling the browser rejects'],
  ['left 10px', 'a short spelling the browser reads as something else'],
  ['center 20px', 'an arity this track did not establish'],
  ['var(--ax) var(--ay)', 'not statically resolvable'],
  ['start top', 'not a logical-position property here'],
  ['left 10px top', 'three components, which is no form at all'],
]

const browser = await chromium.launch()
const page = await browser.newPage()

/** What an authored value computes to with nothing moving — `auto` when the browser rejects it. */
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

/** The property's computed value across a held wall, over hand-written native keyframes. */
const series = async (from, to) => {
  await page.setContent(
    `<style>
      @keyframes native { from { offset-anchor: ${from}; } to { offset-anchor: ${to}; } }
      #e { animation: native 1000ms linear both; }
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
      values.push(getComputedStyle(node).getPropertyValue('offset-anchor').trim())
    }

    return values
  }, WALL)
}

const arities = []

for (const value of ARITIES)
  arities.push({
    accepted: (await resting(value)) !== 'auto',
    computed: await resting(value),
    normalized: normalizeOffsetAnchor(value),
    value,
  })

const accepted = []

for (const [from, to] of ACCEPTED) {
  const fromResult = normalizeOffsetAnchor(from)
  const toResult = normalizeOffsetAnchor(to)

  if (fromResult === null || toResult === null) {
    accepted.push({
      from,
      normalized: null,
      reason: 'the normalizer declined an endpoint the pass assumes it accepts',
      to,
    })

    continue
  }

  const reconstructedFrom = fromResult.join(' ')
  const reconstructedTo = toResult.join(' ')

  const authoredSeries = await series(from, to)
  const reconstructedSeries = await series(reconstructedFrom, reconstructedTo)

  accepted.push({
    authoredSeries,
    equal: authoredSeries.join('|') === reconstructedSeries.join('|'),
    from,
    normalized: [fromResult, toResult],
    reconstructedFrom,
    reconstructedSeries,
    reconstructedTo,
    to,
  })
}

const declined = []

for (const [value, why] of DECLINED)
  declined.push({
    computed: await resting(value),
    normalized: normalizeOffsetAnchor(value),
    rationale: why,
    value,
  })

console.log('D.3.7 normalizer · what the browser accepts, and what the normalizer does with it\n')

console.log('the arities, decided by the browser:')
for (const one of arities)
  console.log(
    `  ${one.value.padEnd(22)} computed ${one.computed.padEnd(22)} normalizer ${one.normalized ? one.normalized.join(' ') : 'declines'}`,
  )

console.log('\nthe reconstruction differential:')

for (const one of accepted) {
  console.log(`\n── ${one.from}   →   ${one.to}`)

  if (!one.normalized) {
    console.log(`   ${one.reason}`)

    continue
  }

  console.log(`   reconstructed  ${one.reconstructedFrom}   →   ${one.reconstructedTo}`)
  console.log(`   authored       ${one.authoredSeries.join(' · ')}`)
  console.log(`   reconstructed  ${one.reconstructedSeries.join(' · ')}`)
  console.log(`   identical      ${one.equal ? 'yes' : 'NO'}`)
}

console.log('\nthe refusals:')

for (const one of declined)
  console.log(
    `  ${one.value.padEnd(22)} computed ${one.computed.padEnd(10)} normalizer ${one.normalized ? `ACCEPTED ${one.normalized.join(' ')}` : 'declines'}   (${one.rationale})`,
  )

/**
 * The pass's own failures, which are the inverse of a refusal: accepting a form this track did not establish,
 * or reconstructing something the browser cannot tell apart from nothing.
 */
const failures = []

for (const one of accepted)
  if (one.normalized && !one.equal)
    failures.push(`${one.from} → ${one.to}: the reconstruction does not reproduce the authored series`)

for (const one of accepted)
  if (!one.normalized) failures.push(`${one.from} → ${one.to}: ${one.reason}`)

for (const one of declined)
  if (one.normalized)
    failures.push(`${one.value}: the normalizer accepted a form it must decline`)

for (const one of accepted)
  if (one.normalized && one.authoredSeries.every(value => value === one.authoredSeries[0]))
    failures.push(`${one.from} → ${one.to}: the authored pair does not interpolate, so nothing was compared`)

console.log(
  `\n${accepted.filter(one => one.equal).length}/${accepted.length} accepted arms reconstruct identically; ${declined.length} forms declined`,
)

if (failures.length) {
  console.log('\n✗ normalizer defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(process.cwd(), 'scripts', 'anchor-normalizer.json'),
  `${JSON.stringify(
    {
      accepted,
      arities,
      declined,
      source: 'D.3.7 · scripts/research/d3-anchor-normalizer.mjs',
    },
    null,
    2,
  )}\n`,
)

await browser.close()

if (failures.length) process.exitCode = 1
