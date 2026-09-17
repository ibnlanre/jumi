/**
 * Definition identity, measured four ways — and the one path where the name went value-free before the
 * body did.
 *
 * The ruling this serves: keep value-free definitions and per-leaf ownership, but express the identity
 * as `(motion program shape, stop set)` rather than `(family, stop set)`, which is the aggregate's
 * shape and would be wrong to carry into the general implementation. The evidence for "before the body
 * did" is here, because the identity question is not only about how many definitions a sheet contains:
 * it is about whether a definition can serve **every** value of the thing it is named for.
 *
 * Four paths, two values each, same family and same stop set:
 *
 *   path                  name                        body            definitions   two values
 *   typed constituent     jumi-scale-x                value baked     1             BROKEN
 *   typed whole           jumi-scale-<hash(values)>   value baked     2             correct
 *   legacy phrase         jumi-scale-<hash(values)>   value-free      2             correct
 *   non-typed constituent jumi-backdrop-filter         value-free      1             correct
 *
 * The two ends are the finding. A **value-free body under a value-free name** is what makes one
 * definition serve every value — the non-typed constituent path already does it. A **value-bearing body
 * under a value-free name** is the worst of both: the identity collides and the first candidate wins, so
 * the second element silently animates to the first element's value, order-dependently. Measured below,
 * and uncovered by the gate — every existing arm uses one value per constituent.
 *
 * So these assertions describe a **defect**, and they invert when it is fixed. That inversion is the
 * point: `[7]` reading `7 1` is the arm that should be in `behaviour-check.mjs` once the typed body
 * reads its slot instead of baking the value, and until then this file is where the reading lives.
 *
 * Run: `pnpm bundle && node scripts/research/identity-collision.mjs` (exits non-zero on failure).
 */
import { chromium } from 'playwright'

import { build, compiler, root } from '../lib/compile.mjs'
import { createBook, sample } from './book.mjs'

const WALL = [0, 2000]

const compile = async candidates =>
  (
    await build(
      await compiler(
        '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
        root,
      ),
      candidates,
    )
  ).css

/** Every `@keyframes` name the sheet declares, so "how many definitions" is a reading. */
const definitions = css =>
  [...css.matchAll(/@keyframes\s+(jumi-[^\s{]+)/g)].map(match => match[1])

/** The body of one definition, for the value-free claim. */
const body = (css, name) => {
  const from = css.indexOf(`@keyframes ${name}`)
  return css.slice(from, css.indexOf('\n}', from))
}

const browser = await chromium.launch()
const book = createBook(
  'definition identity — a value-free name over a value-bearing body',
)

/**
 * Compile, then read one element per candidate. The sheet carries **both** candidates; only the element
 * differs, which is the whole point of a definition being shared.
 */
const measure = async (candidates, pairs, property) => {
  const css = await compile(candidates)
  const names = definitions(css)
  const page = await sample(browser, {
    at: WALL,
    body: pairs
      .map(([id, classes]) => `<div id="${id}" class="${classes}"></div>`)
      .join(''),
    css,
    ids: pairs.map(([id]) => id),
    property,
  })

  return { css, names, page }
}

const settled = (measurement, id) => measurement.page[id].values.at(-1)

book.section(
  'the typed constituent: a value-free name over a value-bearing body',
)

const typedForward = await measure(
  ['animate-scale-x-[5]', 'animate-scale-x-[7]'],
  [
    ['five', 'animate-scale-x-[5]'],
    ['seven', 'animate-scale-x-[7]'],
  ],
  'scale',
)

const typedReversed = await measure(
  ['animate-scale-x-[7]', 'animate-scale-x-[5]'],
  [
    ['five', 'animate-scale-x-[5]'],
    ['seven', 'animate-scale-x-[7]'],
  ],
  'scale',
)

book.check(
  'two values share exactly one definition, named for the channel and not the value',
  typedForward.names.join(',') === 'jumi-scale-x',
  typedForward.names.join(', '),
)

book.check(
  'and its body carries the authored value',
  /--jumi-scale-x:\s*5/.test(body(typedForward.css, 'jumi-scale-x')),
  body(typedForward.css, 'jumi-scale-x').replace(/\s+/g, ' ').slice(0, 120),
)

book.check(
  'THE DEFECT: the second candidate animates to the first candidate’s value',
  settled(typedForward, 'seven') === '5 1',
  `[7] settled at ${settled(typedForward, 'seven')}`,
)

book.check(
  'and it is order-dependent — reversed, both settle at 7',
  settled(typedReversed, 'five') === '7 1' &&
    settled(typedReversed, 'seven') === '7 1',
  `[5] settled at ${settled(typedReversed, 'five')}, [7] at ${settled(typedReversed, 'seven')}`,
)

book.section(
  'the typed whole: values in the name, so no collision and no sharing',
)

const whole = await measure(
  ['animate-scale-[2]', 'animate-scale-[3]'],
  [
    ['two', 'animate-scale-[2]'],
    ['three', 'animate-scale-[3]'],
  ],
  'scale',
)

book.check(
  'two values give two definitions',
  whole.names.length === 2,
  whole.names.join(', '),
)

book.check(
  'each keeping its own value',
  settled(whole, 'two') === '2 2 2' && settled(whole, 'three') === '3 3 3',
  `[2] settled at ${settled(whole, 'two')}, [3] at ${settled(whole, 'three')}`,
)

book.section(
  'the legacy phrase: values in the name, and a body that reads slots',
)

const phrase = await measure(
  ['animate-scale-x-[0:0|100:1]', 'animate-scale-x-[0:0|100:2]'],
  [
    ['one', 'animate-scale-x-[0:0|100:1]'],
    ['two', 'animate-scale-x-[0:0|100:2]'],
  ],
  'scale',
)

book.check(
  'two values give two definitions — the duplication a value-free identity would remove',
  phrase.names.length === 2,
  phrase.names.join(', '),
)

book.check(
  'each keeping its own value',
  settled(phrase, 'one') === '1' && settled(phrase, 'two') === '2 1',
  `[100:1] settled at ${settled(phrase, 'one')}, [100:2] at ${settled(phrase, 'two')}`,
)

book.check(
  'and the bodies are value-free — they read per-candidate slots',
  phrase.names.every(name =>
    /var\(--jumi-scale-x-.+-0, var\(--jumi-scale-x\)\)/.test(
      body(phrase.css, name),
    ),
  ),
  'each body reads its own frame slots rather than a literal',
)

book.section('the non-typed constituent: the target shape, already shipping')

const blurred = await measure(
  ['animate-backdrop-filter-blur-[5px]', 'animate-backdrop-filter-blur-[10px]'],
  [
    ['five', 'animate-backdrop-filter-blur-[5px]'],
    ['ten', 'animate-backdrop-filter-blur-[10px]'],
  ],
  'backdrop-filter',
)

book.check(
  'two values share ONE definition, named for the channel',
  blurred.names.join(',') === 'jumi-backdrop-filter',
  blurred.names.join(', '),
)

book.check(
  'its body is value-free',
  !/5px|10px/.test(body(blurred.css, 'jumi-backdrop-filter')),
  body(blurred.css, 'jumi-backdrop-filter').replace(/\s+/g, ' ').slice(0, 120),
)

book.check(
  'AND BOTH ELEMENTS ARE CORRECT — one definition, every value',
  settled(blurred, 'five').includes('blur(5px)') &&
    settled(blurred, 'ten').includes('blur(10px)'),
  `[5px] settled at ${settled(blurred, 'five').slice(0, 20)}, [10px] at ${settled(blurred, 'ten').slice(0, 20)}`,
)

await browser.close()
book.report()
