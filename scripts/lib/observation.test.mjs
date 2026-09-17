import { describe, expect, it } from 'vitest'

import {
  applicationOf,
  censusOf,
  censusPopulation,
  chainsOf,
  describe as describePair,
  descriptorOf,
  frameOf,
  liveOf,
  population,
} from './observation.mjs'
import { bucketOf, readTypedLeaves } from './property-model.mjs'

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

describe('population coverage', () => {
  // The census's unit and its totals, restated here because this pass derives them from the graph rather than
  // reading them off `reach.test.ts` — and the buckets come from the **shared** predicate, so the two cannot
  // drift into different populations. That drift is what this test exists to catch: the census's constituent
  // count and this pass's reach count were 303 and 294, because one reader evaluated the model while the other
  // read its source.
  const pairs = population()
  const described = pairs.map(one => ({
    ...describePair(one),
    machinery: bucketOf(one.parent, one.component) === 'machinery',
  }))

  const machinery = described.filter(one => one.machinery)
  const reach = described.filter(one => !one.machinery)
  const complete = reach.filter(one => one.status === 'complete')
  const incomplete = reach.filter(one => one.status !== 'complete')

  it('walks the census population, as pairs', () => {
    expect(pairs).toHaveLength(324)
    expect(new Set(pairs.map(one => one.parent)).size).toBe(104)
  })

  it('counts the census populations, machinery included', () => {
    // The numbers the census asserts, computed here from the graph and the shared bucket: 21 machinery,
    // 303 constituent. A pair count that agrees while the sets disagree is exactly what was possible before.
    expect(machinery).toHaveLength(21)
    expect(reach).toHaveLength(303)
  })

  it('counts completeness as exactly the declared representations, placed', () => {
    // The shape assertion rather than the number, because the number is a record of a batch: a component the
    // model declares a representation for and the population places makes every one of its pairs complete, and
    // a declaration no pair can place is a defect — a registration nothing would ever read.
    //
    // Deriving the expectation rather than restating it is what keeps this honest across promotions. D.3.5
    // landed a batch and this test was a list of six names; the list would have had to grow by 26 lines and
    // the next batch by more, and each edit would have been the assertion agreeing with whatever was there.
    const declared = readTypedLeaves()
    const placed = new Set(
      population()
        .filter(one => bucketOf(one.parent, one.component) !== 'machinery')
        .map(one => one.component)
        .filter(component => declared.has(component)),
    )

    expect(new Set(complete.map(one => one.component))).toEqual(placed)
    expect(
      [...declared.keys()].filter(component => !placed.has(component)),
      'these components are declared but no pair in the population places them',
    ).toEqual([])
  })

  it('records a reason wherever it stops', () => {
    expect(incomplete.length).toBeGreaterThan(0)

    for (const one of incomplete)
      expect(one.reason, `${one.parent}/${one.component}`).toBeTruthy()

    expect(new Set(incomplete.map(one => one.reason))).toEqual(
      new Set([
        'no candidate addresses the pair',
        'the model declares no representation for the component',
      ]),
    )
  })

  it('scopes a candidate to the pair it actually serves', () => {
    // `scale-x` is composed by `scale` and by `scale-3d`, and `animate-scale-x` addresses `scale` — so one of
    // those pairs is served and the other is not. Selecting by component alone made the second look like a
    // broken descriptor instead of an unserved one.
    const served = described.find(
      one => one.component === 'scale-x' && one.parent === 'scale',
    )
    const other = described.find(
      one => one.component === 'scale-x' && one.parent === 'scale-3d',
    )

    expect(served.status).toBe('complete')
    expect(other.status).toBe('unresolved-descriptor')
    expect(other.reason).toBe('no candidate addresses the pair')
  })
})

describe('the census population', () => {
  it('counts the authoring surface where the composition no longer reads it', () => {
    // The rule a reshape needs, stated as a function of its inputs so it can be exercised without moving the
    // model underneath it: the graph stopped naming the authoring components, and they did not stop being
    // constituents. A pair leaves this population because the graph stopped reading it, not because an author
    // lost the ability to address it.
    expect(
      censusOf({
        authoring: [{ component: 'edge', parent: 'anchor' }],
        composition: [{ component: 'position', parent: 'anchor' }],
      }),
    ).toEqual([
      { component: 'position', parent: 'anchor' },
      { component: 'edge', parent: 'anchor' },
    ])
  })

  it('leaves the execution machinery out of it', () => {
    // An execution leaf is reached by the composition and by nothing else — no candidate addresses it — so
    // counting it would say an author can address something they cannot see.
    expect(
      censusOf({
        authoring: [{ component: 'edge', parent: 'anchor' }],
        composition: [{ component: 'position', parent: 'anchor' }],
        execution: ['position'],
      }),
    ).toEqual([{ component: 'edge', parent: 'anchor' }])
  })

  it('counts a pair once when both relations name it', () => {
    // A family whose composition still reads an authoring component contributes it through both halves, and
    // without this the buckets would each grow by a pair nobody can explain.
    expect(
      censusOf({
        authoring: [{ component: 'edge', parent: 'anchor' }],
        composition: [{ component: 'edge', parent: 'anchor' }],
      }),
    ).toHaveLength(1)
  })

  it('is the graph while no family declares either relation', () => {
    // The rule is inert until a family needs it, and that is asserted rather than assumed: with no authoring
    // surface and no execution leaf declared, the census is exactly the composition graph it has always been,
    // which is what makes the counts in `crosstab.test.mjs` a statement about the model rather than about this
    // function. The increment that lands `offset-anchor` restates this identity with both halves non-empty.
    expect(censusPopulation()).toEqual(population())
  })
})
