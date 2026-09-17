import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import { compiler, finalizeCss, root } from '../lib/compile.mjs'
import { applicationOf, restOf } from '../lib/observation.mjs'
import { FUNCTION } from '../lib/property-model.mjs'
import { readTypedLeaves } from '../lib/property-model.mjs'
import { framesOf, pinningOf, plans, verdictOf } from '../lib/validation.mjs'

import path from 'node:path'

/**
 * D.3.5 · pass three: **the derived representations, validated in a browser**.
 *
 * Pass one asked what the model can justify; pass two joined that to the evidence already on record. This
 * pass is the one that creates evidence, and it is the first stage of the pipeline that *measures* a
 * proposal:
 *
 *   registration/rest  →  native-vs-typed interpolation  →  contexts  →  verdict
 *
 * Nothing here is hand-written. Each of the 41 mechanically derivable pairs becomes two arms (two authored
 * magnitudes, the arm's only declared input), and everything else is read out of the emission: the resting
 * value the registration has to stand in for (`restOf`), the frame the motion is going to (`framesOf`), the
 * surface the pair has to be read on and the wiring that hands the value there (`applicationOf`), and the
 * slot the leaf actually is (`pinningOf`). The test suite asserts that each probe is a value its own syntax
 * admits, so an arm cannot quietly test a representation against a value the representation does not cover.
 *
 * Three things the fixtures do, each for a measured reason:
 *
 *   **The phrase is the authored spelling.** `-[2]` (one value) sets the leaf's *live* slot to the target, so
 *   the application reads the frame and the leaf drives nothing — measured: the property sat at the target at
 *   every instant and the arm had no motion to compare. `-[0:<rest>|100:<probe>]` keeps the live slot at the
 *   resting value and carries the endpoint in a frame the application never reads, which is what makes the
 *   leaf the source of truth the arm needs it to be.
 *
 *   **The canary comes before the differential.** Pin the leaf to the far frame; if the consumer's computed
 *   value does not move, the arm cannot see the constituent at all and says `fixture-unobservable` rather
 *   than reporting two identical readings as agreement. `mask-border-outset` reads `''` with and without the
 *   pin (Chromium has no such property) and `rotate-z` reads `0deg` however the z axis is scaled, because the
 *   axis normalises — both are limits of the observable, and both say so.
 *
 *   **Both arms step the same held wall with the same easing.** The animation is paused and its
 *   `currentTime` set, so the series is a property of the values and not of how long the sampler took to ask,
 *   and `linear` in both arms because the language's own easing is not what is under test here — the
 *   *interpolation path* is.
 *
 * Two readings this pass produced that are not verdicts about a representation, and both are recorded the way
 * the ruling asked for rather than folded into the four census classes:
 *
 *   `math-depth-add` is `interpolation-unsafe`, and the honest reading is larger than that. The emission
 *   animates the leaf `add(0)` -> `add(2)`: **the thing that moves is an argument inside `add(...)`, not the
 *   scalar leaf the resting value suggested**, so a value-bucket pair whose interpolation unit is an
 *   expression is a *reshape* — D.1's subject, not this one's. The test is structural and comes from the
 *   model's own `FUNCTION` pattern rather than from a list of properties, so the finding generalises past
 *   `math-depth`.
 *
 *   `offset-anchor-x/y` are the other cause of `reshape-required`, and they entered the log as
 *   `blocked-by-emission`: their application composes to `center 0 center 0`, which the property rejects, so the
 *   pair reads `auto` with the arm's declaration and with none at all. That was right at the time — the
 *   representation was never tested because production produced no valid consumer value — and what changed is the
 *   diagnosis of *why*: `<position>` will not take two edge-plus-offset pairs, so no local repair of the emission
 *   expresses this decomposition and the family belongs to the reshape track.
 *
 * Run: `pnpm research:d3-validation` (exits non-zero only on an arm defect, never on a verdict).
 */
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${root}/dist/index.js";\n`

const compile = async candidates =>
  finalizeCss((await compiler(ENTRY, root)).build(candidates)).css

const DURATION = 1000
const WALL = [0, 250, 500, 750, 1000]

/**
 * Where the evidence lands, as a record rather than as a report.
 *
 * The standing guard reads this: a declaration is admitted only with a `movable` record naming *that* pair and
 * *that* representation, so the record has to exist outside the run that produced it. It is data — written by
 * a research book, read by a unit test — and nothing in `src/` ever imports it.
 */
const EVIDENCE = path.join(root, 'scripts', 'validated-representations.json')

const DECLARED = readTypedLeaves()

const browser = await chromium.launch()
const page = await browser.newPage()

/** The consumer's computed value at each instant of a held wall, on one element carrying the class. */
const series = (klass, property, style) =>
  page
    .setContent(`<style>${style}</style><div id="e" class="${klass}">x</div>`)
    .then(() =>
      page.evaluate(
        async ({ at, property }) => {
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
              getComputedStyle(node).getPropertyValue(property).trim(),
            )
          }

          return { animations: animations.length, values }
        },
        { at: WALL, property },
      ),
    )

/** One reading, animation off: this is what the property computes when nothing is moving. */
const reading = (klass, property, style) =>
  series(klass, property, `${style}\n#e { animation: none; }`)

const pad = (text, width) => String(text).padEnd(width)

const arms = []
const failures = []

for (const plan of plans()) {
  if (plan.status !== 'planned') {
    arms.push({ plan, reason: plan.reason, verdict: 'unresolved' })
    continue
  }

  const sheet = await compile([plan.klass])

  let arm

  try {
    // The sheet's rest must be the rest the derivation used. If they disagree the arm is testing a different
    // resting value than the one the syntax was derived from, which is a reader defect and not a finding.
    const rest = restOf(sheet, plan.component)

    if (rest !== plan.rest)
      throw new Error(
        `the sheet rests at \`${rest}\` where the derivation used \`${plan.rest}\``,
      )

    const { application, slot } = applicationOf(sheet, plan.consumer)
    const pin = pinningOf({
      application,
      component: plan.component,
      css: sheet,
      slot,
    })

    if (!pin)
      throw new Error(
        `the sheet applies \`${plan.consumer}\` without reading \`--jumi-${plan.component}\``,
      )

    const frames = framesOf(sheet, plan.component)

    arm = {
      application,
      // Whether the *emission* moves an expression where the syntax holds a scalar: `add(0)` is a function of
      // the value, so a leaf whose rest looks like a number can still be the argument of the moving thing.
      expression:
        FUNCTION.test(frames.first.value) || FUNCTION.test(frames.far.value),
      far: frames.far.value,
      first: frames.first.value,
      pin,
      rest,
      stops: frames.stops.map(one => one.stop),
    }
  } catch (error) {
    arms.push({ plan, reason: error.message, verdict: 'unresolved' })
    continue
  }

  /**
   * What the arm registers: the **declared** representation when the model carries one, the proposal otherwise.
   *
   * That is the difference between validating a proposal and validating what shipped. The derivation proved the
   * syntax; the arms below prove that the thing `typedLeaves` names is the same thing — so they register the
   * declared metadata once it exists, and a declaration that differs from the proposal is a **failure** rather
   * than a second measurement, because then the run would be testing something no proposal asked for.
   */
  const declared = DECLARED.get(plan.component)

  if (declared && declared.syntax !== plan.syntax)
    failures.push(
      `${plan.pair}: typedLeaves declares \`${declared.syntax}\` where the derivation proposed \`${plan.syntax}\``,
    )

  const syntax = declared?.syntax ?? plan.syntax

  const registration = `@property ${arm.pin} {
    syntax: "${syntax}";
    inherits: false;
    initial-value: ${arm.rest};
  }`

  // Every fixture starts from the emitted sheet. The class on the element means nothing without the rules
  // that give it leaves: the first version of this pass omitted the sheet and every consumer read `none` or
  // `''`, with five arms agreeing perfectly — which is what two invalid readings agreeing looks like. The
  // arm's own declaration is written after it so it wins on specificity (`#e` over the class), and
  // `animation: none` in `reading` removes the emission's own animation rather than fighting it.
  const applied = `${sheet}\n#e { ${plan.consumer}: ${arm.application}; }`

  const withoutRegistration = await reading(plan.klass, plan.consumer, applied)
  const withRegistration = await reading(
    plan.klass,
    plan.consumer,
    `${applied}\n${registration}`,
  )

  // The canary: the leaf at its far frame, everything else untouched. A consumer that does not move here
  // cannot see the constituent, so neither differential below would mean anything.
  const farReading = await reading(
    plan.klass,
    plan.consumer,
    `${applied}\n#e { ${arm.pin}: ${arm.far}; }`,
  )

  const exercised = farReading.values[0] !== withoutRegistration.values[0]

  if (!exercised) {
    // What `property` computes on an element with no motion at all: the reading that separates "the arm's
    // declaration never computed" from "the observable cannot see this constituent".
    const bare = await reading('', plan.consumer, sheet)
    const refusal = verdictOf({
      applied: withoutRegistration.values[0],
      bare: bare.values[0],
      canary: { exercised },
      property: plan.consumer,
      rest: {
        preserved: true,
        registered: withRegistration.values[0],
        without: withoutRegistration.values[0],
      },
      series: { agrees: true, native: [], typed: [] },
    })

    arms.push({
      ...arm,
      bare: bare.values[0],
      canary: `${withoutRegistration.values[0]} -> ${farReading.values[0]}`,
      cause: refusal.cause,
      farReading: farReading.values[0],
      plan,
      reason: refusal.reason,
      verdict: refusal.verdict,
    })
    continue
  }

  // Native: the property itself between the two renderings the leaf produces. The endpoints are the engine's
  // readings, not the arm's arithmetic.
  const native = await series(
    plan.klass,
    plan.consumer,
    `${sheet}\n` +
      `@keyframes d3native { from { ${plan.consumer}: ${withoutRegistration.values[0]} } to { ${plan.consumer}: ${farReading.values[0]} } }\n` +
      `#e { animation: d3native ${DURATION}ms linear both; }`,
  )

  // Typed: the leaf registered, the frames the emission animates it to, the consumer reading the leaf.
  const typedFixture =
    `${applied}\n${registration}\n` +
    `@keyframes d3typed { from { ${arm.pin}: ${arm.first} } to { ${arm.pin}: ${arm.far} } }\n` +
    `#e { animation: d3typed ${DURATION}ms linear both; }`

  const typed = await series(plan.klass, plan.consumer, typedFixture)

  // The leaf's own series, read through the same instrument as the consumer: a registered custom property
  // computes, so a leaf that never leaves its initial value is visible as one value repeated, and that is
  // the difference between "the motion diverged" and "there was no motion to diverge".
  const leaf = await series(plan.klass, arm.pin, typedFixture)

  if (!native.animations)
    failures.push(`${plan.pair}: the native arm has no animation to step`)

  // The trap this pass exists to avoid, made impossible rather than unlikely: two arms that never moved agree
  // perfectly, and `movable` is exactly what that looks like. A canary that passed with a native series that
  // never moved *and* a typed series that reads the same is a blind fixture, and the run fails rather than
  // reporting it. A flat native series with a moving typed arm is the other thing — `rotate-x` has no native
  // baseline at all, because the property will not interpolate `0deg` with `2 0 1 0deg` — and that is a
  // verdict (`no native baseline`), not a defect.
  if (
    new Set(native.values).size === 1 &&
    native.values.join(' | ') === typed.values.join(' | ')
  )
    failures.push(
      `${plan.pair}: both arms read \`${native.values[0]}\` at every instant while the leaf moves — ` +
        `the fixture cannot see this constituent and its agreement is not evidence`,
    )

  const verdict = verdictOf({
    applied: withoutRegistration.values[0],
    bare: null,
    canary: { exercised },
    property: plan.consumer,
    rest: {
      preserved: withoutRegistration.values[0] === withRegistration.values[0],
      registered: withRegistration.values[0],
      without: withoutRegistration.values[0],
    },
    series: {
      agrees: native.values.join(' | ') === typed.values.join(' | '),
      native: native.values,
      // Endpoints that differ while the property's own animation does not move means the property declined to
      // interpolate its own two renderings — which is a missing baseline, not a fault in the representation.
      nativeEndpoints: [withoutRegistration.values[0], farReading.values[0]],
      nativeFlat: new Set(native.values).size === 1,
      typed: typed.values,
    },
    // The unit the *emission* names, which the resting shape cannot always see: `add(0)` is a function of the
    // value, so what moves is an argument inside it rather than the scalar leaf the rest suggested. It is
    // reported to the assembler rather than turned into a verdict here, so the precedence stays testable.
    unit: { expression: arm.expression, frames: [arm.first, arm.far], syntax },
  })

  // A flat leaf is the *reason* a typed arm diverges, and it is worth naming precisely: the registration did
  // not take the value the emission animates the leaf to, so nothing interpolated at all. The verdict stays
  // the one the protocol returned — the two unsafe classes mean what D.3.4 said they mean, and a value the
  // syntax refuses is an interpolation that never happened, not a rest that did not survive.
  const flat = new Set(leaf.values).size === 1

  arms.push({
    ...arm,
    cause: verdict.cause,
    farReading: farReading.values[0],
    leaf: leaf.values,
    native: native.values,
    plan,
    reason: flat
      ? `the leaf never leaves \`${leaf.values[0]}\`: the frames \`${arm.first}\` -> \`${arm.far}\` are not \`${syntax}\``
      : verdict.reason,
    rest: {
      registered: withRegistration.values[0],
      without: withoutRegistration.values[0],
    },
    typed: typed.values,
    verdict: verdict.verdict,
  })
}

await browser.close()

/**
 * The **route's** verdict, over its magnitudes.
 *
 * A context that renders the same as the one before it adds nothing and says so; the route's verdict is the most
 * informative of the exercised arms, so a representation that holds at one magnitude and not another reports the
 * failure rather than the average.
 *
 * Grouped by route rather than by pair, which is the correction the ruling made: `(parent, component)` collapsed
 * the four corners' two registrations into one, so the map that came out of it had three corners under
 * `border-radius` and one under its own property — an artefact of candidate order, and a half-typed motion for
 * whichever route lost.
 */
const routes = []

for (const arm of arms) {
  if (!arm.plan) continue

  const existing = routes.find(one => one.route === arm.plan.route)

  if (!existing)
    routes.push({ arms: [arm], pair: arm.plan.pair, route: arm.plan.route })
  else existing.arms.push(arm)
}
const order = [
  'registration-unsafe',
  'reshape-required',
  'interpolation-unsafe',
  'fixture-unobservable',
  'unresolved',
  'movable',
]

/**
 * A magnitude is a **context**, and it is only evidence if it renders something different.
 *
 * The first magnitude is the reference; a later arm whose far reading is that same rendering has not exercised
 * a second context — the representation was asked the same question twice — so it says `not exercised` rather
 * than counting as a second confirmation. That is the same discipline as the canary one level up.
 */
for (const one of routes) {
  const reference = one.arms[0]?.farReading

  for (const arm of one.arms)
    arm.context =
      arm.plan.magnitude === 0 || arm.farReading !== reference
        ? 'exercised'
        : 'not exercised'
}

const forRoute = one => {
  const exercised = one.arms.filter(
    arm =>
      arm.context === 'exercised' &&
      arm.verdict &&
      arm.verdict !== 'unresolved',
  )

  if (!exercised.length) return one.arms[0]

  return (
    [...exercised].sort(
      (left, right) =>
        order.indexOf(left.verdict) - order.indexOf(right.verdict),
    )[0] ?? one.arms[0]
  )
}

const counted = routes.map(one => ({ ...one, verdict: forRoute(one) }))
const tally = verdict =>
  counted.filter(one => one.verdict.verdict === verdict).length

/** Every exclusion, grouped by the measurement that caused it rather than by the verdict alone. */
const causes = [
  ...new Set(counted.map(one => one.verdict.cause).filter(cause => cause)),
].map(cause => ({
  cause,
  routes: counted
    .filter(one => one.verdict.cause === cause)
    .map(one => one.route),
}))

/**
 * The evidence, as the standing guard has to read it: **one record per route**.
 *
 * `syntax` and `initialValue` are the two fields a declaration can be compared against exactly, and
 * `consumer` is the third: a declaration is keyed `(family, leaf)`, so the evidence has to say which family it
 * admits a declaration under. A pair reached through two families gets two records, and that is the whole
 * correction — the first version keyed a record by the pair and took the first serving candidate, which is how
 * the generated map ended up with three corners under `border-radius` and one under its own property.
 *
 * The file is data written by a research book and read by a unit test; nothing in `src/` imports it, and
 * production never depends on the pass that produced it.
 */
writeFileSync(
  EVIDENCE,
  `${JSON.stringify(
    {
      routes: counted
        .map(one => ({
          candidate: one.verdict.plan.candidate,
          component: one.verdict.plan.component,
          consumer: one.verdict.plan.consumer,
          initialValue: one.verdict.plan.rest,
          magnitudes: one.arms.filter(arm => arm.context === 'exercised')
            .length,
          parent: one.verdict.plan.parent,
          route: one.route,
          syntax: one.verdict.plan.syntax,
          verdict: one.verdict.verdict,
        }))
        .sort((left, right) => left.route.localeCompare(right.route)),
      source: 'scripts/research/d3-validation.mjs',
    },
    null,
    2,
  )}\n`,
)

console.log(
  [
    'D.3.5 · derived-representation validation (pass three: 41 proposals, generated arms)',
    '',
    `${arms.length} arms over ${routes.length} routes of ${new Set(routes.map(one => one.pair)).size} pairs — the derivation proposed, the browser decided`,
    `${[...new Set(routes.map(one => one.pair))].filter(pair => routes.filter(one => one.pair === pair).length > 1).length} of those pairs reachable by more than one route, each measured on its own`,
    `${arms.filter(arm => arm.context === 'not exercised').length} arms a second magnitude that rendered the same as the first, and said so`,
    '',
    ...counted.map(one => {
      const arm = one.verdict
      const numbers =
        arm.native && arm.typed
          ? `\n${pad('', 30)}native ${arm.native.join(' · ')}\n${pad('', 30)}typed  ${arm.typed.join(' · ')}`
          : ''

      return (
        `  ${pad(one.route, 62)}${pad(arm.verdict, 22)}${arm.reason ? `${arm.reason}` : `rest \`${arm.rest?.without}\` preserved`}` +
        numbers
      )
    }),
    '',
    'the tally, with every exclusion named:',
    `  movable                ${tally('movable')}`,
    `  registration-unsafe    ${tally('registration-unsafe')}`,
    `  interpolation-unsafe   ${tally('interpolation-unsafe')}`,
    `  fixture-unobservable   ${tally('fixture-unobservable')}`,
    `  unresolved             ${tally('unresolved')}`,
    `  reshape-required       ${tally('reshape-required')}`,
    '',
    // A zero that is a result rather than a gap, said in as many words: the syntax was derived from the resting
    // value's own shape, so the rest is inside the syntax by construction, and the reach gate's
    // `registration-unsafe` belongs to the *keyword* population where the rest is a keyword and the grammar is
    // a promise. This pass measures the rest anyway, because the emission's rest is read from the sheet rather
    // than assumed from the model, and a disagreement between those two is a reader defect it must fail on.
    `  registration-unsafe is ${tally('registration-unsafe')} by construction, not by luck: the syntax came from the`,
    "  resting value's own shape, so the rest is inside the syntax the derivation proposed. This pass measures",
    "  it anyway — the emission's rest is read from the sheet rather than assumed from the model, and the two",
    '  disagreeing is a reader defect this pass fails on rather than a finding it reports.',
    ...causes.map(
      one =>
        `  ${one.cause}:\n` +
        one.routes.map(route => `    ${route}`).join('\n'),
    ),
    '',
    `evidence recorded at \`${path.relative(root, EVIDENCE)}\` — ${counted.filter(one => one.verdict.verdict === 'movable').length} movable record(s), which is what a declaration has to name to be admitted`,
    '',
    'The proposal is not the declaration. `movable` means the derived representation held at rest and through',
    'the motion, under every magnitude this pass exercised, for the values the emission animates this pair',
    'to — and once the model declares a component these arms register **that** metadata, so the run measures',
    'what shipped rather than what was proposed.',
    '`reshape-required` is outside the four census classes on purpose, and it has two causes: a unit a resting',
    'value cannot reveal (an argument inside `add(...)`), and an emission whose application does not compute',
    'because the family decomposes a grammar along boundaries the browser does not recognise.',
  ].join('\n'),
)

if (failures.length) {
  console.error(`\n✗ ${failures.length} arm(s) are broken:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  `\n✓ ${arms.length} generated arms ran, and every verdict above is a measurement rather than an inference\n`,
)
