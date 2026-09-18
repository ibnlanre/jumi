import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

import { compiler, finalizeCss, root } from '../lib/compile.mjs'
import { derive, SYNTAX_OF } from '../lib/derivation.mjs'
import { applicationOf, population } from '../lib/observation.mjs'
import {
  FUNCTION,
  readCandidates,
  readPropertyEntries,
} from '../lib/property-model.mjs'
import { plans, PROBES, routesOf } from '../lib/validation.mjs'

import path from 'node:path'

/**
 * D.3.6 · the function-argument reshape — surveyed and measured.
 *
 * D.3.5 found the first cause of `reshape-required` after `offset-anchor` and named it structurally: **the
 * thing that moves is an argument inside a function, not the scalar the resting value suggested.** The
 * CTO's question for this pass is narrow — *can Jumi represent and animate a typed argument inside a static
 * function shell without introducing a family-specific execution path?* — and it has to be answered before
 * `offset-anchor`, because `math-depth` is the clean case: one function, one argument, one slot, no
 * `<position>` grammar mixed in.
 *
 * The proposal is one line of shape:
 *
 *     --jumi-math-depth-add: 0;          /* the leaf is a bare, typed argument *\/
 *     math-depth: add(var(--jumi-math-depth-add));   /* the *composition* owns the shell *\/
 *
 * and everything else follows from it: a `<integer>` leaf interpolates (the engine rounds per frame), the
 * property recomputes from the substituted value, and the console's `getComputedStyle().mathDepth` — which
 * Chromium *does* serialise for `add(n)` forms, measured — is the observable. `add(2)` fails the same
 * registration that today's emission writes into the frames, so nothing can be fixed locally: the shell has
 * to move.
 *
 * **The survey is structural, not a property list.** Two places in the model put a function around a leaf's
 * value, and both are read from the model rather than remembered:
 *
 *   - the leaf's own default, `value: css('blur', '0')` in `variables/property.ts` — the shell is in the
 *     variable's rest, so a registration replacing that rest has to take the shell out of it;
 *   - the candidate's part, `['math-depth-add', value => css('add', value)]` in `properties/tween.ts` — the
 *     shell is in the *phrase*, so nothing about the leaf's rest reveals it at all.
 *
 * A leaf in the first shape is visible in the emission's rest; a leaf in the second is only visible in the
 * emission's *frames*. Surveying one and not the other would have missed `math-depth` itself, which is the
 * case this pass exists to prove. The survey finds **23 leaves** — the eleven `filter-*` slots, the eleven
 * `backdrop-filter-*` slots, and `math-depth-add`, which is a `phrase` shape alone.
 *
 * **The emission puts the shell in the frames of the property, not the value of the leaf.** That is the fact
 * the first version of the proposal missed, and it is why the repair cannot be local. `math-depth-add`
 * compiles to `--jumi-math-depth-add-sluPV-0: add(0)` feeding `@keyframes jumi-math-depth-sluPV { 0% {
 * math-depth: var(--…-0, var(--jumi-math-depth-add)) } }` — so the animated *subject* is the property, the
 * property is not registered, and the series is a **discrete flip**. Moving the shell inside those same
 * frames changes nothing; the frames have to animate the **argument** instead, and the composition has to
 * carry the shell statically.
 *
 * **Every measurement is a differential against the shipped emission.** The emitted arm is the real sheet and
 * the real class, unchanged. The proposal arm is that same sheet plus exactly three things, all of them read
 * from the emission or the derivation rather than invented: the leaf's registration with the derived syntax
 * and rest, frames that animate the leaf across the derived `rest` → `probe`, and the consumer's own read of
 * the leaf wrapped in the shell the survey found. The canary pins the leaf to the far frame first: if the
 * pinned reading is the unpinned reading, nothing the leaf says reaches the property, and a flat series would
 * be a fact about the fixture rather than about the representation.
 *
 * Measured, against the shipped sheet:
 *
 *     math-depth   0 -> 2      emitted  0 · 0 · 2 · 2 · 2     reshaped  0 · 1 · 1 · 2 · 2     canary 2
 *     math-depth   0 -> 7      emitted  0 · 0 · 7 · 7 · 7     reshaped  0 · 2 · 4 · 5 · 7     canary 7
 *
 * The reshape interpolates, in the engine's own integer rounding (`0 → 7` over five samples is
 * `0 · 1.75 · 3.5 · 5.25 · 7`, which serialises rounded), and the endpoints are unchanged. No family-specific
 * path is involved: one registration, one substitution, and the frames animating the argument rather than the
 * property.
 *
 * Hard failures, all of them lessons from this track rather than taste: a survey that finds only one of the
 * two shell shapes (the pattern is then not what we think it is); a surveyed leaf whose shell the emission
 * does not actually contain (the survey is describing something else); an arm that is discrete in both arms
 * (the proposal changed nothing); and an arm whose endpoints move (a different motion, not the same one
 * interpolated).
 *
 * Run: `pnpm research:d3-argument` (exits non-zero only on an arm defect, never on a finding).
 */
const DURATION = 1000
const WALL = [0, 250, 500, 750, 1000]

/**
 * The element a consumer is observable on.
 *
 * This is a fact about where the property *applies*, not a family-specific execution path: `math-depth` takes
 * effect on MathML elements, so a `<div>` carrying it computes to the initial value whatever the frames say,
 * and the canary reads a flat series on a fixture that was never able to see anything. Measured here: the
 * first run of this pass reported both `math-depth` arms `fixture-unobservable` for exactly that reason, and
 * the series was flat for the fixture's shape rather than for the representation's.
 */
const ELEMENT_OF = { 'math-depth': 'math', 'math-style': 'math' }

const pad = (text, width) => String(text).padEnd(width)

const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${root}/dist/index.js";\n`

const compile = async candidates =>
  finalizeCss((await compiler(ENTRY, root)).build(candidates)).css

/**
 * The leaves whose value the model wraps in a function, and where the wrapper is written.
 *
 * `leaf` shape: the entry's `value` *starts* with a function call. That is the whole test — `css('blur',
 * '0')` reads back as `blur(0)`, so a value beginning with an identifier and a paren is a shell around the
 * rest of its own expression.
 *
 * `phrase` shape: the candidate's part carries a wrapper. The part reader deliberately keeps only the part's
 * name (a quoted-name scan finds the wrapper's function name and credits a part that is not in the graph),
 * so the wrapper is read here from the same entry bodies, by the same syntactic test: a part element that
 * names the slot and also mentions a function.
 */
const shellSurvey = () => {
  const leaves = readPropertyEntries()
    .filter(entry => entry.value && FUNCTION.test(entry.value))
    .map(entry => ({
      leaf: entry.slot,
      shape: 'leaf',
      shell: entry.value.slice(0, entry.value.indexOf('(')),
      value: entry.value,
    }))

  const text = readFileSync(
    path.join(root, 'src', 'properties', 'tween.ts'),
    'utf8',
  )
  const phrases = []
  const part = /\[\s*'([\w-]+)'\s*,\s*value\s*=>\s*css\(\s*'([\w-]+)'/g

  for (const match of text.matchAll(part)) {
    phrases.push({ leaf: match[1], shape: 'phrase', shell: match[2] })
  }

  const merged = new Map()

  for (const one of [...leaves, ...phrases]) {
    const seen = merged.get(one.leaf)

    // A leaf in both tables is one reshape. The `leaf` shape is recorded first because it also names the rest
    // the registration has to replace, which is the fact the reshaped arm needs.
    merged.set(one.leaf, {
      ...seen,
      ...one,
      shapes: [...(seen?.shapes ?? []), one.shape],
    })
  }

  return [...merged.values()].sort((left, right) =>
    left.leaf.localeCompare(right.leaf),
  )
}

/**
 * The consumer's computed value at each instant of a held wall, on one element carrying the class.
 *
 * Both arms are forced to `linear`, and that is a correction the second family paid for: the emitted arm's
 * animation carries the phrase's own easing while the proposal's frames are written `linear`, so the two
 * series differed in the *easing* rather than in the representation — `0 · 8.17 · 16.05 · 19.21 · 20` against
 * `0 · 5 · 10 · 15 · 20` for a `blur` that no one disputed. With the easing held equal the arms differ only
 * in what is under test, which is the same discipline D.3.5's curve arms follow.
 */
const series = (klass, property, style, tag = 'div') =>
  page
    .setContent(
      `<style>${style}\n#e { animation-timing-function: linear; }</style><${tag} id="e" class="${klass}">x</${tag}>`,
    )
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

/**
 * The proposal, built from the emission's own facts and nothing else.
 *
 * The first version of this function moved the shell out of the leaf's *declaration* and into the consumer's
 * read of it, and the emission answered: there is no declaration of the leaf to move a shell out of. The
 * shell is written into the **frames of the property** — `--jumi-math-depth-add-sluPV-0: add(0)`, emitted
 * once, for both the two-value and the phrase spelling, as D.3.5 recorded — and the slot keyframes then read
 * those back as `math-depth: var(--…-0, var(--jumi-math-depth-add))`. So the animated subject is the
 * *property*, `math-depth` is not registered, and the series is a discrete flip: the shell cannot be
 * relocated inside the same frames.
 *
 * The proposal therefore changes **which subject the frames animate**, and that is the whole of it:
 *
 *     @property --jumi-math-depth-add { syntax: '<integer>'; initial-value: 0 }
 *     #e         { math-depth: add(var(--jumi-math-depth-add)) }    /* the composition owns the shell *\/
 *     @keyframes { from { --jumi-math-depth-add: 0 } to { …: 2 } }  /* the frames animate the argument *\/
 *
 * Everything it needs is already in hand, and none of it is inferred from computed text: the consumer's read
 * of the leaf is `application` exactly as the emission writes it, the shell is what the survey found, and the
 * two stops are the derivation's own `rest` and `probe`.
 */
const reshaped = (
  sheet,
  { application, consumer, leaf, probe, rest, shell, syntax },
) => {
  const name = `jumi-${leaf}-reshaped`
  const escaped = leaf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  /**
   * Every **write** of the leaf, and of any frame variable the leaf's slot owns, loses the shell — the leaf
   * has to hold the bare argument.
   *
   * This is the edit the first version of this function did not make, and the second family is what showed it
   * was needed: `math-depth`'s shell lives in the frames of the *property*, which the element rule overrides,
   * so leaving it there was harmless. `filter`'s shell lives in the leaf's own **rest** and in its class's
   * frame variables, and those the element rule cannot override — they are different properties. Measured:
   * pinning the leaf to `20px` with the shell still written into it left the composition reading
   * `blur(20px)` as one filter and `20px` as the next, so the whole declaration voided and `filter` computed
   * to `none`.
   */
  const writes = new RegExp(
    `(--jumi-${escaped}[\\w-]*:\\s*)${shell}\\(([^;{}]*)\\)`,
    'g',
  )
  const existing = new RegExp(`@property --jumi-${escaped}\\s*\\{[^}]*\\}`, 'g')
  const registration = `\n@property --jumi-${leaf} {\n  syntax: '${syntax}';\n  inherits: false;\n  initial-value: ${rest};\n}\n`
  const frames = `\n@keyframes ${name} {\n  from { --jumi-${leaf}: ${rest}; }\n  to { --jumi-${leaf}: ${probe}; }\n}\n`

  // The shell wraps the **leaf's read inside the composition**, never the composition itself. Wrapping the
  // application whole produces `blur(var(--a) var(--b) …)` — one filter whose argument is a filter list — and
  // the declaration voids: measured, `filter` read `none` in both arms.
  const read = `var(--jumi-${leaf})`
  const element = `\n#e {\n  ${consumer}: ${application.split(read).join(`${shell}(${read})`)};\n  animation: ${name} ${DURATION}ms linear both;\n}\n`

  return {
    css: `${sheet.replace(existing, '').replace(writes, '$1$2')}${registration}${frames}${element}`,
    // A proposal is only a proposal if the emission reads the leaf where the shell can wrap it, if it writes
    // the shell into something that can be stripped, and if the frames carry a value the leaf's syntax admits.
    edited:
      application.includes(read) &&
      rest !== '' &&
      probe !== '' &&
      probe !== rest &&
      writes.test(sheet),
  }
}

const browser = await chromium.launch()
const page = await browser.newPage()

/**
 * The shell's single argument, or `null` when the call does not take exactly one.
 *
 * This is the **argument position** the invariant asks the model to identify structurally — read off the
 * entry's own rest rather than assumed from a function-name table. A top-level comma means the shell takes a
 * list, and a list is not one independently interpolable subject: `drop-shadow(…)` is the case this refuses,
 * and refusing it is the honest answer rather than treating the whole list as one argument.
 */
const argumentOf = (value, shell) => {
  if (!shell || !value.startsWith(`${shell}(`) || !value.endsWith(')'))
    return null

  const inner = value.slice(shell.length + 1, -1).trim()

  if (inner === '') return null

  let depth = 0

  for (const char of inner) {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === ',' && depth === 0) return null
  }

  return inner
}

/**
 * The verdict for one pair of arms, in one place — because the second-family question **is** whether this
 * judgement applies unchanged, and a copy of it per family would answer a different question.
 */
const judge = ({ emitted, moved, pinned, probe }) => {
  if (pinned.values[0] === moved.values[0])
    return {
      note: `pinning the leaf to \`${probe}\` leaves the consumer at \`${moved.values[0]}\`, so this fixture cannot see the argument`,
      outcome: 'fixture-unobservable',
    }

  // "Moving" is not one thing, and the first classification could not tell the two apart: these emissions
  // *do* move, in the two steps of a discrete flip (`0 · 0 · 2 · 2 · 2`), which is the very defect the pass
  // exists for. A discrete series has the two stops and nothing else; an interpolated one has values between.
  const distinct = values => new Set(values).size
  const emittedSteps = distinct(emitted.values)
  const reshapedSteps = distinct(moved.values)
  const last = values => values[values.length - 1]

  if (reshapedSteps <= 2 && emittedSteps <= 2)
    return {
      failure: `the emission is discrete (${emitted.values.join(' · ')}) and the reshape is too (${moved.values.join(' · ')}), so the proposal changed nothing`,
    }

  if (
    moved.values[0] !== emitted.values[0] ||
    last(moved.values) !== last(emitted.values)
  )
    return {
      failure: `the reshape moves the endpoints (${emitted.values.join(' · ')} becomes ${moved.values.join(' · ')}), which is a different motion rather than the same one interpolated`,
    }

  // The strongest result the second-family test can produce, and the one the ruling asks for: the same
  // series, sample for sample, with the trajectory's *shape* changed and its motion unchanged. Easing is held
  // equal in both arms, so equality here is a statement about the representation and nothing else.
  if (emitted.values.join('|') === moved.values.join('|'))
    return {
      note: `the same series in both arms (${emittedSteps} distinct), so the relocation is motion-preserving`,
      outcome: 'equivalent',
    }

  return {
    note:
      emittedSteps <= 2
        ? `discrete as emitted (${emittedSteps} step${emittedSteps === 1 ? '' : 's'}) and interpolated by the reshape (${reshapedSteps})`
        : `interpolated as emitted (${emittedSteps} steps); the reshape keeps the same endpoints (${reshapedSteps})`,
    outcome: emittedSteps <= 2 ? 'reshape-unlocks' : 'already-interpolating',
  }
}

const survey = shellSurvey()
const byLeaf = new Map(survey.map(one => [one.leaf, one]))
const findings = []
const failures = []

for (const shape of ['leaf', 'phrase'])
  if (!survey.some(one => one.shapes.includes(shape)))
    failures.push(
      `the survey found no \`${shape}\`-shaped shell, so the pattern it describes is not the pattern in the model`,
    )

for (const plan of plans()) {
  if (plan.status !== 'planned') continue

  const one = byLeaf.get(plan.component)

  if (!one) continue

  const sheet = await compile([plan.klass])
  const { application } = applicationOf(sheet, plan.consumer)

  // The survey has to be describing the emission, not a memory of the model: the shell it found must be
  // somewhere the emission writes the leaf's value. The whole sheet is the scope, and that is a correction
  // this line already earned — the frames of a phrase are emitted as *class* variables
  // (`--jumi-math-depth-add-sluPV-0: add(0)`, beside the slot wiring and *before* any `@keyframes`), so a
  // check that started at `@keyframes` reported the shell as missing for the one pair this pass exists to
  // measure.
  if (!new RegExp(`\\b${one.shell}\\(`).test(sheet)) {
    failures.push(
      `${plan.component}: the survey reports a \`${one.shell}\` shell, but the emission never writes one`,
    )

    continue
  }

  const proposal = reshaped(sheet, {
    application,
    consumer: plan.consumer,
    leaf: plan.component,
    probe: plan.probe,
    rest: plan.rest,
    shell: one.shell,
    syntax: plan.syntax,
  })

  if (!proposal.edited) {
    failures.push(
      `${plan.component}: the reshaped sheet made none of the three edits, so the arms are identical`,
    )

    continue
  }

  const tag = ELEMENT_OF[plan.consumer] ?? 'div'
  const emitted = await series(plan.klass, plan.consumer, sheet, tag)
  const moved = await series(plan.klass, plan.consumer, proposal.css, tag)

  // The canary: pin the leaf to the far frame and ask whether the consumer *deviates* from its unpinned
  // reading. A pin holds the animation off, so it is constant by construction — the first version of this
  // test asked for variation over the wall and so reported every working pin as blindness. What it has to
  // establish is that the consumer can see the leaf at all: if the pinned reading is the unpinned reading,
  // nothing the leaf says reaches the property, and a flat reshaped series is a fact about the fixture rather
  // than about the representation.
  const pinned = await series(
    plan.klass,
    plan.consumer,
    `${proposal.css}\n#e { --jumi-${plan.component}: ${plan.probe}; animation: none; }`,
    tag,
  )

  const verdict = judge({
    emitted,
    moved,
    pinned,
    probe: plan.probe,
  })

  if (verdict.failure) failures.push(`${plan.component}: ${verdict.failure}`)
  else
    findings.push({
      ...recordOf(plan, one, { emitted, moved, pinned }),
      ...verdict,
    })
}

/**
 * D.3.6's second-family falsification, in the ruling's own terms: *does the same subject relocation work in a
 * second family without changing core behaviour?*
 *
 * Two representatives, not a census — `filter-blur` and its `backdrop-filter` twin, plus one whose grammar is
 * materially different (`filter-hue-rotate` is an `<angle>`, so the argument's type, its unit family and its
 * probe are all different from `blur`'s). Everything the arms need is **structurally identified or the arm is
 * refused**: the shell from the survey, the argument position from the shell's own rest, the syntax from the
 * candidate's single declared type through the derivation's own `SYNTAX_OF` table (one copy, so it cannot
 * drift), the consumer from the pair's own route, the composition from the emission, and the two stops from
 * the shared `PROBES`. The judgement is `judge` — the same function the `math-depth` arms ran through, which
 * is what makes this a test of the primitive rather than of a copy of it.
 *
 * Note where the shell has to move *from* here: unlike `math-depth`, these entries write the shell into the
 * leaf's **rest** (`value: css('blur', '0')`) while the composition already reads the leaf bare, so the
 * proposal has to take the shell out of the emission and put it into the composition. Two origins, one
 * transformation — and the origins are reported separately rather than normalized, per the ruling.
 */
const REPRESENTATIVES = [
  'filter-blur',
  'backdrop-filter-blur',
  'filter-hue-rotate',
]

const representatives = []
const candidates = readCandidates()

for (const leaf of REPRESENTATIVES) {
  const one = byLeaf.get(leaf)
  const pair = population().find(entry => entry.component === leaf)
  const route = pair ? routesOf(pair)[0] : null
  const types =
    candidates.find(entry => (entry.parts ?? []).includes(leaf))?.types ?? []
  const syntaxes = [
    ...new Set(types.map(type => SYNTAX_OF[type]).filter(Boolean)),
  ]
  // The leaf's resolved rest comes from the derivation, not from the property table: that reader returns the
  // **source text** for a helper-composed entry (`css('blur', '0')`), and asking a source string to begin with
  // a shell is how the first version of this line refused all three representatives — a refusal that read as
  // "the shell takes more than one argument" when nothing had been read at all.
  const rest = argumentOf(pair ? derive(pair).rest : '', one?.shell ?? '')
  const probe = (PROBES[syntaxes[0]] ?? [])[0] ?? null

  const refused = !one
    ? 'the survey does not know this leaf'
    : !pair
      ? 'no pair in the population'
      : !route
        ? 'no serving candidate'
        : rest === null
          ? `the shell \`${one.shell}\` does not take exactly one argument`
          : syntaxes.length !== 1
            ? `the candidate's grammar is ${JSON.stringify(types)} and an arm registers one syntax`
            : probe === null
              ? `no probe is declared for \`${syntaxes[0]}\``
              : null

  if (refused) {
    representatives.push({ leaf, note: refused, outcome: 'refused' })

    continue
  }

  const klass = `${route.candidate}-[0:${rest}|100:${probe}]`
  const sheet = await compile([klass])
  const { application } = applicationOf(sheet, route.consumer)
  const proposal = reshaped(sheet, {
    application,
    consumer: route.consumer,
    leaf,
    probe,
    rest,
    shell: one.shell,
    syntax: syntaxes[0],
  })
  const tag = ELEMENT_OF[route.consumer] ?? 'div'
  const emitted = await series(klass, route.consumer, sheet, tag)
  const moved = await series(klass, route.consumer, proposal.css, tag)
  const pinned = await series(
    klass,
    route.consumer,
    `${proposal.css}\n#e { --jumi-${leaf}: ${probe}; animation: none; }`,
    tag,
  )
  const record = {
    canary: pinned.values,
    consumer: route.consumer,
    emitted: emitted.values,
    leaf,
    parent: pair.parent,
    probe,
    reshaped: moved.values,
    rest,
    shape: one.shapes.join('+'),
    shell: one.shell,
    syntax: syntaxes[0],
  }

  // The same two guards the `math-depth` arm carries, for the same reasons: the survey must be describing
  // *this* emission, and a proposal that made no edit would leave the arms identical while reporting a
  // difference it never produced.
  if (!new RegExp(`\\b${one.shell}\\(`).test(sheet))
    failures.push(
      `${leaf}: the survey reports a \`${one.shell}\` shell, but the emission never writes one`,
    )
  else if (!proposal.edited)
    failures.push(
      `${leaf}: the reshaped sheet made no edit, so the arms are identical`,
    )
  else {
    const verdict = judge({ emitted, moved, pinned, probe })

    if (verdict.failure) failures.push(`${leaf}: ${verdict.failure}`)
    else representatives.push({ ...record, ...verdict })
  }
}

function recordOf(plan, one, arms) {
  return {
    canary: arms.pinned.values,
    consumer: plan.consumer,
    emitted: arms.emitted.values,
    leaf: plan.component,
    magnitude: plan.magnitude,
    parent: plan.parent,
    probe: plan.probe,
    reshaped: arms.moved.values,
    rest: plan.rest,
    shape: one.shapes.join('+'),
    shell: one.shell,
    syntax: plan.syntax,
  }
}

const unlocked = findings.filter(one => one.outcome === 'reshape-unlocks')

console.log(
  `the shell survey: ${survey.length} leaves carry a function around their value`,
)
for (const one of survey)
  console.log(
    `  ${pad(one.leaf, 34)} ${pad(one.shapes.join('+'), 14)} ${one.shell}(`,
  )

console.log(
  `\nthe plans this pass could measure: ${findings.length} arm(s), ${unlocked.length} the reshape unlocks`,
)
for (const one of findings)
  console.log(
    `  ${pad(one.parent, 26)} ${pad(`[${one.syntax}]`, 12)} ${pad(one.outcome, 17)} ${one.note}`,
  )

console.log(
  `\nthe second-family falsification: ${representatives.length} arm(s) of ${REPRESENTATIVES.length} representatives`,
)
for (const one of representatives)
  console.log(
    `  ${pad(`${one.parent ?? '—'} ← ${one.leaf}`, 44)} ${pad(one.syntax ? `[${one.syntax}]` : '', 12)} ${pad(one.outcome, 17)} ${one.note}`,
  )

if (failures.length) {
  console.log('\n✗ arm defects:')
  for (const one of failures) console.log(`  ${one}`)
}

writeFileSync(
  path.join(root, 'scripts', 'argument-reshape.json'),
  `${JSON.stringify({ findings, representatives, source: 'D.3.6 · scripts/research/d3-argument.mjs', survey }, null, 2)}\n`,
)

await browser.close()

if (failures.length) process.exitCode = 1
