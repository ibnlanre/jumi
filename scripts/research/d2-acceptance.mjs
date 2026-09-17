/**
 * D.2's acceptance set, measured on the **second** family.
 *
 * The question D.2 was re-pointed to: can a **value-free** per-leaf definition — one `@keyframes` named
 * for the leaf, whose body reads the leaf's endpoint slot — serve every authored value of a family
 * without regressing the five things that make a motion first-class? Those five *are* the acceptance
 * set, and they are the surfaces a definition strategy breaks silently if it breaks anything:
 *
 *   1. phrases            a frame form (`-[0:10px|100:30px]`) still animates
 *   2. ownership          a whole and a constituent on one element keep their own leaves
 *   3. segment timing     a per-property control (`animation-duration-1000/translate-x`) still lands
 *   4. scroll/range       a range-driven motion still runs off the typed definition
 *   5. the timing chain   component → slot/label → property → global still resolves
 *
 * The order in 5 is **component first**, and it is a cascade decision rather than a plumbing one. An earlier
 * version of this book asserted the opposite because a repair in flight had made the element-local link
 * outermost — a consequence of the pass recovering a position's instance from the head of its timing entry.
 * The CTO's ruling was that precedence is the author-facing fact and the reader had to change; the instance
 * now travels as data, and the chain states the order the author sees. See section 5.
 *
 * `scale` proved the mechanism. `translate` is the family that shows whether the mechanism
 * **generalized** or merely worked once, and it differs exactly where it can:
 *
 *   - a `<length-percentage>` leaf is one interpolation branch, so `translate` declares **no**
 *     animation canonicalizer (the authored value is already the canonical frame value);
 *   - a missing component takes the **identity**, where `scale` repeats the first value
 *     (`translate: 10px` is `10px 0 0`; `scale: 2` is `2 2 2`).
 *
 * Both are declared in the family, not in the core, which is what makes them a test of the extraction
 * rather than of a second implementation.
 *
 * Section B asks the other half of the same question of the **source** rather than of the browser:
 * which of the six surfaces — `typedLeaves`, `typedExecutions`, endpoint emission, definition naming,
 * substrate publication, whole decomposition — needed a translate-specific branch in `src/core`.
 *
 * Assertions here are derived from the **authored** frames, never from a remembered reading: an arm
 * that says "10px, 20px, 30px" is saying what the author asked for.
 *
 * Run: `pnpm bundle && node scripts/research/d2-acceptance.mjs` (exits non-zero on failure).
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

import { compiler, finalizeCss, root } from '../lib/compile.mjs'
import { createBook, sample } from './book.mjs'

import path from 'node:path'

const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

/** A duration long enough that the wall-clock instants below are whole shares of it. */
const TWO_SECONDS = 'animation-duration-2000'

/** Stepped at 0 / 50% / 100% of a 2000ms motion, with `linear` forced so a share is a value. */
const WALL = [0, 1000, 2000]

const compile = async candidates =>
  finalizeCss((await compiler(ENTRY, root)).build(candidates)).css

const LINEAR = ' style="animation-timing-function: linear"'

const compileAndRead = async (candidates, body, property, ids = ['e']) => {
  const css = await compile(candidates)
  const reading = await sample(browser, { at: WALL, body, css, ids, property })

  return { css, reading }
}

const browser = await chromium.launch()
const book = createBook(
  "D.2's acceptance set — value-free per-leaf definitions on the second family",
)

/* ------------------------------------------------------------------------------------
 * 1. Phrases — a frame form on a typed constituent
 * ---------------------------------------------------------------------------------- */

book.section('1 · phrases')

const PHRASE = 'animate-translate-x-[0:10px|100:30px]'
const phrase = await compileAndRead(
  [PHRASE, TWO_SECONDS],
  `<div id="e" class="${PHRASE} ${TWO_SECONDS}"${LINEAR}></div>`,
  'translate',
)

book.check(
  'a translate-x phrase runs as one animation and moves 10px → 30px → 20px is its midpoint',
  phrase.reading.e.instances === 1 &&
    phrase.reading.e.values[0] === '10px' &&
    phrase.reading.e.values[1] === '20px' &&
    phrase.reading.e.values[2] === '30px',
  `${phrase.reading.e.instances} instance(s), read ${phrase.reading.e.values.join(' · ')}`,
)

/* ------------------------------------------------------------------------------------
 * 2. Ownership — a whole and a constituent on one element
 * ---------------------------------------------------------------------------------- */

book.section('2 · whole + constituent ownership')

const OWNED = ['animate-translate-[10px]', 'animate-translate-x-[30px]']

const owned = await compileAndRead(
  [...OWNED, TWO_SECONDS],
  `<div id="e" class="${OWNED.join(' ')} ${TWO_SECONDS}"${LINEAR}></div>`,
  'translate',
)

const ownedReversed = await compileAndRead(
  [...OWNED].reverse().concat(TWO_SECONDS),
  `<div id="e" class="${[...OWNED].reverse().join(' ')} ${TWO_SECONDS}"${LINEAR}></div>`,
  'translate',
)

book.check(
  'the constituent owns its leaf and the whole keeps the rest',
  owned.reading.e.instances === 2 &&
    (owned.reading.e.values.at(-1) ?? '').startsWith('30px'),
  `${owned.reading.e.instances} instance(s), settled at ${owned.reading.e.values.at(-1)}`,
)

book.check(
  'and candidate discovery order does not change the reading',
  ownedReversed.reading.e.values.at(-1) === owned.reading.e.values.at(-1),
  `read ${ownedReversed.reading.e.values.at(-1)} reversed, ${owned.reading.e.values.at(-1)} as written`,
)

/* ------------------------------------------------------------------------------------
 * 3. Segment timing — a per-property control still lands
 * ---------------------------------------------------------------------------------- */

book.section('3 · segment timing')

/**
 * A **second** motion rides along, and it is not decoration.
 *
 * The claim is "the component rung times the motion and the global rung times everything else", and
 * that needs two motions to be observable at all: one slot yields one duration position, so a
 * single-motion element cannot report both readings no matter what the product does. Measured with one
 * motion, this arm read `[1000]` — the assertion was unsatisfiable rather than failed, because
 * `includes(400)` needs a second position to exist.
 */
const SEGMENT = [
  PHRASE,
  'animate-opacity-[0:0|100:1]',
  'animation-duration-1000/translate-x',
  'animation-duration-400',
]

const segment = await compileAndRead(
  SEGMENT,
  `<div id="e" class="${SEGMENT.join(' ')}"${LINEAR}></div>`,
  'translate',
)

book.check(
  'the component rung times the motion and the global rung times everything else',
  segment.reading.e.durations.includes(1000) &&
    segment.reading.e.durations.includes(400),
  `durations ${JSON.stringify(segment.reading.e.durations)}`,
)

/* ------------------------------------------------------------------------------------
 * 4. Scroll / range — a range-driven motion off the typed definition
 * ---------------------------------------------------------------------------------- */

book.section('4 · scroll / range')

const RANGE_NAME = 'drift'
const RANGE = [
  `${PHRASE}/${RANGE_NAME}`,
  `animation-timeline-scroll/${RANGE_NAME}`,
  `animation-range-[25%_75%]/${RANGE_NAME}`,
]

/**
 * A real scroller, stepped by real scrolling.
 *
 * A scroll-driven animation rejects an absolute `currentTime`, so it cannot go through `sample`:
 * the timeline is the scroll position, and the only way to move the motion is to move the page.
 *
 * The wait is **two** frames, and one frame is a race rather than a bias. A scroll-driven animation is
 * updated in the frame's *update the rendering* step, which runs after the `requestAnimationFrame`
 * callbacks — so a read taken in the first callback after setting `scrollTop` sees the state from
 * *before* that frame, and the first sample of a freshly loaded page then reads the resting value:
 * measured `none · 20px · 30px`, where `0.25` of the range is authored as `10px`. It is not reliably
 * wrong either — the same code read `10px · 20px · 30px` when an incidental `scrollTop` read happened
 * to force the flush first. Waiting for the *next* callback puts the read after that frame's update,
 * which is what makes the reading a statement about the motion.
 */
const rangePage = async (candidates, classes, property) => {
  const css = await compile(candidates)
  const page = await browser.newPage()

  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  html { scroll-behavior: auto; }
  body { margin: 0; }
  #lead { height: 200px; }
  #stage { position: relative; height: 200px; }
  #stage > * { position: absolute; inset: 0; }
  #tail { height: 1600px; }
</style><style id="jumi">${css}</style></head><body>
<div id="lead"></div><div id="stage"><div id="e" class="${classes}"${LINEAR}></div></div><div id="tail"></div>
</body></html>`)

  const reading = await page.evaluate(
    async ({ at, property: name }) => {
      const element = document.getElementById('e')
      const own = element.getAnimations()
      const style = getComputedStyle(element)
      const values = []
      const tops = []
      const frame = () =>
        new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        )

      for (const share of at) {
        const reach = document.documentElement.scrollHeight - innerHeight
        document.documentElement.scrollTop = Math.round(share * reach)
        await frame()
        tops.push(document.documentElement.scrollTop)
        values.push(getComputedStyle(element)[name])
      }

      return {
        instances: own.length,
        range: style.getPropertyValue('animation-range').trim(),
        timeline: style.getPropertyValue('animation-timeline').trim(),
        tops,
        values,
      }
    },
    { at: [0.25, 0.5, 0.75], property },
  )

  await page.close()

  return { css, reading }
}

/**
 * Sampled **inside** the authored range, and that is the whole correction.
 *
 * `animation-range-[25%_75%]` says the motion's own 0% happens at 25% of the scroll range. Stepped at
 * `0` the animation is in its *before* phase, where the default fill mode leaves the property alone —
 * so the element reads its resting `none`, and that is the specification working rather than the motion
 * failing. Measured at `[0, 0.25, 0.5, 0.75, 1]`: `none · 10px · … · 30px · 30px`, endpoints correct and
 * the first sample outside the range. Stepping within it reads the authored frames, which is what this
 * section is meant to assert.
 *
 * The element forces `linear` like every other fixture here, so a share is a value: with the default
 * easing the midpoint of a `10px → 30px` line reads `26.0481px`, and the arm would be measuring the
 * easing curve rather than the frames the author wrote. Linear, the three samples are the authored
 * `10px · 20px · 30px`.
 */
const range = await rangePage(RANGE, RANGE.join(' '), 'translate')

const RANGE_READ = range.reading.values

book.check(
  'a range-driven translate leaf still runs off its typed definition',
  RANGE_READ[0] === '10px' && RANGE_READ.at(-1) === '30px',
  `read ${RANGE_READ.join(' · ')} at scroll ${range.reading.tops.join(' · ')}`,
)

book.check(
  'and it advances monotonically between them, so the range is a range and not a jump',
  RANGE_READ.map(value => parseFloat(value)).every(
    (value, at, steps) => at === 0 || value >= steps[at - 1],
  ) && RANGE_READ.every(value => value !== 'none'),
  `read ${RANGE_READ.join(' · ')}`,
)

book.check(
  'and the motion is on a scroll timeline, with the authored range intact',
  /scroll/.test(range.reading.timeline) && range.reading.range === '25% 75%',
  `timeline ${range.reading.timeline || '(none)'}, range ${range.reading.range || '(none)'}`,
)

/* ------------------------------------------------------------------------------------
 * 5. The timing chain — component → slot/label → property → global
 * ---------------------------------------------------------------------------------- */

book.section('5 · the timing chain')

const CHAIN = [
  `${PHRASE}/${RANGE_NAME}`,
  `animation-duration-900/${RANGE_NAME}`,
  'animation-duration-700/translate-x',
  'animation-duration-500/translate',
  'animation-duration-300',
]

const chain = await compileAndRead(
  CHAIN,
  `<div id="e" class="${CHAIN.join(' ')}"${LINEAR}></div>`,
  'translate',
)

/**
 * All four rungs authored at once, and the **component** wins.
 *
 * This arm was written twice, and the first version is the interesting one. It asserted the component rung
 * ahead of the label and read `900`, because the repair in flight at the time had moved the label outermost —
 * a repair that existed only because the pass recovered a position's instance from the *head* of its timing
 * entry, so the order of the chain was load-bearing for identity. The CTO's ruling was that precedence is the
 * author-facing fact and the reader had to change instead, which is what happened: the instance now travels as
 * data (`--jumi-staging-positions-slot`), the chain is free, and this reads `700` — the component — with the
 * name rung still inside it.
 *
 * The arm below is the other half, and it is not optional: a chain can put the component first by *losing* the
 * label, which the previous ordering nearly did. Something has to show the label still reaches its own motion.
 */
book.check(
  'the component address resolves first, ahead of the label, the property and the global',
  chain.reading.e.durations.includes(700) &&
    !chain.reading.e.durations.includes(900) &&
    !chain.reading.e.durations.includes(500),
  `durations ${JSON.stringify(chain.reading.e.durations)}`,
)

const NAME_ONLY = [
  `${PHRASE}/${RANGE_NAME}`,
  `animation-duration-900/${RANGE_NAME}`,
  'animation-duration-500/translate',
  'animation-duration-300',
]

const nameOnly = await compileAndRead(
  NAME_ONLY,
  `<div id="e" class="${NAME_ONLY.join(' ')}"${LINEAR}></div>`,
  'translate',
)

book.check(
  'and the label is still reachable, resolving ahead of the property and the global',
  nameOnly.reading.e.durations.includes(900) &&
    !nameOnly.reading.e.durations.includes(500) &&
    !nameOnly.reading.e.durations.includes(300),
  `durations ${JSON.stringify(nameOnly.reading.e.durations)}`,
)

book.check(
  'and the motion is still one instance timed once, not a stack of competing controls',
  chain.reading.e.instances === 1,
  `${chain.reading.e.instances} instance(s)`,
)

/* ------------------------------------------------------------------------------------
 * B. Which of the six surfaces needed a family-specific branch in core
 * ---------------------------------------------------------------------------------- */

book.section(
  'B · the six surfaces, asked of the source rather than of the browser',
)

const source = readFileSync(path.join(root, 'src', 'core', 'index.ts'), 'utf8')

/**
 * Core with its prose removed.
 *
 * The distinction matters more here than anywhere: `scale` is *named* all over core's comments —
 * they are how the mechanism is explained — and a check that counted those would say the opposite
 * of the truth. What is being asked is whether any **code** knows a family's name.
 */
const code = source
  .split('\n')
  .filter(line => {
    const trimmed = line.trim()

    return (
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('/*') &&
      !trimmed.startsWith('//')
    )
  })
  .join('\n')

const FAMILIES = ['scale', 'translate']

for (const family of FAMILIES)
  book.check(
    `core's code contains no '${family}' literal`,
    !new RegExp(`['"\`]${family}['"\`]`).test(code),
    'a quoted family name in core is a branch the declaration did not remove',
  )

book.check(
  'core reads the family declarations instead of naming families',
  /typedLeavesOf\(/.test(code) &&
    /typedExecutionOf\(/.test(code) &&
    /typedLeafOf\(/.test(code) &&
    /canonicalizeLeaf\(/.test(code),
  'the family-agnostic entry points are the ones core imports',
)

book.check(
  'and the whole decomposition lives in the family, not in core',
  !/normalizeScale|translateLeaves|scaleLeafEndpoints/.test(code),
  'a decomposition helper reached into core means the extraction is incomplete',
)

book.report()
await browser.close()
