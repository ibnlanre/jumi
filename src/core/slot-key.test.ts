import { describe, expect, it } from 'vitest'

import { addressableName, instanceKey } from '@/core'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyVariables } from '@/variables/property'

import shorthash2 from 'shorthash2'

/**
 * The instance vocabulary's boundary, as an assertion rather than a comment.
 *
 * A slot key is `<name>-<id>-<attribute>` for a named instance and `<attribute>-<id>` for one that took no
 * name. The name is first because that is the readable end; the id sits between the name and the attribute
 * because `shorthash2` is base62 — `scripts/spike-slot-key.mjs` enumerates its alphabet — so the id is the
 * one segment of the key that can hold no hyphen.
 *
 * That gives two properties and not three, and the difference is worth stating because the ruling assumed
 * otherwise. **Hyphen-free** is true (measured: every character of 4000 hashes is `[0-9A-Za-z]`) and that is
 * what keeps a *name* from absorbing the attribute — put the attribute between the name and the id, and
 * `foo-accent` + `color` and `foo` + `accent-color` are one string, reachable by an author writing
 * `/foo-accent` on a `color` motion. **Fixed-length** is not true: ids run from two characters to seven
 * (`shorthash2('50')` is `rI`), so the id is a delimiter but not an unforgeable one, and a name whose tail
 * *is* another instance's id can still absorb. That residual is enumerated below rather than argued away,
 * because it is the difference between "safe against every name" and "safe against every name nobody
 * crafted".
 *
 * The corpus is built **from the vocabulary** for the reason the probe learned: a corpus of generic samples
 * reports no collisions in either shape, which is how a wrong order looks safe until someone writes the
 * name that breaks it. Every name here is a real attribute, `foo` plus an attribute, or `foo` plus the piece
 * of an attribute that another attribute already names (`color` under `accent-color`, `width` under
 * `stroke-width`).
 */

/** Every attribute Jumi can give a slot: the animatable properties, and the effects. */
const VOCABULARY = [
  ...Object.keys(propertyVariables),
  ...Object.keys(effectKeyframes),
]

/** The attributes that end in another attribute's name — the overlaps the corpus attacks through. */
const OVERLAPS = VOCABULARY.flatMap(attribute =>
  VOCABULARY.filter(
    suffix => attribute !== suffix && attribute.endsWith(`-${suffix}`),
  ).map(suffix => [attribute, suffix] as const),
)

/** Names to try: generic, every attribute, and every `foo-` spelling the overlaps make possible. */
const NAMES = [
  ...new Set([
    'a',
    'flick',
    'foo',
    'foo-animation-duration',
    'foo-bar-baz',
    'loop',
    ...OVERLAPS.flatMap(([attribute, suffix]) => [
      `foo-${attribute}`,
      `foo-${attribute.slice(0, -(suffix.length + 1))}`,
    ]),
    ...VOCABULARY,
    ...VOCABULARY.map(attribute => `foo-${attribute}`),
  ]),
]

/** Every name the model would accept, with the unnamed instance as its own case. */
const LEGAL: Array<null | string> = [null, ...NAMES.filter(addressableName)]

/**
 * Ids as the model produces them, over values a corpus would plausibly declare — three of them, because
 * the enumeration below runs the whole attribute vocabulary against every name and the gate instruments
 * this file. The id enters the key only as one of these tokens, so three are three ways to be wrong.
 */
const IDS = [
  ...new Set(['50', '0:0|100:1', 'scale'].map(value => shorthash2(value))),
]

/**
 * The first key two different triples share, over the whole cross product.
 *
 * A `Set` of keys and a count, rather than a map of key to triple: the enumeration is hundreds of
 * thousands of entries, and injectivity is exactly `keys.size === count`. What the collision *was* is the
 * residual test's business, not this one's.
 */
const shared = (ids: string[], names: Array<null | string>) => {
  const keys = new Set<string>()
  let count = 0

  for (const attribute of VOCABULARY)
    for (const id of ids)
      for (const name of names) {
        keys.add(instanceKey(attribute, id, name ?? undefined))
        count += 1
      }

  return { count, keys }
}

describe('the slot key', () => {
  it('spells the name first, the id between the name and the attribute', () => {
    // The vocabulary itself, pinned, so a reorder is a failing test and not a diff nobody reads.
    expect(instanceKey('rotate', 'Z2excak', 'flick')).toBe(
      'flick-Z2excak-rotate',
    )
    expect(instanceKey('background-color', '23M1JK', 'pulse')).toBe(
      'pulse-23M1JK-background-color',
    )

    // No name, no id: the definition, for a composed tween or an effect.
    expect(instanceKey('rotate', 'Z2excak')).toBe('rotate-Z2excak')
    expect(instanceKey('filter')).toBe('filter')
  })

  it('builds its corpus from legal names and real overlaps', () => {
    expect(LEGAL.length).toBeGreaterThan(300)

    // The overlap is a fact about the vocabulary, not a hypothetical.
    expect(OVERLAPS).toContainEqual(['accent-color', 'color'])
    expect(OVERLAPS).toContainEqual(['stroke-width', 'width'])
  })

  it('is injective over the vocabulary, for the ids the model produces', () => {
    const { count, keys } = shared(IDS, LEGAL)

    // One key per triple, over several hundred attributes-and-effects × several ids × several
    // hundred names. A shorter set is a collision, and the residual test below names the shape.
    expect(keys.size).toBe(count)
    expect(count).toBeGreaterThan(200_000)
  })

  it('records the residual: a name whose tail is another instance id', () => {
    // Not a hypothetical, and not a name anyone writes by accident: this is what the readable key costs,
    // and the assertion is here so the cost is visible rather than discovered.
    expect(
      instanceKey('right', 'rotate', 'foo-backdrop-filter-hue-rotate'),
    ).toBe(instanceKey('rotate-right', 'rotate', 'foo-backdrop-filter-hue'))

    // Reachability: an id is the hash of a value or a phrase (`shorthash2('50')` is `rI`), so a crafted name
    // has to end in the exact id of a definition on an overlapping attribute — the author has to compute
    // another motion's hash and write it into theirs. Ids are short enough that the word can collide by
    // chance, which is why this is recorded.
    expect(shorthash2('50')).toHaveLength(2)
    expect(new Set(IDS.map(id => id.length)).size).toBeGreaterThan(1)

    // The two ways out, for whoever rules on it: names restricted to a hyphen-free token, which makes the
    // key provably injective, or a separator a name cannot hold. Both cost something this shape bought.
  })

  it('shows what the reordered key would cost, so nobody reorders it back', () => {
    // The shape that was proposed first: `<name>-<attribute>-<id>`. Its collision needs no crafted hash at
    // all — only a name that ends where another attribute's name begins.
    const reordered = (attribute: string, id: string, name: string) =>
      `${name}-${attribute}-${id}`

    expect(reordered('color', 'k1aaa', 'foo-accent')).toBe(
      reordered('accent-color', 'k1aaa', 'foo'),
    )
    expect(reordered('width', 'k1aaa', 'foo-stroke')).toBe(
      reordered('stroke-width', 'k1aaa', 'foo'),
    )

    // …and the shipped shape keeps both pairs apart, which is the whole of the argument.
    expect(instanceKey('color', 'k1aaa', 'foo-accent')).not.toBe(
      instanceKey('accent-color', 'k1aaa', 'foo'),
    )
    expect(instanceKey('width', 'k1aaa', 'foo-stroke')).not.toBe(
      instanceKey('stroke-width', 'k1aaa', 'foo'),
    )
  })
})
