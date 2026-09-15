#!/usr/bin/env node
/**
 * Segment easing: what CSS permits, measured — before any syntax is chosen.
 *
 * The model distinction the CTO settled on:
 *
 *   slot easing      → variable-driven, addressable, one easing for the whole animation
 *   segment easing   → keyframe-local, literal, part of the motion definition
 *
 * The reason segment easing cannot be variable-driven is the second measurement below: a `var()` inside
 * a keyframe's `animation-timing-function` is **dropped**, so a keyframe's easing has to be a literal in
 * the keyframe. Everything else here is about what that buys and what it costs.
 *
 * Plain CSS only — the feature does not exist in Jumi yet, and this file decides whether it can. Samples
 * read computed values at a paused `currentTime`, so each number is the browser's own interpolation rather
 * than an assertion about the emitted text.
 *
 * Run: `pnpm spike:segments`.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

const browser = await chromium.launch()
const page = await browser.newPage()

/**
 * Sample `property` at `time` ms, with every animation paused at that time.
 *
 * `--vars` are written on the element, which is how a case asks whether a variable-driven easing is
 * honoured in a place a *literal* is.
 */
const sample = async ({ animation, keyframes, property, time, vars = '' }) => {
  await page.setContent(`<!doctype html>
<html><head><style>
@keyframes probe { ${keyframes} }
#only {
  ${animation}
  animation-name: probe;
  animation-duration: 1000ms;
  animation-fill-mode: both;
  animation-play-state: paused;
  animation-delay: 0s;
  ${vars}
}
</style></head><body><div id="only">x</div></body></html>`)

  return page.evaluate(
    ({ property: name, time: at }) => {
      for (const running of document.getAnimations()) running.currentTime = at

      return getComputedStyle(document.querySelector('#only')).getPropertyValue(
        name,
      )
    },
    { property, time },
  )
}

const round = value => {
  const number = Number.parseFloat(value)

  return Number.isFinite(number) ? Math.round(number * 1000) / 1000 : value
}

console.log('══ segment easing — what CSS permits\n')

/* ── 1. A keyframe's own easing governs its segment, and only its segment ──────────────────────────
 *
 * `step-start` jumps to the segment's **end** value for the whole segment, so a segment that honours it
 * reads as the later frame while a segment that does not reads as an interpolation. The animation-level
 * easing is `linear`, which is what the first segment must keep: `0.5` at 25% is that interpolation, and
 * `0` at 75% is the override — the 100% frame's value, held from 50% onward.
 */
const override = {
  animation: 'animation-timing-function: linear;',
  keyframes:
    '0% { opacity: 0 } 50% { opacity: 1; animation-timing-function: step-start } 100% { opacity: 0 }',
  property: 'opacity',
}

const firstHalf = await sample({ ...override, time: 250 })
const secondHalf = await sample({ ...override, time: 750 })

console.log(
  '1 · a keyframe easing governs its own segment, and leaves the others alone',
)
console.log(`   animation-level: linear, 50% frame: step-start`)
console.log(
  `   at 25% → ${round(firstHalf)}  (linear: the 0→1 segment interpolates)`,
)
console.log(
  `   at 75% → ${round(secondHalf)}  (step-start: the 100% frame's 0, held from 50%)`,
)

/* ── 2. A variable-driven easing at the animation level still governs the segments without one ─────
 *
 * This is the Jumi-shaped question: the slot's easing arrives as a control variable
 * (`--jumi-<attr>-animation-timing-function`), and a segment override has to compose with it rather
 * than replace it for the whole animation.
 */
const variable = await sample({
  ...override,
  animation: 'animation-timing-function: var(--slot-ease);',
  time: 750,
  vars: '--slot-ease: step-end;',
})

console.log(
  '\n2 · a variable-driven slot easing keeps the segments a keyframe did not claim',
)
console.log(
  `   animation-level: var(--slot-ease) = step-end, 50% frame: step-start`,
)
console.log(
  `   at 75% → ${round(variable)}  (the frame's own step-start still applies there)`,
)

/* ── 3. THE CONSTRAINT. A `var()` in a keyframe's `animation-timing-function` is dropped ───────────
 *
 * Same shape as case 1, with the frame's easing written as a variable. If it were honoured, 75% would
 * read 1. It cannot be honoured: the declaration is dropped at parse time, so the segment falls back to
 * the animation-level easing — which is why segment easing is keyframe-local *by necessity* and not by
 * taste.
 */
const dropped = await sample({
  ...override,
  keyframes:
    '0% { opacity: 0 } 50% { opacity: 1; animation-timing-function: var(--segment-ease) } 100% { opacity: 0 }',
  time: 750,
  vars: '--segment-ease: step-start;',
})

console.log('\n3 · a variable in a keyframe easing is dropped — the constraint')
console.log(
  `   50% frame: animation-timing-function: var(--segment-ease) = step-start`,
)
console.log(
  `   at 75% → ${round(dropped)}  (linear again: the declaration did not survive)`,
)

/* ── 4. A segment can overshoot, which is the point of easing one frame at a time ──────────────────
 *
 * `ease-out-back` on a segment that actually moves — the frame carrying it governs the segment *after*
 * it, so the first frame carries it here — overshoots past the target and settles back. Nothing else in
 * the model can express this: one easing per animation diverges mid-flight, and `translate` is where it is
 * measurable, because it is not clamped to a range the way `opacity` is.
 */
const overshoot = {
  animation: 'animation-timing-function: linear;',
  keyframes:
    '0% { translate: 0px; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1) } 100% { translate: 100px }',
  property: 'translate',
}

const mid = await sample({ ...overshoot, time: 750 })

console.log(
  '\n4 · a segment can overshoot its target, which one easing per animation cannot',
)
console.log(
  `   0→100 segment: cubic-bezier(0.34, 1.56, 0.64, 1) (ease-out-back)`,
)
console.log(
  `   at 75% → ${round(mid)}  (past the 100px target, on its way back)`,
)

/* ── 5. Does the candidate survive a separator, in the real pipeline? ──────────────────────────
 *
 * A segment easing has to be written *inside* an arbitrary value, so whatever separates it from the frame's
 * value has to be a character Tailwind carries through the candidate. This is the measurement the syntax
 * choice turns on, and it is taken in the shipped pipeline rather than assumed from the grammar notes: a
 * dropped candidate emits no rule at all, and a dropped character silently merges the easing into the
 * value — which animates nothing and says nothing.
 *
 * The value is not yet a segment easing (Jumi does not read one), so what is asserted here is carriage:
 * the rule exists, and the frame's value arrived with the separator intact.
 */
const CARRIERS = ['~', '@', '^', ':']

console.log(
  '\n5 · which separator survives the candidate, once it is in a phrase',
)

for (const separator of CARRIERS) {
  const candidate = `animate-rotate-[0:0deg${separator}ease-out-back|100:45deg]`
  const built = build(
    await compiler(
      '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
      root,
    ),
    [candidate],
  )
  const selector = [...built.css.matchAll(/\.animate-rotate[^\s{},]*/g)][0]?.[0]

  console.log(
    `   ${separator}  ${selector ? `emitted (${selector.slice(0, 40)}${selector.length > 40 ? '…' : ''})` : 'DROPPED — no rule at all'}`,
  )
}

/* ── 6. A timing function on the last frame is inert ───────────────────────────────────────────────
 *
 * The spec's rule is that a keyframe's timing function governs the segment *after* it, and the last
 * keyframe has none — so writing one there should change nothing. Checked by A/B across the timeline
 * rather than at one time, because at a single sample the two are easy to confuse. Sampled one at a time:
 * a shared page means concurrent `setContent` calls overwrite each other, which produced four readings
 * from one stylesheet the first time this ran.
 */
const baseFrames = '0% { translate: 0px } 80% { translate: 100px }'
const lastEased =
  '0% { translate: 0px } 80% { translate: 100px; animation-timing-function: step-start }'
const at = [100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950, 990]
const timeline = async keyframes => {
  const readings = []

  for (const time of at)
    readings.push(
      await sample({
        animation: 'animation-timing-function: linear;',
        keyframes,
        property: 'translate',
        time,
      }),
    )

  return readings
}

const withoutLast = await timeline(baseFrames)
const withLast = await timeline(lastEased)

/** Where the two differ, so the shape is read off the timeline rather than inferred from one point. */
const shape = readings => readings.map(round).join(', ')
const differs = withoutLast
  .map((value, index) =>
    round(value) === round(withLast[index]) ? null : at[index],
  )
  .filter(time => time !== null)

console.log(
  '\n6 · what a timing function on the last frame does (0% → 80% frames, held to 100%)',
)
console.log(`   times      ${at.join(', ')}`)
console.log(`   without it ${shape(withoutLast)}`)
console.log(`   with it    ${shape(withLast)}`)
console.log(
  `   differs at: ${differs.length ? `${differs.join(', ')} ms` : 'no sample'}`,
)

/* ── 7. Direction: an easing governs the segment after its frame, never before ─────────────────────
 *
 * The 100% frame has no segment after it, so a timing function written there must change nothing — while
 * the identical easing one frame earlier changes everything. Same pair of segments, one frame apart.
 */
const middle = {
  animation: 'animation-timing-function: linear;',
  keyframes: '0% { opacity: 0 } 50% { opacity: 1 } 100% { opacity: 0 }',
  property: 'opacity',
}
const easedAtFifty = {
  ...middle,
  keyframes:
    '0% { opacity: 0 } 50% { opacity: 1; animation-timing-function: step-start } 100% { opacity: 0 }',
}
const easedAtHundred = {
  ...middle,
  keyframes:
    '0% { opacity: 0 } 50% { opacity: 1 } 100% { opacity: 0; animation-timing-function: step-start }',
}

const neither = await sample({ ...middle, time: 750 })
const fifty = await sample({ ...easedAtFifty, time: 750 })
const hundred = await sample({ ...easedAtHundred, time: 750 })

console.log('\n7 · the easing belongs to the segment after its frame')
console.log(`   at 75%, animation-level linear, 50→100 segment`)
console.log(`   no easing anywhere → ${round(neither)}  (linear: half way)`)
console.log(
  `   on the 50% frame   → ${round(fifty)}  (step-start: the segment end, 0)`,
)
console.log(
  `   on the 100% frame  → ${round(hundred)}  (no segment after it: nothing changes)`,
)

await browser.close()
