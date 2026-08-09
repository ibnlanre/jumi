import { describe, expect, it } from 'vitest'

import { toPaintHex } from '@/helpers/paint'

describe('toPaintHex', () => {
  it('converts an oklch color to a hex literal', () => {
    expect(toPaintHex('oklch(62.7% 0.265 303.9)')).toBe('#ad46ff')
    expect(toPaintHex('oklch(62.3% 0.214 259.815)')).toBe('#2b7fff')
  })

  it('normalizes hex and rgb inputs', () => {
    expect(toPaintHex('#a855f7')).toBe('#a855f7')
    expect(toPaintHex('rgb(59, 130, 246)')).toBe('#3b82f6')
  })

  it('resolves color-mix with transparent to a translucency hex8', () => {
    // Tailwind opacity modifier format: mixing with transparent un-premultiplies,
    // so the result is the color at the weighted alpha.
    expect(toPaintHex('color-mix(in oklab, oklch(63.7% 0.237 25.331) 50%, transparent)')).toBe(
      '#fb2c3680',
    )
    expect(toPaintHex('color-mix(in oklab, oklch(62.7% 0.265 303.9) 75%, transparent)')).toBe(
      '#ad46ffbf',
    )
  })

  it('resolves color-mix between two opaque colors', () => {
    // matches Chromium: color(srgb 0.914706 0.833333 0.992157)
    expect(toPaintHex('color-mix(in srgb, #a855f7 25%, white)')).toBe('#e9d5fd')
    // percentage may also precede the color (CSS allows either order)
    expect(toPaintHex('color-mix(in srgb, 25% #a855f7, white)')).toBe('#e9d5fd')
  })

  it('parses a hue interpolation method after the color space', () => {
    // `shorter hue` (and friends) sit between `in <space>` and the comma.
    expect(toPaintHex('color-mix(in oklch shorter hue, oklch(0.7 0.1 20) 50%, white)')).toBe(
      '#ecc1c6',
    )
  })

  it('keeps achromatic mixing from becoming NaN', () => {
    // White is achromatic, so its hue channel is undefined. Without the `?? 0`
    // fallback in mixColors, `undefined * number` → NaN poisons the channels
    // and the mix fails. Chromium gives #edc1c0 for this input — visually
    // identical (both near-white pink).
    expect(toPaintHex('color-mix(in oklch, oklch(0.7 0.1 20) 50%, white)')).toBe('#ecc1c6')
  })

  it('passes non-color values through unchanged', () => {
    expect(toPaintHex('none')).toBe('none')
    expect(toPaintHex('url(#pattern)')).toBe('url(#pattern)')
    expect(toPaintHex('currentColor')).toBe('currentColor')
  })
})
