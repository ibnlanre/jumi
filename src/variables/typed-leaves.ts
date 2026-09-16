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
