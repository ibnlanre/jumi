import { describe, expect, it } from 'vitest'

import { assemble } from '@/helpers/assemble'

describe('assemble function', () => {
  describe('properties with no dependencies', () => {
    it('should return single variable for simple property', () => {
      const result = assemble('accent-color')

      expect(result).toBeDefined()
      expect(Object.keys(result).length).toBe(1)
      expect(result).toEqual({
        '--jumi-accent-color': 'auto',
      })
    })

    it('should handle basic CSS properties', () => {
      const result = assemble('align-content')

      expect(result).toEqual({
        '--jumi-align-content': 'normal',
      })
    })

    it('should handle animation properties', () => {
      const result = assemble('animation-duration')

      expect(result).toEqual({
        '--jumi-animation-duration': '1s',
      })
    })

    it('should return all variables as CSS custom properties', () => {
      const result = assemble('backdrop-filter')

      Object.keys(result).forEach((key) => {
        expect(key).toMatch(/^--jumi-/)
      })
    })

    it('should return string values for all variables', () => {
      const result = assemble('aspect-ratio')

      Object.values(result).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    })

    it('should include composition values from imported functions', () => {
      const result = assemble('aspect-ratio')

      expect(result['--jumi-aspect-ratio']).toBeDefined()
      expect(result['--jumi-aspect-ratio']).not.toBe('auto')
    })

    it('should include CSS function calls in values', () => {
      const result = assemble('backdrop-filter')

      expect(result['--jumi-backdrop-filter-blur']).toContain('blur(')
      expect(result['--jumi-backdrop-filter-brightness']).toContain('brightness(')
      expect(result['--jumi-backdrop-filter-contrast']).toContain('contrast(')
    })
  })

  describe('properties with dependencies', () => {
    it('should resolve aspect-ratio dependencies', () => {
      const result = assemble('aspect-ratio')

      expect(result).toEqual({
        '--jumi-aspect-ratio': expect.any(String),
        '--jumi-aspect-ratio-height': 'auto',
        '--jumi-aspect-ratio-width': 'auto',
      })
    })

    it('should resolve backdrop-filter dependencies', () => {
      const result = assemble('backdrop-filter')

      expect(result).toHaveProperty('--jumi-backdrop-filter-blur')
      expect(result).toHaveProperty('--jumi-backdrop-filter-brightness')
      expect(result).toHaveProperty('--jumi-backdrop-filter-contrast')
      expect(result).toHaveProperty('--jumi-backdrop-filter-drop-shadow')
      expect(result).toHaveProperty('--jumi-backdrop-filter-grayscale')
      expect(result).toHaveProperty('--jumi-backdrop-filter-hue-rotate')
      expect(result).toHaveProperty('--jumi-backdrop-filter-invert')
      expect(result).toHaveProperty('--jumi-backdrop-filter-opacity')
      expect(result).toHaveProperty('--jumi-backdrop-filter-saturate')
      expect(result).toHaveProperty('--jumi-backdrop-filter-sepia')
      expect(result).toHaveProperty('--jumi-backdrop-filter')

      expect(result).toMatchObject({
        '--jumi-backdrop-filter-blur': 'blur(0)',
        '--jumi-backdrop-filter-brightness': 'brightness(1)',
        '--jumi-backdrop-filter-contrast': 'contrast(1)',
      })
    })

    it('should resolve nested dependencies for backdrop-filter-drop-shadow', () => {
      const result = assemble('backdrop-filter')

      expect(result).toHaveProperty('--jumi-backdrop-filter-drop-shadow-offset-x')
      expect(result).toHaveProperty('--jumi-backdrop-filter-drop-shadow-offset-y')
      expect(result).toHaveProperty('--jumi-backdrop-filter-drop-shadow-blur')
      expect(result).toHaveProperty('--jumi-backdrop-filter-drop-shadow-color')
      expect(result).toHaveProperty('--jumi-backdrop-filter-drop-shadow')
    })

    it('should resolve border dependencies', () => {
      const result = assemble('border')

      expect(result).toEqual({
        '--jumi-border': expect.any(String),
        '--jumi-border-color': 'currentColor',
        '--jumi-border-style': 'none',
        '--jumi-border-width': 'medium',
      })
    })

    it('should resolve background-position dependencies', () => {
      const result = assemble('background-position')

      expect(result).toHaveProperty('--jumi-background-position-x')
      expect(result).toHaveProperty('--jumi-background-position-y')
      expect(result).toHaveProperty('--jumi-background-position')
    })
  })

  describe('circular dependency prevention', () => {
    it('should not include the property itself in dependencies', () => {
      const result = assemble('aspect-ratio')

      // The function should not infinitely recurse on itself
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('edge cases', () => {
    it('should handle properties that do not exist', () => {
      expect(() => assemble('non-existent-property' as any)).not.toThrow()
    })

    it('should return consistent results when called multiple times', () => {
      const result1 = assemble('backdrop-filter')
      const result2 = assemble('backdrop-filter')

      expect(result1).toEqual(result2)
    })
  })
})
