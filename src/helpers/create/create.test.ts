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

  it('writes a phrase into one variable per declared frame', () => {
    const { creator } = setup()

    const result = creator.property('rotate')('0:16deg,58:0deg', { modifier: null })
    const id = shorthash2('0:16deg,58:0deg')

    expect(result).toEqual({
      [`--jumi-rotate-${id}-0`]: '16deg',
      [`--jumi-rotate-${id}-58`]: '0deg',
      [`--jumi-rotate-${id}-animation-name`]: `jumi-rotate-${id}`,
    })
  })

  it('leaves a value that is not a phrase on the plain path', () => {
    const { creator } = setup()

    // No leading offset, so this stays a one-frame tween at 100%.
    const result = creator.property('rotate')('16deg', { modifier: null })
    const id = shorthash2('16deg')

    expect(result).toEqual({
      [`--jumi-rotate-${id}-animation-name`]: `jumi-rotate-${id}`,
      [`--jumi-rotate-${id}`]: '16deg',
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

  it('orders and dedupes frames, so one phrase is one declaration', () => {
    const { creator } = setup()

    const ascending = creator.property('rotate')('0:16deg,58:0deg', { modifier: null })
    const shuffled = creator.property('rotate')('58:0deg,0:16deg', { modifier: null })

    expect(shuffled).toEqual(ascending)
  })

  it('lets the last of two frames at one offset win', () => {
    const { creator } = setup()

    const result = creator.property('rotate')('0:16deg,0:0deg', { modifier: null })
    const id = shorthash2('0:0deg')

    expect(result).toEqual({
      [`--jumi-rotate-${id}-0`]: '0deg',
      [`--jumi-rotate-${id}-animation-name`]: `jumi-rotate-${id}`,
    })
  })

  it('distributes every frame across the parts of a composed property', () => {
    const { creator } = setup()

    const result = creator.property('filter', [['filter-blur', value => css('blur', value)]])('0:0px,50:8px', { modifier: null })
    const id = shorthash2('0:0px,50:8px')

    expect(result).toEqual({
      [`--jumi-filter-${id}-animation-name`]: `jumi-filter-${id}`,
      [`--jumi-filter-blur-${id}-0`]: 'blur(0px)',
      [`--jumi-filter-blur-${id}-50`]: 'blur(8px)',
    })
  })

  it('escapes a decimal frame offset in the variable name', () => {
    const { creator } = setup()

    const result = creator.property('rotate')('12.5:0deg', { modifier: null })
    const id = shorthash2('12.5:0deg')

    expect(result).toEqual({
      [`--jumi-rotate-${id}-12\\.5`]: '0deg',
      [`--jumi-rotate-${id}-animation-name`]: `jumi-rotate-${id}`,
    })
  })
  it('records a phrase label in the rule it declares', () => {
    const { creator } = setup()

    const labelled = creator.property('rotate')('0:0deg,58:0deg', { modifier: 'flick' })
    const bare = creator.property('rotate')('0:0deg,100:90deg', { modifier: null })

    // The label is the address a person can write down, unlike the hash the
    // frame variables are keyed by, so the rule says what the slot is called.
    expect(labelled).toMatchObject({ [`--jumi-rotate-${shorthash2('0:0deg,58:0deg')}-label`]: 'flick' })
    expect(bare).not.toHaveProperty(`--jumi-rotate-${shorthash2('0:0deg,100:90deg')}-label`)
  })
})

describe('keyframe emission', () => {
  it('emits a `to` keyframe for a plain value so its variable is applied', () => {
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

  it('emits one keyframe per phrase, holding exactly its frames', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('0:0,58:1', { modifier: null })
    creator.animations

    const id = shorthash2('0:0,58:1')
    const keyframes = addUtilities.mock.calls
      .map(([u]) => u)
      .find(u => `@keyframes jumi-opacity-${id}` in u)

    const frames = keyframes[`@keyframes jumi-opacity-${id}`]

    // Exactly the declared offsets — nobody else's — each reading its own frame
    // variable.
    expect(Object.keys(frames)).toEqual(['0%', '58%'])
    expect(frames['0%'].opacity).toBe(`var(--jumi-opacity-${id}-0, var(--jumi-opacity))`)
    expect(frames['58%'].opacity).toBe(`var(--jumi-opacity-${id}-58, var(--jumi-opacity))`)
  })

  it('gives different phrases of one property separate keyframes', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('0:0,58:1', { modifier: null })
    creator.property('opacity')('0:0,100:1', { modifier: null })
    creator.animations

    const names = addUtilities.mock.calls
      .flatMap(([utilities]) => Object.keys(utilities))
      .filter(name => name.startsWith('@keyframes jumi-opacity-'))

    // Isolation is structural. Neither keyframe can hold the other's offsets,
    // because each is named after the phrase that declared it.
    expect(names).toContain(`@keyframes jumi-opacity-${shorthash2('0:0,58:1')}`)
    expect(names).toContain(`@keyframes jumi-opacity-${shorthash2('0:0,100:1')}`)
    expect(names).toHaveLength(2)
  })

  it('expands the composition per frame for a composed property', () => {
    const { addUtilities, creator } = setup()

    creator.property('filter', [['filter-blur', value => css('blur', value)]])('0:0px,40:8px', { modifier: null })
    creator.animations

    const id = shorthash2('0:0px,40:8px')
    const keyframes = addUtilities.mock.calls
      .map(([u]) => u)
      .find(u => `@keyframes jumi-filter-${id}` in u)

    expect(keyframes).toBeDefined()

    const frame = keyframes[`@keyframes jumi-filter-${id}`]['40%'].filter
    expect(frame).toContain(`var(--jumi-filter-${id}-40,`)
    expect(frame).toContain(`var(--jumi-filter-blur-${id}-40, var(--jumi-filter-blur))`)
  })

  it('escapes a decimal offset in the keyframe', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('12.5:0', { modifier: null })
    creator.animations

    const id = shorthash2('12.5:0')
    const keyframes = addUtilities.mock.calls
      .map(([u]) => u)
      .find(u => `@keyframes jumi-opacity-${id}` in u)

    expect(keyframes[`@keyframes jumi-opacity-${id}`]['12.5%'].opacity)
      .toBe(`var(--jumi-opacity-${id}-12\\.5, var(--jumi-opacity))`)
  })

  it('wires a phrase slot with per-attribute timing overrides', () => {
    const { creator } = setup()

    creator.property('opacity')('0:0,58:1', { modifier: null })
    const animations = creator.animations
    const id = shorthash2('0:0,58:1')

    expect(animations['animation-name']).toBe(
      `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
    )
    expect(animations['animation-duration']).toContain(
      'var(--jumi-opacity-animation-duration, var(--jumi-animation-duration))',
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

  it('orders the animation list per-value → composed → phrase → effects', () => {
    const { creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: null })
    creator.property('opacity')('0:0,58:1', { modifier: null })
    creator.effect('bounce-in')

    const animations = creator.animations
    const id = shorthash2('50')
    const phraseId = shorthash2('0:0,58:1')

    expect(animations['animation-name']).toBe(
      [
        `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
        'var(--jumi-filter-animation-name, var(--jumi-animation-name))',
        `var(--jumi-opacity-${phraseId}-animation-name, var(--jumi-animation-name))`,
        'var(--jumi-bounce-in-animation-name, var(--jumi-animation-name))',
      ].join(', '),
    )
  })

  it('gives each phrase its own slot', () => {
    const { creator } = setup()

    creator.property('opacity')('0:0,58:1', { modifier: null })
    creator.property('opacity')('0:0,100:1', { modifier: null })
    const animations = creator.animations

    // Two phrases, two animations: each owns its keyframe, so neither can be
    // corrupted by offsets the other declared.
    expect(animations['animation-name']).toBe(
      [
        `var(--jumi-opacity-${shorthash2('0:0,58:1')}-animation-name, var(--jumi-animation-name))`,
        `var(--jumi-opacity-${shorthash2('0:0,100:1')}-animation-name, var(--jumi-animation-name))`,
      ].join(', '),
    )
  })
  it('gives a labelled slot its own control link', () => {
    const { creator } = setup()

    creator.property('rotate')('0:0deg,58:0deg', { modifier: 'flick' })
    creator.property('rotate')('0:0deg,100:90deg', { modifier: null })
    const animations = creator.animations

    // A labelled slot reads its label's variable first, so `/[rotate.flick]`
    // times that animation on its own — which is how two animations of one
    // property, summed by `animation-composition: add`, are timed apart.
    expect(animations['animation-duration']).toContain(
      'var(--jumi-rotate-flick-animation-duration, var(--jumi-rotate-animation-duration, var(--jumi-animation-duration)))',
    )

    // Composition and timeline apply to one animation, so they are chained the
    // same way — that is what lets `add` compose a single slot.
    expect(animations['animation-composition']).toContain(
      'var(--jumi-rotate-flick-animation-composition, var(--jumi-rotate-animation-composition, var(--jumi-animation-composition)))',
    )
    expect(animations['animation-timeline']).toContain('var(--jumi-rotate-flick-animation-timeline, ')

    // An unlabelled slot has no name to be addressed by, so it keeps the
    // shorter chain and falls straight through to the attribute's control.
    expect(animations['animation-duration']).toContain(
      'var(--jumi-rotate-animation-duration, var(--jumi-animation-duration)))',
    )
    expect(animations['animation-duration']).not.toContain('var(--jumi-rotate-0-animation-duration')
  })
})

describe('animation-name registration', () => {
  const registered = (addBase: ReturnType<typeof setup>['addBase']) =>
    addBase.mock.calls.reduce<CssInJs>((acc, [utilities]) => ({ ...acc, ...utilities }), {})

  it('registers per-value, composed, phrase and effect names as non-inheriting', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.property('filter', [['filter-blur', value => css('blur', value)]])('8px', { modifier: null })
    creator.property('rotate')('0:16deg,58:0deg', { modifier: null })
    creator.effect('bounce-in')
    creator.animations

    const utilities = registered(addBase)
    const id = shorthash2('50')
    const phraseId = shorthash2('0:16deg,58:0deg')

    const expected = [
      '--jumi-bounce-in-animation-name',
      '--jumi-filter-animation-name',
      `--jumi-opacity-${id}-animation-name`,
      `--jumi-rotate-${phraseId}-animation-name`,
    ].sort()

    expect(Object.keys(utilities).filter(name => name.startsWith('@property')).sort())
      .toEqual(expected.map(name => `@property ${name}`))

    expect(utilities[`@property --jumi-opacity-${id}-animation-name`]).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('registers a phrase name against its own slot', () => {
    const { addBase, creator } = setup()

    creator.property('rotate')('0:16deg,58:0deg', { modifier: null })
    creator.animations

    const id = shorthash2('0:16deg,58:0deg')

    expect(registered(addBase)[`@property --jumi-rotate-${id}-animation-name`]).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('registers a name once, however often `.animations` is evaluated', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.effect('fade-in')

    // Tailwind evaluates `.animations` once per candidate that carries it —
    // `animations`, `*:animations`, `before:animations`, `hover:animations`.
    creator.animations
    creator.animations
    creator.animations
    creator.animations

    const names = addBase.mock.calls.flatMap(([utilities]) => Object.keys(utilities))
    const id = shorthash2('50')

    expect(names.filter(name => name === `@property --jumi-opacity-${id}-animation-name`))
      .toHaveLength(1)
    expect(names.filter(name => name === '@property --jumi-fade-in-animation-name'))
      .toHaveLength(1)
  })

  it('registers a slot created after the last `.animations` evaluation', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animations

    // Tailwind sorts some candidates after `.animations` — a `not-sm:*` variant,
    // for instance — so a slot can be created once the getter has run for good.
    // Registration must not depend on the getter: otherwise that name is left
    // inheritable and leaks an ancestor's animation into its descendants.
    creator.property('accent-color')('amber-400', { modifier: null })

    const id = shorthash2('amber-400')

    expect(registered(addBase)[`@property --jumi-accent-color-${id}-animation-name`]).toEqual({
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
