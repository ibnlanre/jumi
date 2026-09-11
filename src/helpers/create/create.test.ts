import type { Api, CssInJs } from '@/types'

import { describe, expect, it, vi } from 'vitest'

import { getCreator } from '@/helpers/create'
import { css } from '@/helpers/css'

import shorthash2 from 'shorthash2'

function setup() {
  const addBase = vi.fn()
  const addUtilities = vi.fn()
  const theme = vi.fn()

  const api: Api = {
    addBase,
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

  return { addBase, addUtilities, creator }
}

describe('property curry', () => {
  it('writes a per-value keyframe name and target var for a simple property', () => {
    const { creator } = setup()

    const result = creator.property('opacity')('50', { modifier: null })
    const id = shorthash2('50')

    expect(result).toEqual({
      [`--jumi-opacity-${id}-animation-name`]: `jumi-opacity-${id}`,
      [`--jumi-opacity-${id}`]: '50',
    })
  })

  it('suffixes the stop modifier into the variable name', () => {
    const { creator } = setup()

    const result = creator.property('opacity')('0', { modifier: '25' })

    expect(result).toEqual({
      '--jumi-opacity-25': '0',
      '--jumi-opacity-25-animation-name': 'jumi-opacity-25',
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
      '--jumi-filter-50-animation-name': 'jumi-filter-50',
      '--jumi-filter-blur-50': 'blur(8px)',
    })
  })

  it('escapes a decimal stop modifier in the variable name', () => {
    const { creator } = setup()

    const result = creator.property('opacity')('0', { modifier: '12.5' })

    expect(result).toEqual({
      '--jumi-opacity-12\\.5': '0',
      '--jumi-opacity-12\\.5-animation-name': 'jumi-opacity-12\\.5',
    })
  })

  it('escapes a decimal stop modifier into part variables', () => {
    const { creator } = setup()

    const result = creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: '12.5' })

    expect(result).toEqual({
      '--jumi-filter-12\\.5-animation-name': 'jumi-filter-12\\.5',
      '--jumi-filter-blur-12\\.5': 'blur(8px)',
    })
  })
})

describe('keyframe emission', () => {
  it('emits a `to` keyframe for a no-stop property so its variable is applied', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animations
    const id = shorthash2('50')

    expect(addUtilities).toHaveBeenCalledWith({
      [`@keyframes jumi-opacity-${id}`]: {
        to: { opacity: `var(--jumi-opacity-${id})` },
      },
    })
  })

  it('emits a `to` keyframe for an aliased value', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('0', { modifier: '25' })
    creator.animations

    const utilities = addUtilities.mock.calls.map(([u]) => u)

    expect(utilities).toContainEqual({
      '@keyframes jumi-opacity-25': {
        to: { opacity: 'var(--jumi-opacity-25)' },
      },
    })
  })

  it('expands the composition per-alias for a composed property', () => {
    const { addUtilities, creator } = setup()

    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: '50' })
    creator.animations

    const keyframes = addUtilities.mock.calls
      .map(([utilities]) => utilities)
      .find(utilities => '@keyframes jumi-filter-50' in utilities)

    expect(keyframes).toBeDefined()

    const filter = keyframes['@keyframes jumi-filter-50'].to.filter
    expect(filter).toContain('var(--jumi-filter-50,')
    expect(filter).toContain('var(--jumi-filter-blur-50, var(--jumi-filter-blur))')
  })

  it('emits a `to` keyframe with an escaped decimal alias', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('0', { modifier: '12.5' })
    creator.animations

    const utilities = addUtilities.mock.calls.map(([u]) => u)

    expect(utilities).toContainEqual({
      '@keyframes jumi-opacity-12\\.5': {
        to: { opacity: 'var(--jumi-opacity-12\\.5)' },
      },
    })
  })

  it('expands the composition per-alias for a decimal alias', () => {
    const { addUtilities, creator } = setup()

    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: '12.5' })
    creator.animations

    const keyframes = addUtilities.mock.calls
      .map(([utilities]) => utilities)
      .find(utilities => '@keyframes jumi-filter-12\\.5' in utilities)

    expect(keyframes).toBeDefined()

    const filter = keyframes['@keyframes jumi-filter-12\\.5'].to.filter
    expect(filter).toContain('var(--jumi-filter-12\\.5,')
    expect(filter).toContain('var(--jumi-filter-blur-12\\.5, var(--jumi-filter-blur))')
  })

  it('wires a per-stop animation slot with per-stop timing overrides', () => {
    const { creator } = setup()

    creator.property('opacity')('0', { modifier: '25' })
    const animations = creator.animations

    expect(animations['animation-name']).toContain('var(--jumi-opacity-25-animation-name, none)')
    expect(animations['animation-duration']).toContain(
      'var(--jumi-opacity-25-animation-duration, var(--jumi-opacity-animation-duration, var(--jumi-animation-duration)))',
    )
    expect(animations['animation-delay']).toContain(
      'var(--jumi-opacity-25-animation-delay, var(--jumi-opacity-animation-delay, var(--jumi-animation-delay)))',
    )
  })
})

describe('animations wiring', () => {
  it('merges the animation-control defaults into `.animations`', () => {
    const { creator } = setup()

    const animations = creator.animations

    // With no registered values, `.animations` falls back to the shared controls.
    expect(animations['animation-name']).toBe('var(--jumi-animation-name)')
    expect(animations['animation-duration']).toBe('var(--jumi-animation-duration)')
    expect(animations).toMatchObject({
      '--jumi-animation': expect.stringContaining('var(--jumi-animation-name)'),
      '--jumi-animation-composition': 'replace',
      '--jumi-animation-duration': '1s',
      '--jumi-animation-name': 'none',
      '--jumi-animation-timeline': 'auto',
      '--jumi-interpolate-size': 'allow-keywords',
    })
  })

  it('wires a per-value slot with per-attribute timing fallbacks', () => {
    const { creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    const animations = creator.animations
    const id = shorthash2('50')

    expect(animations['animation-name']).toBe(
      `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
    )
    expect(animations['animation-duration']).toContain(
      'var(--jumi-opacity-animation-duration, var(--jumi-animation-duration))',
    )
  })

  it('emits longhands, never the `animation` shorthand', () => {
    const { creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.effect('bounce-in')
    const animations = creator.animations

    // Chromium re-parses var() chains inside the shorthand and shuffles values
    // between slots, so the shorthand must not come back.
    expect(animations['animation']).toBeUndefined()
    expect(animations['animation-name']).toContain(', ')
  })

  it('includes the per-attribute assembled default', () => {
    const { creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    const animations = creator.animations

    expect(animations['--jumi-opacity']).toBe('1')
  })

  it('orders the animation list per-value → composed → per-stop → effects', () => {
    const { creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: null })
    creator.property('opacity')('0', { modifier: '25' })
    creator.effect('bounce-in')

    const animations = creator.animations
    const id = shorthash2('50')

    expect(animations['animation-name']).toBe(
      [
        `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
        'var(--jumi-filter-animation-name, var(--jumi-animation-name))',
        'var(--jumi-opacity-25-animation-name, none)',
        'var(--jumi-bounce-in-animation-name, var(--jumi-animation-name))',
      ].join(', '),
    )
  })

  it('resolves an unset per-stop slot to `none`', () => {
    const { creator } = setup()

    creator.property('opacity')('0', { modifier: '25' })
    const animations = creator.animations

    expect(animations['animation-name']).toContain(
      'var(--jumi-opacity-25-animation-name, none)',
    )
  })
})

describe('animation-name registration', () => {
  const registered = (addBase: ReturnType<typeof setup>['addBase']) =>
    addBase.mock.calls.reduce<CssInJs>((acc, [utilities]) => ({ ...acc, ...utilities }), {})

  it('registers per-value, composed, per-stop and effect names as non-inheriting', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: null })
    creator.property('opacity')('0', { modifier: '25' })
    creator.effect('bounce-in')
    creator.animations

    const utilities = registered(addBase)
    const id = shorthash2('50')

    expect(Object.keys(utilities).filter(name => name.startsWith('@property')).sort()).toEqual([
      '--jumi-bounce-in-animation-name',
      '--jumi-filter-animation-name',
      '--jumi-opacity-25-animation-name',
      `--jumi-opacity-${id}-animation-name`,
    ].map(name => `@property ${name}`))

    expect(utilities[`@property --jumi-opacity-${id}-animation-name`]).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('escapes a decimal stop into its registration', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('0', { modifier: '12.5' })
    creator.animations

    expect(registered(addBase)['@property --jumi-opacity-12\\.5-animation-name']).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('leaves the shared animation name and controls inheritable for subtree cascades', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.effect('fade-in')
    creator.animations

    const utilities = registered(addBase)

    expect(utilities['@property --jumi-animation-name']).toBeUndefined()
    expect(utilities['@property --jumi-animation-duration']).toBeUndefined()
    expect(utilities['@property --jumi-animation-delay']).toBeUndefined()
  })
})

describe('color paints', () => {
  it('emits an SVG paint target as a hex literal', () => {
    const { creator } = setup()

    const result = creator.color('fill', [], { paint: true })('oklch(62.7% 0.265 303.9)', { modifier: null })
    const id = shorthash2('#ad46ff')

    expect(result).toEqual({
      [`--jumi-fill-${id}-animation-name`]: `jumi-fill-${id}`,
      [`--jumi-fill-${id}`]: '#ad46ff',
    })
  })

  it('leaves non-paint colors untouched', () => {
    const { creator } = setup()

    const result = creator.color('background-color')('oklch(62.7% 0.265 303.9)', { modifier: null })
    const id = shorthash2('oklch(62.7% 0.265 303.9)')

    expect(result[`--jumi-background-color-${id}`]).toBe('oklch(62.7% 0.265 303.9)')
  })

  it('passes non-color paint values through unchanged', () => {
    const { creator } = setup()

    const result = creator.color('fill', [], { paint: true })('url(#pattern)', { modifier: null })

    expect(Object.values(result)).toContain('url(#pattern)')
  })
})

describe('transitions wiring', () => {
  it('emits per-motion transitions plus a transition-behavior longhand', () => {
    const { creator } = setup()

    creator.motion('background-color')
    const transitions = creator.transitions

    expect(transitions['transition']).toContain('var(--jumi-background-color-transition)')
    expect(transitions['--jumi-background-color-transition']).toContain(
      'var(--jumi-background-color-transition-property, background-color)',
    )
    expect(transitions['transition-behavior']).toBe('var(--jumi-transition-behavior)')
  })

  it('falls back to the global shorthand and still wires transition-behavior', () => {
    const { creator } = setup()
    const transitions = creator.transitions

    expect(transitions['transition']).toBe('var(--jumi-transition)')
    expect(transitions['transition-behavior']).toBe('var(--jumi-transition-behavior)')
    expect(transitions['--jumi-transition-behavior']).toBe('normal')
  })
})
