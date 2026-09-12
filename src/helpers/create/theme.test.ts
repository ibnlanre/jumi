import type { Api } from '@/types'

import { describe, expect, it } from 'vitest'

import { resolveTheme, themeSpacing, themeTokens } from './theme'

const api = (themes: Record<string, Record<string, any>>) =>
  ({ theme: (key: string) => themes[key] }) as unknown as Api

/** A spacing scale as the host hands it over: resolved multiples of `--spacing`. */
const spacing = { padding: { 0: '0px', 0.5: '0.125rem', 1: '0.25rem', 4: '1rem', 96: '24rem', px: '1px' } }

describe('resolveTheme', () => {
  it('resolves a host value to the token that carries it', () => {
    const themed = api({ colors: { 'red-500': 'oklch(63.7% 0.237 25.331)' } })

    expect(resolveTheme(themed, 'colors')).toEqual({ 'red-500': 'var(--color-red-500)' })
  })

  it('flattens a nested scale before resolving it', () => {
    const themed = api({ colors: { red: { 500: 'oklch(63.7% 0.237 25.331)' } } })

    expect(resolveTheme(themed, 'colors')).toEqual({ 'red-500': 'var(--color-red-500)' })
  })

  it('uses the namespace the key is declared under', () => {
    const themed = api({ letterSpacing: { tight: '-0.025em' } })

    expect(resolveTheme(themed, 'letterSpacing')).toEqual({ tight: 'var(--tracking-tight)' })
  })

  it('leaves Jumi\u2019s own vocabulary as a literal', () => {
    // `theme('colors', fill)`: `context-fill` is Jumi's, so there is no
    // `--color-context-fill` token to point at.
    const themed = api({ colors: { 'red-500': 'oklch(63.7% 0.237 25.331)' } })

    expect(resolveTheme(themed, 'colors', { 'context-fill': 'context-fill' })).toEqual({
      'context-fill': 'context-fill',
      'red-500': 'var(--color-red-500)',
    })
  })

  it('keeps an overridden host name as a literal', () => {
    // The token would carry the host's value, not the one Jumi was handed.
    const themed = api({ colors: { 'red-500': 'oklch(63.7% 0.237 25.331)' } })

    expect(resolveTheme(themed, 'colors', { 'red-500': 'oklch(50% 0.1 20)' }))
      .toEqual({ 'red-500': 'oklch(50% 0.1 20)' })
  })

  it('keeps a name the namespace has no token for', () => {
    const themed = api({ borderColor: { 'DEFAULT': 'currentColor', 'red-500': 'oklch(63.7% 0.237 25.331)' } })

    expect(resolveTheme(themed, 'borderColor')).toEqual({
      'DEFAULT': 'currentColor',
      'red-500': 'var(--color-red-500)',
    })
  })

  it('leaves a key with no declared namespace untouched', () => {
    const themed = api({ zIndex: { 10: '10', 20: '20' } })

    expect(resolveTheme(themed, 'zIndex')).toEqual({ 10: '10', 20: '20' })
  })

  it('tolerates a key the host has nothing for', () => {
    expect(resolveTheme(api({}), 'colors')).toEqual({})
  })

  it('resolves a spacing multiple to the formula', () => {
    expect(resolveTheme(api(spacing), 'padding')).toEqual({
      0: '0px',
      0.5: 'calc(var(--spacing) * 0.5)',
      1: 'var(--spacing)',
      4: 'calc(var(--spacing) * 4)',
      96: 'calc(var(--spacing) * 96)',
      px: '1px',
    })
  })

  it('keeps the names in a spacing scale that are not multiples', () => {
    const themed = api({ width: { '1/2': '50%', '4': '1rem', 'auto': 'auto', 'full': '100%', 'screen': '100vw' } })

    expect(resolveTheme(themed, 'width')).toEqual({
      '1/2': '50%',
      '4': 'calc(var(--spacing) * 4)',
      'auto': 'auto',
      'full': '100%',
      'screen': '100vw',
    })
  })

  it('does not depend on what the host\u2019s scale says, because it is unusable under an override', () => {
    // Measured with `--spacing: 0.3rem`: `theme('margin')` returns the characters of the base
    // string, so a name like `2` arrives as `'3'`. Trusting it emitted `margin: 3`.
    const themed = api({ margin: { 0: '0', 1: '.', 2: '3', 4: 'e', auto: 'auto' } })

    expect(resolveTheme(themed, 'margin')).toEqual({
      0: '0',
      1: 'var(--spacing)',
      2: 'calc(var(--spacing) * 2)',
      4: 'calc(var(--spacing) * 4)',
      auto: 'auto',
    })
  })

  it('leaves a key outside the batch untouched', () => {
    const themed = api({ zIndex: { 10: '10', 20: '20' } })

    expect(resolveTheme(themed, 'zIndex')).toEqual({ 10: '10', 20: '20' })
  })

  it('leaves Jumi\u2019s own additions to a spacing scale as literals', () => {
    // `theme('inset', inset)`: `hero-gap` is Jumi's, so it is not a multiple of anything the host
    // said, and the rest of the scale still resolves.
    expect(resolveTheme(api(spacing), 'padding', { 'hero-gap': '7rem' })).toEqual({
      '0': '0px',
      '0.5': 'calc(var(--spacing) * 0.5)',
      '1': 'var(--spacing)',
      '4': 'calc(var(--spacing) * 4)',
      '96': 'calc(var(--spacing) * 96)',
      'hero-gap': '7rem',
      'px': '1px',
    })
  })
})

describe('themeTokens', () => {
  it('names a namespace for every resolved key', () => {
    const unnamed = Object.entries(themeTokens)
      .filter(([, target]) => !target.namespace)
      .map(([key]) => key)

    expect(unnamed).toEqual([])
  })
})

describe('themeSpacing', () => {
  it('does not overlap the token keys, because a key has one representation', () => {
    const both = [...themeSpacing].filter(key => key in themeTokens)

    expect(both).toEqual([])
  })
})
