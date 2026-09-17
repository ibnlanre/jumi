import { chromium } from 'playwright'

import { compiler, finalizeCss, root } from '../lib/compile.mjs'
import {
  applicationOf,
  computedOf,
  descriptorOf,
  frameOf,
  fromSheet,
  observe,
  print,
  restOf,
} from '../lib/observation.mjs'

/**
 * D.3.4 · what must actually be observed to prove that a pair can move.
 *
 * The differential (`d3-interpolation.mjs`) compared typed execution against the native property and
 * produced three verdicts. Two of them were `unresolved` for **different reasons**, and neither was a
 * failure of typed execution:
 *
 *   `column-gap: normal`  the same computed value means `0` in flex and grid and `1em` in multi-column,
 *                         so the computed surface cannot establish equivalence at all;
 *   `…-x-edge`            the leaf moved while the property the arm read never did, because the model's
 *                         composition for that leaf is a *pair* and the longhand drops it.
 *
 * So this book answers the question those two raised, before the keyword population is expanded: **what
 * surface has to be read, with what method, in which contexts, to prove that moving a constituent
 * preserves what the browser does?**
 *
 * A descriptor, built from the model rather than written by hand, carries four things:
 *
 *   pair              (parent, component) — the census unit
 *   consumer surface  the property the candidate hands the value to, checked against the emission
 *   observation       `computed` · `used-gap` · `border-box`
 *   contexts          the semantics the claim covers; a context where the claim is false belongs in it
 *
 * and the classification rule is the conjunction, not the first term:
 *
 *   movable = justified typed representation
 *           + rest equivalence
 *           + interpolation equivalence
 *           + equivalence across every relevant semantic context
 *
 * Anything less is `unresolved`, which is not `unsafe`: only a measured divergence earns that word.
 *
 * One category is deliberately **not** about semantics. The gate's `border-bottom-width` arm read
 * `0px -> 0px` at every revision and looked like a held gate; the width was invisible because the family's
 * style was `none`. That is a fixture that cannot see, so it is named for what it is —
 * `fixture-unobservable` — rather than for the property, and arm D proves the difference by making the same
 * constituent visible without changing anything about the motion.
 *
 * Run: `pnpm bundle && node scripts/research/d3-observation.mjs` (exits non-zero on failure).
 */
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${root}/dist/index.js";\n`

const compile = async candidates =>
  finalizeCss((await compiler(ENTRY, root)).build(candidates)).css

const WALL = [0, 500, 1000, 1500, 2000]

const browser = await chromium.launch()
const page = await browser.newPage()
const failures = []
const observed = []

/** A context does not move, so its reading is the settled one rather than a series. */
const settled = (style, method, property, klass = '') =>
  observe(page, { at: [0], klass, method, property, style }).then(
    reading => reading.settled,
  )

/** Whether a series moved at all — the difference between a divergence and a blind fixture. */
const moved = values => values[0] !== values[values.length - 1]

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * A · computed-value observable — `font-weight`, resting at `normal`
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * The positive control: the consumer is the property the component names, the method is the computed value,
 * and one context covers it. The rest and the endpoints are the engine's readings (`normal` = 400,
 * `bold` = 700) and the slot and application are the emission's, so the arm cannot drift into a hand-copy of
 * the model it is reading.
 */
{
  const descriptor = descriptorOf({
    candidate: 'animate-font-weight',
    component: 'font-weight',
    contexts: ['ordinary text'],
    method: 'computed',
  })

  const sheet = await compile([`${descriptor.candidate}-bold`])
  const rest = restOf(sheet, descriptor.component)
  const { application, slot } = applicationOf(sheet, descriptor.consumer)
  const far = 'bold'

  const [restNumeric, farNumeric] = await computedOf(
    page,
    descriptor.consumer,
    [`${descriptor.consumer}: ${rest}`, `${descriptor.consumer}: ${far}`],
  )

  const registration = `@property ${slot} {
    syntax: "<number>";
    inherits: false;
    initial-value: ${restNumeric};
  }`

  const native =
    `@keyframes armA { from { ${descriptor.consumer}: ${rest} } to { ${descriptor.consumer}: ${far} } }` +
    `\n#e { animation: armA 2000ms linear both; }`

  const typed = `${registration}
@keyframes armAT { from { ${slot}: ${restNumeric} } to { ${slot}: ${farNumeric} } }
#e { ${descriptor.consumer}: ${application}; animation: armAT 2000ms linear both; }`

  const nativeReading = await observe(page, {
    at: WALL,
    method: descriptor.method,
    property: descriptor.consumer,
    style: native,
  })

  const typedReading = await observe(page, {
    at: WALL,
    method: descriptor.method,
    property: descriptor.consumer,
    style: typed,
  })

  const agrees =
    nativeReading.values.join(' | ') === typedReading.values.join(' | ')

  if (!agrees)
    failures.push(
      `A ${descriptor.component}: the descriptor's own method disagrees — native ${nativeReading.values.join(' | ')} but typed ${typedReading.values.join(' | ')}`,
    )

  observed.push(
    `A  ${agrees ? 'movable' : 'registration-safe, interpolation-unsafe'}\n` +
      `     ${print(descriptor)}\n` +
      `     rest \`${rest}\` = ${restNumeric} · \`${far}\` = ${farNumeric} (engine's numbers)\n` +
      `     native ${nativeReading.values.join(' · ')}\n` +
      `     typed  ${typedReading.values.join(' · ')}`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * B · used-value observable — `column-gap`, resting at `normal`, in the contexts it means different things
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * This class exists because the computed surface **cannot** answer the question. `normal` computes to
 * `normal` everywhere; what it *means* depends on the container. So the observation is geometry (the used
 * gap between two children) and the claim is only as strong as its worst context — which is why the set is
 * declared here rather than assumed, and why a context where the typed rest changes the rendering has to
 * appear in it for the verdict to be honest.
 *
 * Two fixture lessons are built in rather than learned again. The container is controlled (fixed `600px`,
 * fixed `16px` font), so the multi-column gap is `1em` and not a function of the page's incidental size.
 * And every context carries a **canary** — an explicit `gap` — because an observable that reads the same
 * with and without a gap cannot distinguish `preserved` from `blind`.
 *
 * The typed representation under test is the arm's proposal, but not its invention: `<length>` with the
 * initial value the candidate's **first frame** already gives the leaf, read out of the emission. The
 * candidate's own motion writes the property from *frame* slots; this arm disables that animation and hands
 * the consumer the model's live composition instead, which is the difference typed execution makes — the
 * leaf interpolates and the composition reads it.
 */
{
  const descriptor = descriptorOf({
    candidate: 'animate-column-gap',
    component: 'column-gap',
    contexts: ['flex', 'grid', 'multicol'],
    method: 'used-gap',
  })

  const klass = `${descriptor.candidate}-[0:0|100:20]`
  const sheet = await compile([klass])
  const composition = fromSheet(
    sheet,
    descriptor.consumer,
    `var(--jumi-${descriptor.component})`,
  )
  const rest = restOf(sheet, descriptor.component)
  const initial = frameOf(sheet, descriptor.component)

  const registration = `@property --jumi-${descriptor.component} {
    syntax: "<length>";
    inherits: false;
    initial-value: ${initial};
  }`

  const CONTAINERS = {
    flex: 'display: flex',
    // Fixed columns, not `1fr`: with fractional columns the gap changes the column widths and the distance
    // between the children stays put — an observable that cannot see a gap, reading `unchanged` forever.
    grid: 'display: grid; grid-template-columns: 10px 10px; justify-content: start',
    multicol: 'columns: 2',
  }

  const fixture =
    context => `.box { width: 10px; height: 10px; background: red }
#e { ${CONTAINERS[context]}; width: 600px; font-size: 16px; }`

  const readings = []

  for (const context of descriptor.contexts) {
    // The class writes the resting slots (`--jumi-row-gap`, `--jumi-column-gap`) and activates its own
    // frame-based motion; the animation is turned off so the reading is the composition's, not a frame's.
    const typed = `#e { animation: none; ${descriptor.consumer}: ${composition}; }`

    const versions = {
      native: `${fixture(context)}\n#e { ${descriptor.consumer}: ${rest}; }`,
      untyped: `${sheet}\n${fixture(context)}\n${typed}`,
      registered: `${registration}\n${sheet}\n${fixture(context)}\n${typed}`,
      canary: `${fixture(context)}\n#e { ${descriptor.consumer}: 20px; }`,
    }

    const reading = {}

    for (const [version, style] of Object.entries(versions))
      reading[version] = {
        computed: await settled(
          style,
          'computed',
          descriptor.consumer,
          version === 'native' || version === 'canary' ? '' : klass,
        ),
        used: await settled(
          style,
          descriptor.method,
          descriptor.consumer,
          version === 'native' || version === 'canary' ? '' : klass,
        ),
      }

    readings.push({ context, ...reading, typed: reading.registered })
  }

  // An observable that cannot see the property at all cannot establish that it was preserved, so the canary
  // is asked first — in every context, not only the one the finding is expected from.
  const blind = readings.filter(
    entry => entry.canary.used === entry.native.used,
  )

  if (blind.length)
    failures.push(
      `B: the used-gap observable is blind to \`${descriptor.consumer}\` in ${blind.map(entry => entry.context).join(', ')} — it reads the same with and without an explicit gap, so those contexts prove nothing`,
    )

  // The untyped path has to preserve the rest's *used* value in every context — the gate's claim, measured
  // geometrically. The computed text is deliberately not asserted on: the composition this arm applies also
  // carries the sibling half (`row-gap`), so its text differs from `column-gap: normal` while the column's
  // used value is identical, which is exactly the distinction this class exists to make.
  for (const { context, native, untyped } of readings)
    if (native.used !== untyped.used)
      failures.push(
        `B ${context}: the untyped path does not preserve the rest — native \`${native.used}\` but untyped \`${untyped.used}\``,
      )

  const diverges = readings.filter(
    entry => entry.typed.used !== entry.native.used,
  )
  const agrees = readings.filter(
    entry => entry.typed.used === entry.native.used,
  )

  if (!diverges.length)
    failures.push(
      'B: no context distinguishes the typed rest from the native one, so the arm exercises nothing',
    )

  if (!agrees.length)
    failures.push(
      'B: every context diverges — the arm cannot show that the harm is context-dependent, and the set should be re-read before the finding is stated that way',
    )

  observed.push(
    'B  unresolved (the rest is a keyword a `<length>` registration cannot hold)\n' +
      `     ${print(descriptor)}\n` +
      `     rest \`${rest}\` · registration \`${initial}\` · applied \`${descriptor.consumer}: ${composition}\`\n` +
      `     ${readings
        .map(
          ({ canary, context, native, typed }) =>
            `${context.padEnd(8)} native ${native.computed.padEnd(7)} used ${native.used.padEnd(6)} · typed ${typed.computed.padEnd(7)} used ${typed.used.padEnd(6)} · canary used ${canary.used}`,
        )
        .join('\n     ')}\n` +
      `     the computed surface reports a difference in all ${readings.length} contexts; the used value diverges in ${diverges.length} (${diverges.map(entry => entry.context).join(', ')}) and is unchanged in ${agrees.length} (${agrees.map(entry => entry.context).join(', ')})`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * C · composed-property observable — the two halves of one pair, judged by `background-position`
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * The pair's parent is `background-position-x`, and that is not the surface that has to be read: the
 * component's contribution is one half of a **pair**, the longhand drops a pair, and the model composes the
 * pair into the shorthand. The descriptor takes the surface from the candidate table
 * (`animate-background-position-x-offset` addresses `background-position`) and the emission confirms it, so
 * this arm also measures what the differential could not: that the emission never applies the longhand.
 *
 * `contexts` is one entry, and it is the interesting kind: not "the default" but the composition that
 * contains the pair. The context *is* the surface.
 *
 * Both halves are read, because the grammar does not treat them alike and the whole point of an observation
 * surface is to say *where* a representation is justified. `left` is `0%` on the longhand — the gate
 * measured that — so a `<length-percentage>` looks like a correct typed representation of the edge. Inside
 * the shorthand's four-value grammar the first value is an **edge keyword**, and a percentage there is not a
 * value at all: the leaf moves, the model's composition moves with it, and the consumer never does. The
 * offset is the half that grammar expects to be a length.
 */
{
  const descriptor = descriptorOf({
    candidate: 'animate-background-position-x-offset',
    component: 'background-position-x-edge',
    contexts: ['the composition that contains the x-edge pair'],
    method: 'computed',
  })

  const klass = `${descriptor.candidate}-[0:0|100:0]`
  const sheet = await compile([klass])
  const composition = fromSheet(
    sheet,
    descriptor.consumer,
    `var(--jumi-${descriptor.parent})`,
  )

  // What the emission applies, on the surface it chose — and what it does *not* apply, on the surface the
  // pair is named for. The second reading is the class's evidence, so it is taken rather than assumed.
  const applied = applicationOf(sheet, descriptor.consumer)
  let appliedToParent = null

  try {
    appliedToParent = applicationOf(sheet, descriptor.parent).application
  } catch (error) {
    appliedToParent = `nothing (${error.message})`
  }

  const SLOTS = [
    {
      component: descriptor.component,
      far: 'right',
      sweep: ['left 0%', 'right 0%'],
    },
    {
      component: `${descriptor.parent}-offset`,
      far: '20%',
      // Four values, because two are a whole position: `left 20%` is `x = left, y = 20%`, which is a y sweep
      // that reads plausibly and measures the wrong axis (it did: `0% 5% · 0% 10%`).
      sweep: ['left 0% top 0%', 'left 20% top 0%'],
    },
  ]

  const readings = []

  for (const slot of SLOTS) {
    const rest = restOf(sheet, slot.component)

    const [restNumeric, farNumeric] = await computedOf(
      page,
      descriptor.parent,
      [`${descriptor.parent}: ${rest}`, `${descriptor.parent}: ${slot.far}`],
    )

    const registration = `@property --jumi-${slot.component} {
    syntax: "<length-percentage>";
    inherits: false;
    initial-value: ${restNumeric};
  }`

    const native = `@keyframes armC-${slot.component} { from { ${descriptor.consumer}: ${slot.sweep[0]} } to { ${descriptor.consumer}: ${slot.sweep[1]} } }
#e { animation: armC-${slot.component} 2000ms linear both; }`

    const typed = `${registration}
${sheet}
@keyframes armCT-${slot.component} { from { --jumi-${slot.component}: ${restNumeric} } to { --jumi-${slot.component}: ${farNumeric} } }
#e { ${descriptor.consumer}: ${composition}; animation: armCT-${slot.component} 2000ms linear both; }`

    const nativeReading = await observe(page, {
      at: WALL,
      method: descriptor.method,
      property: descriptor.consumer,
      style: native,
    })

    const typedReading = await observe(page, {
      at: WALL,
      klass,
      method: descriptor.method,
      property: descriptor.consumer,
      style: typed,
    })

    readings.push({
      ...slot,
      farNumeric,
      nativeReading,
      rest,
      restNumeric,
      typedReading,
    })
  }

  // The control that makes this a finding about the *slot* rather than about the arm: one half of the pair
  // moves the composed consumer and the other does not. Without both, a constant reading cannot be told from
  // a fixture that is simply blind.
  const moving = readings.filter(entry => moved(entry.typedReading.values))

  if (!moving.length)
    failures.push(
      'C: neither half of the pair moved the composed consumer, so the arm is blind and its verdicts say nothing',
    )

  observed.push(
    `C  the slot decides — ${moving.length} of ${readings.length} halves move the consumer\n` +
      readings
        .map(
          entry =>
            `     ${entry.component.padEnd(29)} ${moved(entry.typedReading.values) ? 'movable' : 'registration-safe, interpolation-unsafe'}\n` +
            `        rest \`${entry.rest}\` = ${entry.restNumeric} · far \`${entry.far}\` = ${entry.farNumeric} (engine's readings)\n` +
            `        native ${entry.nativeReading.values.join(' · ')}\n` +
            `        typed  ${entry.typedReading.values.join(' · ')}`,
        )
        .join('\n') +
      `\n     ${print(descriptor)}\n` +
      `     the emission applies \`${descriptor.consumer}: ${applied.application}\`\n` +
      `     and applies to \`${descriptor.parent}\` ${appliedToParent}\n` +
      `     composition \`${composition}\``,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * D · fixture-unobservable — `border-bottom-width`, and what makes it observable
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * The gate read `0px -> 0px` for this leaf at every revision. Nothing was wrong with the property: a
 * `border-*-width` whose family's style is `none` computes to `0px`, so the fixture could not see the
 * constituent at all. The category is named for the fixture, and this arm proves the naming by making the
 * same motion visible: the only difference between the two readings below is `border-bottom-style`.
 *
 * Deliberately **no execution verdict** is taken. What a fixture cannot see is not evidence about the
 * property, in either direction.
 */
{
  const descriptor = descriptorOf({
    candidate: 'animate-border-bottom-width',
    component: 'border-bottom-width',
    contexts: ['border-bottom-style: none', 'border-bottom-style: solid'],
    method: 'border-box',
  })

  const klass = `${descriptor.candidate}-[0:0|100:3]`
  const sheet = await compile([klass])
  const { application } = applicationOf(sheet, descriptor.consumer)
  const rest = restOf(sheet, descriptor.component)

  // The class writes the leaf's resting value, and the application the emission resolves with the animation
  // off is the live slot (`var(--jumi-border-bottom-width)`), so nothing about the motion differs between the
  // two readings except the family's style.
  const fixture = style =>
    `${sheet}\n#e { animation: none; border-bottom-style: ${style}; ${descriptor.consumer}: ${application}; height: 0; }`

  const collapsed = await settled(
    fixture('none'),
    descriptor.method,
    descriptor.consumer,
    klass,
  )

  const visible = await settled(
    fixture('solid'),
    descriptor.method,
    descriptor.consumer,
    klass,
  )

  if (!/^\d+(\.\d+)?px tall/.test(visible) || /^0px tall/.test(visible))
    failures.push(
      `D: the solid fixture still cannot see the constituent (\`${visible}\`), so the class is not established either way`,
    )

  if (!/^0px tall/.test(collapsed))
    failures.push(
      `D: the collapsing fixture was not supposed to be able to see it, but read \`${collapsed}\``,
    )

  observed.push(
    `D  fixture-unobservable — no execution verdict, in either direction\n` +
      `     ${print(descriptor)}\n` +
      `     rest \`${rest}\` · applied \`${descriptor.consumer}: ${application}\`\n` +
      `     style none   \`${collapsed}\`\n` +
      `     style solid  \`${visible}\`\n` +
      `     the property was observable all along; the fixture was not`,
  )
}

await page.close()
await browser.close()

console.log(observed.join('\n\n'))

if (failures.length) {
  console.error(`\n✗ ${failures.length} arm(s) disagree:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  `\n✓ ${observed.length} observation classes recorded — computed-value, used-value, composed-property, fixture-unobservable`,
)
