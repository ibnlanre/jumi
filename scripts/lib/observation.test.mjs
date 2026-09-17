import { describe, expect, it } from 'vitest'

import {
  applicationOf,
  chainsOf,
  descriptorOf,
  frameOf,
  liveOf,
} from './observation.mjs'

describe('liveOf', () => {
  it('resolves a frame wrapper to the live slot beneath it', () => {
    // The shape a whole-value candidate writes, and the reading a rest depends on: with the animation off
    // the element resolves the fallback, so applying the frame instead is frame zero wearing the rest's name.
    expect(liveOf('var(--a-0, var(--a))')).toBe('var(--a)')
  })

  it('leaves a plain value reference alone', () => {
    // No fallback means the reference *is* the live slot.
    expect(liveOf('var(--a)')).toBe('var(--a)')
  })

  it('keeps a fallback that is a value rather than a reference', () => {
    // `red` is the fallback, not a wrapper: the reference resolves to whatever `--a` holds, and rewriting it
    // to `red` would be the reader inventing a value.
    expect(liveOf('var(--a, red)')).toBe('var(--a, red)')
  })

  it('resolves every wrapper in a composed expression, and no paren leaks', () => {
    // The defect this holds: carrying the wrapper's `)` over emitted `var(--b))`, an unbalanced pair that
    // reads exactly like a property which never resolves.
    expect(liveOf('var(--a-0, var(--a)) var(--b-100, var(--b))')).toBe(
      'var(--a) var(--b)',
    )
  })

  it('answers null for a value with no reference at all', () => {
    expect(liveOf('bolder')).toBe(null)
  })
})

describe('applicationOf', () => {
  it('finds the declaration that hands the property to a slot, not the first one', () => {
    // Tailwind's own utility precedes Jumi's in a real sheet, and a first-match reader reports that the
    // emission never applies the property at all.
    const css = `@layer utilities {
  .font-bold { font-weight: bolder; }
}
@keyframes jumi-font-weight-eBE {
  to { font-weight: var(--jumi-font-weight-eBE); }
}`

    expect(applicationOf(css, 'font-weight')).toEqual({
      application: 'var(--jumi-font-weight-eBE)',
      slot: '--jumi-font-weight-eBE',
    })
  })

  it('reads the live slot out of a frame wrapper', () => {
    const css = `@keyframes jumi-border-bottom-width-sluPW {
  to { border-bottom-width: var(--jumi-border-bottom-width-sluPW-0, var(--jumi-border-bottom-width)); }
}`

    expect(applicationOf(css, 'border-bottom-width')).toEqual({
      application: 'var(--jumi-border-bottom-width)',
      slot: '--jumi-border-bottom-width',
    })
  })

  it('says so when the property is applied but not to a slot', () => {
    expect(() => applicationOf('#e { gap: 10px; }', 'gap')).toThrow(
      /not to a slot/,
    )
  })
})

describe('frameOf', () => {
  it('reads the value a candidate gives a slot at one stop', () => {
    const css =
      '--jumi-column-gap-ZPEK33-0: 0;\n--jumi-column-gap-ZPEK33-100: 20;'

    expect(frameOf(css, 'column-gap', '0')).toBe('0')
    expect(frameOf(css, 'column-gap', '100')).toBe('20')
  })

  it('throws rather than answering with a neighbouring stop', () => {
    expect(() => frameOf('--jumi-column-gap-ZPEK33-0: 0;', 'gap')).toThrow(
      /no `0` frame/,
    )
  })
})

describe('chainsOf and descriptorOf', () => {
  it('walks the pair relation the census counted, upward', () => {
    expect(chainsOf('column-gap')).toEqual([['gap']])
  })

  it('takes the consumer surface from the candidate table, not from the pair name', () => {
    // `column-gap`'s consumer really is `gap` — which is the whole reason a pair does not name its surface.
    const descriptor = descriptorOf({
      candidate: 'animate-column-gap',
      component: 'column-gap',
      contexts: ['flex'],
      method: 'used-gap',
    })

    expect(descriptor.consumer).toBe('gap')
    expect(descriptor.parts).toEqual(['column-gap'])
  })

  it('reaches a shorthand the component is two compositions below', () => {
    const descriptor = descriptorOf({
      candidate: 'animate-background-position-x-offset',
      component: 'background-position-x-edge',
      contexts: ['the composition'],
      method: 'computed',
    })

    expect(descriptor.chain).toEqual([
      'background-position-x-edge',
      'background-position-x',
      'background-position',
      'background',
    ])
    expect(descriptor.consumer).toBe('background-position')
  })

  it('refuses a candidate whose surface the composition cannot reach', () => {
    // A descriptor that measured something adjacent would be worse than one that stops: the whole point of
    // deriving the surface is that a wrong one is visible. Reachability is the check, not equality with the
    // candidate's own part — a pair and the candidate compiled to produce its composition need only share a
    // consumer surface, which is how the composed-property arm reads both halves of one pair.
    expect(() =>
      descriptorOf({
        candidate: 'animate-column-gap',
        component: 'background-position-x-edge',
        contexts: ['flex'],
        method: 'used-gap',
      }),
    ).toThrow(/not reachable/)
  })
})
