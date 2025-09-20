import { describe, expect, it } from 'vitest'

import { merge } from './index'

describe('merge', () => {
  it('should merge multiple values', () => {
    const value1 = {
      color: 'red', fontSize: 12,
    }
    const value2 = {
      color: 'blue', margin: 10,
    }
    const result = merge(value1, value2)
    expect(result).toEqual({
      color: 'blue', fontSize: 12, margin: 10,
    })
  })

  it('should handle undefined values gracefully', () => {
    const value1 = {
      color: 'red',
    }
    const result = merge(value1, undefined)
    expect(result).toEqual({
      color: 'red',
    })
  })

  it('should return an empty object if no values are provided', () => {
    expect(merge()).toEqual({})
  })

  it('should merge deeply only at the first level (shallow merge)', () => {
    const value1 = {
      color: 'red', nested: {
        a: 1,
      },
    }
    const value2 = {
      color: 'blue', nested: {
        b: 2,
      },
    }
    const result = merge(value1, value2)
    expect(result).toEqual({
      color: 'blue', nested: {
        b: 2,
      },
    })
  })

  it('should not mutate input objects', () => {
    const value1 = {
      color: 'red',
    }
    const value2 = {
      color: 'blue',
    }
    const value1Copy = {
      ...value1,
    }
    merge(value1, value2)
    expect(value1).toEqual(value1Copy)
  })

  it('should merge more than two values', () => {
    const value1 = {
      a: 1,
    }
    const value2 = {
      b: 2,
    }
    const value3 = {
      c: 3,
    }
    expect(merge(value1, value2, value3)).toEqual({
      a: 1, b: 2, c: 3,
    })
  })

  it('should handle values with undefined values', () => {
    const value1 = {
      a: undefined, b: 2,
    }
    const value2 = {
      a: 1,
    }
    expect(merge(value1, value2)).toEqual({
      a: 1, b: 2,
    })
  })
})
