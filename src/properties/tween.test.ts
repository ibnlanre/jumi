import type { Api } from '@/types'

import { describe, expect, it, vi } from 'vitest'

import { getCreator } from '@/helpers/create'
import { getMatchTween } from '@/properties/tween'

function setup() {
  const api: Api = {
    addBase: vi.fn(),
    addComponents: vi.fn(),
    addUtilities: vi.fn(),
    addVariant: vi.fn(),
    config: vi.fn(),
    matchComponents: vi.fn(),
    matchUtilities: vi.fn(),
    matchVariant: vi.fn(),
    prefix: vi.fn(),
    theme: vi.fn(() => ({})),
  }

  return getMatchTween(getCreator(api))
}

/** The `animate` entry — the utility an effect's name is a value of. */
const animate = setup().animate as unknown as { fn: (value: string) => unknown }

describe('the effect utility', () => {
  it('writes the activation declaration for an effect Jumi has', () => {
    expect(animate.fn('fade-in')).toEqual({ '--jumi-fade-in-animation-name': 'jumi-fade-in' })
  })

  it('ignores a candidate with no name', () => {
    // `animate-` is a real candidate, and not a hypothetical one: `animate-${name}` in a template
    // literal — ordinary React — scans as this bare stub, and `animate-` is also the root every
    // property utility hangs off. Asking the model for keyframes a name does not have crashed the
    // whole build, from inside Tailwind's `addUtilities`, with `Cannot convert undefined or null to
    // object` and no frame pointing back here.
    expect(() => animate.fn('')).not.toThrow()
    expect(animate.fn('')).toEqual({})
  })

  it('ignores a name that is not an effect', () => {
    expect(animate.fn('not-an-effect')).toEqual({})
    // Not `cssEffects[value]`, which would find `Object.prototype`'s own properties and hand the
    // model a name it has no keyframes for.
    expect(animate.fn('constructor')).toEqual({})
  })
})
