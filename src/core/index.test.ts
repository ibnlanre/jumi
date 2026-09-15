import { describe, expect, it } from 'vitest'

import { addressableName, isPhrase } from '@/core'

/**
 * The one doorway around the host's type check.
 *
 * A phrase is not a CSS value of any type, so a matcher that declares one never receives it — Tailwind
 * refuses the candidate first. The way a phrase reaches Jumi is a second handler under the same utility
 * prefix that takes anything Tailwind will hand it, which means **`isPhrase` decides what bypasses
 * validation**. A false positive there is not a cosmetic bug: it would route an ordinary arbitrary CSS
 * value through the phrase parser, and the value would be rewritten as keyframes.
 *
 * So the corpus is adversarial in both directions. Everything a phrase can look like must pass, and
 * everything that merely resembles one must not.
 */
describe('what Jumi will accept as a phrase', () => {
  it('accepts the grammar', () => {
    expect(isPhrase('0:0%')).toBe(true)
    expect(isPhrase('0:0%|100:100%')).toBe(true)
    expect(isPhrase('0:red|100:blue')).toBe(true)
    expect(isPhrase('0:0deg|50:0deg|100:45deg')).toBe(true)
    expect(isPhrase('0,50:45deg')).toBe(true)
    expect(isPhrase('  0 : 0%  |  100 : 100%  ')).toBe(true)
    expect(isPhrase('0.5:1px')).toBe(true)
    expect(isPhrase('0:0')).toBe(true)

    // And this is a phrase too, which is the asymmetry Jumi has chosen: the *grammar* is `number:value`
    // and the value is left to the browser. `2%:3` is not a sensible declaration, and it is the browser
    // that drops it — the same division of labour an ordinary arbitrary value has, where the host checks
    // the CSS type and nobody checks whether the result means anything.
    expect(isPhrase('1:2%:3')).toBe(true)
  })

  it('refuses anything that is not one, however much syntax it carries', () => {
    const notPhrases = [
      // Ordinary scalars, including the ones a typed matcher already refuses.
      '50%',
      '4rem',
      'abc',
      '.25',
      '#123456',
      '23deg',
      // The near misses: a phrase is `number:value`, so anything else with a colon is not one.
      '50%:0',
      'calc(1px:2px)',
      'url(data:image/png;base64,iVBORw0KGgo=)',
      'color-mix(in srgb, red 50%, blue)',
      'rgb(1,2,3)',
      'light-dark(red, blue)',
      'a:b',
      'red:blue',
      '0:',
      // Partial and malformed syntax.
      ':',
      ':50%',
      '0:',
      '|',
      '0:50%|',
      '|0:50%',
      '0:50%||100:1',
      ':|',
      '0:50%|100:',
      // A value with a leading number is still not a phrase without the colon.
      '0 50%',
      '0,50%',
    ]

    expect(notPhrases.filter(candidate => isPhrase(candidate))).toEqual([])
  })

  it('does not read a phrase out of something else that contains one', () => {
    // The parser anchors at the start of the value, which is what keeps `url(…)` and a colour function
    // out — a phrase can appear *inside* a value without making the value a phrase.
    expect(isPhrase('url(0:0%|100:100%)')).toBe(false)
    expect(isPhrase('calc(0:1px|100:2px)')).toBe(false)
    expect(isPhrase('var(--x, 0:1px|100:2px)')).toBe(false)
  })
})

/**
 * Names, from the sibling feature, and for the same reason: a name becomes a custom-property segment, so
 * one that cannot be written has to be refused rather than emitted.
 */
describe('what Jumi will accept as a name', () => {
  it('accepts a word, and refuses whitespace', () => {
    expect(
      [
        'reveal',
        'card',
        'flick',
        'return',
        'hero-2',
        '2x',
        'a_b',
        '_x',
        'A-Z',
        'a.b',
      ].every(addressableName),
    ).toBe(true)

    // `_` is Tailwind's space inside `[brackets]`, so these arrive as whitespace and cannot be written as
    // part of a custom property's name — the declaration would not parse, which used to fail the build.
    expect(['a b', ' x', 'x ', '', ' '].filter(addressableName)).toEqual([])
  })
})
