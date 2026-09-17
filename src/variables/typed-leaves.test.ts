import type { PropertyType } from '@/types'

import { describe, expect, it } from 'vitest'

import { compositionEdges } from '@/variables/composition'
import { propertyVariables } from '@/variables/property'

import {
  canonicalizeLeaf,
  normalizeScale,
  scaleFactorToNumber,
  scaleLeafEndpoints,
  typedExecutionOf,
  typedExecutions,
  typedLeafOf,
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

describe('canonicalizeLeaf', () => {
  it('answers null for a leaf the family does not declare', () => {
    // The first state, and the one a family that has not opted in always reaches.
    expect(canonicalizeLeaf(undefined, '5')).toBeNull()
    expect(canonicalizeLeaf(typedLeafOf('gap', 'row-gap'), '5px')).toBeNull()
  })

  it('takes the authored value when the leaf declares no canonicalizer', () => {
    // The second state, which the shape this replaced could not express. A leaf that is one
    // interpolation branch needs no rewrite — `<length-percentage>` is one branch, so the authored
    // value is already what a frame writes — and reading that as a decline is the conflation.
    const leaf = { initialValue: '0px', syntax: '<length-percentage>' }

    expect(canonicalizeLeaf(leaf, '10px')).toBe('10px')
    expect(canonicalizeLeaf(leaf, '50%')).toBe('50%')
  })

  it('defers to a declared canonicalizer, decline included', () => {
    // The third state, and the one that must not be folded into the second: a `?? value` after the
    // call would accept exactly what the canonicalizer just refused, writing a value nothing can
    // interpolate into a registered property.
    const leaf = typedLeafOf('scale', 'scale-x')

    expect(canonicalizeLeaf(leaf, '150%')).toBe('1.5')
    expect(canonicalizeLeaf(leaf, '2')).toBe('2')
    expect(canonicalizeLeaf(leaf, 'none')).toBeNull()
    expect(canonicalizeLeaf(leaf, 'var(--x)')).toBeNull()
    expect(canonicalizeLeaf(leaf, '2px')).toBeNull()
  })
})

describe('typed execution declarations', () => {
  it('names the leaf each component of a whole value becomes', () => {
    // The facet carries the names, and that is the point of extracting it: the core writes
    // `--jumi-<leaf>` for each pair without knowing which family it is animating, or assuming that
    // a decomposition returns its values in the same order as the leaves happen to be registered.
    expect(typedExecutionOf('scale')?.whole('2 3 4')).toEqual([
      ['scale-x', '2'],
      ['scale-y', '3'],
      ['scale-z', '4'],
    ])
    expect(typedExecutionOf('scale')?.whole('150%')).toEqual([
      ['scale-x', '1.5'],
      ['scale-y', '1.5'],
      ['scale-z', '1.5'],
    ])
  })

  it('names only leaves the family declares, and every one of them', () => {
    // Both halves matter and neither is checkable from the other declaration alone. A name the
    // family does not declare is a write to an **unregistered** custom property — discrete instead
    // of interpolable, and silent, because the keyframe still carries it. A declared leaf the whole
    // facet never assigns is a leaf the motion does not move.
    for (const [attribute, execution] of Object.entries(typedExecutions)) {
      const declared = typedLeavesOf(attribute as PropertyType).map(
        ([leaf]) => leaf,
      )
      const names = (execution.whole('2 3 4') ?? []).map(([leaf]) => leaf)

      for (const leaf of names)
        expect(declared, `${attribute}: ${leaf}`).toContain(leaf)

      // Compared as a **set**, so this arm answers exactly one question — which leaves are named.
      // Cardinality is the next arm, and the two have to be separable: a repeated name passes this
      // one and has to fail that one.
      expect([...new Set(names)].sort()).toEqual(declared)
    }
  })

  it('returns each leaf exactly once', () => {
    // The facet returns an **ordered sequence of declarations**, not a record, so a repeated leaf is
    // expressible — and a repeated leaf is silent rather than malformed: the later assignment wins,
    // the earlier value never reaches a frame, and the result still names only declared leaves and
    // still represents every one of them.
    //
    // Measured, with `scale-x` returned twice and all three leaves still present: the arm above
    // **passes**, because every name is declared and the set of names is still the declared set. Only
    // this arm rejects it. The value arm at the top of this block also rejects that duplicate, but
    // only because it pins `scale`'s literal output — a second family would have no such arm, and
    // would carry the duplicate silently. That is the gap this closes.
    //
    // The array stays an array on purpose. It is compiler output in emission order, and a record
    // would push object-key semantics into that output to buy a guarantee one test states outright.
    for (const [attribute, execution] of Object.entries(typedExecutions)) {
      const names = (execution.whole('2 3 4') ?? []).map(([leaf]) => leaf)

      expect(new Set(names).size, `${attribute}: ${names.join(', ')}`).toBe(
        names.length,
      )
    }
  })

  it('declines exactly what the family declines, so the core has one entrance', () => {
    // The facet is the entrance the core uses, and it must not be more permissive than the
    // composition it wraps: a value that reaches the typed path without a complete decomposition is
    // the partial move this whole boundary exists to prevent.
    const execution = typedExecutionOf('scale')!

    for (const value of ['none', '2 3 4 5', 'var(--x)', '2px', ''])
      expect(execution.whole(value), value).toBeNull()

    for (const value of ['2', '2 3', '2 3 4', '150%', '2 150%'])
      expect(execution.whole(value), value).not.toBeNull()
  })

  it('has no facet for a family that declares no typed leaves', () => {
    // The overwhelming majority, and the answer the core branches on instead of naming a family.
    expect(typedExecutionOf('rotate')).toBeUndefined()
    expect(typedExecutionOf('not-a-property' as PropertyType)).toBeUndefined()
  })

  it('never declares an execution a family has no leaves for', () => {
    // One-way on purpose: a family may declare leaves and decline whole decomposition — the
    // constituent path is useful without it. The reverse is not a state to be in, because every
    // leaf an execution writes is a leaf that has to have been registered.
    for (const attribute of Object.keys(typedExecutions))
      expect(typedLeavesOf(attribute as PropertyType).length).toBeGreaterThan(0)
  })
})
