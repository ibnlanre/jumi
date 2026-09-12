import { describe, expect, it } from 'vitest'

import { finalize, finalizeCss, stagingMarker } from '@/helpers/carriers'

import postcss from 'postcss'

/**
 * The finalizer is the mechanism the whole carrier feature now depends on, so it is tested
 * against the constructs rather than the happy path: nested at-rules, nested rules, comments,
 * strings, `var()` fallbacks, and the exact whitespace of a stylesheet it must not disturb.
 *
 * It is also where the protocol's zero-occurrence invariant is pinned: what the finalizer returns
 * must hold the carrier's real `animation-*` longhands and none of the build-time names.
 */

/**
 * A carrier body: the marker, plus a read for each part it asks the finalizer to write.
 *
 * The reads are the contract. A part is written only where the carrier declares it, which is what
 * keeps two carriers with different data apart — `animations` declares the animation longhands and
 * `transitions` declares `transition`, so neither is handed the other's list. A fixture that leaves
 * a part out is therefore testing something real: it must not receive what it did not ask for.
 */
const carrier = (parts: string[] = ['animation-name']) =>
  `--jumi-carrier: animations;${parts.map(part => ` ${part}: var(--jumi-aggregate-${part}, var(--jumi-${part}));`).join('')}`

/** Every longhand the model stages a list for, and therefore every longhand the finalizer writes. */
const PARTS = [
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-timeline',
  'animation-timing-function',
]

/** A staging rule carrying one longhand, with the marker the finalizer looks for. */
const staged = (value: string, selector = ':root') =>
  `${selector} { --jumi-carrier-staging: 1; --jumi-aggregate-animation-name: ${value}; }`

describe('the finalizer', () => {
  it('writes the aggregate into every carrier and removes what staged it', () => {
    const css = [
      staged('var(--jumi-rotate-a, var(--jumi-animation-name))'),
      `.animations { ${carrier()} }`,
      '.other { color: red; }',
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })
    expect(out).not.toContain(stagingMarker)
    expect(out).toContain('.animations { animation-name: var(--jumi-rotate-a, var(--jumi-animation-name)); }')
    expect(out).toContain('.other { color: red; }')
  })

  it('reaches a carrier wherever Tailwind put it, including nested at-rules', () => {
    const css = [
      '@layer base {',
      `  ${staged('var(--a)')}`,
      '}',
      '@media (min-width: 40rem) {',
      '  @supports (color: red) {',
      `    :is(.animations > *) { ${carrier()} }`,
      '  }',
      '}',
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })
    expect(out).toContain(':is(.animations > *) { animation-name: var(--a); }')
    expect(out).not.toContain(stagingMarker)
  })

  it('reaches a carrier nested inside another rule', () => {
    const { carriers, css: out } = finalizeCss([
      staged('var(--a)'),
      '.parent {',
      `  .animations { ${carrier()} }`,
      '}',
    ].join('\n'))

    expect(carriers).toBe(1)
    expect(out).toContain('.animations { animation-name: var(--a); }')
  })

  it('takes the last publication, the way a later declaration would win', () => {
    const { css: out } = finalizeCss([
      staged('var(--first)'),
      `.animations { ${carrier()} }`,
      staged('var(--second)'),
    ].join('\n'))

    expect(out).toContain('animation-name: var(--second);')
  })

  it('writes only the parts a carrier declares, so two carriers can differ', () => {
    const lists = [
      '--jumi-aggregate-animation-name: var(--jumi-rotate-a, var(--jumi-animation-name));',
      '--jumi-aggregate-transition: var(--jumi-scale-transition-chain);',
    ].join(' ')

    const { carriers, css: out } = finalizeCss([
      `:root { ${stagingMarker}: 1; ${lists} }`,
      `.animations { ${carrier()} }`,
      `.transitions { ${carrier(['transition'])} }`,
    ].join('\n'))

    // One staging rule, two carriers, two different requests — and each is handed the part it
    // declared and nothing else. This is what lets `animations` and `transitions` share a channel
    // while needing different data.
    expect(carriers).toBe(2)
    expect(out).toContain('.animations { animation-name: var(--jumi-rotate-a, var(--jumi-animation-name)); }')
    expect(out).toContain('.transitions { transition: var(--jumi-scale-transition-chain); }')
  })

  it('does not mistake a comment or a string for the protocol', () => {
    const css = [
      '/* --jumi-carrier: animations; --jumi-carrier-staging: 1; */',
      '.quoted { content: "--jumi-carrier: animations"; }',
      '.animations { --jumi-carrier: animations; }',
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    // The comment and the string are not declarations, so there is nothing to remove — and this
    // carrier declares no part, so there is nothing to write either.
    expect({ carriers, staging }).toEqual({ carriers: 0, staging: 0 })
    expect(out).toBe(css)
  })

  it('keeps a value that only looks like it ends early', () => {
    const css = [
      staged('var(--a, "x;y"), var(--b, "}" )'),
      `.animations { ${carrier()} }`,
    ].join('\n')

    const { css: out } = finalizeCss(css)

    expect(out).toContain('animation-name: var(--a, "x;y"), var(--b, "}" );')
  })

  it('is idempotent, byte for byte', () => {
    const once = finalizeCss([
      staged('var(--a)'),
      `.animations { ${carrier()} }`,
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
    const root = { css: [staged('var(--a)'), `.animations { ${carrier()} }`].join('\n') }
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
    const css = [staged('var(--stale)'), `.animations { ${carrier()} }`].join('\n')

    const { css: out } = finalizeCss(css, { 'animation-name': 'var(--fresh)' })

    expect(out).toContain('.animations { animation-name: var(--fresh); }')
    expect(out).not.toContain('var(--stale)')
    expect(out).not.toContain(stagingMarker)
  })

  it('leaves no build-time name in the stylesheet it returns', () => {
    const lists = PARTS.map(part => `--jumi-aggregate-${part}: var(--jumi-${part});`).join(' ')
    const css = [
      `:root { ${stagingMarker}: 1; ${lists} }`,
      `.animations { ${carrier(PARTS)} }`,
    ].join('\n')

    const { carriers, css: out, staging } = finalizeCss(css)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })

    // The invariant. Everything the two markers and the staging namespace spell is build-time
    // only, and a browser should never be handed any of it.
    expect(out).not.toContain('--jumi-carrier')
    expect(out).not.toContain('--jumi-aggregate-')

    // What is left is the declarations a browser actually applies.
    expect(out).toContain('animation-name: var(--jumi-animation-name);')
    expect(out).toContain('animation-timeline: var(--jumi-animation-timeline);')
  })

  it('keeps the marker when there is nothing to materialize, so the invariant can fire', () => {
    const css = `.animations { ${carrier()} }`

    const { carriers, css: out, staging } = finalizeCss(css)

    // A carrier with no aggregate behind it is a broken build, not an empty one. Leaving the
    // marker behind is what turns that into a detectable violation — the zero-occurrence check
    // fails — instead of a carrier that silently animates nothing.
    expect({ carriers, out, staging }).toEqual({ carriers: 0, out: css, staging: 0 })
  })

  it('walks an AST in place, so a host that owns one needs no parse', () => {
    const root = postcss.parse([staged('var(--a)'), `.animations { ${carrier()} }`].join('\n'))

    const { carriers, staging } = finalize(root)

    expect({ carriers, staging }).toEqual({ carriers: 1, staging: 1 })
    expect(root.toString()).toContain('animation-name: var(--a);')
    expect(root.toString()).not.toContain(stagingMarker)
  })
})
