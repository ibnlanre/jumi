import type { PropertyType } from '@/types'

import { describe, expect, it } from 'vitest'

import { propertyVariables } from '@/variables/property'
import {
  authoringPairs,
  isExecutionLeaf,
  typedLeaves,
  typedLeavesOf,
} from '@/variables/typed-leaves'

import {
  bucketOf,
  readPropertyEntries,
} from '../../scripts/lib/property-model.mjs'

/**
 * D.3 · reach — the constituent surface, and where typing it stops.
 *
 * D.2 proved the mechanism generalizes past its first family. D.3 asks the narrower and more useful
 * question: **how much of the constituent surface can move onto value-free per-leaf typed execution
 * before it hits cases that cannot move?** This is the census that answers it, derived from the model
 * rather than listed, so whatever the vocabulary gains or loses the numbers follow.
 *
 * The surface is every **(parent, component) pair** — the pair and not the leaf, and that is a measured
 * distinction rather than a refinement: `translate-x` is a bare component of `translate` and an
 * *argument* of `translate3d(…)`, so one leaf participates two ways and a per-leaf verdict would have to
 * be wrong about one of them.
 *
 *   pairs            326
 *   machinery         21   parts of the `animation`/`transition`/`*-timeline` shorthands
 *   constituent      305   what reach is actually about
 *     reshape         96   ≈ 31%
 *     value          108   ≈ 35%
 *     keyword        101   ≈ 33%
 *
 * The counts moved by two when `offset-anchor` was reshaped, and the movement is the finding rather than noise:
 * the composition stopped composing the two per-axis groups, whose pairs were `reshape` and leave — the reshape
 * doing exactly what the bucket says it means — and the family's four authoring components arrive as pairs it
 * exposes. The two execution leaves the composition now reads are refused rather than counted, because no
 * candidate addresses them: four in, two out, and the same six components reached a different way.
 *
 * Those three are close to equal, and that is the finding. Reach is not "mostly easy values with a few
 * ugly cases" — it is **three comparably large architectural populations**, which fail or succeed for
 * fundamentally different reasons. D.3 should therefore not become "migrate the remaining leaves"; it
 * becomes three separate reach questions.
 *
 * The buckets are **census morphology, not execution classes**, and the wording keeps them from claiming
 * more than the census knows:
 *
 *   reshape   typing requires changing the interpolation **unit or static composition shape** — the
 *             leaf is a function value (`blur(0)`), a function argument (inside `drop-shadow(…)`), or a
 *             composition of its own (`box-shadow-inset`). It does **not** mean "cannot be typed"; it
 *             names the work D.1 deliberately deferred.
 *   value     the resting constituent already has a **scalar-like typed representation**. Execution
 *             still depends on the authored grammar and any canonicalization it requires.
 *   keyword   the leaf rests on an identifier — `none`, `auto`, `medium`, `normal`, `left`. A **candidate
 *             list**, not a verdict: `d3-reach.mjs` measures whether a typed registration preserves the
 *             parent's computed value at rest, which is an *eligibility gate* — registration-unsafe is
 *             sufficient to keep a leaf native, registration-safe is not sufficient to type it.
 *   machinery reported so it is not counted as reach at all.
 *
 * What this file deliberately does **not** decide, because it is not a fact about the model:
 *
 *   - The `value` bucket's split into *typed directly* against *typed with normalization*. That is the
 *     family's authored grammar, and the two are not the same abstraction:
 *
 *         whole normalization / decomposition   ≠   leaf animation canonicalization
 *
 *     `scale` needed a leaf `animationCanonicalizer` because its leaf grammar admitted number/percentage
 *     spellings that native `scale` cross-interpolates and the registered union does not. `translate`
 *     is the opposite example, and the reason it was chosen for D.2: `<length-percentage>` is one
 *     interpolation grammar, so **no leaf canonicalizer should be required merely to make `10px`
 *     interpolate**. What translate needs is **whole decomposition** — `translate: 10px` →
 *     `x = 10px, y = 0, z = 0` — which is a different mechanism, stated in the family, and conflating
 *     the two would undo the separation D.1 and D.2 were for.
 *   - The keyword bucket's full membership. The gate is settled and the mechanism generalises, but only
 *     the decisive set has been read. The next increment classifies the remaining pairs by asking the
 *     **model or the family** for a justified typed representation, then runs the gate — and then the
 *     second differential, interpolation equivalence, which is what would finally license `movable`.
 */
/**
 * The bucket for one pair comes from the **shared** predicate (`scripts/lib/property-model.mjs`), which reads
 * the model's source and resolves each composition the way the plugin evaluates it.
 *
 * It used to be a second copy here, and the two copies disagreed on the representation rather than on the
 * rule: this file evaluated the model and saw `scroll(var(--jumi-animation-timeline-axis) var(…))`, while a
 * source reader saw the identifier `animationTimelineScroll`, so the depth test could not fire and nine
 * reshapes were counted as machinery — `324 - 30 = 294` "reach" against this file's `324 - 21 = 303`. Two
 * readers, one model, two populations. One predicate is what makes that impossible, and the counts below are
 * the evidence that the source reader reproduces the evaluated model rather than replacing it.
 */
const parents = Object.entries(propertyVariables).filter(
  ([, entry]) => (entry.dependencies?.length ?? 0) > 0,
)

// The same parents, read from the source: a disagreement here would mean the reader and the module have
// parted company, and the pair-by-pair bucket assertions below are computed from the source either way.
const sourceParents = readPropertyEntries().filter(entry => entry.composite)

/**
 * The **execution machinery**: leaves that exist to be written by a frame and cannot be entered through.
 *
 * Not population, and not an absence of reach either — a leaf no author can address was never on the surface.
 */
const executionLeaves = new Set(
  Object.keys(typedLeaves)
    .flatMap(attribute => typedLeavesOf(attribute as PropertyType))
    .filter(([, declaration]) => isExecutionLeaf(declaration))
    .map(([leaf]) => leaf),
)

/**
 * The surface, in the two relations the model states separately: what each property **composes**, and what each
 * family **exposes to an author**.
 *
 * They were one list until a reshape needed them apart — `dependencies` is what the property is made of, and an
 * emission that resolves two execution leaves out of four authoring components has a composition that reads
 * neither pair correctly. Counting only the graph would drop the four the moment the composition stopped naming
 * them; counting only the declarations would drop every pair nobody has had reason to declare yet.
 */
const surface = [
  ...parents.flatMap(([parent, entry]) =>
    (entry.dependencies ?? []).map(leaf => ({ leaf, parent })),
  ),
  ...authoringPairs().map(one => ({ leaf: one.component, parent: one.parent })),
]

// Counted once per pair, and never an execution leaf: both rules are the ones
// `scripts/lib/observation.mjs`'s `censusOf` applies, and the counts below are asserted in both files.
const pairs = [
  ...new Map(
    surface.map(one => [`${one.parent}/${one.leaf}`, one]),
  ).values(),
]
  .filter(one => !executionLeaves.has(one.leaf))
  .map(one => ({ bucket: bucketOf(one.parent, one.leaf), ...one }))

const components = new Set(pairs.map(one => one.leaf))

const buckets = pairs.reduce<
  Record<string, Array<{ leaf: string; parent: string }>>
>((acc, one) => {
  acc[one.bucket] = [...(acc[one.bucket] ?? []), one]

  return acc
}, {})

const size = (name: string) => (buckets[name] ?? []).length

describe("D.3's constituent census", () => {
  it('reads the surface off the vocabulary, not off a list kept here', () => {
    expect(parents).toHaveLength(104)
    expect(components.size).toBe(286)
    expect(pairs).toHaveLength(326)

    // The source reader and the evaluated model must have the same parents, because one predicate now serves
    // a census that reads both. This is the assertion that the shared predicate is not standing in for a
    // different model: same parents, and — through the bucket counts below — the same buckets.
    expect(sourceParents.map(entry => entry.slot).sort()).toEqual(
      parents.map(([parent]) => parent).sort(),
    )

    // Every bucket together is the surface, and no pair is in two of them.
    expect(
      size('reshape') + size('machinery') + size('keyword') + size('value'),
    ).toBe(pairs.length)
  })

  it('splits the surface by what moving a place would need', () => {
    // Reported over the **constituent** pairs, because machinery is not reach at all: three populations
    // of 98 / 106 / 99 against a denominator of 303 is ≈ 32% / 35% / 33%, and the near-equality is the
    // finding rather than the exact counts.
    const constituent = pairs.length - size('machinery')

    expect(constituent).toBe(305)
    expect(size('reshape')).toBe(96)
    expect(size('value')).toBe(108)
    expect(size('keyword')).toBe(101)
    expect(size('machinery')).toBe(21)

    // Each population is between a quarter and a half of the constituent surface — the statement that
    // no one of them can be treated as the tail of the others.
    for (const bucket of ['reshape', 'value', 'keyword'] as const) {
      expect(size(bucket) / constituent).toBeGreaterThan(0.25)
      expect(size(bucket) / constituent).toBeLessThan(0.45)
    }
  })

  it('counts the authoring surface, and never the execution machinery', () => {
    // The two halves of the population rule, each stated where it can fail. An authoring component stays a
    // constituent whether or not the composition still names it: a reshape moves work, it does not unexpose a
    // surface. An execution leaf is the opposite — it has no entrance, so it was never census population.
    for (const one of authoringPairs())
      expect(
        pairs.some(pair => pair.leaf === one.component && pair.parent === one.parent),
        `${one.parent}/${one.component}`,
      ).toBe(true)

    for (const leaf of executionLeaves)
      expect(
        pairs.some(pair => pair.leaf === leaf),
        `${leaf} is execution machinery and is in the census`,
      ).toBe(false)

    // Counted once, from either relation: a family that exposed a component its composition also read would
    // otherwise contribute it twice, and the buckets would each grow by a pair nobody can explain.
    expect(new Set(pairs.map(one => `${one.parent}/${one.leaf}`)).size).toBe(
      pairs.length,
    )
  })

  it('places the decisive pairs, whose buckets the browser book confirms or refutes', () => {
    // The reshape, in each of its three shapes: a function-valued leaf, a function argument, and a
    // composition that is itself a component.
    expect(bucketOf('filter', 'filter-blur')).toBe('reshape')
    expect(bucketOf('filter-drop-shadow', 'filter-drop-shadow-blur')).toBe(
      'reshape',
    )
    expect(bucketOf('box-shadow', 'box-shadow-inset')).toBe('reshape')

    // The same leaf through two parents, which is why the pair is the unit.
    expect(bucketOf('translate', 'translate-x')).toBe('value')
    expect(bucketOf('translate-3d', 'translate-x')).toBe('reshape')

    // The keyword bucket, whose members `d3-reach.mjs` reads in the browser: `left` survives a typed
    // registration, `auto` and `normal` do not. A bucket of candidates, not a verdict.
    expect(
      bucketOf('background-position-x', 'background-position-x-edge'),
    ).toBe('keyword')
    expect(bucketOf('gap', 'column-gap')).toBe('keyword')
    expect(bucketOf('aspect-ratio', 'aspect-ratio-width')).toBe('keyword')
    expect(bucketOf('background-size', 'background-size-width')).toBe('keyword')

    // The typeable control, and the two families already carrying typed leaves.
    expect(bucketOf('translate', 'translate-x')).toBe('value')
    expect(bucketOf('scale', 'scale-x')).toBe('value')
  })
})
