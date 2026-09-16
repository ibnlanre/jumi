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
  /** The value the property falls to when nothing declares it. */
  initialValue: string
  /** A CSS syntax string, unquoted — `@/core` quotes it into the `syntax` descriptor. */
  syntax: string
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
 * Every leaf named here must be a leaf of the family it is declared under: a typed registration on a
 * name that is not part of the composition is a registration nothing reads.
 */
export const typedLeaves: Partial<
  Record<PropertyType, Record<string, TypedLeaf>>
> = {
  scale: {
    'scale-x': { initialValue: '1', syntax: '<number>' },
    'scale-y': { initialValue: '1', syntax: '<number>' },
    'scale-z': { initialValue: '1', syntax: '<number>' },
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
