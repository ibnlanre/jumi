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
export const typedLeaves: Partial<
  Record<PropertyType, Record<string, TypedLeaf>>
> = {
  scale: {
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
   * A whole value → the leaves it sets, in the family's own order, or `null` to **decline** the
   * motion so the caller keeps the property-level representation.
   *
   * Declining is all-or-nothing on purpose: a motion that cannot be represented completely does not
   * enter the typed path partially, because a native whole-property animation and a constituent
   * motion over one property contend for it and the loser goes silent.
   */
  whole: (value: string) => Array<[string, string]> | null
}

/**
 * The families that animate as typed leaves.
 *
 * **Only `scale` is here, and deliberately.** It is the proving family — fully addressable, a
 * grammar already understood, and an ownership case that is easy to reason about. The declaration
 * is what makes a second family an addition rather than a copy: it says which leaf each component
 * of a whole value becomes, and a family that cannot say that does not get the execution model.
 */
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
