import { describe, expect, it } from 'vitest'

import { addressableName } from '@/core'
import { instanceKey, parseInstanceKey } from '@/helpers/carriers/instance'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyVariables } from '@/variables/property'

import cssEscape from 'css.escape'

/**
 * The instance vocabulary's **exactness**, as a permanent assertion.
 *
 * A named slot key is `<units>-<name>-<id>-<attribute>`:
 *
 *   --jumi-slot-5-flick-Z2excak-rotate
 *   --jumi-slot-24-flick-animation-duration-Z2excak-rotate
 *
 * The prefix is what makes it exact rather than merely readable. Every shape that joined the three pieces
 * with hyphens alone was a collision waiting for the right name, and the history is worth keeping because
 * each step looked fine until it was measured:
 *
 *   flick-rotate-Z2excak        `foo-accent` on `color` and `foo` on `accent-color` are one string
 *   flick-Z2excak-rotate        a name whose tail is another instance's id absorbs its key
 *   <units>-flick-Z2excak-rotate   a boundary that is a fact about the shape
 *
 * The third is exact **by construction**: the reader is a left inverse of the writer. That is the criterion
 * the CTO set, and it is a stronger claim than "no collisions in a corpus", so the round trip below is the
 * assertion and the enumeration is its corroboration.
 *
 * The corpus is built **from the vocabulary**, because a corpus of generic samples reports no collisions in
 * any of these shapes — which is exactly how a wrong one looks safe. Every name here is a real attribute,
 * `foo` plus an attribute, `foo` plus the piece of an attribute another attribute already names (`color`
 * under `accent-color`), or a name that attacks the *encoding*: Unicode, characters CSS escapes, and names
 * that read like the prefix.
 */

/** Every attribute Jumi can give a slot: the animatable properties, and the effects. */
const VOCABULARY = [
  ...Object.keys(propertyVariables),
  ...Object.keys(effectKeyframes),
]

/** The attributes that end in another attribute's name — the overlaps a hyphen-joined key loses to. */
const OVERLAPS = VOCABULARY.flatMap(attribute =>
  VOCABULARY.filter(
    suffix => attribute !== suffix && attribute.endsWith(`-${suffix}`),
  ).map(suffix => [attribute, suffix] as const),
)

/** Names to try: adversarial by construction, and the `foo-` spellings the overlaps make possible. */
const NAMES = [
  ...new Set([
    '2fast',
    '5-flick',
    '👍emoji',
    'a',
    'café',
    'flick',
    'foo',
    'foo,bar',
    'foo--bar',
    'foo-animation-duration',
    'foo-bar-baz',
    'foo.bar',
    'loop',
    '日本語',
    ...OVERLAPS.slice(0, 30).flatMap(([attribute, suffix]) => [
      `foo-${attribute}`,
      `foo-${attribute.slice(0, -(suffix.length + 1))}`,
    ]),
    ...VOCABULARY.slice(0, 20),
  ]),
].filter(addressableName)

/** Ids as the model produces them — base62, two to seven characters — plus one shaped like an attribute. */
const IDS = ['k1aaa', 'Z2excak', 'rI', 'rotate']

/**
 * The text a name occupies in the emitted variable — the test's own statement of the format, deliberately
 * not imported from the implementation, because an assertion that reuses the code under test asserts only
 * that the code is itself.
 */
const emitted = (name: string) => cssEscape(`x${name}`).slice(1)

/** The variable a named instance gets, which is what a reader actually parses. */
const variable = (attribute: string, id: string, name: string, part: string) =>
  cssEscape(`--jumi-slot-${instanceKey(attribute, id, name)}-${part}`)

/** The key back out of that variable, the way the pass does it: the part is known, the prefix says the rest. */
const keyOf = (text: string, part: string) =>
  text.slice('--jumi-slot-'.length, text.length - part.length - 1)

describe('the instance key', () => {
  it('states the name length first, and counts the text that ships', () => {
    expect(instanceKey('rotate', 'Z2excak', 'flick')).toBe(
      '5-flick-Z2excak-rotate',
    )
    expect(instanceKey('rotate', 'Z2excak', 'flick-animation-duration')).toBe(
      '24-flick-animation-duration-Z2excak-rotate',
    )

    // The count is of the **emitted** name, and the key carries the name as written: `foo.bar` is seven
    // characters the author typed and eight characters a stylesheet holds, and it is the eight a reader has
    // to slice by. Measured against a real compile in `scripts/spike-slot-boundary.mjs`: the variable is
    // `--jumi-slot-8-foo\.bar-d38-scale`.
    expect(instanceKey('scale', 'd38', 'foo.bar')).toBe('8-foo.bar-d38-scale')
    expect(variable('scale', 'd38', 'foo.bar', 'animation-duration')).toBe(
      '--jumi-slot-8-foo\\.bar-d38-scale-animation-duration',
    )
  })

  it('round-trips every triple: the reader is a left inverse of the writer', () => {
    const wrong: string[] = []
    let checked = 0

    for (const attribute of VOCABULARY)
      for (const id of IDS)
        for (const name of NAMES) {
          checked += 1

          const text = variable(attribute, id, name, 'animation-duration')
          const back = parseInstanceKey(keyOf(text, 'animation-duration'))

          // The name comes back as the variable spells it, which is all a reader needs: keys are compared
          // with each other in the emitted text, never with what the author typed.
          if (
            !back ||
            back.attribute !== attribute ||
            back.id !== id ||
            back.name !== emitted(name)
          )
            wrong.push(
              `${JSON.stringify(name)} on ${attribute} / ${id} → ${text.slice(0, 60)}`,
            )
        }

    expect(wrong.slice(0, 3)).toEqual([])
    expect(checked).toBeGreaterThan(50_000)
  })

  it('keeps two attributes that overlap apart, and two names over one definition', () => {
    // The pair that killed the hyphen-joined order: `color` is a suffix of `accent-color`, so nothing about
    // those two names distinguishes them once the attribute sits between the name and the id.
    expect(instanceKey('color', 'k1aaa', 'foo-accent')).not.toBe(
      instanceKey('accent-color', 'k1aaa', 'foo'),
    )

    // And the pair that killed the readable-but-undelimited one: a name whose tail is another instance's id.
    expect(
      instanceKey('rotate-x', 'rotate', 'foo-backdrop-filter-hue-rotate'),
    ).not.toBe(instanceKey('rotate', 'rotate', 'foo-backdrop-filter-hue'))
  })

  it('never mistakes a definition or an effect for a named instance', () => {
    // The reader's null is the answer for everything that is not a named instance, so a caller comparing a
    // definition gets it right without asking a second question.
    for (const notAnInstance of [
      'rotate-Z2excak',
      'filter',
      'bounce-in',
      '5-flick',
      '',
      'x-',
      '2a-b',
    ])
      // The value carries the input, so a failure says which one it was without a message argument.
      expect({
        input: notAnInstance,
        parsed: parseInstanceKey(notAnInstance),
      }).toEqual({
        input: notAnInstance,
        parsed: null,
      })
  })

  it('takes no character away from a name that was legal before', () => {
    // The whole point of a length prefix over a delimiter: nothing is reserved. A name may hold the sequence
    // the rejected alternative needed (`--`), the characters CSS escapes, and anything outside ASCII.
    for (const name of [
      'foo--bar',
      'foo.bar',
      'foo:bar',
      'foo)bar',
      '日本語',
      '👍emoji',
    ]) {
      expect(addressableName(name)).toBe(true)

      const back = parseInstanceKey(
        keyOf(
          variable('rotate', 'Z2excak', name, 'animation-delay'),
          'animation-delay',
        ),
      )

      // As above: the name is in the compared value, so the failure names the character that moved it.
      expect({ emitted: emitted(name), parsed: back?.name }).toEqual({
        emitted: emitted(name),
        parsed: emitted(name),
      })
    }
  })
})
