import { derivations, SYNTAX_OF } from './derivation.mjs'
import { describe } from './observation.mjs'
import { readCandidates } from './property-model.mjs'

/**
 * D.3.5 · the third pass: **validating a derived representation in a browser**.
 *
 * The derivation pass answers whether a typed syntax can be derived from two model facts; it does not
 * answer whether the syntax **works**. This is the step between them, and the ruling named its shape:
 *
 *   registration/rest differential → native-vs-typed interpolation differential → contexts → verdict
 *
 * Everything an arm needs is model-derived, which is the point: 41 pairs, 82 arms, and **no hand-written
 * fixture**. The one authored input is a *probe* — a value the syntax admits — because a class has to carry
 * a value for the compiler to emit anything at all; the resting value, the far frame, the consumer surface
 * and the wiring are all read out of the emission.
 *
 * Two rules carried over from the passes before this one, because both were learned by getting them wrong:
 *
 *   **A proposal may not be validated against a value the model did not derive.** The arm compiles
 *   `animate-<candidate>-[0:<rest>|100:<probe>]` — the phrase form, with the model's own resting value as the
 *   first stop — and asserts that the sheet's rest is the rest the derivation used. The single-value spelling
 *   (`-[2]`) is not usable here for a different reason: it sets the leaf's *live* slot to the target, so the
 *   application reads the frame and the leaf never drives anything. Measured, not assumed: with `-[2]` the
 *   property sat at the target at every instant, and the arm had no motion to compare.
 *
 *   **A reading is only evidence if it can see a gap.** Each arm carries a canary — pin the leaf to the far
 *   frame and the consumer must move. `math-depth` reads `0` on a plain element whatever the leaf says, so
 *   that arm cannot decide anything about the representation, and it says so (`fixture-unobservable`) instead
 *   of reporting the agreement of two identical readings as `movable`.
 *
 * Nothing here declares a representation, writes `typedLeaves`, or promotes anything: the verdict is about
 * the representation **as tested**, and the ruling is explicit that an unsafe verdict belongs to the tested
 * representation rather than to the conceptual constituent forever.
 */

/**
 * The five verdicts, in the vocabulary the census has used since D.3.4.
 *
 * The two unsafe classes stay apart on purpose: `registration-unsafe` means the resting value does not
 * survive the syntax (the property falls to the registration's initial value on every element that never
 * asked for a motion), and `interpolation-unsafe` means the rest survives and the motion through the typed
 * leaf diverges from the property's own. They point at different repairs.
 */
export const VERDICTS = [
  'movable',
  'registration-unsafe',
  'interpolation-unsafe',
  'unresolved',
  'fixture-unobservable',
  // Added by the ruling on this pass, and deliberately outside the four census classes: the
  // representation was **never tested**, because production does not currently produce a valid consumer
  // value for the pair. Calling that `unresolved` or `fixture-unobservable` would file a defect in the
  // emission under the D.3 workstream it does not belong to.
  'blocked-by-emission',
]

/**
 * The authored probe per syntax: the far stop of the phrase the arm compiles.
 *
 * The only input the model does not carry, and it is deliberately one value per syntax rather than a table
 * per property. Each probe is a value the syntax admits **by the shape reader's own judgement** — that is
 * asserted in the test suite rather than asserted here — and each is chosen to be distinguishable from the
 * resting values in this population: not `0`, not `transparent`, not `currentColor`, not a full turn.
 *
 * Two magnitudes per syntax, because one cannot tell "the representation holds" from "this value happened to
 * hold". The second is the arm's **context**, and it is canary-checked like everything else: where the second
 * magnitude renders the same as the first, that context is reported as not exercised rather than counted.
 */
export const PROBES = {
  '<angle>': ['45deg', '0.5turn'],
  // Space-free, and that is a requirement rather than a style: the probe ends up inside a *class attribute*
  // as well as inside a selector, so `rgba(0, 0, 255, 0.5)` splits into four class names and the element
  // silently matches nothing. Measured — that is exactly how the second magnitude of every colour arm read
  // `none` on its first run, with the emission and the representation both entirely innocent.
  '<color>': ['#ff0000', '#0000ff80'],
  '<integer>': ['2', '7'],
  '<length>': ['20px', '0.5em'],
  '<number>': ['2', '0.5'],
  '<percentage>': ['75%', '25%'],
}

/**
 * One pair's arm plan, as far as the model carries it.
 *
 * Refused rather than approximated, with the reason: a pair whose candidate addresses the *parent's* whole
 * value has no class spelling that names this component's value, and inventing one would be authoring the
 * fixture this pass exists to avoid. That is `unresolved`, and it names the pair rather than dropping it.
 */
export const planFor = (derivation, magnitude = 0) => {
  const { component, parent } = derivation.pair
  const pair = `${parent}/${component}`

  if (derivation.outcome !== 'mechanically derivable')
    return {
      pair,
      reason: `the derivation outcome is \`${derivation.outcome}\`, not a proposal`,
      status: 'unresolved',
    }

  if (derivation.proposal.length !== 1)
    return {
      pair,
      reason: `the proposal is a union (\`${derivation.proposal.join(' | ')}\`) and an arm registers one syntax`,
      status: 'unresolved',
    }

  const descriptor = describe(derivation.pair)
  const entry = readCandidates().find(one => one.name === descriptor.candidate)
  const syntax = derivation.proposal[0]
  const probes = PROBES[syntax]

  if (!probes)
    return {
      pair,
      reason: `no probe is declared for \`${syntax}\``,
      status: 'unresolved',
    }

  // The class spelling has to name *this component's* value. `candidate.parts` says a part candidate does
  // (`animate-background-position-x-offset`), and `attribute === component` says the candidate addresses the
  // component's own property (`animate-background-color`). A whole candidate addressing an ancestor would
  // need the parent's whole value assembled, which is a different fixture and a decision of its own.
  if (
    !entry ||
    (!entry.parts.includes(component) && entry.attribute !== component)
  )
    return {
      pair,
      reason:
        `\`${descriptor.candidate}\` addresses \`${entry?.attribute ?? 'nothing'}\` as a whole, so a class ` +
        `carrying it names the parent's value and not this component's`,
      status: 'unresolved',
    }

  const probe = probes[magnitude]

  if (!probe)
    return {
      pair,
      reason: `no magnitude ${magnitude} for \`${syntax}\``,
      status: 'unresolved',
    }

  return {
    candidate: descriptor.candidate,
    component,
    consumer: descriptor.consumer,
    klass: `${descriptor.candidate}-[0:${derivation.rest}|100:${probe}]`,
    magnitude,
    pair,
    parent,
    probe,
    // The model's resting value, which the sheet is asserted against rather than trusted to agree with.
    rest: derivation.rest,
    status: 'planned',
    syntax,
  }
}

/** Every derivable pair, planned once per declared magnitude — so a pair is never silently dropped. */
export const plans = () =>
  derivations()
    .filter(one => one.outcome === 'mechanically derivable')
    .flatMap(derivation =>
      (PROBES[derivation.proposal[0]] ?? [null]).map((_, magnitude) =>
        planFor(derivation, magnitude),
      ),
    )

/**
 * Every `--jumi-*` name an expression ends up depending on, through the sheet's own declarations.
 *
 * The application is not always the leaf: `object-position: var(--jumi-object-position)` reads a
 * *composition*, whose own definition reads `--jumi-object-position-x-offset`. So the slots are resolved
 * transitively rather than read off the application's text, and the sheet is the authority for what each name
 * expands to. A name the sheet never declares ends the walk: that is a reader that has lost the emission, not
 * a leaf with no slot.
 */
export const slotsOf = (expression, css) => {
  const seen = new Set()
  const queue = [...String(expression).matchAll(/--jumi-[A-Za-z0-9-]+/g)].map(
    match => match[0],
  )

  while (queue.length) {
    const name = queue.shift()

    if (seen.has(name)) continue

    seen.add(name)

    const declaration = new RegExp(`--jumi-${name.slice(7)}:\\s*([^;]+);`).exec(
      css,
    )

    if (declaration)
      queue.push(
        ...[...declaration[1].matchAll(/--jumi-[A-Za-z0-9-]+/g)].map(
          match => match[0],
        ),
      )
  }

  return seen
}

/**
 * The **slot the arm pins** so the reading is about the leaf and not about the emission's animation.
 *
 * Two shapes, both read rather than assumed. A part candidate's application reaches the component's own slot
 * (`rotate: var(--jumi-rotate-x) …`, and `object-position: var(--jumi-object-position)` two steps down), so
 * pinning `--jumi-<component>` is pinning the leaf. A whole candidate addressing the component's own property
 * reaches a *versioned* slot instead (`--jumi-background-color-Zkj828`, the id being the candidate's), and
 * that slot is pinned — the composition never names the bare component there, which is why the discrimination
 * has to be made against the sheet rather than against the application's first `var(`.
 */
export const pinningOf = ({ application, component, css, slot }) => {
  if (slotsOf(application, css ?? '').has(`--jumi-${component}`))
    return `--jumi-${component}`

  if (slot?.startsWith(`--jumi-${component}-`)) return slot

  return null
}

/**
 * Every frame the sheet carries for one component, by stop.
 *
 * The emission names frames in two spellings — `--jumi-rotate-x-100` and
 * `--jumi-background-color-Zkj828-100` — so the reader takes the optional candidate id rather than assuming
 * one. A stop of `0` and a final stop are both required: a pair whose emission animates a single value has no
 * motion for the arm to compare, and that is a refusal with a reason rather than a comparison of two
 * identical readings.
 */
export const framesOf = (css, component) => {
  const frames = [
    ...css.matchAll(
      new RegExp(
        `--jumi-${component}(?:-[A-Za-z0-9]+)?-(\\d+):\\s*([^;]+);`,
        'g',
      ),
    ),
  ].map(match => ({ stop: Number(match[1]), value: match[2].trim() }))

  const first = frames.find(one => one.stop === 0)

  if (!first)
    throw new Error(`the sheet carries no \`0\` frame for --jumi-${component}`)

  const far = frames
    .filter(one => one.stop > 0)
    .sort((one, two) => two.stop - one.stop)[0]

  if (!far)
    throw new Error(`the sheet carries one frame for --jumi-${component}`)

  return { far, first, stops: frames }
}

/**
 * The verdict, from what the browser read. Pure, so the precedence is testable without a browser.
 *
 * The order is the protocol's, not a preference: the fixture has to be able to see the constituent before
 * either differential can mean anything, and the rest has to survive the registration before interpolation
 * through it is a question at all. `registration-safe` is an **eligibility gate** — the reach gate said so —
 * and it is not `movable`.
 *
 * A canary that fails is not one finding but three, and the difference is measured rather than attributed:
 *
 *   `''` for the consumer            the engine computes nothing for the property at all
 *                                    (`mask-border-outset`: Chromium does not implement it) — a fixture the
 *                                    environment cannot support, not a statement about the representation
 *   the same as a bare element       the arm's own declaration never computed — for `offset-anchor` the
 *                                    emission's application is `center 0 center 0`, which the property
 *                                    rejects, so the pair cannot be observed through this surface at all
 *   anything else                    the observable cannot see this constituent (`rotate-z` at an angle of
 *                                    `0deg` normalises to `0deg` however the z axis is scaled)
 *
 * The second is a finding about the emission rather than about the representation, so it is `unresolved` —
 * the verdict that means "nothing here decides it" — while the first and third are limits of the fixture and
 * say so. They stay distinguishable because they are different work.
 *
 * And a divergence is not always a divergence: where the property declines to interpolate its own two
 * endpoint renderings, there is no native baseline to compare against and the arm says so rather than
 * reporting the absence as a fault in the representation.
 */
export const verdictOf = ({
  applied,
  bare,
  canary,
  property,
  rest,
  series,
}) => {
  if (!canary.exercised) {
    if (applied === '')
      return {
        cause: 'no computed form',
        reason: `the engine computes nothing for \`${property}\`, so no reading of it can decide anything`,
        verdict: 'fixture-unobservable',
      }

    if (applied === bare)
      return {
        cause: 'the emission produces no valid value',
        reason:
          `the arm's own declaration computes to \`${applied}\`, which is what \`${property}\` reads with no ` +
          `motion applied at all: the emission's application does not compute on this element, so neither the ` +
          `native nor the typed path can be judged through it`,
        verdict: 'blocked-by-emission',
      }

    return {
      cause: 'constituent invisible',
      reason: `the leaf moves and \`${property}\` stays \`${applied}\`: this observable cannot see this constituent`,
      verdict: 'fixture-unobservable',
    }
  }

  if (!rest.preserved)
    return {
      cause: 'rest not preserved',
      reason: `the rest does not survive the syntax: \`${rest.without}\` unregistered, \`${rest.registered}\` registered`,
      verdict: 'registration-unsafe',
    }

  if (!series.agrees) {
    // No baseline is `unresolved` rather than `fixture-unobservable`, and the distinction is the ruling's:
    // the fixture *can* see the property, and what is missing is the thing to compare against. `rotate-x`
    // normalises — `0deg` and `2 0 1 0deg` are one form to the other — so the property declines to
    // interpolate its own two renderings, and the typed arm moving while it does is interesting without being
    // equivalence.
    if (series.nativeFlat)
      return {
        cause: 'no native baseline',
        reason:
          `\`${property}\` will not interpolate its own two renderings (\`${(series.nativeEndpoints ?? []).join('\` -> \`')}\`), ` +
          `so there is nothing native to compare the typed arm against`,
        verdict: 'unresolved',
      }

    return {
      cause: 'divergence',
      reason: `native \`${series.native.join(' · ')}\` but typed \`${series.typed.join(' · ')}\``,
      verdict: 'interpolation-unsafe',
    }
  }

  return { cause: null, reason: null, verdict: 'movable' }
}
