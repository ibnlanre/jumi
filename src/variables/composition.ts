import type { PropertyType } from '@/types'

import { readSlots } from '@/helpers/slots'
import { propertyVariables } from '@/variables/property'

/**
 * How one composed property reaches one of its dependencies, and whether the
 * constituent model can address that dependency **on its own**.
 *
 * `'direct'` and `'fallback'` describe the read; `'composite'` describes a read
 * that is direct but whose target is itself a composed property, so it is not
 * addressable *at this level* — a distinction worth keeping rather than
 * collapsing, because nested composites are a routing problem this increment
 * deliberately does not solve and the reason has to survive for whoever does.
 *
 * A `'fallback'` kind covers both shapes where a fallback is what carries the
 * read: `var(--jumi-filter-url, opacity(1))`, which has one, and
 * `var(--jumi-box-shadow-outset)`, which is reached only **as** the fallback of
 * `var(--jumi-box-shadow-inset, …)`. In both cases no bare slot head names it,
 * which is the operative fact.
 */
export type CompositionEdge = {
  /** Whether the constituent model can address this dependency on its own. */
  addressable: boolean
  /** The dependency, by its slot name rather than its variable name. */
  dependency: PropertyType
  kind: 'composite' | 'direct' | 'fallback'
}

/**
 * Whether a composition slot read is bare — `var(<name>)` with nothing between
 * the name and its `)`.
 *
 * The slot pattern's fallback capture includes the comma, so an empty capture is
 * exactly the bare shape and no second test is needed.
 */
const isBare = (fallback: string) => fallback === ''

/**
 * The edges of one composed property, derived from the composition it already
 * declares.
 *
 * The composition is the source of truth and this reads it rather than restating
 * it: a table here would be a second copy of `src/composition/**`, and the two
 * would disagree the first time a composition changed. The only thing added is
 * the dependency graph's own fact — whether the target is itself a composite.
 *
 * A dependency whose variable is not a slot head at all is `'fallback'` by
 * construction: `slot` is undefined, and no bare read reaches it.
 */
const edgesOf = (attribute: PropertyType): CompositionEdge[] => {
  const { dependencies = [], value } = propertyVariables[attribute]
  const reads = new Map(
    readSlots(value).map(slot => [slot.name, slot.fallback]),
  )

  return dependencies.map(dependency => {
    const target = propertyVariables[dependency]
    const fallback = reads.get(target.variable)
    const composite = (target.dependencies?.length ?? 0) > 0

    const kind: CompositionEdge['kind'] =
      fallback !== undefined && isBare(fallback)
        ? composite
          ? 'composite'
          : 'direct'
        : 'fallback'

    return { addressable: kind === 'direct', dependency, kind }
  })
}

/**
 * Every composed property's edges, derived once at module load.
 *
 * Derived rather than declared, and global rather than per-instance, because the
 * fact is a property of the composition: `filter` reaches `filter-blur` the same
 * way whatever element or variant is animating it. What varies per element is
 * *which* instances are live, which is a question about the aggregate and not
 * about the graph.
 */
export const compositionEdges: ReadonlyMap<PropertyType, CompositionEdge[]> =
  new Map(
    Object.keys(propertyVariables)
      .filter(
        (attribute): attribute is PropertyType =>
          (propertyVariables[attribute as PropertyType].dependencies?.length ??
            0) > 0,
      )
      .map(attribute => [attribute, edgesOf(attribute)]),
  )

/**
 * Whether `attribute` addresses `dependency` as a bare leaf — the predicate the
 * constituent model keys on.
 *
 * Exposed as a question rather than as a set so that the *reason* stays
 * available through `compositionEdges`: `computeSlots()` needs the answer and
 * must not be the place that works out why it is true.
 */
export const isDirectlyAddressable = (
  attribute: PropertyType,
  dependency: PropertyType,
): boolean =>
  compositionEdges
    .get(attribute)
    ?.some(edge => edge.dependency === dependency && edge.addressable) ?? false

/**
 * Whether **every** dependency `attribute` composes is directly addressable — the
 * eligibility a part motion needs before it may be given an animation identity of
 * its own.
 *
 * It is a property of the graph, and that is the point: it is fixed before any
 * candidate compiles, so a decision keyed on it cannot change when a later
 * candidate arrives. The alternative — deciding against the live instance set —
 * is architecturally cleaner and was deliberately not taken, because a slot's
 * keyframe is emitted where the slot is created, and a slot that later became
 * ineligible could not retract it. The cost of the graph-stable rule is reach,
 * not correctness: `scale` qualifies at 3/3, `filter` does not at 9/11, and
 * `transform` does not at 0/7 because all seven of its dependencies are
 * composites.
 *
 * Deliberately asks about the **declared dependencies**, not the parts any
 * candidate exposes. A property whose public surface looks complete can still
 * compose an internal fallback edge — `box-shadow` composes `inset` over
 * `outset` — and a rule reading the candidate set would call that property
 * addressable while one of its reads is not.
 *
 * A property that composes nothing has no dependencies to fail on and answers
 * `false`: a leaf is not a composition that parts belong to.
 */
export const isFullyAddressable = (attribute: PropertyType): boolean => {
  const edges = compositionEdges.get(attribute)

  return !!edges?.length && edges.every(edge => edge.addressable)
}
