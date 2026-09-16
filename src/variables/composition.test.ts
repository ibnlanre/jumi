import type { PropertyType } from '@/types'

import { describe, expect, it } from 'vitest'

import { propertyVariables } from '@/variables/property'

import {
  compositionEdges,
  isDirectlyAddressable,
  isFullyAddressable,
} from './composition'

const edge = (attribute: PropertyType, dependency: PropertyType) =>
  compositionEdges.get(attribute)?.find(one => one.dependency === dependency)

describe('composition edges', () => {
  it('calls a bare read of a leaf direct and addressable', () => {
    // `scale` composes `var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z)`,
    // and each is a leaf, so each is a constituent the model can animate alone.
    expect(edge('scale', 'scale-x')).toEqual({
      addressable: true,
      dependency: 'scale-x',
      kind: 'direct',
    })
    expect(isDirectlyAddressable('scale', 'scale-x')).toBe(true)
    expect(isDirectlyAddressable('scale', 'scale-z')).toBe(true)
  })

  it('calls a read with a fallback fallback, and not addressable', () => {
    // `filter` composes `var(--jumi-filter-url, opacity(1))`. The operand's
    // resting value is *not* the leaf's own value, so the reshape cannot own the
    // function and neither can a constituent own the slot.
    expect(edge('filter', 'filter-url')).toEqual({
      addressable: false,
      dependency: 'filter-url',
      kind: 'fallback',
    })
    expect(isDirectlyAddressable('filter', 'filter-url')).toBe(false)
  })

  it('calls a bare read of a composite composite, and not addressable here', () => {
    // `transform` composes `var(--jumi-skew)`, and `skew` composes
    // `var(--jumi-skew-x) var(--jumi-skew-y)`. So `skew-x` is reachable only by
    // descending a composite — a routing problem this increment does not solve.
    expect(edge('transform', 'skew')).toEqual({
      addressable: false,
      dependency: 'skew',
      kind: 'composite',
    })
    expect(isDirectlyAddressable('transform', 'skew')).toBe(false)

    // And the descent is *not* taken: the edge is to `skew`, never to `skew-x`.
    expect(edge('transform', 'skew-x')).toBeUndefined()
  })

  it('calls a dependency reached only through another read fallback', () => {
    // `box-shadow` composes `var(--jumi-box-shadow-inset, var(--jumi-box-shadow-outset))`.
    // Only `inset` is a slot head; `outset` exists solely as that read's fallback.
    expect(edge('box-shadow', 'box-shadow-inset')?.kind).toBe('fallback')
    expect(edge('box-shadow', 'box-shadow-outset')?.kind).toBe('fallback')
    expect(isDirectlyAddressable('box-shadow', 'box-shadow-inset')).toBe(false)
    expect(isDirectlyAddressable('box-shadow', 'box-shadow-outset')).toBe(false)
  })

  it('separates the function-shaped families from the structural ones', () => {
    // The two `filter` families differ only in the read, which is the whole
    // reason the discriminant is a property of the composition and not of the leaf.
    expect(isDirectlyAddressable('filter', 'filter-blur')).toBe(true)
    expect(isDirectlyAddressable('filter', 'filter-brightness')).toBe(true)
    expect(isDirectlyAddressable('filter', 'filter-drop-shadow')).toBe(false)
    expect(isDirectlyAddressable('filter', 'filter-url')).toBe(false)

    // `backdrop-filter` is the same composition shape, so it agrees.
    expect(
      isDirectlyAddressable('backdrop-filter', 'backdrop-filter-blur'),
    ).toBe(true)
    expect(
      isDirectlyAddressable('backdrop-filter', 'backdrop-filter-url'),
    ).toBe(false)
  })

  it('gives every composite an edge for every dependency it declares', () => {
    // No composite may have a dependency with no edge: an unmodelled dependency
    // is one a consumer would have to guess about, which is the shape the
    // derivation exists to remove.
    for (const [attribute, node] of Object.entries(propertyVariables)) {
      const dependencies = node.dependencies ?? []

      if (!dependencies.length) continue

      const edges = compositionEdges.get(attribute as PropertyType) ?? []

      expect(edges.map(one => one.dependency)).toEqual(dependencies)
    }
  })

  it('never derives an edge for a property that composes nothing', () => {
    // A leaf has no edges, so the map cannot be read as "every property is
    // addressable from somewhere".
    expect(compositionEdges.get('scale-x')).toBeUndefined()
    expect(compositionEdges.get('filter-blur')).toBeUndefined()
    expect(compositionEdges.get('filter-url')).toBeUndefined()
  })

  it('answers false for an attribute that composes nothing', () => {
    expect(isDirectlyAddressable('scale-x', 'scale')).toBe(false)

    // The runtime guard, not just the type: `propertyVariables` is a total record,
    // so this shape cannot be written without the cast — but a consumer holding a
    // string from the candidate set can still reach it, and the answer must be a
    // refusal rather than a throw.
    expect(
      isDirectlyAddressable('not-a-property' as PropertyType, 'scale-x'),
    ).toBe(false)
  })
})

describe('fully addressable composites', () => {
  it('qualifies a composite whose every dependency is a bare leaf', () => {
    // `scale` composes `var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z)` —
    // three bare reads of three leaves, so a part motion on it may be keyed on its own.
    expect(isFullyAddressable('scale')).toBe(true)
  })

  it('refuses a composite with a single fallback read', () => {
    // `filter` is 9 of 11: `filter-url` is read with a fallback and
    // `filter-drop-shadow` is itself a composite. One non-addressable edge is enough —
    // this is the whole reason the rule reads every dependency rather than a sample.
    expect(isFullyAddressable('filter')).toBe(false)
    expect(isFullyAddressable('backdrop-filter')).toBe(false)
  })

  it('refuses a composite whose dependencies are all composites', () => {
    // `transform` is 0 of 7: `skew-x` is reachable only by descending `skew`, which is
    // a routing problem this rule declines rather than solves.
    expect(isFullyAddressable('transform')).toBe(false)
  })

  it('refuses a composite with an internal fallback edge', () => {
    // `box-shadow` composes `var(--jumi-box-shadow-inset, var(--jumi-box-shadow-outset))`.
    // Both dependencies are `fallback`, so the property is refused — which is the case a
    // rule reading the candidate surface instead of the declared dependencies would miss,
    // because no candidate addresses either component.
    expect(isFullyAddressable('box-shadow')).toBe(false)
  })

  it('refuses a property that composes nothing', () => {
    // A leaf has no dependencies to fail on, and must not read as "vacuously
    // addressable" — that would make every leaf a composition parts belong to.
    expect(isFullyAddressable('scale-x')).toBe(false)
    expect(isFullyAddressable('filter-blur')).toBe(false)
    expect(isFullyAddressable('not-a-property' as PropertyType)).toBe(false)
  })
})
