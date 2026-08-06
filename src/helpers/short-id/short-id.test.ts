import { describe, expect, it } from 'vitest'

import { shortId } from './index'

describe('shortId', () => {
  it('is stable: the same value always produces the same id', () => {
    expect(shortId('red-500')).toBe(shortId('red-500'))
    expect(shortId('blue-500')).toBe(shortId('blue-500'))
  })

  it('produces a short, safe suffix for keyframe names', () => {
    const id = shortId('[calc(100%-2rem)]')
    expect(id.length).toBeLessThanOrEqual(6)
    expect(id).toMatch(/^[0-9a-z]+$/)
  })

  it('distinguishes different values', () => {
    expect(shortId('red-500')).not.toBe(shortId('blue-500'))
  })

  it('handles values with characters invalid in keyframe names', () => {
    for (const value of ['red-500/50', '[calc(1rem+2px)]', 'ease-in-out']) {
      expect(shortId(value)).toMatch(/^[0-9a-z]+$/)
    }
  })
})
