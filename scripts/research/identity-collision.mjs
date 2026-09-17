/**
 * Definition identity, measured four ways — what a definition's identity has to include for it to serve
 * **every** value of the thing it is named for.
 *
 * The ruling this serves: keep value-free definitions and per-leaf ownership, but express the identity
 * as `(motion program shape, stop set)` rather than `(family, stop set)`, which is the aggregate's
 * shape and would be wrong to carry into the general implementation. The identity question is not only
 * how many definitions a sheet contains: it is whether one definition can serve every value.
 *
 * Four paths, two values each, same family and same stop set:
 *
 *   path                  name                        body                      definitions   two values
 *   typed constituent     jumi-scale-x                reads its endpoint slot   1             correct
 *   typed whole           jumi-scale-<hash(values)>   value baked               2             correct
 *   legacy phrase         jumi-scale-<hash(values)>   reads per-candidate slots 2             correct
 *   non-typed constituent jumi-backdrop-filter         value-free                1             correct
 *
 * The first row is the repair (`a5…`), and it is the reason this file exists. It used to read:
 *
 *   typed constituent     jumi-scale-x                value baked               1             BROKEN
 *
 * A **value-free name over a value-bearing body** is the worst of both: the identity collides and the
 * first candidate compiled wins, so the second element silently animated to the first element's value —
 * `animate-scale-x-[5]` beside `[7]` settled both at `5 1`, and reversed settled both at `7 1`. Silent,
 * order-dependent, and uncovered, because every existing arm used one value per constituent.
 *
 * The two ends are the finding, stated as the thing to keep: a **value-free body** is what makes a
 * definition serve every value (the non-typed constituent path always did it, and the typed constituent
 * now converges on it), and **values in the name** is what a value-free identity would remove — which is
 * the remaining D.2 scope, visible in the two rows that still hold two definitions for two values.
 *
 * The permanent guard for the repaired row is `behaviour-check.mjs` section 17, which asserts the same
 * two halves in the gate. This book keeps the four-path contrast, including the falsification arm, so the
 * *mechanism* stays measured rather than remembered.
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
  'definition identity — what a definition must include to serve every value',
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

book.section('the typed constituent: a value-free name over a value-free body')

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
  'and its body reads the candidate’s endpoint slot rather than a literal',
  /--jumi-scale-x:\s*var\(--jumi-scale-x-100\)/.test(
    body(typedForward.css, 'jumi-scale-x'),
  ),
  body(typedForward.css, 'jumi-scale-x').replace(/\s+/g, ' ').slice(0, 120),
)

book.check(
  'so each element resolves its own value — the defect this replaced',
  settled(typedForward, 'five') === '5 1' &&
    settled(typedForward, 'seven') === '7 1',
  `[5] settled at ${settled(typedForward, 'five')}, [7] at ${settled(typedForward, 'seven')}`,
)

book.check(
  'and reversing candidate discovery changes nothing',
  settled(typedReversed, 'five') === '5 1' &&
    settled(typedReversed, 'seven') === '7 1',
  `reversed: [5] at ${settled(typedReversed, 'five')}, [7] at ${settled(typedReversed, 'seven')}`,
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

book.section(
  'the non-typed constituent: the shape the typed path now converges on',
)

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
