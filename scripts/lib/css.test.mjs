import { describe, expect, it } from 'vitest'

import {
  aggregateList,
  aggregateSlots,
  compositionRules,
  compositionScope,
  splitTopLevel,
  transitionRules,
} from './css.mjs'

describe('splitTopLevel', () => {
  it('splits on top-level commas', () => {
    expect(splitTopLevel('a, b, c')).toEqual(['a', 'b', 'c'])
  })

  it('keeps a nested fallback together', () => {
    // The bug this helper exists for: `.animations` lists `var(--x, var(--y))`
    // entries, and a naive split counts the inner comma as an entry boundary —
    // which doubles every slot metric.
    expect(splitTopLevel('var(--a, var(--b)), var(--c, var(--d))')).toEqual([
      'var(--a, var(--b))',
      'var(--c, var(--d))',
    ])
  })

  it('ignores commas inside brackets, including in custom properties', () => {
    expect(splitTopLevel('animate-[a,b] 1s, fade-in 2s')).toEqual([
      'animate-[a,b] 1s',
      'fade-in 2s',
    ])
    expect(
      splitTopLevel('[--x:a,b], linear-gradient(to right, red, blue)'),
    ).toEqual(['[--x:a,b]', 'linear-gradient(to right, red, blue)'])
  })

  it('ignores commas inside strings, even unbalanced ones', () => {
    expect(splitTopLevel('"a,b", url("c,d"), \'e,f\'')).toEqual([
      '"a,b"',
      'url("c,d")',
      "'e,f'",
    ])
  })

  it('handles escapes without ending a string', () => {
    expect(splitTopLevel('"a\\",b", c')).toEqual(['"a\\",b"', 'c'])
  })

  it('drops empty entries, so a trailing comma does not inflate a count', () => {
    expect(splitTopLevel('a, b,')).toEqual(['a', 'b'])
    expect(splitTopLevel('  ,  ')).toEqual([])
  })
})

describe('aggregateSlots', () => {
  const entry = name => `var(--jumi-slot-${name}, none)`

  const composition = entries =>
    `.animations { animation: ${entries};` +
    ' animation-composition: replace; animation-timeline: auto; }'

  it('counts the entries the browser applies', () => {
    // The list lands in the longhand a browser reads, not in a `--jumi-aggregate-*` pointer.
    expect(aggregateSlots(composition(entry('a')))).toBe(1)
    expect(aggregateSlots(composition(`${entry('a')}, ${entry('b')}`))).toBe(2)
  })

  it('counts nothing when the carrier was never materialized', () => {
    // An unfinalized carrier declares only custom properties, so there is no shorthand to read and
    // the answer is zero — which is also what makes a build that skipped finalization visible.
    expect(aggregateSlots('.animations { --jumi-animation-name: none; }')).toBe(
      0,
    )
  })

  it('reads the value the shorthand carries, not the pieces it names', () => {
    expect(aggregateList(composition(entry('a')))).toBe(
      'var(--jumi-slot-a, none)',
    )
  })
})

describe('compositionRules', () => {
  it('finds a rule by its whole shape, not by the shorthand alone', () => {
    const css =
      '.animations { animation: var(--jumi-slot-a, none);' +
      ' animation-composition: replace; animation-timeline: auto; }'

    expect(compositionRules(css)).toHaveLength(1)
  })

  it('refuses an ordinary utility that declares the shorthand', () => {
    // The detector this replaced keyed on `animation-name` and went to zero when the hoist stopped
    // emitting it. "Has an `animation` shorthand" would be the same mistake with a different word
    // in it: a stylesheet is full of rules that declare the shorthand and nothing else.
    expect(
      compositionRules('.spin { animation: spin 1s linear infinite; }'),
    ).toHaveLength(0)
  })

  it('refuses a rule that only declares the shorthand and one reset', () => {
    const css =
      '.animations { animation: var(--jumi-slot-a, none); animation-timeline: auto; }'

    expect(compositionRules(css)).toHaveLength(0)
  })

  it('refuses a rule whose positions are not shallow slot references', () => {
    // The resets alone would identify the *kind*, so the references identify the *representation*.
    // A deep composition keeps its values in the list and declares no slot to publish them under.
    const css =
      '.animations { animation: fade 1s linear;' +
      ' animation-composition: replace; animation-timeline: auto; }'

    expect(compositionRules(css)).toHaveLength(0)
  })

  it('finds both the defaults and the composition rule of a kind', () => {
    // Two rules per kind, at opposite ends of the layer, because a rule has one cascade position.
    const body =
      '{ animation: var(--jumi-slot-a, none);' +
      ' animation-composition: replace; animation-timeline: auto; }'

    expect(
      compositionRules(`@layer utilities { .a ${body} .b ${body} }`),
    ).toHaveLength(2)
  })

  it('does not find a rule that declares the two resets before the shorthand', () => {
    // The shorthand *resets* them, so declaring them first would be a rule that loses them by the
    // time the cascade is done. The order is part of the shape, not a formatting accident.
    const css =
      '.animations { animation-composition: replace; animation-timeline: auto;' +
      ' animation: var(--jumi-slot-a, none); }'

    expect(compositionRules(css)).toHaveLength(0)
  })
})

describe('compositionScope', () => {
  const composition = selectors =>
    `${selectors} {\n animation: var(--jumi-slot-a, none);` +
    '\n animation-composition: replace;\n animation-timeline: auto;\n}'

  it('counts the selectors a composition was written for', () => {
    // Exactly the activation shapes: the utility, a descendant variant, and the rule `@apply`
    // inlined into, which is the one no utility's own selector names.
    expect(compositionScope(composition('.a,\n.b,\n.applied'))).toBe(3)
  })

  it('reads the transitions composition through its own shorthand', () => {
    expect(
      compositionScope(
        '.motion {\n transition: var(--jumi-x-transition-property);\n}',
        'transitions',
      ),
    ).toBe(1)
  })

  it('does not count a comma that belongs to a variant', () => {
    // `.a:is(h1, h2)` is one selector. Splitting on `,\n` happens to survive this today and a plain
    // comma split does not, which is why the split is depth-aware rather than formatting-aware.
    expect(compositionScope(composition('.a:is(h1, h2),\n.b'))).toBe(2)
  })

  it('counts nothing when the kind has no composition', () => {
    expect(compositionScope('.a { color: red; }')).toBe(0)
    expect(compositionScope('.a { color: red; }', 'transitions')).toBe(0)
  })
})

describe('transitionRules', () => {
  it('finds the rule that publishes the transition shorthand', () => {
    expect(transitionRules('.motion { transition: opacity 1s; }')).toHaveLength(
      1,
    )
  })

  it('does not read a longhand as the shorthand', () => {
    // `transition-property` and `transition-behavior` both start with the word, and Tailwind emits
    // them for every `transition-*` utility.
    const css =
      '.transition-opacity { transition-property: opacity; transition-behavior: normal; }'

    expect(transitionRules(css)).toHaveLength(0)
  })
})
