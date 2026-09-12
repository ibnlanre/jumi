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
    const css = '.animations { --jumi-aggregate-animation-name: one, two; }\n'
      + '.animations { --jumi-aggregate-animation-name: one, two, three; }'

    expect(lastDeclaration(css, '--jumi-aggregate-animation-name')).toBe('one, two, three')
  })

  it('returns an empty string when the property is absent', () => {
    expect(lastDeclaration('.animations { color: red; }', '--jumi-aggregate-animation-name')).toBe('')
  })
})

describe('aggregateSlots', () => {
  const entry = name => `var(--jumi-${name}-animation-name, var(--jumi-animation-name))`

  it('counts the entries the browser applies', () => {
    const css = `.animations { --jumi-aggregate-animation-name: ${entry('a')}; }`
      + `.animations { --jumi-aggregate-animation-name: ${entry('a')}, ${entry('b')}; }`

    expect(aggregateSlots(css)).toBe(2)
  })

  it('counts nothing when no aggregate has been published', () => {
    expect(aggregateSlots('.animations { animation-name: none; }')).toBe(0)
  })
})
