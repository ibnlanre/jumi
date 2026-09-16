import { describe, expect, it } from 'vitest'

import { varReferences } from './var-references.mjs'

const names = value => varReferences(value).map(one => one.name)
const offsets = value => varReferences(value).map(one => one.offset)

describe('varReferences', () => {
  it('reads a reference with no fallback', () => {
    expect(varReferences('var(--a)')).toEqual([
      { fallbackStart: -1, name: '--a', offset: 0 },
    ])
  })

  it('reads a reference with a plain fallback', () => {
    // `fallbackStart` is the first token of the fallback, not the comma: `var(--a, red)` puts the comma
    // at 7 and `red` at 9.
    expect(varReferences('var(--a, red)')).toEqual([
      { fallbackStart: 9, name: '--a', offset: 0 },
    ])
  })

  it('reads a reference nested in a fallback', () => {
    // The shape the audit could not see: a pattern requiring `)` after the inner name matched nothing
    // here, so the read was reported as dead while the CSS was correct.
    expect(names('var(--a, var(--b))')).toEqual(['--a', '--b'])
    expect(names('var(--a, var(--b, opacity(1)))')).toEqual(['--a', '--b'])
  })

  it('reads a deep fallback chain, innermost last', () => {
    expect(names('var(--a, var(--b, var(--c, var(--d, 1)))))')).toEqual([
      '--a',
      '--b',
      '--c',
      '--d',
    ])
  })

  it('reads every sibling reference, in source order', () => {
    expect(names('var(--a) var(--b) var(--c)')).toEqual(['--a', '--b', '--c'])
  })

  it('reads a reference inside a function in a fallback', () => {
    expect(names('var(--a, calc(var(--b) * 2))')).toEqual(['--a', '--b'])
    expect(names('var(--a, rgba(var(--b), 0, 0, 0.5))')).toEqual(['--a', '--b'])
  })

  it('reads a reference adjacent to another function', () => {
    // `blur(var(--a))` and `var(--a)blur(2px)` — the second has no whitespace to key on at all.
    expect(names('blur(var(--a))')).toEqual(['--a'])
    expect(names('var(--a)blur(2px)')).toEqual(['--a'])
    expect(names('var(--a, 1)drop-shadow(var(--b))')).toEqual(['--a', '--b'])
  })

  it('does not read a comma or a paren inside a string as syntax', () => {
    // The case that decides whether the argument split is structural: a quoted data URI has both.
    const value = 'var(--a, url("data:image/svg+xml,<svg d=\'(x)\'/>"))'

    expect(names(value)).toEqual(['--a'])
    expect(varReferences(value)[0].fallbackStart).toBe(9)
  })

  it('reads a reference after a quoted string that contains a comma', () => {
    expect(names('url("a,b(c)") var(--a)')).toEqual(['--a'])
  })

  it('steps over an escaped quote inside a string', () => {
    // `"a\"b"` is one string: a reader keying on the first quote would end it early and then read the
    // rest as syntax.
    expect(names('var(--a, "a\\"b(c)") var(--b)')).toEqual(['--a', '--b'])
  })

  it('does not read a var( that is part of a longer identifier', () => {
    expect(names('myvar(--a)')).toEqual([])
    expect(names('--a-var(--b)')).toEqual([])
  })

  it('is case-insensitive about the function name, as CSS is', () => {
    expect(names('VAR(--a)')).toEqual(['--a'])
  })

  it('reports a fallback that begins with a var() as starting there', () => {
    // What tells a direct fallback from a fallback that merely contains one. The next entry's offset
    // equals this entry's fallbackStart exactly when the fallback begins with it.
    const direct = varReferences('var(--a, var(--b))')
    const indirect = varReferences('var(--a, calc(var(--b)))')

    expect(direct[1].offset).toBe(direct[0].fallbackStart)
    expect(indirect[1].offset).not.toBe(indirect[0].fallbackStart)
  })

  it('tolerates whitespace inside the reference', () => {
    expect(varReferences('var( --a , var( --b ) )')).toEqual([
      { fallbackStart: 11, name: '--a', offset: 0 },
      { fallbackStart: -1, name: '--b', offset: 11 },
    ])
  })

  it('answers truncated and empty input rather than throwing', () => {
    // An unbalanced value is answered up to the point it can be read. A gate that hangs or dies on a
    // malformed sheet is worse than one that reports what it could see — and the name it reports for an
    // unterminated reference is `''`, which no frame key can equal, so a truncated read hooks nothing.
    expect(varReferences('')).toEqual([])
    expect(varReferences(')')).toEqual([])
    expect(varReferences('(')).toEqual([])
    expect(varReferences('var(--a')).toEqual([
      { fallbackStart: -1, name: '--a', offset: 0 },
    ])
    expect(varReferences('var(')).toEqual([
      { fallbackStart: -1, name: '', offset: 0 },
    ])
    expect(varReferences('var(--a, var(')).toEqual([
      { fallbackStart: 9, name: '--a', offset: 0 },
      { fallbackStart: -1, name: '', offset: 9 },
    ])
  })

  it('reports every reachable reference exactly once', () => {
    // The invariant, on a value built to be hostile: siblings, a deep chain, functions, a quoted string
    // with commas and parens, an escaped quote, and a reference adjacent to a function on both sides.
    const value = [
      'var(--a) ',
      'drop-shadow(var(--b, calc(var(--c) * 1px)) 0 0 var(--d)) ',
      'var(--e, var(--f, url("x,y(z)"))) ',
      'var(--g, "a\\"b,c") ',
      'blur(var(--h))var(--i)',
    ].join('')

    const references = varReferences(value)
    const unique = new Set(references.map(one => one.offset))

    // Exactly once: no offset reported twice, and the array is in source order.
    expect(unique.size).toBe(references.length)
    expect(offsets(value)).toEqual([...offsets(value)].sort((a, b) => a - b))

    // And reachable: the count is every `var(` token in the value, including inside strings — the one
    // place the count could drift, asserted here so a change there is a deliberate one.
    expect(references.length).toBe(value.split('var(').length - 1)
    expect(names(value)).toEqual([
      '--a',
      '--b',
      '--c',
      '--d',
      '--e',
      '--f',
      '--g',
      '--h',
      '--i',
    ])
  })
})
