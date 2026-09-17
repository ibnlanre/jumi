import type { PropertyType } from '@/types'

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { compositionEdges } from '@/variables/composition'
import { propertyVariables } from '@/variables/property'

import {
  expressions,
  readCandidates,
} from '../../scripts/lib/property-model.mjs'
import {
  addressableLeavesOf,
  authoringOf,
  canonicalizeLeaf,
  isExecutionLeaf,
  normalizeScale,
  scaleFactorToNumber,
  scaleLeafEndpoints,
  translateLeaves,
  typedExecutionOf,
  typedExecutions,
  typedLeafOf,
  typedLeaves,
  typedLeavesOf,
} from './typed-leaves'

import path from 'node:path'

/**
 * The evidence D.3.5 measured, and the guard that ties a declaration to it.
 *
 * A typed declaration changes what ships: a leaf in `typedLeaves` is registered with a real grammar, so its
 * resting value has to survive that grammar and its frames have to interpolate the way the property does. Both
 * were measured, per pair, by `scripts/research/d3-validation.mjs` — and the record it wrote is the *only* thing
 * that admits a declaration. Nothing in `src/` imports this file at runtime; the pass that produced it is a
 * research book, and production depends on the data rather than on the run.
 *
 * The guard is exact on the two fields a declaration can be compared against without interpretation:
 *
 *   pair          the record names **that** parent and component, so a sibling cannot be rounded up
 *   representation the declared `syntax` and `initialValue` are the ones that were measured
 *
 * One asymmetry is deliberate, and it is where a naive guard would be wrong. A declaration is keyed
 * `(family, leaf)` while a pair is keyed `(parent, component)`, so one leaf can serve two validated routes —
 * `box-shadow`'s five leaves serve the inset and the outset pairs alike. The declaration is therefore only
 * admitted when **every** record through it is `movable`: one registration serves both routes, so it is only as
 * good as its worst one.
 */
type Evidence = {
  routes: Array<{
    candidate: string
    component: string
    consumer: string
    initialValue: string
    magnitudes: number
    parent: string
    route: string
    syntax: string
    verdict: string
  }>
}

const EVIDENCE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  '..',
  'scripts',
  'validated-representations.json',
)

const evidence: Evidence = JSON.parse(readFileSync(EVIDENCE, 'utf8'))

/** The identity a declaration and its evidence share: a leaf, and the family it is executed through. */
const keyOf = (one: { component: string; consumer: string }) =>
  `${one.consumer}\u0000${one.component}`

const declaredLeaf = (consumer: string, component: string) =>
  typedLeaves[consumer as PropertyType]?.[component]

describe('a typed declaration is admitted by evidence and by nothing else', () => {
  const validated = evidence.routes.filter(one => one.verdict === 'movable')

  it('declares every route the validation measured as movable, with its representation', () => {
    // Forward, and exact: a `movable` record admits a declaration under **that family**, with **that syntax**
    // and **that initial value**. This is the assertion that fails when a declaration is edited after the fact
    // to something the browser never saw.
    for (const one of validated) {
      const leaf = declaredLeaf(one.consumer, one.component)

      expect(
        leaf,
        `${one.route} is validated \`movable\` but not declared under \`${one.consumer}\``,
      ).toBeDefined()
      expect(leaf?.syntax).toBe(one.syntax)
      expect(leaf?.initialValue).toBe(one.initialValue)
    }
  })

  it('refuses a declaration any of whose routes is undecided', () => {
    // A declaration is keyed `(family, leaf)` while a route is a pair *through* a family, so one declaration can
    // serve more than one pair — `box-shadow`'s five leaves serve the inset and the outset routes alike. One
    // registration serves both, so it is only as good as its worst route.
    const verdicts = new Map<string, string[]>()

    for (const one of evidence.routes)
      verdicts.set(keyOf(one), [
        ...(verdicts.get(keyOf(one)) ?? []),
        one.verdict,
      ])

    for (const [key, records] of verdicts) {
      const [consumer, component] = key.split('\u0000')

      if (!declaredLeaf(consumer, component)) continue

      // A key whose records are all `movable` is the batch's business. A key with **no** `movable` record is
      // not: the six leaves declared before this pass have their evidence in the landing registry, and this
      // pass refuses their union syntaxes because a union is not one probe. What the guard must never allow is
      // a key where *some* route is movable and another is not — that is a promotion one route short.
      if (!records.includes('movable')) continue

      expect(
        records,
        `\`${consumer}\`/\`${component}\` is declared while one of its routes is not movable`,
      ).toEqual(records.map(() => 'movable'))
    }
  })

  it('leaves the routes the pass could not decide undeclared', () => {
    // Named rather than counted, because these are the findings of that pass and a future edit that "rounds up"
    // one of them should fail here rather than in a report nobody reads.
    for (const one of evidence.routes.filter(
      record => record.verdict !== 'movable',
    ))
      if (one.verdict !== 'unresolved')
        expect(
          declaredLeaf(one.consumer, one.component),
          `${one.route} is ${one.verdict} and must not be declared`,
        ).toBeUndefined()
  })
})

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

  it('names only leaves the family reads, at any depth, or the family itself', () => {
    // Three shapes, and the runtime has one lookup for all of them — `typedLeavesOf(attribute)`, where the
    // attribute is the property the *candidate* animates.
    //
    //   composed   the family composes the leaf directly (`scale` reads `scale-x`; `border-radius` reads its
    //              four corners), so the registration is read by a rule the family emits.
    //   nested     the family reaches it through another composition (`background-position` reads
    //              `background-position-x`, which reads `background-position-x-offset`), which is why the
    //              test walks rather than looking one edge deep — a rule two levels down still reads the leaf.
    //   whole      the family **is** the property the candidate animates (`animate-background-color` addresses
    //              `background-color`, and the emission applies the leaf directly), so the leaf name and the
    //              family name are the same string and there is no composition edge to point at.
    //
    // The failure mode is the same in all three and is what this guards: an `@property` block nothing reads — a
    // registration published for a variable no rule ever sets, which is silent and permanent.
    //
    // Every edge is followed, whatever its kind, and that is the correction this promotion forced: the kinds
    // describe *how* a dependency is addressed — `direct`, `composite`, `fallback` — which is a different
    // question from whether it is read. `box-shadow` reaches its five leaves only through
    // `var(--jumi-box-shadow-inset, var(--jumi-box-shadow-outset))`, and `background-position` reaches its
    // offsets through `background-position-x`; both are read, and a registration on either leaf is read with
    // them. `edgesOf` enumerates `dependencies`, so every name this walk reaches is a dependency of something —
    // which is exactly the invariant the original test stated in one edge's worth of prose.
    //
    // The other half of that intent, "a `composite` leaf is a routing problem this increment does not solve", is
    // asserted by the sibling test below: a leaf that is itself a composition is rejected outright, so a
    // composite can be a *path* through this walk but never a declaration.
    const reachable = (attribute: PropertyType) => {
      const seen = new Set<string>()
      const queue: PropertyType[] = [attribute]

      while (queue.length) {
        for (const edge of compositionEdges.get(queue.shift()!) ?? []) {
          if (seen.has(edge.dependency)) continue

          seen.add(edge.dependency)
          queue.push(edge.dependency as PropertyType)
        }
      }

      return seen
    }

    for (const [attribute, leaves] of Object.entries(typedLeaves)) {
      const composed = reachable(attribute as PropertyType)

      for (const leaf of Object.keys(leaves ?? {})) {
        if (leaf === attribute) continue

        expect(
          composed.has(leaf),
          `\`${attribute}\` declares \`${leaf}\`, which it does not read through direct composition`,
        ).toBe(true)
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
    expect(typedLeavesOf('gap')).toEqual([])
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

describe('translateLeaves', () => {
  it('pads the missing components with the identity, not with the first value', () => {
    // `scale: 2` is `2 2 2`; `translate: 10px` is `10px 0 0`. The two families deliberately do not
    // share a rule, and a shared one would have been the obvious wrong generalization — which is the
    // argument for a declared facet rather than a rule the core could have assumed.
    expect(translateLeaves('10px')).toEqual([
      ['translate-x', '10px'],
      ['translate-y', '0'],
      ['translate-z', '0'],
    ])
    expect(translateLeaves('10px 20px')).toEqual([
      ['translate-x', '10px'],
      ['translate-y', '20px'],
      ['translate-z', '0'],
    ])
    expect(translateLeaves('10px 20px 30px')).toEqual([
      ['translate-x', '10px'],
      ['translate-y', '20px'],
      ['translate-z', '30px'],
    ])
  })

  it('declines through the same guards the constituent path uses', () => {
    // One statement of what the family accepts, read by both entrances, so a value one path accepts
    // and the other refuses is not expressible. A leaf cannot hold a keyword, so claiming the motion
    // for one would animate nothing while suppressing every other declaration of the property.
    for (const value of [
      'none',
      'auto',
      'banana',
      '10px 20px 30px 40px',
      'calc(2px)',
      'var(--x)',
      '',
    ])
      expect(translateLeaves(value), value).toBeNull()

    expect(
      canonicalizeLeaf(typedLeafOf('translate', 'translate-x'), 'banana'),
    ).toBeNull()
  })

  it('takes a percentage on x and y, and refuses one on z', () => {
    // `translate`'s z is a `<length>`: a percentage there is not a value the leaf can hold, so the
    // whole value declines rather than writing one the browser would drop.
    expect(translateLeaves('50%')).toEqual([
      ['translate-x', '50%'],
      ['translate-y', '0'],
      ['translate-z', '0'],
    ])
    expect(translateLeaves('10px 20px 30%')).toBeNull()
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
    //
    // The second half is stated over the **addressable** leaves, which is a narrowing rather than a
    // relaxation. It used to say every declared leaf, and that was only true while every declared leaf
    // was something an author could address; a family that resolves execution out of an authoring
    // surface has leaves no whole value can name — they are named by the resolver, from authoring
    // state the whole facet does not receive — and requiring them here would demand the facet invent
    // an entrance. What an author can address still owes a whole-value reading, and that is asserted.
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
      const addressable = addressableLeavesOf(attribute as PropertyType).map(
        ([leaf]) => leaf,
      )

      expect([...new Set(names)].sort()).toEqual(addressable)
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

  it('evidences an execution leaf through the family that produces it', () => {
    // An execution leaf **cannot** have route evidence of its own, because a route means an author can enter
    // through something. What stands in its place is the family, and both halves of that are checked here,
    // since either alone is satisfiable by a leaf that is dead in a different way: a leaf the composition never
    // reads is a write to a property nothing consumes, and a leaf some candidate addresses is authoring surface
    // wearing an execution marker — a distinction that would then be wrong rather than merely unused.
    for (const attribute of Object.keys(typedExecutions) as PropertyType[]) {
      const composed = expressions().get(attribute) ?? ''

      for (const [leaf, declaration] of typedLeavesOf(attribute))
        if (isExecutionLeaf(declaration)) {
          expect(composed, `${attribute}: ${leaf}`).toContain(
            `var(--jumi-${leaf})`,
          )

          expect(
            readCandidates().some(
              one => one.attribute === leaf || one.parts.includes(leaf),
            ),
            `${leaf} is addressed by a candidate, so it is authoring surface`,
          ).toBe(false)
        }
    }
  })

  it('declares an authoring surface wherever execution exists', () => {
    // Execution is *resolved out of* authoring state, so the state has to exist and the way an author reaches
    // it has to be declared. A family with execution leaves and no authoring surface is one whose leaves can
    // never move — the resolver would have nothing to read, and the routes that are supposed to prove the
    // execution would have nothing to enter through.
    for (const attribute of Object.keys(typedExecutions) as PropertyType[])
      if (typedLeavesOf(attribute).some(([, one]) => isExecutionLeaf(one)))
        expect(authoringOf(attribute).length, attribute).toBeGreaterThan(0)
  })
})

type AuthoringEvidence = {
  records: Array<{
    authoring: { component: string; context: string[] }
    condition: null | string
    consumer: string
    execution: { assigned: string[]; leaves: string[] }
    parent: string
    representation: string
    route: string
    verdict: string
  }>
}

const AUTHORING_EVIDENCE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  '..',
  'scripts',
  'authoring-route-evidence.json',
)

const authoringEvidence: AuthoringEvidence = JSON.parse(
  readFileSync(AUTHORING_EVIDENCE, 'utf8'),
)

describe('authoring-route evidence', () => {
  it('evidences every authoring component of a compound family, and nothing else', () => {
    // The durable rule D.3.7 proved: a **simple** constituent is evidenced as one component to one leaf, and a
    // **compound** one is evidenced as an authoring component plus the sibling context its resolver reads,
    // resolving to a complete execution assignment. The shapes are different because the things are different,
    // and forcing the second into the first would hide the fact that makes it work.
    const expected = Object.entries(typedExecutions).flatMap(
      ([attribute, execution]) =>
        execution.constituent
          ? (execution.authoring ?? []).map(
              component => `${attribute}/${component}`,
            )
          : [],
    )

    expect(
      authoringEvidence.records
        .map(one => `${one.parent}/${one.authoring.component}`)
        .sort(),
    ).toEqual(expected.sort())
  })

  it('resolves each one to the family’s complete assignment, or says it declines', () => {
    // Both halves or neither. A record claiming a route works while assigning one leaf describes the half-typed
    // state the decline exists to prevent, and a declining route that assigns leaves is the same error with the
    // polarity reversed.
    for (const one of authoringEvidence.records) {
      const leaves = typedLeavesOf(one.parent as PropertyType)
        .filter(([, declaration]) => isExecutionLeaf(declaration))
        .map(([leaf]) => leaf)
        .sort()
      const resolved = one.verdict === 'movable' || one.verdict === 'conditional'

      expect([...one.execution.leaves].sort(), one.route).toEqual(leaves)
      expect([...one.execution.assigned].sort(), one.route).toEqual(
        resolved ? leaves : [],
      )

      // A verdict that is not unconditional carries its condition, because the record's whole job is to answer
      // *under what authoring state* this public route enters typed execution — and the offsets are the case
      // that makes the question real: their normalizer refuses `center` over a non-zero offset by contract.
      if (one.verdict !== 'movable')
        expect(one.condition, one.route).toBeTruthy()

      // And the sibling context it names is the family's other authoring components, not a list kept here.
      expect([...one.authoring.context].sort(), one.route).toEqual(
        authoringOf(one.parent as PropertyType)
          .filter(name => name !== one.authoring.component)
          .sort(),
      )
    }
  })
})
