import type { Api } from '@/types'

import { describe, expect, it, vi } from 'vitest'

import { getCreator } from '@/helpers/create'
import { getMatchControls } from '@/properties/controls'

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
    theme: vi.fn(),
  }

  const creator = getCreator(api)

  return { controls: getMatchControls(creator), creator }
}

describe('per-alias timing controls', () => {
  const cases: Array<[string, string, string, Record<string, string>]> = [
    ['animation-delay', '2000ms', 'width.2', { '--jumi-width-2-animation-delay': '2000ms' }],
    ['animation-duration', '3000ms', 'rotate.1', { '--jumi-rotate-1-animation-duration': '3000ms' }],
    ['animation-direction', 'alternate', 'width.2', { '--jumi-width-2-animation-direction': 'alternate' }],
    ['animation-fill-mode', 'both', 'rotate.1', { '--jumi-rotate-1-animation-fill-mode': 'both' }],
    ['animation-iteration-count', '3', 'scale.1', { '--jumi-scale-1-animation-iteration-count': '3' }],
    ['animation-play-state', 'paused', 'width.2', { '--jumi-width-2-animation-play-state': 'paused' }],
    ['animation-timing-function', 'ease', 'scale.1', { '--jumi-scale-1-animation-timing-function': 'ease' }],
  ]

  it.each(cases)('scopes %s to its aliased stop slot', (control, value, modifier, expected) => {
    const { controls } = setup()

    expect(controls[control]!.fn(value, { modifier })).toEqual(expected)
  })

  it('keeps the per-attribute form for a bare `/{attr}` modifier', () => {
    const { controls } = setup()

    expect(controls['animation-direction']!.fn('alternate', { modifier: 'rotate' })).toEqual({
      '--jumi-rotate-animation-direction': 'alternate',
    })
  })

  it('writes the global variable without a modifier', () => {
    const { controls } = setup()

    expect(controls['animation-direction']!.fn('alternate', { modifier: null })).toEqual({
      '--jumi-animation-direction': 'alternate',
    })
  })

  it('preserves a decimal stop in the per-alias variable name', () => {
    const { controls } = setup()

    expect(controls['animation-direction']!.fn('alternate', { modifier: 'rotate.12.5' })).toEqual({
      '--jumi-rotate-12\\.5-animation-direction': 'alternate',
    })
  })
})
describe('transition controls', () => {
  it.each([
    ['transition-property', 'background-color'],
    ['transition-duration', 'background-color'],
    ['transition-delay', 'background-color'],
    ['transition-timing-function', 'background-color'],
  ])('%s with a `/{attr}` modifier registers the attribute as a motion', (control, modifier) => {
    const { controls, creator } = setup()
    const motion = vi.spyOn(creator, 'motion')

    controls[control]!.fn('value', { modifier })

    expect(motion).toHaveBeenCalledWith(modifier)
  })

  it('writes the scoped timing var alongside the motion registration', () => {
    const { controls } = setup()

    expect(controls['transition-duration']!.fn('500ms', { modifier: 'background-color' })).toEqual({
      '--jumi-background-color-transition-duration': '500ms',
    })
  })

  it('keeps the global form when no modifier is present', () => {
    const { controls } = setup()

    expect(controls['transition-behavior']!.fn('allow-discrete', { modifier: null })).toEqual({
      '--jumi-transition-behavior': 'allow-discrete',
    })
  })
})
describe('stagger utilities', () => {
  it('uses a count-free sibling-index() rule when no count modifier is given', () => {
    const { controls } = setup()

    expect(controls['animate-stagger-forward']!.fn('100ms', { modifier: null })).toEqual({
      '& > *': { '--jumi-stagger-animation-delay': 'calc((sibling-index() - 1) * 100ms)' },
    })
  })

  it('uses sibling-count() and sibling-index() for a count-free backward stagger', () => {
    const { controls } = setup()

    expect(controls['animate-stagger-backward']!.fn('150ms', { modifier: null })).toEqual({
      '& > *': { '--jumi-stagger-animation-delay': 'calc((sibling-count() - sibling-index()) * 150ms)' },
    })
  })

  it('prefers the adaptive rule and emits an nth-child fallback when a count is given', () => {
    const { controls } = setup()

    expect(controls['animate-stagger-forward']!.fn('100ms', { modifier: '5' })).toEqual([
      {
        '@supports (animation-delay: calc(sibling-index() * 1ms))': {
          '& > *': { '--jumi-stagger-animation-delay': 'calc((sibling-index() - 1) * 100ms)' },
        },
      },
      {
        '@supports not (animation-delay: calc(sibling-index() * 1ms))': {
          '& > :nth-child(1)': { '--jumi-stagger-animation-delay': 'calc(100ms * 0)' },
          '& > :nth-child(2)': { '--jumi-stagger-animation-delay': 'calc(100ms * 1)' },
          '& > :nth-child(3)': { '--jumi-stagger-animation-delay': 'calc(100ms * 2)' },
          '& > :nth-child(4)': { '--jumi-stagger-animation-delay': 'calc(100ms * 3)' },
          '& > :nth-child(5)': { '--jumi-stagger-animation-delay': 'calc(100ms * 4)' },
        },
      },
    ])
  })

  it('reverses the nth-child fallback for a backward stagger', () => {
    const { controls } = setup()

    expect(controls['animate-stagger-backward']!.fn('150ms', { modifier: '4' })).toEqual([
      {
        '@supports (animation-delay: calc(sibling-index() * 1ms))': {
          '& > *': { '--jumi-stagger-animation-delay': 'calc((sibling-count() - sibling-index()) * 150ms)' },
        },
      },
      {
        '@supports not (animation-delay: calc(sibling-index() * 1ms))': {
          '& > :nth-child(1)': { '--jumi-stagger-animation-delay': 'calc(150ms * 3)' },
          '& > :nth-child(2)': { '--jumi-stagger-animation-delay': 'calc(150ms * 2)' },
          '& > :nth-child(3)': { '--jumi-stagger-animation-delay': 'calc(150ms * 1)' },
          '& > :nth-child(4)': { '--jumi-stagger-animation-delay': 'calc(150ms * 0)' },
        },
      },
    ])
  })
})
