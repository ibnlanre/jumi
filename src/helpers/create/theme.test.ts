import type { Api } from '@/types'

import { describe, expect, it } from 'vitest'

import { resolveTheme, themeTokens } from './theme'

const api = (themes: Record<string, Record<string, any>>) =>
  ({ theme: (key: string) => themes[key] }) as unknown as Api

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
})

describe('themeTokens', () => {
  it('names a namespace for every resolved key', () => {
    const unnamed = Object.entries(themeTokens)
      .filter(([, target]) => !target.namespace)
      .map(([key]) => key)

    expect(unnamed).toEqual([])
  })
})
