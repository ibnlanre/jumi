import type { PropertyType } from '@/types'

/**
 * A leaf that is **typed** — registered with a real grammar and an initial value rather than the
 * permissive `syntax: "*"` a token gets.
 *
 * The registration itself is `@/core`'s business; what lives here is the *declaration*, because a
 * typed leaf is a fact about the family that owns it and not about the branch that happens to
 * register it.
 */
export type TypedLeaf = {
  /**
   * What representation an animation frame writes.
   *
   * A typed custom property's **accepted grammar and its interpolation representation are different
   * concerns**, and this is the field that says so. `syntax` governs what the leaf accepts at rest —
   * which is why it is a union for `scale`, since an author may write `50%`. The canonicalizer governs
   * what a *frame* writes, because a union interpolates only between two spellings of the same
   * component: animating a `<number> | <percentage>` leaf from `1` to `150%` does not blend, it jumps.
   *
   * Measured, and the reason this field exists: animating the canonical form is **bit-identical to
   * native `scale` at every sampled point** for `1 → 150%`, `50% → 2`, `50% → 150%` and `1 → 2`, where
   * animating the authored forms steps on the two mixed pairs. Native `scale` treats `1` and `150%` as
   * the same kind of scale factor; the registered property does not.
   *
   * Returns `null` to **decline**, and a caller that gets `null` keeps the authored value. A `string`
   * return would make declining inexpressible, and declining is required: the canonicalizer only
   * transforms values that are semantically equivalent under the property's own grammar, so anything
   * outside the forms it understands must pass through untouched rather than be guessed at.
   */
  animationCanonicalizer?: ((value: string) => null | string) | undefined
  /**
   * This leaf is **execution machinery** rather than an authoring component: what a frame writes, not what an
   * author writes.
   *
   * The distinction is first-class because three subsystems were conflating it — the census counted such a leaf
   * as a constituent, the evidence model required a route for it, and the only way to give it one was to invent
   * an entrance no author has. What is true of it instead: it has **no candidate route** and never will, it is
   * not population, and it is evidenced through the public routes that generate it. Absence means addressable,
   * which is why this is a marker rather than a required field — the map's overwhelming majority is authoring
   * surface and should not have to say so.
   */
  execution?: true | undefined
  /** The value the property falls to when nothing declares it. */
  initialValue: string
  /** A CSS syntax string, unquoted — `@/core` quotes it into the `syntax` descriptor. */
  syntax: string
}

/** The scalar forms `scale` accepts, as one number optionally signed and optionally a percentage. */
const SCALE_FACTOR = /^[+-]?(\d+\.?\d*|\.\d+)%?$/

/**
 * A `scale` factor written as a **plain number**, or `null` when the value is not one.
 *
 * Native `scale` accepts `<number>` and `<percentage>` as the same kind of thing — `50%` and `0.5` are
 * the same scale factor — but a registered custom property interpolates them as two branches of a
 * union and steps between them. Writing the number is what keeps an animation on one branch, and the
 * measurement is that this reproduces native `scale` exactly.
 *
 * Deliberately narrow, and it declines rather than guesses:
 *
 *   `150%`  → `1.5`     `50%` → `0.5`     `-25%` → `-0.25`     `12.25%` → `0.1225`
 *   `2`     → `2`       `-1`  → `-1`      `.5`   → `.5`
 *   `none`, `calc(1)`, `1px`, `50 %`, `var(--x)`, `50%%`   → `null`
 *
 * This is not a CSS value normalizer and must not become one: it rewrites a value only when the
 * rewrite is *semantically equivalent under `scale`'s own grammar*, which is the only condition under
 * which a frame may differ from what an author wrote. A plain number is returned as authored — the
 * rewrite would be an identity, and an identity rewrite is one more thing a test has to pin for no
 * gain.
 */
export const scaleFactorToNumber = (value: string): null | string => {
  const trimmed = value.trim()

  if (!SCALE_FACTOR.test(trimmed)) return null
  if (!trimmed.endsWith('%')) return trimmed

  // The decimal point moves **textually**, and that is not a stylistic choice: `33.333 / 100` is
  // `0.33332999999999996` in binary floating point, so dividing would write six digits of noise into
  // a frame. Shifting the digits cannot introduce error, because there is no arithmetic.
  const sign = trimmed.startsWith('-') ? '-' : ''
  const magnitude = trimmed.replace(/^[+-]/, '').slice(0, -1)
  const [whole = '', fraction = ''] = magnitude.split('.')
  const padded = whole.padStart(3, '0')

  const shifted =
    `${padded.slice(0, -2)}.${padded.slice(-2)}${fraction}`.replace(
      /\.?0+$/,
      '',
    )

  return !shifted || shifted === '0' ? '0' : `${sign}${shifted}`
}

/**
 * A `<length>` or a `<length-percentage>`, as **one** interpolation branch, or `null`.
 *
 * This canonicalizer does not rewrite anything — it is a **guard**, and the distinction matters: the
 * constituent path's only validator is the leaf's canonicalizer, so a family that declares leaves
 * without one will claim its property for values the leaf cannot hold, animating nothing while
 * suppressing every other declaration of that property.
 *
 * Declines `calc()` and `var()` as well as keywords, which is the same line `scale` draws: a value
 * whose *shape* cannot be checked keeps the composed-property path, which is correct today.
 */
export const lengthish = (value: string): null | string => {
  const trimmed = value.trim()

  return /^[+-]?(\d+\.?\d*|\.\d+)([a-z]+|%)?$/i.test(trimmed) ? trimmed : null
}

/** The same guard for a component that takes a `<length>` only — `translate`'s z axis. */
export const lengthOnly = (value: string): null | string => {
  const guarded = lengthish(value)

  return guarded !== null && guarded.endsWith('%') ? null : guarded
}

/**
 * The typed leaves of each family that has them.
 *
 * Declared per family rather than emitted where a family is implemented, because the alternative is
 * three literal registrations buried in the `scale` branch, which is the shape that cannot be
 * generalized: a second family would mean a second copy, and the two would drift the moment one
 * grammar was corrected. A declaration like this one gives the generalization something to consume
 * instead of something to imitate.
 *
 * **Only `scale` is here, and deliberately.** It is the proving family — fully addressable, a
 * grammar that is already understood, and an ownership case that is easy to reason about. A second
 * family joins when the mechanism has been shown to work end to end, not before.
 *
 * The syntax is a **union, not `<number>`**, and that was measured rather than chosen. `scale` accepts
 * a percentage, `animate-scale-x-[50%]` reaches the leaf through the `any` escape hatch and works
 * today, and a `<number>` registration breaks it *silently*: the leaf computes to the registered
 * initial instead of the authored value. `<number> | <percentage>` keeps that value and leaves
 * numeric interpolation bit-identical — a midpoint of `1 → 5` reads `4.20961` under both. So the
 * union costs nothing where only numbers are used and is the difference between accepting a
 * percentage and discarding it.
 *
 * A union interpolates only between two spellings of the **same** component, so `1 → 150%` does not
 * blend. That is a property of the union and not a regression: today that pair does not blend
 * either, and the alternative is not "blending" but resetting to `1`.
 *
 * Every leaf named here must be a leaf of the family it is declared under: a typed registration on a
 * name that is not part of the composition is a registration nothing reads.
 */
/**
 * An argument that must be an integer: identity where the value is one, `null` where it is not.
 *
 * The same shape `lengthish` and `lengthOnly` already are, and for the same reason: a leaf's canonicalizer is
 * the constituent path's only validator, so a leaf whose grammar admits values it cannot hold has to declare
 * one. `<integer>` declines `2.5`, and without this guard the authored value would be discarded in favour of
 * the registered initial instead of falling through to the representation the model already had.
 */
export const integerOnly = (value: string): null | string =>
  /^[+-]?\d+$/.test(value.trim()) ? value.trim() : null

export const typedLeaves: Partial<
  Record<PropertyType, Record<string, TypedLeaf>>
> = {
  /**
   * The D.3.5 batch: **30 declarations from 35 validated routes**, plus the six that were declared before it.
   *
   * The batch's leaves were derived from two model facts (the resting shape and the candidate's declared
   * grammar) and then measured **route by route** — rest first, then native against typed interpolation at two
   * authored magnitudes — and only the `movable` routes are here. `scripts/validated-representations.json` holds
   * the evidence, one record per route, and `typed-leaves.test.ts` asserts this map against it exactly: every
   * leaf declared here names a `movable` record for that family, representation and initial value, every
   * `movable` route is declared, and neither set can grow without the other.
   *
   * A **route** is why this is not one declaration per pair. A registration is looked up through the attribute
   * the *candidate* animates, and a pair can be served by more than one candidate: `animate-border-left-radius`
   * addresses `border-radius` with `border-bottom-left-radius` as one of its parts, while
   * `animate-border-bottom-left-radius` addresses the corner's own property. The four corners are the only pairs
   * in this batch with two routes, and they are declared under both — keying a leaf on one route leaves the
   * other half-typed, one leaf interpolating and its sibling not, which is a silent failure rather than a loud
   * one.
   *
   * Anything absent is absent by design, and each absence is a record with a verdict: `math-depth-add`'s
   * interpolation unit is an argument inside `add(...)` rather than the leaf its rest suggested (reshape work),
   * `offset-anchor-x/y`'s application does not compute at all (an emission defect), the rotate axes and
   * `mask-border-outset` are undecided, and the five union-syntax routes of `scale` and `translate` are refused
   * by this pass because a union is not one probe — those six leaves are the pre-existing declarations above,
   * carried by their own landing records rather than by this batch.
   */
  'background-color': {
    'background-color': {
      initialValue: 'transparent',
      syntax: '<color>',
    },
  },
  'background-position': {
    'background-position-x-offset': {
      initialValue: '0%',
      syntax: '<percentage>',
    },
    'background-position-y-offset': {
      initialValue: '0%',
      syntax: '<percentage>',
    },
  },
  'border-block-color': {
    'border-block-color': {
      initialValue: 'currentColor',
      syntax: '<color>',
    },
  },
  'border-bottom-left-radius': {
    'border-bottom-left-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
  },
  'border-bottom-right-radius': {
    'border-bottom-right-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
  },
  'border-color': {
    'border-color': {
      initialValue: 'currentColor',
      syntax: '<color>',
    },
  },
  'border-radius': {
    'border-bottom-left-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
    'border-bottom-right-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
    'border-top-left-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
    'border-top-right-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
  },
  'border-top-left-radius': {
    'border-top-left-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
  },
  'border-top-right-radius': {
    'border-top-right-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
  },
  'box-shadow': {
    'box-shadow-blur': {
      initialValue: '0',
      syntax: '<length>',
    },
    'box-shadow-color': {
      initialValue: 'transparent',
      syntax: '<color>',
    },
    'box-shadow-offset-x': {
      initialValue: '0',
      syntax: '<length>',
    },
    'box-shadow-offset-y': {
      initialValue: '0',
      syntax: '<length>',
    },
    'box-shadow-spread': {
      initialValue: '0',
      syntax: '<length>',
    },
  },
  'column-rule-color': {
    'column-rule-color': {
      initialValue: 'currentColor',
      syntax: '<color>',
    },
  },
  'math-depth': {
    /**
     * The first **shell-shaped** leaf to be typed — D.3.6's proving case.
     *
     * The shell is not declared here and must not be: it is read off the composition, which now spells
     * `add(var(--jumi-math-depth-add))`, so the model already says where the function is and what its sole
     * argument is. All this declaration adds is what the argument *is* — a bare integer — which is the one
     * fact the composition cannot state.
     *
     * It is declared alone, and the 22 surveyed `filter`/`backdrop-filter` leaves are not, because the two
     * have different evidence: `math-depth-add`'s relocation repairs a discrete flip, while theirs was
     * measured motion-preserving with representability as its only benefit. Structural resemblance is not
     * evidence, so this map stays the gate rather than a list of everything that matches the shape.
     */
    'math-depth-add': {
      animationCanonicalizer: integerOnly,
      initialValue: '0',
      syntax: '<integer>',
    },
  },
  'object-position': {
    'object-position-x-offset': {
      initialValue: '50%',
      syntax: '<percentage>',
    },
    'object-position-y-offset': {
      initialValue: '50%',
      syntax: '<percentage>',
    },
  },
  /**
   * `offset-anchor`'s two **execution** leaves.
   *
   * Nothing public addresses them, and that is the family's design rather than a gap: an author writes an edge
   * or an offset, and the resolver turns the four of those into these two. They are what the frames animate, so
   * they are declared — a write to an unregistered property is discrete instead of interpolable — while being
   * marked as machinery so nothing asks them for a route they cannot have.
   *
   * Their rest is the resolved form of the authoring rests rather than a new opinion: `center` over a `0` offset
   * is `50%`, which is the same anchor, and it is also what makes the resting composition a value the property
   * accepts where the four-token one computed to `auto`.
   */
  'offset-anchor': {
    'offset-anchor-x-position': {
      execution: true,
      initialValue: '50%',
      syntax: '<length-percentage>',
    },
    'offset-anchor-y-position': {
      execution: true,
      initialValue: '50%',
      syntax: '<length-percentage>',
    },
  },
  'offset-position': {
    'offset-position-x-offset': {
      initialValue: '50%',
      syntax: '<percentage>',
    },
    'offset-position-y-offset': {
      initialValue: '50%',
      syntax: '<percentage>',
    },
  },
  'outline': {
    'outline-color': {
      initialValue: 'currentColor',
      syntax: '<color>',
    },
  },
  'rotate': {
    'rotate-angle': {
      initialValue: '0deg',
      syntax: '<angle>',
    },
  },
  'scale': {
    'scale-x': {
      animationCanonicalizer: scaleFactorToNumber,
      initialValue: '1',
      syntax: '<number> | <percentage>',
    },
    'scale-y': {
      animationCanonicalizer: scaleFactorToNumber,
      initialValue: '1',
      syntax: '<number> | <percentage>',
    },
    'scale-z': {
      animationCanonicalizer: scaleFactorToNumber,
      initialValue: '1',
      syntax: '<number> | <percentage>',
    },
  },
  'text-shadow': {
    'text-shadow-blur-radius': {
      initialValue: '0',
      syntax: '<length>',
    },
    'text-shadow-color': {
      initialValue: 'currentColor',
      syntax: '<color>',
    },
    'text-shadow-offset-x': {
      initialValue: '0px',
      syntax: '<length>',
    },
    'text-shadow-offset-y': {
      initialValue: '0px',
      syntax: '<length>',
    },
  },
  'transform-origin': {
    'transform-origin-z': {
      initialValue: '0px',
      syntax: '<length>',
    },
  },
  'translate': {
    'translate-x': {
      animationCanonicalizer: lengthish,
      initialValue: '0px',
      syntax: '<length-percentage>',
    },
    'translate-y': {
      animationCanonicalizer: lengthish,
      initialValue: '0px',
      syntax: '<length-percentage>',
    },
    'translate-z': {
      animationCanonicalizer: lengthOnly,
      initialValue: '0px',
      syntax: '<length>',
    },
  },
}

/**
 * The typed-leaf declaration for one leaf of a family, or `undefined`.
 *
 * A lookup rather than a predicate, because every consumer needs the declaration and not merely the
 * fact of it: the syntax to register with, the initial value to fall to, and the canonicalizer to
 * write a frame with.
 */
export const typedLeafOf = (
  attribute: PropertyType,
  leaf: string,
): TypedLeaf | undefined => typedLeaves[attribute]?.[leaf]

/**
 * The typed leaves a family declares, or an empty list.
 *
 * Returns pairs rather than a record so the caller does not decide the order it registers them in:
 * a registration per leaf is idempotent, but a stable order is one less thing that can differ
 * between two builds of the same sheet.
 */
export const typedLeavesOf = (
  attribute: PropertyType,
): Array<[string, TypedLeaf]> =>
  Object.entries(typedLeaves[attribute] ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  )

/** Whether a leaf is execution machinery rather than an authoring component. */
export const isExecutionLeaf = (declaration: TypedLeaf | undefined): boolean =>
  declaration?.execution === true

/**
 * The leaves a family declares that an author can **address**, which are the ones that owe route evidence.
 *
 * The invariant is narrowed rather than relaxed. A route means an author can enter through something, and an
 * execution leaf cannot be entered through at all — it is proven by the public routes that produce it, which is
 * a different kind of evidence and belongs to the family rather than to the leaf.
 */
export const addressableLeavesOf = (
  attribute: PropertyType,
): Array<[string, TypedLeaf]> =>
  typedLeavesOf(attribute).filter(([, one]) => !isExecutionLeaf(one))

/**
 * What a frame writes for one leaf, or `null` to **decline** — three states, and the middle one is
 * the reason this is a function rather than an optional call at the call site.
 *
 * ```text
 * the leaf is not a typed leaf of this family   → null
 * typed, and declares no canonicalizer          → the authored value
 * typed, with a canonicalizer                   → whatever it decides, including `null`
 * ```
 *
 * The alternative — `declaration?.animationCanonicalizer?.(value) ?? null` — reads **one `null` for
 * two different facts**, which is not a style problem. A family whose leaves are a single
 * interpolation branch needs no canonicalizer: `<length-percentage>` for `translate` is one branch,
 * so the authored value is already the canonical frame value. Under the conflated form that family's
 * constituents silently declined while its whole motion went typed, and with both present the two
 * execution models contended for one property: measured on a spiked `translate`, a compound curve
 * that returned to its 100% value at 0%, so the motion never started.
 *
 * Note that "declares no canonicalizer" must **not** be read as "cannot decline": a family with no
 * canonicalizer still declines by not declaring the leaf at all, which is the first state.
 */
export const canonicalizeLeaf = (
  declaration: TypedLeaf | undefined,
  value: string,
): null | string => {
  if (!declaration) return null

  return declaration.animationCanonicalizer
    ? declaration.animationCanonicalizer(value)
    : value
}

/**
 * A whole `scale` value decomposed into the three leaves it sets, or `null` when the value is not
 * safely decomposable and the caller should keep the property-level animation.
 *
 * The forms are **measured from the browser**, not read off a grammar, because the computed
 * serialization hides the distinction that matters:
 *
 *   scale: 2        → 2          one value **repeats**     → [2, 2, 2]
 *   scale: 2 3      → 2 3        two values **pad** with the identity → [2, 3, 1]
 *   scale: 2 3 4    → 2 3 4      three values              → [2, 3, 4]
 *   scale: 2 3 4 5  → none       invalid, the declaration is dropped → null
 *   scale: none     → none       a whole-property keyword, not three scalars → null
 *   scale: 2 150%   → 2 1.5      mixed forms are accepted   → [2, 150%, 1]
 *
 * `2 3` serializes as `2 3` rather than `2 3 1` because a trailing value equal to the initial is
 * collapsed — so the serialization cannot tell "z was given as 1" from "z was not given", and both
 * are the same value. It can look like padding and repetition are the same rule; they are not, and
 * `2` versus `2 3` is exactly where they differ.
 *
 * Declines rather than guesses, and the declines are the honest half: a value the shape cannot be
 * read from keeps the current property-level path, which is what ships today and is correct.
 *
 * Values are returned **as authored** — normalisation decides the shape, `animationCanonicalizer`
 * decides the representation, and folding the two together would make it impossible to tell a
 * grammar decision from an interpolation one.
 */
export const normalizeScale = (
  value: string,
): [string, string, string] | null => {
  const parts = value.trim().split(/\s+/)

  if (!parts.length || parts.length > 3) return null

  // The same grammar the leaves accept, reused rather than restated: a part that is not a scale
  // scalar is not something this can decompose, and `scaleFactorToNumber` is already the statement
  // of what a scale scalar is.
  if (parts.some(part => scaleFactorToNumber(part) === null)) return null

  if (parts.length === 1)
    return [parts[0] as string, parts[0] as string, parts[0] as string]

  if (parts.length === 2) return [parts[0] as string, parts[1] as string, '1']

  return [parts[0] as string, parts[1] as string, parts[2] as string]
}

/**
 * The three frame endpoints a whole `scale` motion writes, already canonical — or `null` when the
 * motion cannot be represented as typed leaves and must stay on the property path.
 *
 * One function rather than two calls at the call site, because the two declines have the same
 * consequence and must not be separable. **Decomposition is opt-in by proof, not by family name**:
 * if normalisation cannot read the shape, or the canonicalizer does not understand a value it
 * produced, the motion does not partially enter the typed-leaf path — it does not enter it at all.
 *
 * That boundary is not hypothetical. `filter` already showed what a partial move costs: a native
 * whole-property animation and a constituent motion over the same property contend for it, one wins
 * outright, and the loser goes silent — published keyframes nothing reads. A half-decomposed `scale`
 * would be the same shape.
 *
 *   "2"       → normalize ['2','2','2']       → canonicalize ['2','2','2']
 *   "150%"    → normalize ['150%',…]          → canonicalize ['1.5','1.5','1.5']
 *   "2 3"     → normalize ['2','3','1']       → canonicalize ['2','3','1']
 *   "2 150%"  → normalize ['2','150%','1']    → canonicalize ['2','1.5','1']
 *   "none", "2 3 4 5", "2px", "var(--x)"      → null
 */
export const scaleLeafEndpoints = (
  value: string,
): [string, string, string] | null => {
  const leaves = normalizeScale(value)

  if (!leaves) return null

  const canonical = leaves.map(scaleFactorToNumber)

  if (canonical.some(one => one === null)) return null

  return canonical as [string, string, string]
}

/**
 * What a family supplies to be animated as **typed leaves**.
 *
 * Four facets make up the execution model, and they are worth naming together because only one of
 * them is data this file does not already hold elsewhere:
 *
 * ```text
 * substrate     the declaration a typed motion's own rule publishes,
 *               `<property>: var(--jumi-<property>)`
 * constituent   a constituent value → its one canonical leaf value, or `null`
 * whole         a whole value → the leaf assignments it sets, or `null`
 * bridge        every typed keyframe re-asserts the composition beside the leaves,
 *               pinned at `from` and `to`
 * ```
 *
 * `whole` is the one facet declared here. The constituent facet is the leaf's own
 * `animationCanonicalizer`, already declared per leaf above. `substrate` is a derivation from the
 * composition the property model already holds — a family supplies it by having a
 * `propertyVariables` entry, which it must have to be animatable at all. And `bridge` is not a
 * choice any family gets to make: it is the consequence of a keyframe beating a rule, which is a
 * fact about CSS rather than about a family.
 *
 * So a function per family for those last two would be machinery that cannot change behaviour —
 * the same test that kept an explicit `kind` off the slot when the falsifying test came back
 * negative. What a family *declares* is what it can read: the shape of its own whole values.
 */
export type TypedExecution = {
  /**
   * The family's **authoring surface**: the public components it exposes, and the set the resolver's projection
   * is built from.
   *
   * Deliberately not the composition's `dependencies`, and the difference is not bookkeeping. After a reshape the
   * property composes the **resolved** components while the authoring ones stay public — candidates still address
   * them and the resolver still reads them — so one list cannot be both without saying the composition reads
   * something it does not. `dependencies` says what the property is made of; this says what an author writes.
   *
   * Two consumers read it, and they are why it is declared rather than inferred: the **context projection** is
   * exactly these slots, and the **constituent census** counts a family's authoring components as its constituents
   * even where the composition no longer names them. A pair leaves the population because the graph stopped
   * reading it, not because an author lost the ability to address it.
   */
  authoring?: readonly string[]

  /**
   * A whole value → the leaves it sets, in the family's own order, or `null` to **decline** the
   * motion so the caller keeps the property-level representation.
   *
   * Declining is all-or-nothing on purpose: a motion that cannot be represented completely does not
   * enter the typed path partially, because a native whole-property animation and a constituent
   * motion over one property contend for it and the loser goes silent.
   */
  whole: (value: string) => Array<[string, string]> | null

  /**
   * A **constituent** value → the complete set of execution leaves it assigns, or `null` to decline the route.
   *
   * A constituent already has a simple shape, and it stays: the authored component *is* the execution leaf, so
   * its own canonicalizer is all the resolution it needs, and that path is cheaper and correct for most typed
   * constituents. This facet is for the **compound** shape, which `offset-anchor` is the first family to prove
   * exists — and it is declared here rather than as anything named for that family, because the shape is what
   * was established, not the property that happened to demonstrate it. A future family whose three authoring
   * components produce two interpolable leaves should need a declaration, not a core feature.
   *
   * The contract, deliberately general:
   *
   *   given the public component addressed, its authored endpoint, and enough **authoring** state to
   *   reconstruct the family's value, return the complete execution-leaf assignment — or `null`, which declines
   *   the entire typed route rather than a part of it.
   *
   * Two boundaries are load-bearing, and both were paid for elsewhere in D.3:
   *
   * - **All or nothing.** One leaf of a set the family executes together is the half-typed state a decline
   *   exists to prevent, and the caller treats a partial answer as no answer.
   * - **One way.** The context is authoring state — the family's own components and their rests — and never
   *   execution state read back out. Handing a resolved value in as though it were authored would make the
   *   normalization depend on what was emitted last rather than on what the author wrote.
   */
  constituent?: (
    component: string,
    value: string,
    /**
     * The family's authoring state, keyed by **exactly the slots the family declares as its authoring surface**:
     * the authored value where the candidate wrote the slot, the model's rest where it did not, and absent where
     * the model declares nothing at all — which is a decline rather than a default.
     */
    authoring: Record<string, string>,
  ) => Array<[string, string]> | null
}

/**
 * The leaves a whole `translate` writes, or `null` when the value is not one this family represents.
 *
 * The components are guarded by the **same** canonicalizers the constituent path uses, so a value one
 * path accepts and the other refuses is not expressible — one statement of what the family accepts,
 * read by both entrances.
 *
 * The missing components take the **identity**, not the first value: `translate: 10px` is
 * `10px 0 0`, where `scale: 2` is `2 2 2`. The two families deliberately do not share a rule, which
 * is the whole reason this is a declaration rather than something the core could have assumed.
 */
export const translateLeaves = (
  value: string,
): Array<[string, string]> | null => {
  const parts = value.trim().split(/\s+/)

  if (!parts.length || parts.length > 3) return null

  const leaves = ['translate-x', 'translate-y', 'translate-z'] as const
  const guarded = parts.map((part, at) =>
    (at === 2 ? lengthOnly : lengthish)(part as string),
  )

  if (guarded.some(one => one === null)) return null

  return leaves.map((leaf, at) => [leaf, (guarded[at] ?? '0') as string])
}

/**
 * The families that animate as typed leaves.
 *
 * **Only `scale` is here, and deliberately.** It is the proving family — fully addressable, a
 * grammar already understood, and an ownership case that is easy to reason about. The declaration
 * is what makes a second family an addition rather than a copy: it says which leaf each component
 * of a whole value becomes, and a family that cannot say that does not get the execution model.
 */
/**
 * `offset-anchor`'s two execution components, and the authoring components they are resolved from.
 *
 * The normalization lives in `src/` rather than in `scripts/` because production cannot import a research book,
 * and the prototype it was measured against stays where it was: a test compares the two rather than one calling
 * the other, so a disagreement is a finding instead of a rename. The contract is the measured one — an edge plus
 * an offset resolves to one component in the direction the edge grows, a `center` edge resolves only over a zero
 * offset, and everything unresolved declines.
 */
const POSITION_X = 'offset-anchor-x-position'
const POSITION_Y = 'offset-anchor-y-position'

const AUTHORING = {
  xEdge: 'offset-anchor-x-edge',
  xOffset: 'offset-anchor-x-offset',
  yEdge: 'offset-anchor-y-edge',
  yOffset: 'offset-anchor-y-offset',
} as const

/** A component as written: a number with an optional unit or percentage. */
const COMPONENT = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[a-z%]{1,4})?$/i

/**
 * Whether a component is arithmetic rather than a single token.
 *
 * Balanced rather than matched, because a `)` inside a nested call is not the end of this one: `calc(min(10px, 2%))`
 * closes the outer call at its last character, and a reader that took the first `)` would carry a fragment into the
 * frames.
 */
const isArithmetic = (text: string) => {
  if (!/^calc\(/i.test(text) || !text.endsWith(')')) return false

  let depth = 0

  for (const char of text) {
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1

      if (depth === 0) return text.length > 5
    }
  }

  return false
}

/** Whether a component is one this family can carry through to a frame. */
const isComponent = (text: string) =>
  COMPONENT.test(text) || isArithmetic(text)

/** A value split at top-level spaces, so `calc(50% + 4px)` stays one component. */
const components = (value: string) => {
  const parts: string[] = []
  let depth = 0
  let part = ''

  for (const char of String(value ?? '').trim()) {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1

    if (/\s/.test(char) && depth === 0) {
      if (part) parts.push(part)

      part = ''

      continue
    }

    part += char
  }

  if (part) parts.push(part)

  return parts
}

/**
 * One axis of authoring state as a resolved component, or `null` to decline.
 *
 * The measured contract, and every clause of it is a reading rather than a guess: an edge plus an offset offsets
 * from that edge; a `center` edge is the anchor itself, which only a zero offset leaves alone; a zero offset is
 * the edge's own percentage; and a logical or unknown edge declines, because `<position>`'s physical keywords are
 * the only ones the browser resolved this way.
 */
export const axisPosition = (edge: string, offset: string): null | string => {
  const component = String(offset ?? '').trim()

  if (edge === 'center') return component === '0' ? '50%' : null
  if (!isComponent(component)) return null

  if (component === '0')
    return { bottom: '100%', left: '0%', right: '100%', top: '0%' }[edge] ?? null

  if (edge === 'left' || edge === 'top') return component
  if (edge === 'right' || edge === 'bottom') return `calc(100% - ${component})`

  return null
}

/**
 * A whole authored position → the two execution components, or `null` to decline the whole route.
 *
 * Two components are read as a resolved pair or as a pair of edge keywords; four when each axis is an edge with
 * its offset. Anything else declines rather than being interpreted — `var()` included, since a value nothing can
 * resolve at build time is not a value that can be resolved by looking harder.
 */
export const positionComponents = (
  value: string,
): Array<[string, string]> | null => {
  const parts = components(value)

  if (parts.length === 2) {
    const [first, second] = parts

    if (isComponent(first) && isComponent(second))
      return [
        [POSITION_X, first],
        [POSITION_Y, second],
      ]

    const x = { center: '50%', left: '0%', right: '100%' }[first]
    const y = { bottom: '100%', center: '50%', top: '0%' }[second]

    return x !== undefined && y !== undefined
      ? [
          [POSITION_X, x],
          [POSITION_Y, y],
        ]
      : null
  }

  if (parts.length === 4) {
    const x = axisPosition(parts[0], parts[1])
    const y = axisPosition(parts[2], parts[3])

    return x !== null && y !== null
      ? [
          [POSITION_X, x],
          [POSITION_Y, y],
        ]
      : null
  }

  return null
}

export const typedExecutions: Partial<Record<PropertyType, TypedExecution>> = {
  scale: {
    whole: value => {
      const endpoints = scaleLeafEndpoints(value)

      return endpoints
        ? [
            ['scale-x', endpoints[0]],
            ['scale-y', endpoints[1]],
            ['scale-z', endpoints[2]],
          ]
        : null
    },
  },
  translate: {
    whole: translateLeaves,
  },
  /**
   * `offset-anchor` — the first **compound** family, and the reason the `constituent` facet exists.
   *
   * Its public components are authoring vocabulary: an edge is a keyword, an offset is a value, and neither is
   * the thing the browser interpolates. Two resolved components are, and a motion assigns **both** or none of
   * them — a typed x beside a native y is the half-typed state the decline exists to prevent.
   */
  'offset-anchor': {
    authoring: [
      'offset-anchor-x-edge',
      'offset-anchor-x-offset',
      'offset-anchor-y-edge',
      'offset-anchor-y-offset',
    ],
    whole: value => positionComponents(value),
    constituent: (component, _value, authoring) => {
      // Only the four declared components are read, and only from authoring state. An absent slot declines: the
      // projection is built from this family's own surface, so a missing key means the model does not declare it
      // — and a default invented here would be a second opinion about the authoring grammar, which belongs to the
      // resolver rather than to the caller.
      const slots: readonly string[] = Object.values(AUTHORING)

      if (!slots.includes(component)) return null

      const read = (slot: string) => authoring[slot]
      const xEdge = read(AUTHORING.xEdge)
      const xOffset = read(AUTHORING.xOffset)
      const yEdge = read(AUTHORING.yEdge)
      const yOffset = read(AUTHORING.yOffset)

      if (
        xEdge === undefined ||
        xOffset === undefined ||
        yEdge === undefined ||
        yOffset === undefined
      )
        return null

      const x = axisPosition(xEdge, xOffset)
      const y = axisPosition(yEdge, yOffset)

      return x !== null && y !== null
        ? [
            [POSITION_X, x],
            [POSITION_Y, y],
          ]
        : null
    },
  },
}

/**
 * The typed-execution facets one family declares, or `undefined` when it has none.
 *
 * The core asks this question instead of naming a family, which is the whole point of the
 * declaration: a build that animates `scale` and a build that animates nothing typed run the same
 * branch, and the second one simply gets `undefined`.
 */
export const typedExecutionOf = (
  attribute: PropertyType,
): TypedExecution | undefined => typedExecutions[attribute]

/**
 * The authoring surface one family declares, or an empty list.
 *
 * Read by the census, which counts a family's authoring components even where the composition no longer names
 * them: the reshape moved them out of `dependencies`, and it did not move them out of the model.
 */
export const authoringOf = (attribute: PropertyType): readonly string[] =>
  typedExecutions[attribute]?.authoring ?? []

/** Every `(parent, component)` pair the declared authoring surfaces expose. */
export const authoringPairs = (): Array<{
  component: string
  parent: string
}> =>
  Object.entries(typedExecutions).flatMap(([attribute, execution]) =>
    (execution.authoring ?? []).map(component => ({
      component,
      parent: attribute,
    })),
  )
