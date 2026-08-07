import type { Api } from '@/types'

import { describe, expect, it, vi } from 'vitest'

import { getCreator } from '@/helpers/create'
import { css } from '@/helpers/css'

function setup() {
  const addUtilities = vi.fn()
  const theme = vi.fn()

  const api: Api = {
    addBase: vi.fn(),
    addComponents: vi.fn(),
    addUtilities,
    addVariant: vi.fn(),
    config: vi.fn(),
    matchComponents: vi.fn(),
    matchUtilities: vi.fn(),
    matchVariant: vi.fn(),
    prefix: vi.fn(),
    theme,
  }

  const creator = getCreator(api)

  return { addUtilities, creator }
}

describe('property curry', () => {
  it('writes the flat variable for a simple property', () => {
    const { creator } = setup()

    const result = creator.property('opacity')('50', { modifier: null })

    expect(result).toEqual({
      '--jumi-opacity': '50',
      '--jumi-opacity-animation-name': 'jumi-opacity',
    })
  })

  it('suffixes the stop modifier into the variable name', () => {
    const { creator } = setup()

    const result = creator.property('opacity')('0', { modifier: '25' })

    expect(result).toEqual({
      '--jumi-opacity-25': '0',
      '--jumi-opacity-animation-name': 'jumi-opacity',
    })
  })

  it('writes each string part to its own variable', () => {
    const { creator } = setup()

    const result = creator.property('gap', ['row-gap', 'column-gap'])('8px', { modifier: null })

    expect(result).toEqual({
      '--jumi-column-gap': '8px',
      '--jumi-gap-animation-name': 'jumi-gap',
      '--jumi-row-gap': '8px',
    })
  })

  it('applies the transform of a tuple part', () => {
    const { creator } = setup()

    const result = creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: null })

    expect(result).toEqual({
      '--jumi-filter-animation-name': 'jumi-filter',
      '--jumi-filter-blur': 'blur(8px)',
    })
  })

  it('suffixes the stop modifier into part variables', () => {
    const { creator } = setup()

    const result = creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: '50' })

    expect(result).toEqual({
      '--jumi-filter-animation-name': 'jumi-filter',
      '--jumi-filter-blur-50': 'blur(8px)',
    })
  })
})

describe('keyframe emission', () => {
  it('emits a `to` keyframe for a no-stop property so its variable is applied', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animations

    expect(addUtilities).toHaveBeenCalledWith({
      '@keyframes jumi-opacity': {
        to: { opacity: 'var(--jumi-opacity)' },
      },
    })
  })

  it('emits stop blocks for a stop-based property', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('0', { modifier: '25' })
    creator.animations

    expect(addUtilities).toHaveBeenCalledWith({
      '@keyframes jumi-opacity': {
        '25%': { opacity: 'var(--jumi-opacity-25, var(--jumi-opacity))' },
      },
    })
  })

  it('expands the composition per-stop for a composed property', () => {
    const { addUtilities, creator } = setup()

    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: '50' })
    creator.animations

    const keyframes = addUtilities.mock.calls
      .map(([utilities]) => utilities)
      .find(utilities => '@keyframes jumi-filter' in utilities)

    expect(keyframes).toBeDefined()

    const filter = keyframes['@keyframes jumi-filter']['50%'].filter
    expect(filter).toContain('var(--jumi-filter-50,')
    expect(filter).toContain('var(--jumi-filter-blur-50, var(--jumi-filter-blur))')
  })
})
