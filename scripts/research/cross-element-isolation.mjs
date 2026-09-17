/**
 * Cross-element isolation: does a **global, value-free** definition drive unrelated elements
 * independently?
 *
 * The whole reason value-free keyframes are attractive is that the definition is stylesheet-global
 * while the frame data is element-scoped. That property was mostly being argued with several
 * motions on *one* element, where interference is expected, so these are the cases that separate
 * the two questions.
 *
 * Run: `node scripts/research/cross-element-isolation.mjs` (exits non-zero if an assertion fails).
 *
 * Five headings, plus two falsifications that make the requirements load-bearing rather than
 * decorative: `inherits: true` on the buckets must *leak* an ancestor's value, and a frame that
 * names its own animated leaf as a fallback must *collapse* to the registered initial.
 */
import { chromium } from 'playwright'

import { createBook, reads, sample } from './book.mjs'

const WALL = [0, 500, 1000, 1500, 2000]

/** Both spellings of the bucket registration, so the inheritance arm can fail on purpose. */
const buckets = inherits => `
  @property --x-0   { syntax: '*'; inherits: ${inherits} }
  @property --x-35  { syntax: '*'; inherits: ${inherits} }
  @property --x-50  { syntax: '*'; inherits: ${inherits} }
  @property --x-100 { syntax: '*'; inherits: ${inherits} }`

const CSS = inherits => `
@property --jumi-translate-x { syntax: '<length-percentage>'; inherits: false; initial-value: 0px }
@property --jumi-translate-y { syntax: '<length-percentage>'; inherits: false; initial-value: 0px }
@property --jumi-translate-z { syntax: '<length>'; inherits: false; initial-value: 0px }
${buckets(inherits)}

div { --jumi-translate: var(--jumi-translate-x) var(--jumi-translate-y) var(--jumi-translate-z);
      translate: var(--jumi-translate); }

/* value-free: no authored value, no timing, one definition per (family, stop set) */
@keyframes jumi-translate-x-0-100  { 0%   { --jumi-translate-x: var(--x-0,   var(--jumi-translate-x)) }
                                     100% { --jumi-translate-x: var(--x-100, var(--jumi-translate-x)) } }
@keyframes jumi-translate-x-50-100 { 50%  { --jumi-translate-x: var(--x-50,  var(--jumi-translate-x)) }
                                     100% { --jumi-translate-x: var(--x-100, var(--jumi-translate-x)) } }
@keyframes jumi-translate-x-0      { 0%   { --jumi-translate-x: var(--x-0,   var(--jumi-translate-x)) }
                                     100% { --jumi-translate-x: var(--x-0,   var(--jumi-translate-x)) } }
@keyframes jumi-translate-x-35     { 35%  { --jumi-translate-x: var(--x-35,  var(--jumi-translate-x)) }
                                     100% { --jumi-translate-x: var(--x-35,  var(--jumi-translate-x)) } }

/* 1 — one definition, different values */
#v1a { --x-0: 0px;  --x-100: 30px;  animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
#v1b { --x-0: 50px; --x-100: 120px; animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
/* 2 — one definition, different timing */
#v2a { --x-0: 0px;  --x-100: 30px;  animation: jumi-translate-x-0-100  500ms  linear 0s 1 normal forwards }
#v2b { --x-0: 50px; --x-100: 120px; animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
/* 3 — different stop sets, same family, both definitions present */
#v3a { --x-0: 0px;  --x-100: 30px;  animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
#v3b { --x-50: 60px; --x-100: 120px; animation: jumi-translate-x-50-100 2000ms linear 0s 1 normal forwards }
/* 4 — a foreign stop set in the sheet must not reach a single-stop element */
#v4a { --x-0: 30px;                 animation: jumi-translate-x-0      2000ms linear 0s 1 normal forwards }
#v4b { --x-35: 50px;                animation: jumi-translate-x-35     2000ms linear 0s 1 normal forwards }
/* 5 — parent and child, same family, different buckets */
#v5p { --x-0: 0px;  --x-100: 30px;  animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
#v5c { --x-0: 50px; --x-100: 120px; animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
/* the leak probe: a child declaring only ONE of the two buckets its definition reads */
#v5d { --x-0: 50px;                 animation: jumi-translate-x-0-100  2000ms linear 0s 1 normal forwards }
`

const BODY = `
  <div id="v1a"></div><div id="v1b"></div>
  <div id="v2a"></div><div id="v2b"></div>
  <div id="v3a"></div><div id="v3b"></div>
  <div id="v4a"></div><div id="v4b"></div>
  <div id="v5p"><div id="v5c"></div><div id="v5d"></div></div>`

const browser = await chromium.launch()
const book = createBook('cross-element isolation')

const registered = await sample(browser, {
  at: WALL,
  body: BODY,
  css: CSS(false),
  ids: [
    'v1a',
    'v1b',
    'v2a',
    'v2b',
    'v3a',
    'v3b',
    'v4a',
    'v4b',
    'v5p',
    'v5c',
    'v5d',
  ],
  property: 'translate',
})

const at = id => registered[id].values.join(' | ')
const check = (label, id, expected) =>
  book.check(label, reads(registered[id].values, expected), at(id))

book.section('1  same definition, different values')

check('element A interpolates its own buckets', 'v1a', [
  '0px',
  '7.5px',
  '15px',
  '22.5px',
  '30px',
])
check('element B interpolates its own, from one shared definition', 'v1b', [
  '50px',
  '67.5px',
  '85px',
  '102.5px',
  '120px',
])

book.section('2  same definition, different timing, different elements')

check('the 500ms element completes and holds', 'v2a', [
  '0px',
  '30px',
  '30px',
  '30px',
  '30px',
])
check('the 2s element keeps its own clock throughout', 'v2b', [
  '50px',
  '67.5px',
  '85px',
  '102.5px',
  '120px',
])

book.section('3  different definitions, same family, both in the sheet')

check('the {0,100} element is unaffected by the {50,100} definition', 'v3a', [
  '0px',
  '7.5px',
  '15px',
  '22.5px',
  '30px',
])
check('and the {50,100} element runs its own program', 'v3b', [
  '0px',
  '30px',
  '60px',
  '90px',
  '120px',
])

book.section('4  a foreign stop set exists in the sheet')

check('a single stop at 0 holds and acquires no 35% stop', 'v4a', [
  '30px',
  '30px',
  '30px',
  '30px',
  '30px',
])
check(
  'a single stop at 35 rises to it at 700ms and holds, acquiring no 0% stop',
  'v4b',
  ['0px', '35.7143px', '50px', '50px', '50px'],
)

book.section('5  parent / child, same family, different buckets')

check('the child runs its own buckets, not the parent\u2019s', 'v5c', [
  '50px',
  '67.5px',
  '85px',
  '102.5px',
  '120px',
])

book.check(
  'a child missing one of its definition\u2019s buckets collapses to the registered initial',
  reads(registered.v5d.values, ['0px', '0px', '0px', '0px', '0px']),
  `${at('v5d')} — the frame names its own animated leaf as the fallback, which is a cycle`,
)

book.section(
  'the falsification that makes \u0060inherits: false\u0060 load-bearing',
)

const leaky = await sample(browser, {
  at: WALL,
  body: BODY,
  css: CSS(true),
  ids: ['v5d'],
  property: 'translate',
})

book.check(
  'with inherits: true the same child consumes the parent\u2019s bucket',
  reads(leaky.v5d.values, ['50px', '45px', '40px', '35px', '30px']),
  `read ${leaky.v5d.values.join(' | ')} — the endpoint 30px is the PARENT\u2019s --x-100`,
)

book.report()
await browser.close()
