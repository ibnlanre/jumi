import { describe, expect, it } from 'vitest'

import { mergeTheme } from './index'

describe('mergeTheme', () => {
  it('should merge multiple theme objects', () => {
    const theme1 = {
      color: 'red', fontSize: 12,
    }
    const theme2 = {
      color: 'blue', margin: 10,
    }
    const result = mergeTheme(theme1, theme2)
    expect(result).toEqual({
      color: 'blue', fontSize: 12, margin: 10,
    })
  })

  it('should handle undefined themes gracefully', () => {
    const theme1 = {
      color: 'red',
    }
    const result = mergeTheme(theme1, undefined)
    expect(result).toEqual({
      color: 'red',
    })
  })

  it('should return an empty object if no themes are provided', () => {
    expect(mergeTheme()).toEqual({})
  })

  it('should merge deeply only at the first level (shallow merge)', () => {
    const theme1 = {
      color: 'red', nested: {
        a: 1,
      },
    }
    const theme2 = {
      color: 'blue', nested: {
        b: 2,
      },
    }
    const result = mergeTheme(theme1, theme2)
    expect(result).toEqual({
      color: 'blue', nested: {
        b: 2,
      },
    })
  })

  it('should not mutate input objects', () => {
    const theme1 = {
      color: 'red',
    }
    const theme2 = {
      color: 'blue',
    }
    const theme1Copy = {
      ...theme1,
    }
    mergeTheme(theme1, theme2)
    expect(theme1).toEqual(theme1Copy)
  })

  it('should merge more than two themes', () => {
    const t1 = {
      a: 1,
    }
    const t2 = {
      b: 2,
    }
    const t3 = {
      c: 3,
    }
    expect(mergeTheme(t1, t2, t3)).toEqual({
      a: 1, b: 2, c: 3,
    })
  })

  it('should handle themes with undefined values', () => {
    const t1 = {
      a: undefined, b: 2,
    }
    const t2 = {
      a: 1,
    }
    expect(mergeTheme(t1, t2)).toEqual({
      a: 1, b: 2,
    })
  })
})
