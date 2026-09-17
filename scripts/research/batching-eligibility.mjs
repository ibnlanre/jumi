/**
 * Batching eligibility: is **sheet-level equality of timing writes** enough to authorise one
 * instance for several constituents of the same family?
 *
 * The claim under test, from the offset-aggregate research: two constituents may share one animation
 * instance when their stop sets are equal, their modifiers are equal, and every rung of their timing
 * chains is either unwritten in the sheet or written identically for both components. All three are
 * sheet-level facts, so batching would need no element-co-occurrence reasoning.
 *
 * The counter-example is a sheet that satisfies the claim while an element does not:
 *
 *   sheet     animate-translate-x-[30px]  animate-translate-y-[20px]
 *             animation-duration-500/translate-x   animation-duration-500/translate-y
 *   element   animate-translate-x-[30px]  animate-translate-y-[20px]
 *             animation-duration-500/translate-x                      ← the y control is absent
 *
 * Both component rungs in the sheet say `500ms`, so the criterion says batch. On the element, x reads
 * its component rung and y falls through the chain, so production resolves **two** programs — and the
 * batched representation, which cannot see the difference, resolves **one**. The same hole appears at
 * the global rung and under a variant (`hover:`), and it is the same statement in every case:
 *
 *   **presence of a candidate in the sheet is not presence of that candidate on this element.**
 *
 * The per-leaf side below is **production** — the real plugin and the real finalizer, read out of
 * `dist/`, on a real element. Hand-writing it would have made this book about a model of the emitter.
 * The batched side is hand-written, and deliberately as the **most favourable** reading of the
 * criterion: one instance, carrying the clock the pair shares. A disagreement is then a fact about the
 * criterion rather than about an unflattering model of it.
 *
 * What survives is narrower, and both surviving rules are measured here rather than asserted in prose:
 * batching is safe when **no constituent-addressable rung exists in the sheet at all**, or when the
 * only rung written is one **both constituents read by construction** (the attribute rung,
 * `animation-duration-500/translate`). Both are negative existence claims over the sheet, which is why
 * they survive element selection: equality of writes is a *positive* check that a missing class
 * silently breaks, while absence is a *negative* check that it cannot.
 *
 * Run: `pnpm bundle && node scripts/research/batching-eligibility.mjs` (exits non-zero on failure).
 * It needs a bundle, unlike the other two books in this directory, because it compiles a real sheet.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from '../lib/compile.mjs'
import { createBook, reads, sample } from './book.mjs'

const WALL = [0, 250, 500, 1000, 1500]

const X = 'animate-translate-x-[30px]'
const Y = 'animate-translate-y-[20px]'

/**
 * The sheet the counter-example describes: both constituent controls present, and identical.
 * `dist/` is loaded by the harness, so this is the shipped emitter's output.
 */
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

/** Both component rungs written, identically. The criterion says: these two may batch. */
const SYMMETRIC = await compile([
  X,
  Y,
  'animation-duration-500/translate-x',
  'animation-duration-500/translate-y',
])

/** No constituent-addressable rung in the sheet at all. */
const UNSCOPED = await compile([X, Y])

/** The attribute rung, which both constituents read by construction. */
const SHARED_RUNG = await compile([X, Y, 'animation-duration-500/translate'])

/**
 * The batched representation the criterion authorises: **one** instance owning the composite, at the
 * clock the pair shares, with the same endpoints as the two phrases. Mirrors the aggregate shape
 * measured in `aggregate-offsets.mjs`; no shipped code emits this.
 */
const batched = duration => `
@property --jumi-translate-x { syntax: '<length-percentage>'; inherits: false; initial-value: 0px }
@property --jumi-translate-y { syntax: '<length-percentage>'; inherits: false; initial-value: 0px }
@property --jumi-translate-z { syntax: '<length>'; inherits: false; initial-value: 0px }
@property --x-0   { syntax: '*'; inherits: false }
@property --x-100 { syntax: '*'; inherits: false }
@property --y-0   { syntax: '*'; inherits: false }
@property --y-100 { syntax: '*'; inherits: false }

#probe {
  --jumi-translate-x: 0px; --jumi-translate-y: 0px; --jumi-translate-z: 0px;
  --jumi-translate: var(--jumi-translate-x) var(--jumi-translate-y) var(--jumi-translate-z);
  --x-0: 0px; --x-100: 30px; --y-0: 0px; --y-100: 20px;
  --jumi-translate-0:   var(--x-0,   var(--jumi-translate-x)) var(--y-0,   var(--jumi-translate-y)) var(--jumi-translate-z);
  --jumi-translate-100: var(--x-100, var(--jumi-translate-x)) var(--y-100, var(--jumi-translate-y)) var(--jumi-translate-z);
  translate: var(--jumi-translate);
  animation: jumi-translate ${duration} ease 0s 1 normal forwards;
}

@keyframes jumi-translate {
  0%   { translate: var(--jumi-translate-0) }
  100% { translate: var(--jumi-translate-100) }
}`

const browser = await chromium.launch()
const book = createBook(
  'batching eligibility — sheet symmetry vs element presence',
)

/** One real element, with `classes` and an optional inline override of a constituent rung. */
const read = (css, classes, style = '') =>
  sample(browser, {
    at: WALL,
    body: `<div id="probe" class="${classes}" style="${style}"></div>`,
    css,
    ids: ['probe'],
    property: 'translate',
  })

const values = s => s.probe.values
const show = s =>
  `${s.probe.durations.join(', ')}ms → ${s.probe.values.join(' | ')}`

const X_ONLY = `${X} ${Y} animation-duration-500/translate-x`
const BOTH = `${X} ${Y} animation-duration-500/translate-x animation-duration-500/translate-y`
const PLAIN = `${X} ${Y}`
const SHARED = `${X} ${Y} animation-duration-500/translate`

const asymmetric = await read(SYMMETRIC, X_ONLY)
const symmetric = await read(SYMMETRIC, BOTH)
const unscoped = await read(UNSCOPED, PLAIN)
const shared = await read(SHARED_RUNG, SHARED)
const override = await read(
  UNSCOPED,
  PLAIN,
  '--jumi-translate-x-animation-duration: 250ms',
)
const one500 = await read(batched('500ms'), '')
const one1000 = await read(batched('1s'), '')

book.section("the criterion's precondition, so the sheet cannot be blamed")

book.check(
  'the sheet writes both constituent rungs identically',
  /--jumi-translate-x-animation-duration:\s*500ms/.test(SYMMETRIC) &&
    /--jumi-translate-y-animation-duration:\s*500ms/.test(SYMMETRIC),
  'both rungs present and equal in the compiled sheet',
)

book.section('the falsification: the sheet is symmetric, the element is not')

book.check(
  'production resolves two different clocks for the two constituents',
  asymmetric.probe.durations.join(',') === '500,1000',
  show(asymmetric),
)

book.check(
  'production draws two instances, each owning one leaf',
  asymmetric.probe.instances === 2,
  show(asymmetric),
)

book.check(
  'the batched representation is one instance at the clock the sheet agrees on',
  one500.probe.instances === 1 && one500.probe.durations.join(',') === '500',
  show(one500),
)

book.check(
  'THE CRITERION IS FALSIFIED — production and the batched representation disagree',
  !reads(values(asymmetric), values(one500)),
  `${show(asymmetric)}  vs  ${show(one500)}`,
)

book.check(
  'production holds y on its own 1000ms clock, which is what the element resolved',
  reads(values(asymmetric), [
    '0px',
    '24.0721px 8.17021px',
    '30px 16.0481px',
    '30px 20px',
    '30px 20px',
  ]),
  show(asymmetric),
)

book.check(
  'batching would have run y on x’s 500ms clock instead',
  reads(values(one500), [
    '0px',
    '24.0721px 16.0481px',
    '30px 20px',
    '30px 20px',
    '30px 20px',
  ]),
  show(one500),
)

book.section(
  'why sheet-level equality is tempting: it is sound when both are present',
)

book.check(
  'when the element does carry both controls, production equals the batched representation',
  reads(values(symmetric), values(one500)),
  show(symmetric),
)

book.section(
  'the conservative rule that survives: no constituent-addressable rung in the sheet',
)

book.check(
  'both constituents fall through to the sheet default and resolve the same clock',
  unscoped.probe.durations.join(',') === '1000,1000',
  show(unscoped),
)

book.check(
  'and the per-leaf result equals the batched representation exactly',
  reads(values(unscoped), values(one1000)),
  show(unscoped),
)

book.section(
  'the permissive rule that also survives: a rung both constituents read by construction',
)

book.check(
  'an attribute-scoped control reaches both constituents',
  shared.probe.durations.join(',') === '500,500',
  show(shared),
)

book.check(
  'and the per-leaf result equals the batched representation exactly',
  reads(values(shared), values(one500)),
  show(shared),
)

book.section(
  'the boundary of the guarantee: safe against the sheet, not the element',
)

book.check(
  'an element-level constituent override still resolves two clocks',
  override.probe.durations.join(',') === '250,1000',
  show(override),
)

book.check(
  'and that element also departs from the batched representation',
  !reads(values(override), values(one1000)),
  `${show(override)}  vs  ${show(one1000)}`,
)

await browser.close()
book.report()
