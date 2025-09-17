import { describe, expect, it } from 'vitest'

import { flattenColorPalette } from '.'

describe('flattenColorPalette', () => {
  it('should handle empty object', () => {
    const result = flattenColorPalette({})
    expect(result).toEqual({})
  })

  it('should handle null/undefined input', () => {
    expect(flattenColorPalette(null as any)).toEqual({})
    expect(flattenColorPalette(undefined as any)).toEqual({})
  })

  it('should handle flat color values', () => {
    const colors = {
      black: '#000000',
      transparent: 'transparent',
      white: '#ffffff',
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      black: '#000000',
      transparent: 'transparent',
      white: '#ffffff',
    })
  })

  it('should flatten nested color objects with DEFAULT', () => {
    const colors = {
      red: {
        500: '#ef4444',
        600: '#dc2626',
        DEFAULT: '#dc2626',
      },
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'red': '#dc2626',
      'red-500': '#ef4444',
      'red-600': '#dc2626',
    })
  })

  it('should flatten deeply nested color objects', () => {
    const colors = {
      primary: {
        dark: {
          800: '#1e3a8a',
          900: '#1e40af',
          DEFAULT: '#1e40af',
        },
        light: {
          100: '#dbeafe',
          200: '#bfdbfe',
          DEFAULT: '#bfdbfe',
        },
      },
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'primary-dark': '#1e40af',
      'primary-dark-800': '#1e3a8a',
      'primary-dark-900': '#1e40af',
      'primary-light': '#bfdbfe',
      'primary-light-100': '#dbeafe',
      'primary-light-200': '#bfdbfe',
    })
  })

  it('should handle mixed flat and nested colors', () => {
    const colors = {
      black: '#000000',
      blue: {
        500: '#3b82f6',
        600: '#2563eb',
        DEFAULT: '#3b82f6',
      },
      transparent: 'transparent',
      white: '#ffffff',
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'black': '#000000',
      'blue': '#3b82f6',
      'blue-500': '#3b82f6',
      'blue-600': '#2563eb',
      'transparent': 'transparent',
      'white': '#ffffff',
    })
  })

  it('should handle TailwindCSS default color structure', () => {
    const colors = {
      black: '#000',
      current: 'currentColor',
      inherit: 'inherit',
      red: {
        50: '#fef2f2',
        500: '#ef4444',
        900: '#7f1d1d',
        DEFAULT: '#ef4444',
      },
      slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        500: '#64748b',
        900: '#0f172a',
        DEFAULT: '#64748b',
      },
      transparent: 'transparent',
      white: '#fff',
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'black': '#000',
      'current': 'currentColor',
      'inherit': 'inherit',
      'red': '#ef4444',
      'red-50': '#fef2f2',
      'red-500': '#ef4444',
      'red-900': '#7f1d1d',
      'slate': '#64748b',
      'slate-50': '#f8fafc',
      'slate-100': '#f1f5f9',
      'slate-500': '#64748b',
      'slate-900': '#0f172a',
      'transparent': 'transparent',
      'white': '#fff',
    })
  })

  it('should handle numeric keys as strings', () => {
    const colors = {
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
      },
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'gray-50': '#f9fafb',
      'gray-100': '#f3f4f6',
      'gray-200': '#e5e7eb',
    })
  })

  it('should handle non-string color values', () => {
    const colors = {
      custom: {
        DEFAULT: 'rgb(255, 0, 0)',
        hsl: 'hsl(0, 100%, 50%)',
      },
      opacity: {
        0: 0,
        50: 0.5,
        100: 1,
      },
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'custom': 'rgb(255, 0, 0)',
      'custom-hsl': 'hsl(0, 100%, 50%)',
      'opacity-0': 0,
      'opacity-50': 0.5,
      'opacity-100': 1,
    })
  })

  it('should handle array values by treating them as non-objects', () => {
    const colors = {
      blue: {
        500: '#3b82f6',
        DEFAULT: '#3b82f6',
      },
      gradient: ['#ff0000', '#00ff00', '#0000ff'],
    }
    const result = flattenColorPalette(colors)
    expect(result).toEqual({
      'blue': '#3b82f6',
      'blue-500': '#3b82f6',
      'gradient': ['#ff0000', '#00ff00', '#0000ff'],
    })
  })

  it('should contain all expected keys', () => {
    const colors = {
      a: '#aaa',
      b: {
        100: '#b1b',
        DEFAULT: '#bbb',
      },
      z: '#zzz',
    }
    const result = flattenColorPalette(colors)
    const keys = Object.keys(result)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('b-100')
    expect(keys).toContain('z')
    expect(keys).toHaveLength(4)
  })
})
