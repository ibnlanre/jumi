import type { PropertyType } from '@/types'

import { describe, expect, it } from 'vitest'

import { compositionEdges } from '@/variables/composition'
import { propertyVariables } from '@/variables/property'

import {
  normalizeScale,
  scaleFactorToNumber,
  scaleLeafEndpoints,
  typedLeaves,
  typedLeavesOf,
} from './typed-leaves'

describe('typed leaf declarations', () => {
  it('declares the three scale leaves as numbers-or-percentages resting at one', () => {
    // A union rather than `<number>`, measured: `animate-scale-x-[50%]` reaches the leaf through
    // the `any` escape hatch and works today, and a `<number>` registration silently resets that
    // value to the initial. The union keeps it and leaves numeric interpolation identical.
    const leaf = {
      animationCanonicalizer: scaleFactorToNumber,
      initialValue: '1',
      syntax: '<number> | <percentage>',
    }

    expect(typedLeavesOf('scale')).toEqual([
      ['scale-x', leaf],
      ['scale-y', leaf],
      ['scale-z', leaf],
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

describe('scaleFactorToNumber', () => {
  it('writes a percentage as the scale factor it equals', () => {
    // Native `scale` treats `50%` and `0.5` as the same factor. A registered property does not
    // interpolate across the union, so a frame has to pick one representation — this one.
    expect(scaleFactorToNumber('150%')).toBe('1.5')
    expect(scaleFactorToNumber('50%')).toBe('0.5')
    expect(scaleFactorToNumber('100%')).toBe('1')
    expect(scaleFactorToNumber('0%')).toBe('0')
  })

  it('keeps the sign and the fraction', () => {
    expect(scaleFactorToNumber('-25%')).toBe('-0.25')
    expect(scaleFactorToNumber('+25%')).toBe('0.25')
    expect(scaleFactorToNumber('12.25%')).toBe('0.1225')
    expect(scaleFactorToNumber('33.333%')).toBe('0.33333')
    expect(scaleFactorToNumber('-0.5%')).toBe('-0.005')
  })

  it('returns a plain number as authored', () => {
    // Identity, deliberately: normalizing `2` to `2` is a change with no effect, and one more
    // thing a test has to pin.
    expect(scaleFactorToNumber('2')).toBe('2')
    expect(scaleFactorToNumber('-1')).toBe('-1')
    expect(scaleFactorToNumber('1.5')).toBe('1.5')
    expect(scaleFactorToNumber('.5')).toBe('.5')
  })

  it('declines anything outside the scalar forms rather than guessing', () => {
    // The narrowness is the contract: a frame may differ from what an author wrote only when the
    // difference is equivalent *under `scale`'s own grammar*. Everything here is either a
    // different property's value, a whole-property keyword, or not a value at all.
    for (const value of [
      'none',
      'var(--x)',
      'calc(1)',
      '1px',
      '1deg',
      '50 %',
      '50%%',
      '%',
      '',
      '  ',
      '2 3',
      'auto',
      'NaN%',
    ])
      expect(scaleFactorToNumber(value), value).toBeNull()
  })

  it('trims before deciding, so a padded value is still a scale factor', () => {
    expect(scaleFactorToNumber(' 150% ')).toBe('1.5')
    expect(scaleFactorToNumber(' 2 ')).toBe('2')
  })

  it('is declared on every scale leaf', () => {
    // The field is the reason the union is safe for animation: without it a frame writes the
    // authored form and a mixed number/percentage pair steps instead of blending.
    for (const [, leaf] of typedLeavesOf('scale'))
      expect(leaf.animationCanonicalizer).toBe(scaleFactorToNumber)
  })

  it('reproduces the measured native endpoints for the pinned pairs', () => {
    // The measurement this field exists for, as the values it consumes: animating `1 → 150%`
    // native-blends, and the canonical pair is what makes the typed leaf blend the same way.
    const pairs: Array<[string, string]> = [
      ['1', '1'],
      ['150%', '1.5'],
      ['50%', '0.5'],
      ['2', '2'],
    ]

    for (const [authored, canonical] of pairs)
      expect(scaleFactorToNumber(authored)).toBe(canonical)
  })
})

describe('normalizeScale', () => {
  it('repeats a single value across the three axes', () => {
    // `scale: 2` is `2 2 2`, and the computed serialization is `2` because the three agree.
    expect(normalizeScale('2')).toEqual(['2', '2', '2'])
    expect(normalizeScale('150%')).toEqual(['150%', '150%', '150%'])
  })

  it('pads two values with the identity, not with the first', () => {
    // Measured: `scale: 2 3` computes to `2 3`, which is `2 3 1` — a trailing value equal to the
    // initial is collapsed in the serialization. Padding with the first value would give `2 3 3`.
    expect(normalizeScale('2 3')).toEqual(['2', '3', '1'])
  })

  it('keeps three values as authored', () => {
    expect(normalizeScale('2 3 4')).toEqual(['2', '3', '4'])
    expect(normalizeScale('-1 2.5 -3')).toEqual(['-1', '2.5', '-3'])
  })

  it('accepts mixed number and percentage forms', () => {
    // Native accepts them, so decomposition must too; the frame representation is the
    // canonicalizer's problem, not this one's.
    expect(normalizeScale('2 150%')).toEqual(['2', '150%', '1'])
    expect(normalizeScale('50% 150% 2')).toEqual(['50%', '150%', '2'])
  })

  it('returns values as authored, never canonicalized', () => {
    // Folding the two steps together would make a grammar decision indistinguishable from an
    // interpolation one, and only the second of those may differ from what the author wrote.
    expect(normalizeScale('150%')).toEqual(['150%', '150%', '150%'])
  })

  it('declines rather than guessing', () => {
    for (const value of [
      'none',
      '2 3 4 5',
      '',
      '  ',
      'var(--x)',
      'calc(2 * 3)',
      '2 3 none',
      '2px',
      'auto',
      '2,3',
    ])
      expect(normalizeScale(value), value).toBeNull()
  })

  it('tolerates padding and repeated whitespace', () => {
    expect(normalizeScale('   2     3   ')).toEqual(['2', '3', '1'])
  })
})

describe('scaleLeafEndpoints', () => {
  it('returns canonical endpoints for a decomposable whole value', () => {
    expect(scaleLeafEndpoints('2')).toEqual(['2', '2', '2'])
    expect(scaleLeafEndpoints('2 3')).toEqual(['2', '3', '1'])
    expect(scaleLeafEndpoints('2 3 4')).toEqual(['2', '3', '4'])
  })

  it('canonicalizes a percentage so the frames stay on one interpolation branch', () => {
    // The reason the two steps are composed here: a frame writing `150%` into a
    // `<number> | <percentage>` leaf steps instead of blending.
    expect(scaleLeafEndpoints('150%')).toEqual(['1.5', '1.5', '1.5'])
    expect(scaleLeafEndpoints('50% 150%')).toEqual(['0.5', '1.5', '1'])
  })

  it('accepts mixed authored forms by canonicalizing them together', () => {
    expect(scaleLeafEndpoints('2 150%')).toEqual(['2', '1.5', '1'])
  })

  it('declines as one decision, so a motion cannot half-enter the typed path', () => {
    // Either decline has the same consequence, which is why the two are composed into one
    // function rather than left to the call site to remember to check.
    for (const value of [
      'none',
      '2 3 4 5',
      'var(--x)',
      'calc(2 * 3)',
      '2px',
      '',
    ])
      expect(scaleLeafEndpoints(value), value).toBeNull()
  })
})
