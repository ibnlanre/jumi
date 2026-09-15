import { describe, expect, it } from 'vitest'

import { flattenPalette } from './index'

describe('flattenPalette', () => {
  it('passes a flat map through', () => {
    // The shape `api.theme()` actually returns in Tailwind v4, and the shape
    // every map in `src/theme/` declares.
    expect(
      flattenPalette({
        'none': 'none',
        'red-500': 'oklch(63.7% 0.237 25.331)',
      }),
    ).toEqual({
      'none': 'none',
      'red-500': 'oklch(63.7% 0.237 25.331)',
    })
  })

  it('joins a nested palette into one key per leaf', () => {
    expect(flattenPalette({ blue: { 50: '#eff6ff', 500: '#3b82f6' } })).toEqual(
      {
        'blue-50': '#eff6ff',
        'blue-500': '#3b82f6',
      },
    )
  })

  it('names a DEFAULT leaf after the scale itself', () => {
    expect(
      flattenPalette({ blue: { 500: '#1d4ed8', DEFAULT: '#3b82f6' } }),
    ).toEqual({
      'blue': '#3b82f6',
      'blue-500': '#1d4ed8',
    })
  })

  it('joins DEFAULT at any depth', () => {
    expect(flattenPalette({ a: { b: { DEFAULT: 'x' } } })).toEqual({
      'a-b': 'x',
    })
  })

  it('never turns theme metadata into a candidate', () => {
    expect(flattenPalette({ __CSS_VALUES__: { red: 4 }, red: 'red' })).toEqual({
      red: 'red',
    })
  })

  it('keeps a numeric leaf, which is how scale keys read', () => {
    expect(flattenPalette({ 0: '0px', 4: '1rem' })).toEqual({
      0: '0px',
      4: '1rem',
    })
  })

  it('treats an empty map as empty', () => {
    expect(flattenPalette(undefined)).toEqual({})
    expect(flattenPalette({})).toEqual({})
  })
})
