import { describe, expect, it } from 'vitest'

import { finalize, finalizeCss, stagingMarker } from '@/helpers/carriers'

import postcss from 'postcss'

/**
 * The finalizer is the mechanism the whole carrier feature now depends on, so it is tested
 * against the constructs rather than the happy path: nested at-rules, nested rules, comments,
 * strings, `var()` fallbacks, and the exact whitespace of a stylesheet it must not disturb.
 */

const carrier = (extra = '') => `--jumi-carrier: animations;${extra}`

/** A staging rule carrying one longhand, with the marker the finalizer looks for. */
const staged = (value: string, selector = ':root') =>
  `${selector} { --jumi-carrier-staging: 1; --jumi-aggregate-animation-name: ${value}; }`

describe('the finalizer', () => {
  it('writes the aggregate into every carrier and removes what staged it', () => {
    const css = [
      staged('var(--jumi-rotate-a, var(--jumi-animation-name))'),
      '.animations { --jumi-carrier: animations; }',
      '.other { color: red; }',
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })
    expect(out).not.toContain(stagingMarker)
    expect(out).toContain(`.animations { --jumi-carrier: animations; --jumi-aggregate-animation-name: var(--jumi-rotate-a, var(--jumi-animation-name)); }`)
    expect(out).toContain('.other { color: red; }')
  })

  it('reaches a carrier wherever Tailwind put it, including nested at-rules', () => {
    const css = [
      '@layer base {',
      `  ${staged('var(--a)')}`,
      '}',
      '@media (min-width: 40rem) {',
      '  @supports (color: red) {',
      '    :is(.animations > *) { --jumi-carrier: animations; }',
      '  }',
      '}',
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })
    expect(out).toContain(':is(.animations > *) { --jumi-carrier: animations; --jumi-aggregate-animation-name: var(--a); }')
    expect(out).not.toContain(stagingMarker)
  })

  it('reaches a carrier nested inside another rule', () => {
    const { carriers, css: out } = finalizeCss([
      staged('var(--a)'),
      '.parent {',
      '  .animations { --jumi-carrier: animations; }',
      '}',
    ].join('\n'))

    expect(carriers).toBe(1)
    expect(out).toContain('.animations { --jumi-carrier: animations; --jumi-aggregate-animation-name: var(--a); }')
  })

  it('takes the last publication, the way a later declaration would win', () => {
    const { css: out } = finalizeCss([
      staged('var(--first)'),
      '.animations { --jumi-carrier: animations; }',
      staged('var(--second)'),
    ].join('\n'))

    expect(out).toContain('--jumi-aggregate-animation-name: var(--second);')
  })

  it('does not mistake a comment or a string for the protocol', () => {
    const css = [
      '/* --jumi-carrier: animations; --jumi-carrier-staging: 1; */',
      '.quoted { content: "--jumi-carrier: animations"; }',
      '.animations { --jumi-carrier: animations; }',
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    // The comment and the string are not declarations, so nothing to inject and nothing to
    // remove — and the carrier has no data to receive.
    expect({ carriers, staging }).toEqual({ carriers: 0, staging: 0 })
    expect(out).toBe(css)
  })

  it('keeps a value that only looks like it ends early', () => {
    const css = [
      staged('var(--a, "x;y"), var(--b, "}" )'),
      '.animations { --jumi-carrier: animations; }',
    ].join('\n')

    const { css: out } = finalizeCss(css)

    expect(out).toContain('--jumi-aggregate-animation-name: var(--a, "x;y"), var(--b, "}" );')
  })

  it('is idempotent, byte for byte', () => {
    const once = finalizeCss([
      staged('var(--a)'),
      '.animations { --jumi-carrier: animations; }',
    ].join('\n'))

    const twice = finalizeCss(once.css)

    expect(twice).toEqual({ carriers: 0, css: once.css, staging: 0 })
  })

  it('returns a stylesheet it did not change exactly as it found it', () => {
    const css = [
      '/* keep me */',
      '@media (width > 100px) {',
      '  .animations {',
      '    --jumi-carrier: animations;/* trailing comment */',
      '  }',
      '}',
    ].join('\n')

    const { carriers, css: out } = finalizeCss(css)

    expect({ carriers, out }).toEqual({ carriers: 0, out: css })
  })

  it('counts a carrier only when it was written', () => {
    const root = { css: [staged('var(--a)'), '.animations { --jumi-carrier: animations; }'].join('\n') }
    const first = finalizeCss(root.css)

    // The second pass is the same document with no staging: there is nothing left to say, so
    // nothing is rewritten and the count is zero — a publication the caller did not cause.
    expect(finalizeCss(first.css).carriers).toBe(0)
  })

  it('removes a staging rule that carries nothing but the marker', () => {
    const { css: out, staging } = finalizeCss(`:root { ${stagingMarker}: 1; }`)

    expect({ out, staging }).toEqual({ out: '', staging: 1 })
  })

  it('prefers an aggregate handed to it over the one in the stylesheet', () => {
    const css = [staged('var(--stale)'), '.animations { --jumi-carrier: animations; }'].join('\n')

    const { css: out } = finalizeCss(css, { '--jumi-aggregate-animation-name': 'var(--fresh)' })

    expect(out).toContain('--jumi-aggregate-animation-name: var(--fresh);')
    expect(out).not.toContain('var(--stale)')
    expect(out).not.toContain(stagingMarker)
  })

  it('walks an AST in place, so a host that owns one needs no parse', () => {
    const root = postcss.parse([staged('var(--a)'), '.animations { --jumi-carrier: animations; }'].join('\n'))

    const { carriers, staging } = finalize(root)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })
    expect(root.toString()).toContain('--jumi-aggregate-animation-name: var(--a);')
    expect(root.toString()).not.toContain(stagingMarker)
  })
})
