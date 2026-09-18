import { describe, expect, it } from 'vitest'

import {
  compoundComponents,
  coverage,
  declared,
  project,
  promoted,
  proposed,
  recordFor,
} from './evidence.mjs'
import { describe as describePair, population } from './observation.mjs'
import { bucketOf, readTypedLeaves } from './property-model.mjs'

/**
 * The invariants that keep pass two a *projection*.
 *
 * A pass that joins evidence to descriptors can fail in three directions, and each one is silent: it can count
 * a proposal as coverage, it can let a verdict cross between representations, and it can leave a complete
 * descriptor without saying whether it is proven. The registry is data, so these are the only checks it can
 * have — and they are the ones the projection's answers depend on.
 */
describe('the evidence registry', () => {
  const leaves = readTypedLeaves()

  it('holds only declared representations in the coverage class', () => {
    // Every component in the **coverage** class must be a representation the model actually declares. Otherwise
    // the projection would report `movable` for a pair whose descriptor is `unresolved-descriptor`, which is
    // exactly the conflation pass one and pass two are kept apart to prevent.
    //
    // Stated over `coverage()` **alone**, which is the direct-representation class. The property-scoped pairs and
    // the compound class name other relations — a declared leaf under a second parent, and an authoring component
    // represented through a resolver — and asking them to satisfy a leaf-shaped invariant was the caller reading
    // the wrong set rather than the entries being wrong.
    const undeclared = coverage()
      .flatMap(one => one.pairs)
      .filter(pair => !leaves.has(pair.component))

    expect(undeclared).toEqual([])
  })

  it('keeps the proposed class out of coverage', () => {
    // The intersection must be empty: a proposal the model also declares is no longer a proposal, and the
    // record belongs in `declared` with the declaration as its source.
    expect(promoted()).toEqual([])
    expect(proposed.length).toBeGreaterThan(0)
  })

  it('names a representation and a source for every record', () => {
    for (const record of [...declared, ...proposed]) {
      const where = record.pairs
        .map(pair => `${pair.parent}/${pair.component}`)
        .join(', ')

      expect(record.representation, where).toBeTruthy()
      expect(record.source, where).toBeTruthy()
      expect(record.pairs.length).toBeGreaterThan(0)
    }
  })

  it('answers for every descriptor-complete pair, with a verdict or a reason', () => {
    // The projection is total: the state the CTO allowed explicitly — `descriptor complete, classification
    // unresolved` — is a value here, not a gap, so a pair can be structurally describable and behaviourally
    // unproven without anything having to be invented to fill the row.
    const complete = population()
      .map(describePair)
      .filter(one => one.status === 'complete')

    const projected = project(complete)

    expect(projected).toHaveLength(complete.length)
    expect(
      projected.filter(one => one.status === 'projected').length,
    ).toBeGreaterThan(0)

    for (const one of projected) {
      expect(one.descriptor.component).toBeTruthy()
      expect(['projected', 'classification unresolved']).toContain(one.status)

      if (one.status === 'classification unresolved')
        expect(one.reason).toBeTruthy()
      else expect(one.record.source).toBeTruthy()
    }
  })

  it('covers the declared leaves by their own declaration, not by family', () => {
    // `translate-z` is declared `<length>` with `lengthOnly`, its siblings `<length-percentage>` with
    // `lengthish`. The registry has to be able to say *which* representation a verdict was measured under, and
    // its own components list is where that shows: a leaf the model declares is either covered by a record or
    // reported unresolved as a pair.
    const z = { component: 'translate-z', parent: 'translate' }
    const x = { component: 'scale-x', parent: 'scale' }

    expect(recordFor(z).representation).toContain('<length>')
    expect(recordFor(z).representation).not.toContain('<length-percentage>')
    expect(recordFor(x).representation).toContain('<number>')
  })

  it('says where the standing arms end and the landing record begins', () => {
    // The distinction D.2 left behind: §16's curve arms are scale's, §17's definition arms cover translate's
    // identity. A record that did not say which would read as "the gate holds this", and for translate's curves
    // it does not.
    expect(
      recordFor({ component: 'scale-x', parent: 'scale' }).source,
    ).toContain('§16')
    expect(
      recordFor({ component: 'translate-x', parent: 'translate' }).scope,
    ).toContain('not a curve arm')
  })

  it('covers the pair the arms measured, and not its same-component sibling', () => {
    // `scale-x` is composed by `scale` and by `scale-3d`; the arms animate the first. Keying the registry by
    // component made the second look covered, and it has no candidate at all — so it cannot even be described.
    expect(recordFor({ component: 'scale-x', parent: 'scale' })).not.toBe(null)
    expect(recordFor({ component: 'scale-x', parent: 'scale-3d' })).toBe(null)
  })

  it('projects onto the census population, machinery excluded, exactly once per pair', () => {
    const pairs = population().filter(
      one => bucketOf(one.parent, one.component) !== 'machinery',
    )

    expect(pairs).toHaveLength(303)

    const complete = pairs
      .map(describePair)
      .filter(one => one.status === 'complete')

    // Derived, not counted: every pair the model can describe is answered by the coverage class, and every
    // answer is `movable`. The batch that landed in D.3.5 is 31 of those pairs and the three D.2 families are
    // the rest — but the assertion is the relation, so a later promotion does not have to edit it.
    expect(complete.length).toBeGreaterThan(0)

    // Stated over the **directly represented** pairs, which are the ones the coverage class answers. A compound
    // pair is proven by its **route** record instead — a measured public route and the execution leaf it assigns —
    // a different class of evidence, asserted by the authoring-route guard, so counting it as unanswered here would
    // be reading one class through another.
    const direct = complete.filter(
      one => !compoundComponents().has(one.component),
    )

    // The relation is stated over the **directly represented** pairs, which are the ones the coverage class
    // answers. A compound pair is proven by its **route** record — a measured public route and the execution leaf
    // it assigns — which is a different class of evidence, asserted by the authoring-route guard rather than by
    // this projection, so counting it here as unanswered would be reading one class through another.

    expect(
      project(direct).filter(one => one.verdict === 'movable'),
    ).toHaveLength(direct.length)
  })
})
