import { describe, expect, it } from 'vitest'

import { classify, collect } from './dead-links.mjs'

/**
 * The classification a stylesheet's reads get, run through `collect` so the test covers the pattern as
 * well as the verdict. Every case here is one the audit actually produces; the fallback-carrying hook is
 * the one that regressed, and it regressed *silently* — a hook the pattern could not see was reported as
 * a dead read while the CSS was correct.
 */
const verdict = (css, name) => {
  const { hooked, registered, written } = collect(css)

  return classify(name, { hooked, registered, written })
}

describe('classify', () => {
  it('reads a component hook whose slot carries no fallback as conditional', () => {
    const css = `@keyframes jumi-scale-abc12 {
      50% { scale: var(--jumi-scale-x-abc12-50, var(--jumi-scale-x)) var(--jumi-scale-y) }
    }`

    expect(verdict(css, '--jumi-scale-x-abc12-50')).toBe(
      'conditional (a phrase addressing --jumi-scale-x over the same frames)',
    )
  })

  it('reads a component hook whose slot carries its own fallback as conditional', () => {
    // The regression: `var(<key>, var(<base>, opacity(1)))`. The pattern required `)` right after the
    // base name, so this hook was invisible and the read was reported DEAD.
    const css = `@keyframes jumi-backdrop-filter-abc12 {
      50% {
        backdrop-filter: var(--jumi-backdrop-filter-blur-abc12-50, var(--jumi-backdrop-filter-blur))
          var(--jumi-backdrop-filter-url-abc12-50, var(--jumi-backdrop-filter-url, opacity(1)));
      }
    }`

    expect(verdict(css, '--jumi-backdrop-filter-url-abc12-50')).toBe(
      'conditional (a phrase addressing --jumi-backdrop-filter-url over the same frames)',
    )
  })

  it('reads an outer read, whose base is the keyframed property, as DEAD', () => {
    // `--jumi-outline` is what the keyframe animates, so the only writer is the phrase that owns the
    // keyframe. A missing writer here is a real defect; a missing component writer is not.
    const css = `@keyframes jumi-outline-abc12 {
      50% { outline: var(--jumi-outline-abc12-50, var(--jumi-outline)) }
    }`

    expect(verdict(css, '--jumi-outline-abc12-50')).toBe('DEAD')
  })

  it('does not let an outer read hide the hooks nested in its fallback', () => {
    // The whole shape, and the regression one version of the pattern introduced: the outer read's
    // fallback is the composition, so every component hook is nested *inside* the outer read's
    // parentheses. A pattern that consumed the outer pair matched it, skipped past the hook's `var(`,
    // and reported all twenty of these as dead reads while the CSS was correct.
    const css = `@keyframes jumi-rotate-abc12 {
      50% {
        rotate: var(--jumi-rotate-abc12-50, var(--jumi-rotate-x-abc12-50, var(--jumi-rotate-x))
          var(--jumi-rotate-y-abc12-50, var(--jumi-rotate-y)))
      }
    }`

    expect(verdict(css, '--jumi-rotate-x-abc12-50')).toBe(
      'conditional (a phrase addressing --jumi-rotate-x over the same frames)',
    )
    expect(verdict(css, '--jumi-rotate-y-abc12-50')).toBe(
      'conditional (a phrase addressing --jumi-rotate-y over the same frames)',
    )

    // The outer read itself is answered by whatever phrase wrote it, so it is written here and must
    // not be counted as a hook — its base is the keyframe's own attribute.
    expect(verdict(css, '--jumi-rotate-abc12-50')).toBe('DEAD')
  })

  it('does not mistake a longer base name for a shorter one', () => {
    // `--jumi-matrix` beside `--jumi-matrix-3d`: the boundary after the base name is load-bearing.
    const css = `@keyframes jumi-transform-abc12 {
      50% { transform: var(--jumi-matrix-3d-abc12-50, var(--jumi-matrix-3d)) }
    }`

    expect(verdict(css, '--jumi-matrix-3d-abc12-50')).toBe(
      'conditional (a phrase addressing --jumi-matrix-3d over the same frames)',
    )
    expect(verdict(css, '--jumi-matrix-abc12-50')).toBe('DEAD')
  })

  it('reads a component read as a hook whatever its fallback is', () => {
    // The rule, and the two shapes it has to hold for. A frame-first read is a hook when the key it reads
    // is scoped to a property other than the one the keyframe animates — the *fallback is not part of the
    // test*, because what a read falls back to is a different question from what the read is.
    //
    // That indirection is the fix for a real regression: the pattern used to require the fallback to name
    // the same variable the key read, and an expanded intermediate's fallback is its own template, so
    // every hook of that shape read as dead the moment the shape was emitted. The corpus caught it, which
    // is why the fixture carries a `animate-skew-x-[…]` phrase.
    const named = collect(`@keyframes jumi-transform-abc12 {
      50% { transform: var(--jumi-skew-x-abc12-50, var(--jumi-skew-x)) }
    }`)

    expect(named.hooked.has('--jumi-skew-x-abc12-50')).toBe(true)

    const computed = collect(`@keyframes jumi-transform-abc12 {
      50% { transform: var(--jumi-skew-x-abc12-50, calc(var(--jumi-skew-x) * 1deg)) }
    }`)

    expect([...computed.reads.keys()].sort()).toEqual([
      '--jumi-skew-x',
      '--jumi-skew-x-abc12-50',
    ])
    expect(computed.hooked.has('--jumi-skew-x-abc12-50')).toBe(true)

    const expanded = collect(`@keyframes jumi-transform-abc12 {
      50% {
        transform: var(--jumi-skew-abc12-50,
          skew(var(--jumi-skew-x-abc12-50, var(--jumi-skew-x)), var(--jumi-skew-y-abc12-50, var(--jumi-skew-y))))
      }
    }`)

    expect(expanded.hooked.has('--jumi-skew-abc12-50')).toBe(true)

    // And the exclusion is the base, not the fallback: the read whose base *is* the keyframe's own
    // attribute is the outer read, which the phrase that owns the keyframe wrote.
    expect(expanded.hooked.has('--jumi-transform-abc12-50')).toBe(false)

    const outer = collect(`@keyframes jumi-transform-abc12 {
      50% {
        transform: var(--jumi-skew-abc12-50, var(--jumi-skew-x-abc12-50, var(--jumi-skew-x))
          var(--jumi-skew-y-abc12-50, var(--jumi-skew-y)))
      }
    }`)

    expect(outer.hooked.has('--jumi-skew-abc12-50')).toBe(true)
    expect(outer.hooked.has('--jumi-skew-x-abc12-50')).toBe(true)
    expect(outer.hooked.has('--jumi-skew-y-abc12-50')).toBe(true)
  })

  it('reads through a quoted string holding commas and parentheses', () => {
    // The case that decides whether a `var()`'s arguments are split structurally. A reader that looked for
    // the first comma in the text would take the one inside the string for the argument boundary, hand back
    // a truncated name, and never reach the reference that follows — which is a hook, and here it is the
    // only writer the read has.
    const { hooked, reads } = collect(`@keyframes jumi-mask-abc12 {
      50% {
        mask: var(--jumi-mask-abc12-50, url("a,b(c)") var(--jumi-mask-image-abc12-50, var(--jumi-mask-image)))
      }
    }`)

    expect([...reads.keys()].sort()).toEqual([
      '--jumi-mask-abc12-50',
      '--jumi-mask-image',
      '--jumi-mask-image-abc12-50',
    ])

    // The outer read's fallback begins with `url(` and not with a reference, so it is not a hook; the one
    // nested after the string is.
    expect(hooked.has('--jumi-mask-abc12-50')).toBe(false)
    expect(hooked.has('--jumi-mask-image-abc12-50')).toBe(true)
  })

  it('answers a declared name as written before anything else', () => {
    const css = `:root { --jumi-filter-url: opacity(1) }
      @keyframes jumi-filter-abc12 {
        50% { filter: var(--jumi-filter-url-abc12-50, var(--jumi-filter-url, opacity(1))) }
      }`

    expect(verdict(css, '--jumi-filter-url')).toBe('written')
  })

  it('answers a registered name as registered, because registration is intent', () => {
    const css = `@property --jumi-slot-filter-abc12 { inherits: false; syntax: "*" }`

    expect(verdict(css, '--jumi-slot-filter-abc12')).toBe('registered')
  })

  it('answers a documented level that exists only when written as optional', () => {
    const css = `@keyframes jumi-rotate-abc12 { 50% { rotate: 45deg } }`

    expect(verdict(css, '--jumi-rotate-abc12-animation-duration')).toContain(
      'optional (',
    )
  })

  it('answers a name nothing in the model can produce as DEAD', () => {
    const css = `@keyframes jumi-rotate-abc12 { 50% { rotate: var(--jumi-nobody-writes-this) } }`

    expect(verdict(css, '--jumi-nobody-writes-this')).toBe('DEAD')
  })
})
