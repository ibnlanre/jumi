/**
 * The aggregate-offset hypothesis, on **one element** — and the places where it destroys a program.
 *
 * The hypothesis: a keyframe definition is identified by `(family, stop set)` and carries no
 * authored value, while the values live in element-scoped *buckets* the definition reads. Then
 * several constituents can share one definition, and one animation can carry all of them.
 *
 * Run: `node scripts/research/aggregate-offsets.mjs` (exits non-zero if an assertion fails).
 *
 * Measured here, in order: it works; an absent bucket changes nothing; a hold comes from the
 * offset-ordered chain; three coincident stops are exact; **a foreign stop flattens a spanned
 * segment**; and **two timing programs on one element cannot share a definition**. The last two are
 * the ones that bound where the hypothesis applies, and both are asserted rather than described.
 */
import { chromium } from 'playwright'

import { createBook, reads, sample, triples } from './book.mjs'

const WALL = [0, 500, 1000, 1500, 2000]

const CSS = `
@property --jumi-translate-x { syntax: '<length-percentage>'; inherits: false; initial-value: 0px }
@property --jumi-translate-y { syntax: '<length-percentage>'; inherits: false; initial-value: 0px }
@property --jumi-translate-z { syntax: '<length>'; inherits: false; initial-value: 0px }

div { --jumi-translate: var(--jumi-translate-x) var(--jumi-translate-y) var(--jumi-translate-z); }

/* The aggregate per stop: declared once for the family, chained in OFFSET ORDER, and it is the
   leaf — never the animated property — that the fallback names. */
.v {
  --jumi-translate-0:   var(--x-0,   var(--jumi-translate-x))
                        var(--y-0,   var(--jumi-translate-y)) var(--jumi-translate-z);
  --jumi-translate-50:  var(--x-50,  var(--x-0, var(--jumi-translate-x)))
                        var(--y-50,  var(--y-0, var(--jumi-translate-y))) var(--jumi-translate-z);
  --jumi-translate-100: var(--x-100, var(--x-50, var(--x-0, var(--jumi-translate-x))))
                        var(--y-100, var(--y-50, var(--y-0, var(--jumi-translate-y)))) var(--jumi-translate-z);
}
.v {
  --jumi-translate-0-nohold:   var(--x-0,   var(--jumi-translate-x))
                               var(--y-0,   var(--jumi-translate-y)) var(--jumi-translate-z);
  --jumi-translate-100-nohold: var(--x-100, var(--jumi-translate-x))
                               var(--y-100, var(--jumi-translate-y)) var(--jumi-translate-z);
}

@keyframes def-0-100  { 0% { translate: var(--jumi-translate-0) }   100% { translate: var(--jumi-translate-100) } }
@keyframes def-0-50-100 { 0% { translate: var(--jumi-translate-0) }
                          50% { translate: var(--jumi-translate-50) }
                          100% { translate: var(--jumi-translate-100) } }
@keyframes def-plain-0-100 { 0% { translate: var(--jumi-translate-0-nohold) }
                             100% { translate: var(--jumi-translate-100-nohold) } }

/* per-leaf: each instance owns its own property, the composite is a static substrate */
@keyframes leaf-x-0-100 { 0% { --jumi-translate-x: var(--x-0) } 100% { --jumi-translate-x: var(--x-100) } }
@keyframes leaf-y-0-100 { 0% { --jumi-translate-y: var(--y-0) } 100% { --jumi-translate-y: var(--y-100) } }
@keyframes leaf-x-50-100 { 50% { --jumi-translate-x: var(--x-50) } 100% { --jumi-translate-x: var(--x-100) } }
@keyframes leaf-y-50-100 { 50% { --jumi-translate-y: var(--y-50) } 100% { --jumi-translate-y: var(--y-100) } }
#leaf { translate: var(--jumi-translate) }

/* one element, one activation, both constituents contributing data */
#both    { --x-0: 0px; --x-100: 30px; --y-0: 0px; --y-100: 20px;
           translate: var(--jumi-translate); animation: def-0-100 2000ms linear 0s 1 normal forwards }
#xonly   { --x-0: 0px; --x-100: 30px;
           translate: var(--jumi-translate); animation: def-0-100 2000ms linear 0s 1 normal forwards }
#hold    { --x-0: 0px; --x-100: 30px; --y-0: 20px;
           translate: var(--jumi-translate); animation: def-0-100 2000ms linear 0s 1 normal forwards }
#plain   { --x-0: 0px; --x-100: 30px; --y-0: 20px;
           translate: var(--jumi-translate); animation: def-plain-0-100 2000ms linear 0s 1 normal forwards }
#stops3  { --x-0: 0px; --x-50: 10px; --x-100: 30px; --y-0: 0px; --y-50: 25px; --y-100: 20px;
           translate: var(--jumi-translate); animation: def-0-50-100 2000ms linear 0s 1 normal forwards }

/* heterogeneous stop sets, BOTH writing the composite: the destructive arrangement */
#twoDefs { --x-0: 0px; --x-100: 30px; --y-50: 25px; --y-100: 20px;
           translate: var(--jumi-translate);
           animation: def-0-100 2000ms linear 0s 1 normal forwards,
                      def-0-50-100 2000ms linear 0s 1 normal forwards }

/* the same two stop sets, each instance owning a leaf: the correct arrangement */
#perLeaf { --x-0: 0px; --x-100: 30px; --y-50: 25px; --y-100: 20px;
           translate: var(--jumi-translate);
           animation: leaf-x-0-100 2000ms linear 0s 1 normal forwards,
                      leaf-y-50-100 2000ms linear 0s 1 normal forwards }

/* two timing programs, one element, one definition: the destructive arrangement */
#twoClocks { --x-0: 0px; --x-100: 30px; --y-0: 0px; --y-100: 20px;
             translate: var(--jumi-translate);
             animation: def-0-100 500ms linear 0s 1 normal forwards,
                        def-0-100 2000ms linear 0s 1 normal forwards }

/* the same two timing programs, each instance owning a leaf: the correct arrangement */
#twoClocksPerLeaf { --x-0: 0px; --x-100: 30px; --y-0: 0px; --y-100: 20px;
                    translate: var(--jumi-translate);
                    animation: leaf-x-0-100 500ms linear 0s 1 normal forwards,
                               leaf-y-0-100 2000ms linear 0s 1 normal forwards }

/* two identical activations: the browser does not dedupe */
#twice { --x-0: 0px; --x-100: 30px; --y-0: 0px; --y-100: 20px;
         translate: var(--jumi-translate);
         animation: def-0-100 2000ms linear 0s 1 normal forwards,
                    def-0-100 2000ms linear 0s 1 normal forwards }
`

const BODY = [
  'both',
  'xonly',
  'hold',
  'plain',
  'stops3',
  'twoDefs',
  'perLeaf',
  'twoClocks',
  'twoClocksPerLeaf',
  'twice',
]
  .map(id => `<div id="${id}" class="v"></div>`)
  .join('')

const browser = await chromium.launch()
const book = createBook('aggregate offsets — one element')
const read = ids =>
  sample(browser, {
    at: WALL,
    body: BODY,
    css: CSS,
    ids,
    property: 'translate',
  })

const s = await read([
  'both',
  'xonly',
  'hold',
  'plain',
  'stops3',
  'twoDefs',
  'perLeaf',
  'twoClocks',
  'twoClocksPerLeaf',
  'twice',
])

const at = id => s[id].values.join(' | ')

book.section(
  'the hypothesis: one definition, one clock, several constituents as data',
)

book.check(
  'two constituents on one definition interpolate together',
  reads(s.both.values, [
    '0px',
    '7.5px 5px',
    '15px 10px',
    '22.5px 15px',
    '30px 20px',
  ]),
  at('both'),
)

book.check(
  'an absent bucket changes nothing: y stays at its resting value',
  reads(s.xonly.values, ['0px', '7.5px', '15px', '22.5px', '30px']),
  at('xonly'),
)

book.section('the chain: what an unset bucket at a later stop resolves to')

book.check(
  'offset-ordered chaining turns a single stop into a hold',
  reads(s.hold.values, [
    '0px 20px',
    '7.5px 20px',
    '15px 20px',
    '22.5px 20px',
    '30px 20px',
  ]),
  at('hold'),
)

book.check(
  'falling straight back to the resting leaf decays instead of holding',
  reads(s.plain.values, [
    '0px 20px',
    '7.5px 15px',
    '15px 10px',
    '22.5px 5px',
    '30px',
  ]),
  at('plain'),
)

book.check(
  'three coincident stops interpolate every segment',
  reads(s.stops3.values, [
    '0px',
    '5px 12.5px',
    '10px 25px',
    '20px 22.5px',
    '30px 20px',
  ]),
  at('stops3'),
)

book.section('the boundary: a foreign stop flattens a spanned segment')

const twoDefsX = triples(s.twoDefs.values).map(parts => parts[0])
const monotonic = twoDefsX.every(
  (value, index) => index === 0 || value >= twoDefsX[index - 1],
)

book.check(
  'a foreign stop collapses x to its previous bucket — non-monotonic in the composite',
  !monotonic,
  `x read ${twoDefsX.join(' | ')}`,
)

book.check(
  'and it is not the intended program either',
  !reads(s.twoDefs.values, [
    '0px',
    '7.5px 12.5px',
    '15px 25px',
    '22.5px 22.5px',
    '30px 20px',
  ]),
  at('twoDefs'),
)

book.check(
  'per-leaf ownership carries the same two stop sets exactly',
  reads(s.perLeaf.values, [
    '0px',
    '7.5px 12.5px',
    '15px 25px',
    '22.5px 22.5px',
    '30px 20px',
  ]),
  at('perLeaf'),
)

book.section(
  'the second boundary: two timing programs cannot share one definition',
)

book.check(
  'two instances of one definition show only the later clock',
  reads(s.twoClocks.values, [
    '0px',
    '7.5px 5px',
    '15px 10px',
    '22.5px 15px',
    '30px 20px',
  ]),
  at('twoClocks'),
)

book.check(
  'and that is not the two-timing program, which would hold x at 30px from 500ms',
  !reads(s.twoClocks.values, [
    '0px',
    '30px 5px',
    '30px 10px',
    '30px 15px',
    '30px 20px',
  ]),
  at('twoClocks'),
)

book.check(
  'per-leaf ownership carries both clocks',
  reads(s.twoClocksPerLeaf.values, [
    '0px',
    '30px 5px',
    '30px 10px',
    '30px 15px',
    '30px 20px',
  ]),
  at('twoClocksPerLeaf'),
)

book.check(
  'two identical activations are two instances — the emitter has to dedupe, the browser will not',
  s.twice.instances === 2,
  `${s.twice.instances} instances`,
)

book.report()
await browser.close()
