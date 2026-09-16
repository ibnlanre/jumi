import type { PropertyType } from '@/types'

import { describe, expect, it } from 'vitest'

import { compositionEdges } from '@/variables/composition'
import { propertyVariables } from '@/variables/property'

import { typedLeaves, typedLeavesOf } from './typed-leaves'

describe('typed leaf declarations', () => {
  it('declares the three scale leaves as numbers resting at one', () => {
    // `<number>` rather than `<number> | <percentage>`: `scale` accepts a percentage, but the
    // *typed leaf* is the interpolation contract and Chromium does not implement
    // `<number-percentage>` as a syntax. One grammar, measured rather than assumed.
    expect(typedLeavesOf('scale')).toEqual([
      ['scale-x', { initialValue: '1', syntax: '<number>' }],
      ['scale-y', { initialValue: '1', syntax: '<number>' }],
      ['scale-z', { initialValue: '1', syntax: '<number>' }],
    ])
  })

  it('names only leaves that are dependencies of the family', () => {
    // A typed registration on a name the composition does not read is a registration nothing
    // reads — and it would publish an `@property` block for a variable no rule ever sets.
    for (const [attribute, leaves] of Object.entries(typedLeaves)) {
      const dependencies = compositionEdges.get(attribute as PropertyType) ?? []

      for (const leaf of Object.keys(leaves ?? {}))
        expect(dependencies.map(one => one.dependency)).toContain(leaf)
    }
  })

  it('names only leaves that the family reads directly', () => {
    // Typed registration is what makes a leaf interpolable *on its own*, which only means
    // something for a leaf the composition reaches as a bare read. A `fallback` leaf reads a
    // value the constituent model does not own, and a `composite` leaf is a routing problem this
    // increment does not solve.
    for (const [attribute, leaves] of Object.entries(typedLeaves)) {
      const edges = compositionEdges.get(attribute as PropertyType) ?? []

      for (const leaf of Object.keys(leaves ?? {})) {
        const edge = edges.find(one => one.dependency === leaf)

        expect(edge?.kind).toBe('direct')
        expect(edge?.addressable).toBe(true)
      }
    }
  })

  it('declares a leaf that is not itself a composition', () => {
    // A typed leaf holds one interpolable value. A name that composes further is a property, not a
    // leaf, and typing it would claim a contract over a value the family does not write directly.
    for (const leaves of Object.values(typedLeaves))
      for (const leaf of Object.keys(leaves ?? {}))
        expect(
          propertyVariables[leaf as PropertyType].dependencies,
        ).toBeUndefined()
  })

  it('answers an empty list for a family that declares none', () => {
    // The overwhelming majority, and the answer a consumer must handle.
    expect(typedLeavesOf('rotate')).toEqual([])
    expect(typedLeavesOf('not-a-property' as PropertyType)).toEqual([])
  })
})
