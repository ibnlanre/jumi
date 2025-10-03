import { css } from './index'
import { describe, expect, it } from 'vitest'

describe('css', () => {
  it('should return a CSS function with no value', () => {
    expect(css('blur')).toBe('blur()')
  })

  it('should return a CSS function with a value', () => {
    expect(css('blur', '5px')).toBe('blur(5px)')
  })

  it('should return a CSS function with a value and a fallback', () => {
    expect(css('blur', '5px', '10px')).toBe('blur(5px, 10px)')
  })

  it('should work with different CSS functions', () => {
    expect(css('calc', '100% - 20px')).toBe('calc(100% - 20px)')
    expect(css('var', '--my-variable')).toBe('var(--my-variable)')
  })

  it('should handle complex values', () => {
    expect(css('linear-gradient', 'to right, #000, #fff')).toBe('linear-gradient(to right, #000, #fff)')
  })
})