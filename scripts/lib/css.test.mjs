import { describe, expect, it } from 'vitest'

import { aggregateSlots, lastDeclaration, splitTopLevel } from './css.mjs'

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
    expect(splitTopLevel('animate-[a,b] 1s, fade-in 2s')).toEqual(['animate-[a,b] 1s', 'fade-in 2s'])
    expect(splitTopLevel('[--x:a,b], linear-gradient(to right, red, blue)')).toEqual([
      '[--x:a,b]',
      'linear-gradient(to right, red, blue)',
    ])
  })

  it('ignores commas inside strings, even unbalanced ones', () => {
    expect(splitTopLevel('"a,b", url("c,d"), \'e,f\'')).toEqual(['"a,b"', 'url("c,d")', '\'e,f\''])
  })

  it('handles escapes without ending a string', () => {
    expect(splitTopLevel('"a\\",b", c')).toEqual(['"a\\",b"', 'c'])
  })

  it('drops empty entries, so a trailing comma does not inflate a count', () => {
    expect(splitTopLevel('a, b,')).toEqual(['a', 'b'])
    expect(splitTopLevel('  ,  ')).toEqual([])
  })
})

describe('lastDeclaration', () => {
  it('returns the last declaration, because a later one wins', () => {
    const css = '.animations { animation-name: one, two; }\n'
      + '.animations { animation-name: one, two, three; }'

    expect(lastDeclaration(css, 'animation-name')).toBe('one, two, three')
  })

  it('returns an empty string when the property is absent', () => {
    expect(lastDeclaration('.animations { color: red; }', 'animation-name')).toBe('')
  })

  it('does not match a property that merely ends with the same word', () => {
    // `--jumi-animation-name` is a different property, every carrier declares it, and it comes
    // *after* the data in the rule body — reading it as `animation-name` would report the control
    // as the aggregate.
    const css = '.animations { animation-name: one, two; --jumi-animation-name: none; }'

    expect(lastDeclaration(css, 'animation-name')).toBe('one, two')
  })
})

describe('aggregateSlots', () => {
  const entry = name => `var(--jumi-${name}-animation-name, var(--jumi-animation-name))`

  it('counts the entries the browser applies', () => {
    // The list lands in the longhand a browser reads, not in a `--jumi-aggregate-*` pointer.
    const css = `.animations { animation-name: ${entry('a')}; }`
      + `.animations { animation-name: ${entry('a')}, ${entry('b')}; }`

    expect(aggregateSlots(css)).toBe(2)
  })

  it('counts nothing when the carrier was never materialized', () => {
    // An unfinalized carrier declares only custom properties, so there is no longhand to read and
    // the answer is zero — which is also what makes a build that skipped finalization visible.
    expect(aggregateSlots('.animations { --jumi-animation-name: none; }')).toBe(0)
  })
})
