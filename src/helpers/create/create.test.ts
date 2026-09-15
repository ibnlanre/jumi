import type { Api, CssInJs } from '@/types'

import { describe, expect, it, vi } from 'vitest'

import { stagingMarker } from '@/helpers/carriers'
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

    const result = creator.property('rotate')('0:16deg|58:0deg', {
      modifier: null,
    })
    const id = shorthash2('0:16deg|58:0deg')

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

    const result = creator.property('gap', ['row-gap', 'column-gap'])('8px', {
      modifier: null,
    })

    expect(result).toEqual({
      '--jumi-column-gap': '8px',
      '--jumi-gap-animation-name': 'jumi-gap',
      '--jumi-row-gap': '8px',
    })
  })

  it('applies the transform of a tuple part', () => {
    const { creator } = setup()

    const result = creator.property('filter', [
      ['filter-blur', value => css('blur', value)],
    ])('8px', { modifier: null })

    expect(result).toEqual({
      '--jumi-filter-animation-name': 'jumi-filter',
      '--jumi-filter-blur': 'blur(8px)',
    })
  })

  it('orders and dedupes frames, so one phrase is one declaration', () => {
    const { creator } = setup()

    const ascending = creator.property('rotate')('0:16deg|58:0deg', {
      modifier: null,
    })
    const shuffled = creator.property('rotate')('58:0deg|0:16deg', {
      modifier: null,
    })

    expect(shuffled).toEqual(ascending)
  })

  it('puts one value at several offsets from a single frame', () => {
    const { creator } = setup()

    // Offsets that share a value are one frame, so the comma is free to be the offset separator —
    // and the shorthand has to be pure syntax, not a second spelling with its own keyframe.
    const shared = creator.property('rotate')('0,100:45deg| 50:0deg', {
      modifier: null,
    })
    const written = creator.property('rotate')('0:45deg|50:0deg|100:45deg', {
      modifier: null,
    })
    const id = shorthash2('0:45deg|50:0deg|100:45deg')

    expect(shared).toEqual(written)
    expect(shared).toEqual({
      [`--jumi-rotate-${id}-0`]: '45deg',
      [`--jumi-rotate-${id}-50`]: '0deg',
      [`--jumi-rotate-${id}-100`]: '45deg',
      [`--jumi-rotate-${id}-animation-name`]: `jumi-rotate-${id}`,
    })
  })

  it('still reads a value that carries its own commas as one frame', () => {
    const { creator } = setup()

    // A comma inside a value is why the offset list gets its own separator rather than the frame:
    // `rgb(0,0,0)` is one value, not three offsets.
    const result = creator.property('background-color')(
      '0:rgb(0,0,0)|100:rgb(255,0,0)',
      { modifier: null },
    )
    const id = shorthash2('0:rgb(0,0,0)|100:rgb(255,0,0)')

    expect(result).toEqual({
      [`--jumi-background-color-${id}-0`]: 'rgb(0,0,0)',
      [`--jumi-background-color-${id}-100`]: 'rgb(255,0,0)',
      [`--jumi-background-color-${id}-animation-name`]: `jumi-background-color-${id}`,
    })
  })

  it('lets the last of two frames at one offset win', () => {
    const { creator } = setup()

    const result = creator.property('rotate')('0:16deg|0:0deg', {
      modifier: null,
    })
    const id = shorthash2('0:0deg')

    expect(result).toEqual({
      [`--jumi-rotate-${id}-0`]: '0deg',
      [`--jumi-rotate-${id}-animation-name`]: `jumi-rotate-${id}`,
    })
  })

  it('distributes every frame across the parts of a composed property', () => {
    const { creator } = setup()

    const result = creator.property('filter', [
      ['filter-blur', value => css('blur', value)],
    ])('0:0px|50:8px', { modifier: null })
    const id = shorthash2('0:0px|50:8px')

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

    const labelled = creator.property('rotate')('0:0deg|58:0deg', {
      modifier: 'flick',
    })
    const bare = creator.property('rotate')('0:0deg|100:90deg', {
      modifier: null,
    })

    // The label is the address a person can write down, unlike the hash the
    // frame variables are keyed by, so the rule says what the slot is called.
    expect(labelled).toMatchObject({
      [`--jumi-flick-${shorthash2('0:0deg|58:0deg')}-rotate-label`]: 'flick',
    })
    expect(bare).not.toHaveProperty(
      `--jumi-rotate-${shorthash2('0:0deg|100:90deg')}-label`,
    )
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

    creator.property('opacity')('0:0|58:1', { modifier: null })
    creator.animations

    const id = shorthash2('0:0|58:1')
    const keyframes = addUtilities.mock.calls
      .map(([u]) => u)
      .find(u => `@keyframes jumi-opacity-${id}` in u)

    const frames = keyframes[`@keyframes jumi-opacity-${id}`]

    // Exactly the declared offsets — nobody else's — each reading its own frame
    // variable.
    expect(Object.keys(frames)).toEqual(['0%', '58%'])
    expect(frames['0%'].opacity).toBe(
      `var(--jumi-opacity-${id}-0, var(--jumi-opacity))`,
    )
    expect(frames['58%'].opacity).toBe(
      `var(--jumi-opacity-${id}-58, var(--jumi-opacity))`,
    )
  })

  it('gives different phrases of one property separate keyframes', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('0:0|58:1', { modifier: null })
    creator.property('opacity')('0:0|100:1', { modifier: null })
    creator.animations

    const names = addUtilities.mock.calls
      .flatMap(([utilities]) => Object.keys(utilities))
      .filter(name => name.startsWith('@keyframes jumi-opacity-'))

    // Isolation is structural. Neither keyframe can hold the other's offsets,
    // because each is named after the phrase that declared it.
    expect(names).toContain(`@keyframes jumi-opacity-${shorthash2('0:0|58:1')}`)
    expect(names).toContain(
      `@keyframes jumi-opacity-${shorthash2('0:0|100:1')}`,
    )
    expect(names).toHaveLength(2)
  })

  it('expands the composition per frame for a composed property', () => {
    const { addUtilities, creator } = setup()

    creator.property('filter', [['filter-blur', value => css('blur', value)]])(
      '0:0px|40:8px',
      { modifier: null },
    )
    creator.animations

    const id = shorthash2('0:0px|40:8px')
    const keyframes = addUtilities.mock.calls
      .map(([u]) => u)
      .find(u => `@keyframes jumi-filter-${id}` in u)

    expect(keyframes).toBeDefined()

    const frame = keyframes[`@keyframes jumi-filter-${id}`]['40%'].filter
    expect(frame).toContain(`var(--jumi-filter-${id}-40,`)
    expect(frame).toContain(
      `var(--jumi-filter-blur-${id}-40, var(--jumi-filter-blur))`,
    )
  })

  it('escapes a decimal offset in the keyframe', () => {
    const { addUtilities, creator } = setup()

    creator.property('opacity')('12.5:0', { modifier: null })
    creator.animations

    const id = shorthash2('12.5:0')
    const keyframes = addUtilities.mock.calls
      .map(([u]) => u)
      .find(u => `@keyframes jumi-opacity-${id}` in u)

    expect(keyframes[`@keyframes jumi-opacity-${id}`]['12.5%'].opacity).toBe(
      `var(--jumi-opacity-${id}-12\\.5, var(--jumi-opacity))`,
    )
  })

  it('wires a phrase slot with per-attribute timing overrides', () => {
    const { creator } = setup()

    creator.property('opacity')('0:0|58:1', { modifier: null })
    const animations = creator.animations
    const id = shorthash2('0:0|58:1')

    expect(animations['animation-name']).toBe(
      `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
    )
    expect(animations['animation-duration']).toContain(
      'var(--jumi-opacity-animation-duration, var(--jumi-animation-duration))',
    )
  })
})

describe('animations wiring', () => {
  it('merges the animation-control defaults into the animations getter', () => {
    const { creator } = setup()

    const animations = creator.animations

    // With no registered values, the getter falls back to the shared controls.
    expect(animations['animation-name']).toBe('var(--jumi-animation-name)')
    expect(animations['animation-duration']).toBe(
      'var(--jumi-animation-duration)',
    )
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
    creator.property('filter', [['filter-blur', value => css('blur', value)]])(
      '8px',
      { modifier: null },
    )
    creator.property('opacity')('0:0|58:1', { modifier: null })
    creator.effect('bounce-in')

    const animations = creator.animations
    const id = shorthash2('50')
    const phraseId = shorthash2('0:0|58:1')

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

    creator.property('opacity')('0:0|58:1', { modifier: null })
    creator.property('opacity')('0:0|100:1', { modifier: null })
    const animations = creator.animations

    // Two phrases, two animations: each owns its keyframe, so neither can be
    // corrupted by offsets the other declared.
    expect(animations['animation-name']).toBe(
      [
        `var(--jumi-opacity-${shorthash2('0:0|58:1')}-animation-name, var(--jumi-animation-name))`,
        `var(--jumi-opacity-${shorthash2('0:0|100:1')}-animation-name, var(--jumi-animation-name))`,
      ].join(', '),
    )
  })

  it('gives two names on one phrase two slots over one keyframe', () => {
    const { creator } = setup()

    creator.property('opacity')('0:0|100:1', { modifier: 'enter' })
    creator.property('opacity')('0:0|100:1', { modifier: 'exit' })
    const animations = creator.animations
    const id = shorthash2('0:0|100:1')

    // Instance identity, not definition identity. Both entries name the *same* keyframe — the frames
    // are declared once — and the two names are two slots, so either can be timed without the other.
    // Leaving the name out of the key made the second name replace the first instead.
    expect(animations['animation-name']).toBe(
      [
        `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
        `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
      ].join(', '),
    )
  })

  it('collapses a repeated name to one instance', () => {
    const { creator } = setup()

    creator.property('opacity')('0:0|100:1', { modifier: 'enter' })
    creator.property('opacity')('0:0|100:1', { modifier: 'enter' })
    const animations = creator.animations

    // The same definition under the same name is one motion, however often a variant re-declares it.
    expect(animations['animation-name']).toBe(
      `var(--jumi-opacity-${shorthash2('0:0|100:1')}-animation-name, var(--jumi-animation-name))`,
    )
  })
  it('gives every slot its own address, and never carries a name in the aggregate', () => {
    const { creator } = setup()

    creator.property('rotate')('0:0deg|58:0deg', { modifier: 'flick' })
    creator.property('rotate')('0:0deg|100:90deg', { modifier: null })
    const animations = creator.animations
    const flick = `--jumi-slot-flick-${shorthash2('0:0deg|58:0deg')}-rotate`

    // Each position reads *its own* slot variable before the property's control, so one animation of
    // a property can be timed without the other — which is how two animations summed by
    // `animation-composition: add` are timed apart.
    expect(animations['animation-duration']).toContain(
      `var(${flick}-animation-duration, var(--jumi-rotate-animation-duration, var(--jumi-animation-duration)))`,
    )

    // Composition and timeline apply to one animation, so they are chained the same way.
    expect(animations['animation-composition']).toContain(
      `var(${flick}-animation-composition, var(--jumi-rotate-animation-composition, var(--jumi-animation-composition)))`,
    )
    expect(animations['animation-timeline']).toContain(
      `var(${flick}-animation-timeline, `,
    )

    // Range is the third list of that shape, and it is a list *per animation*: position 0 may carry
    // a real range while position 1 falls through to the global default.
    expect(animations['animation-range']).toContain(
      `var(${flick}-animation-range, `,
    )
    expect(animations['animation-range']).toContain(
      'var(--jumi-rotate-animation-range, var(--jumi-animation-range))',
    )
    expect(
      String(animations['animation-range']).split(
        'var(--jumi-rotate-animation-range',
      ).length - 1,
    ).toBe(2)

    // **And no name is anywhere in it.** Not as a value and not as a variable — a chain may carry the
    // *slot*, which is inert on an element that never set it, but nothing may carry a label. The
    // aggregate is one declaration block shared by every element that matches the composition, so a name
    // written into a chain is a name every element answers to — including elements that called the motion
    // something else, or nothing at all. Measured before the split: with two elements naming one effect
    // `reveal` and `loop`, `animation-duration-900/loop` reached the `reveal` one, and which name won
    // depended on the order the candidates were compiled in.
    //
    // The word itself *is* in the key now, which is the readable vocabulary this shape bought, so the
    // assertion is about the namespace rather than the spelling.
    for (const part of Object.keys(animations).filter(part =>
      part.startsWith('animation-'),
    ))
      expect(String(animations[part])).not.toContain('--jumi-label-')
  })
})

describe('animation-name registration', () => {
  const registered = (addBase: ReturnType<typeof setup>['addBase']) =>
    addBase.mock.calls.reduce<CssInJs>(
      (acc, [utilities]) => ({ ...acc, ...utilities }),
      {},
    )

  it('registers per-value, composed, phrase and effect names as non-inheriting', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.property('filter', [['filter-blur', value => css('blur', value)]])(
      '8px',
      { modifier: null },
    )
    creator.property('rotate')('0:16deg|58:0deg', { modifier: null })
    creator.effect('bounce-in')
    creator.animations

    const utilities = registered(addBase)
    const id = shorthash2('50')
    const phraseId = shorthash2('0:16deg|58:0deg')

    const expected = [
      '--jumi-bounce-in-animation-name',
      '--jumi-filter-animation-name',
      `--jumi-opacity-${id}-animation-name`,
      `--jumi-rotate-${phraseId}-animation-name`,
    ].sort()

    // Two registrations per slot, and the *pair* is the contract rather than the count. The name a
    // slot is activated by, and the value the aggregate publishes it under — both have to be
    // non-inheriting, because a descendant that inherits either one re-runs its ancestor's
    // animation. The second was missing when the aggregate became a hoist, and
    // `behaviour:check`'s non-inheritance arm is what found it.
    const hoisted = expected.map(name =>
      name.replace(/^--jumi-(.+)-animation-name$/, '--jumi-slot-$1'),
    )

    expect(
      Object.keys(utilities)
        .filter(name => name.startsWith('@property'))
        .sort(),
    ).toEqual([...expected, ...hoisted].sort().map(name => `@property ${name}`))

    expect(utilities[`@property --jumi-opacity-${id}-animation-name`]).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })

    expect(utilities[`@property --jumi-slot-opacity-${id}`]).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('registers a phrase name against its own slot', () => {
    const { addBase, creator } = setup()

    creator.property('rotate')('0:16deg|58:0deg', { modifier: null })
    creator.animations

    const id = shorthash2('0:16deg|58:0deg')

    expect(
      registered(addBase)[`@property --jumi-rotate-${id}-animation-name`],
    ).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('registers each named instance hoist independently from its shared definition', () => {
    const { addBase, creator } = setup()
    for (const modifier of ['enter', 'exit'])
      creator.property('opacity')('0:0|100:1', { modifier })
    creator.animations
    const rules = registered(addBase)
    for (const name of ['enter', 'exit'])
      expect(
        rules[
          `@property --jumi-slot-${name}-${shorthash2('0:0|100:1')}-opacity`
        ],
      ).toEqual({ inherits: 'false', syntax: '"*"' })
  })

  it('registers every link a labelled slot reads, so a label cannot inherit', () => {
    const { addBase, creator } = setup()

    creator.property('rotate')('0:16deg|58:0deg', { modifier: 'flick' })
    creator.animations

    const utilities = registered(addBase)
    const parts = Object.keys(creator.animations).filter(
      part => part.startsWith('animation-') && part !== 'animation-name',
    )

    expect(parts.length).toBeGreaterThan(0)

    for (const part of parts) {
      expect(utilities[`@property --jumi-label-flick-${part}`]).toEqual({
        inherits: 'false',
        syntax: '"*"',
      })
    }
  })

  it('assigns a name separately only for the parts the shorthand cannot carry', () => {
    const { addBase, creator } = setup()

    creator.property('rotate')('0:16deg|58:0deg', { modifier: 'flick' })
    const animations = creator.animations
    const key = `flick-${shorthash2('0:16deg|58:0deg')}-rotate`
    const utilities = registered(addBase)

    // These three are assigned on the rule that named the motion, because the composition declares them
    // in one rule for every activating selector and so knows no names. Registered for the same reason as
    // ever: a descendant that animates the same property must not answer to a name declared above it.
    for (const part of [
      'animation-composition',
      'animation-range',
      'animation-timeline',
    ])
      expect(utilities[`@property --jumi-slot-${key}-${part}`]).toEqual({
        inherits: 'false',
        syntax: '"*"',
      })

    // The other seven are not registered, because nothing declares them anywhere: they are sections of
    // the `animation` shorthand, whose value the naming rule publishes with the name already in it. A
    // registration with nothing to fill it is an address that reads as silence.
    for (const part of [
      'animation-delay',
      'animation-direction',
      'animation-duration',
      'animation-fill-mode',
      'animation-iteration-count',
      'animation-play-state',
      'animation-timing-function',
    ])
      expect(utilities[`@property --jumi-slot-${key}-${part}`]).toBeUndefined()

    // The aggregate still addresses the slot for every part, which is what the composition reads — and
    // where no label is written, because that block is shared by every element that matches it. The key
    // spells the instance (that is the readable vocabulary), so the assertion is about the namespace: a
    // chain may carry a slot, and never a label.
    for (const part of Object.keys(animations).filter(part =>
      part.startsWith('animation-'),
    ))
      expect(String(animations[part])).not.toContain('--jumi-label-')
  })

  it('never registers a name outside the label namespace', () => {
    const { addBase, creator } = setup()

    // The invariant that replaced an exemption. A name used to be registered under itself —
    // `--jumi-rotate-animation-duration` for the label `rotate` — which is the property scope's own
    // variable, so the identity case had to be carved out to keep a scope cascading. Now the two live
    // in namespaces that cannot meet: a scope is always `--jumi-<attribute>-<part>`, and a name is
    // always `--jumi-label-<name>-<part>`.
    creator.property('rotate')('0:16deg|58:0deg', { modifier: 'rotate' })
    creator.property('opacity')('0:0|100:1', { modifier: 'reveal' })
    creator.animations

    const utilities = registered(addBase)

    expect(
      Object.keys(utilities).filter(name =>
        name.startsWith('@property --jumi-reveal-'),
      ),
    ).toEqual([])
    expect(
      utilities['@property --jumi-rotate-animation-duration'],
    ).toBeUndefined()
    expect(
      utilities['@property --jumi-rotate-animation-timing-function'],
    ).toBeUndefined()
  })

  it('records a name that is already a structural address instead of linking it', () => {
    const { creator } = setup()

    // `animate-rotate-45/scale` cannot be addressed: `--jumi-scale-animation-duration` is the scale
    // property's scope, read by every motion animating scale. The record is what the pass reports, and
    // the absence of a label declaration is what keeps the CSS free of an address nothing fills.
    const shadowed = creator.property('rotate')('0:0deg|58:0deg', {
      modifier: 'scale',
    })

    expect(shadowed).toMatchObject({
      [`--jumi-name-${shorthash2('scale')}-shadowed`]: 'scale',
    })
    expect(Object.keys(shadowed).some(key => key.endsWith('-label'))).toBe(
      false,
    )

    // Naming a motion after the property it animates is not the same thing: one scope serves both
    // readings, so nothing is recorded and nothing is lost.
    expect(
      creator.property('rotate')('0:90deg|100:180deg', { modifier: 'rotate' }),
    ).not.toHaveProperty(`--jumi-name-${shorthash2('rotate')}-shadowed`)
  })

  it('registers a name once, however often the animations getter is read', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.effect('fade-in')

    // Every read has to leave exactly one registration behind, however many callers read it.
    creator.animations
    creator.animations
    creator.animations
    creator.animations

    const names = addBase.mock.calls.flatMap(([utilities]) =>
      Object.keys(utilities),
    )
    const id = shorthash2('50')

    expect(
      names.filter(
        name => name === `@property --jumi-opacity-${id}-animation-name`,
      ),
    ).toHaveLength(1)
    expect(
      names.filter(name => name === '@property --jumi-fade-in-animation-name'),
    ).toHaveLength(1)
  })

  it('registers a slot created after the last read of the animations getter', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animations

    // A slot's utility can be compiled after anything has read the lists, so a
    // slot can be created once the getter has run for good. Registration must not
    // depend on the getter: otherwise that name is left inheritable and leaks an
    // ancestor's animation into its descendants.
    creator.property('accent-color')('amber-400', { modifier: null })

    const id = shorthash2('amber-400')

    expect(
      registered(addBase)[`@property --jumi-accent-color-${id}-animation-name`],
    ).toEqual({
      inherits: 'false',
      syntax: '"*"',
    })
  })

  it('leaves the shared animation controls unregistered', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.effect('fade-in')
    creator.animations

    // Unregistered is not the same as cascading: the derived defaults rule
    // declares these on every animating element, and a declaration beats
    // inheritance, so a global control written on an ancestor never reaches a
    // descendant's animations. Registering them would add a block per name and
    // change nothing a page could observe.
    const utilities = registered(addBase)

    expect(utilities['@property --jumi-animation-name']).toBeUndefined()
    expect(utilities['@property --jumi-animation-duration']).toBeUndefined()
    expect(utilities['@property --jumi-animation-delay']).toBeUndefined()
  })
})

describe('color paints', () => {
  it('emits an SVG paint target as a hex literal', () => {
    const { creator } = setup()

    const result = creator.color('fill', [], { paint: true })(
      'oklch(62.7% 0.265 303.9)',
      { modifier: null },
    )
    const id = shorthash2('#ad46ff')

    expect(result).toEqual({
      [`--jumi-fill-${id}-animation-name`]: `jumi-fill-${id}`,
      [`--jumi-fill-${id}`]: '#ad46ff',
    })
  })

  it('leaves non-paint colors untouched', () => {
    const { creator } = setup()

    const result = creator.color('background-color')(
      'oklch(62.7% 0.265 303.9)',
      { modifier: null },
    )
    const id = shorthash2('oklch(62.7% 0.265 303.9)')

    expect(result[`--jumi-background-color-${id}`]).toBe(
      'oklch(62.7% 0.265 303.9)',
    )
  })

  it('passes non-color paint values through unchanged', () => {
    const { creator } = setup()

    const result = creator.color('fill', [], { paint: true })('url(#pattern)', {
      modifier: null,
    })

    expect(Object.values(result)).toContain('url(#pattern)')
  })
})

describe('the payload', () => {
  const parts = [
    'animation-composition',
    'animation-delay',
    'animation-direction',
    'animation-duration',
    'animation-fill-mode',
    'animation-iteration-count',
    'animation-name',
    'animation-play-state',
    'animation-range',
    'animation-timeline',
    'animation-timing-function',
  ]

  // `sink.payload` writes `{ ':root': { [stagingMarker]: kind, … } }`, so every publication is one
  // `addBase` call and several accumulate: a later declaration wins, and nothing is ever retracted.
  /** Every payload rule published so far, in order. */
  const published = (addBase: ReturnType<typeof setup>['addBase']) =>
    addBase.mock.calls
      .map(([payload]) => payload[':root'] as CssInJs | undefined)
      .filter((entry): entry is CssInJs => Boolean(entry))

  /** One kind's payload, later publications winning, with the staging prefix taken back off. */
  const payload = (
    addBase: ReturnType<typeof setup>['addBase'],
    kind: string,
  ) => {
    const prefix = `${stagingMarker}${kind}-`

    return Object.fromEntries(
      published(addBase)
        .flatMap(entry => Object.entries(entry))
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, value]) => [name.slice(prefix.length), value]),
    ) as Record<string, string>
  }

  /** What that kind's composition declares: a name that is not itself a custom property. */
  const lists = (addBase: ReturnType<typeof setup>['addBase'], kind: string) =>
    Object.fromEntries(
      Object.entries(payload(addBase, kind)).filter(
        ([name]) => !name.startsWith('--'),
      ),
    )

  /** What it resolves through: the names that are, written as the element reads them. */
  const defaults = (
    addBase: ReturnType<typeof setup>['addBase'],
    kind: string,
  ) =>
    Object.fromEntries(
      Object.entries(payload(addBase, kind)).filter(([name]) =>
        name.startsWith('--'),
      ),
    )

  it('publishes a payload per kind, before anything can read the model', () => {
    const { addBase } = setup()

    // Nothing reads the model as a side effect any more — the candidate that used to ask for the
    // carrier is gone — so construction is the publication point. Without it a page with no Jumi
    // motion at all would stage nothing, and a build that never ran the finalizer would leave no
    // trace of the protocol for the checks to find.
    const names = published(addBase).flatMap(entry => Object.keys(entry))

    expect(
      names.some(name => name.startsWith(`${stagingMarker}animations-`)),
    ).toBe(true)
    expect(
      names.some(name => name.startsWith(`${stagingMarker}transitions-`)),
    ).toBe(true)
    expect(published(addBase)).toHaveLength(4)
  })

  it('stages the composition as data bound to the declaration it becomes', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })

    const id = shorthash2('50')
    const staged = lists(addBase, 'animations')

    // Each entry is the slot reference itself. `var(--jumi-<slot>-animation-name)` is declared *on
    // the element* by the `animate-*` utility, so the list only resolves there — which is precisely
    // why the data travels instead of being published where it is read.
    expect(staged['animation-name']).toBe(
      `var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`,
    )

    // The payload is exactly the aggregate parts and nothing else. `interpolate-size` used to ride this
    // channel as a real property; it does not any more, because it is **inherited** — written on a carrier
    // it opts the whole descendant subtree in, and a child's own `width: 200px → auto` transition starts
    // interpolating because an ancestor happens to animate. Measured, and this assertion is what stops it
    // coming back.
    expect(Object.keys(staged).sort()).toEqual([...parts].sort())
    expect(staged['interpolate-size']).toBeUndefined()
  })

  it('stages the defaults under their own names, for the element that resolves them', () => {
    const { addBase, creator } = setup()

    creator.property('rotate')('45deg', { modifier: null })

    const staged = defaults(addBase, 'animations')

    // Declared on the element rather than once on `:root`, because they compose custom properties
    // the slot utilities write there — and a custom property containing `var()` resolves where it is
    // *declared*. `--jumi-animation-delay` published on `:root` resolves once, to the stagger
    // fallback, and every element inherits that literal: measured, and it stops the stagger system.
    expect(staged['--jumi-animation-delay']).toBe(
      'var(--jumi-stagger-animation-delay, 0s)',
    )
    expect(staged['--jumi-animation-duration']).toBe('1s')
    expect(staged['--jumi-rotate']).toContain('var(--jumi-rotate-')

    // Only custom properties travel, and only through base: a longhand there would sit in a weaker
    // layer, competing with the utilities supposed to beat it.
    expect(Object.keys(staged).every(name => /^--jumi-/.test(name))).toBe(true)
  })

  it('republishes when a slot registers after a publication', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    const before = published(addBase).length

    creator.property('rotate')('45deg', { modifier: null })

    // Tailwind will not revisit the utility it already emitted, so the only way that slot reaches
    // the element is a fresh publication.
    expect(published(addBase).length).toBeGreaterThan(before)

    const names = lists(addBase, 'animations')['animation-name'] as string

    expect(names).toContain('--jumi-opacity-')
    expect(names).toContain('--jumi-rotate-')
  })

  it('publishes once per change to the slot set, and not on every read', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    const before = published(addBase).length

    // Reading the oracle is not a publication point. Tailwind recompiles the accumulated candidate
    // set whenever anything changes, so the same slot set would otherwise arrive here over and over
    // — and re-saying it is pure cost, because the finalizer would build an identical rule.
    creator.animations
    creator.animations

    expect(published(addBase)).toHaveLength(before)

    creator.property('rotate')('45deg', { modifier: null })

    expect(published(addBase).length).toBeGreaterThan(before)
  })

  it('sends the defaults as a delta, never re-saying one already published', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    const before = published(addBase).length

    creator.property('rotate')('45deg', { modifier: null })
    creator.property('opacity')('25', { modifier: null })
    creator.property('opacity')('75', { modifier: null })

    // The set of defaults only ever grows, so it travels as a delta: a full snapshot on every
    // publication would rewrite every earlier property's defaults each time, which is quadratic in
    // the number of properties for no gain. A default already published never appears again.
    const repeated = published(addBase)
      .slice(before)
      .flatMap(entry => Object.entries(entry))
      .filter(
        ([name]) =>
          name === `${stagingMarker}animations---jumi-animation-duration`,
      )

    expect(repeated).toEqual([])
  })

  it('moves a re-registered value to the end of all ten lists', () => {
    // A → B → A. Re-registering a value is what a variant (`hover:`) does, and
    // `animation-composition: replace` decides the winner by list position, so
    // the first value has to land last — in every list, or the composite stops
    // being a single animation.
    const first = '50'
    const second = '25'
    const a = `--jumi-opacity-${shorthash2(first)}`
    const b = `--jumi-opacity-${shorthash2(second)}`

    const compositionFor = (sequence: string[]) => {
      const scope = setup()

      for (const value of sequence)
        scope.creator.property('opacity')(value, { modifier: null })

      return lists(scope.addBase, 'animations')
    }

    const reregistered = compositionFor([first, second, first])
    const order = compositionFor([second, first])
    const appended = compositionFor([first, second])

    // The whole composition, all eleven lists at once: `A → B → A` resolves to exactly
    // what `B → A` would have. Comparing the composition rather than each list's
    // entries is what makes the relationship atomic — and it is also the only
    // way to state it for the lists whose entries are per-attribute rather than
    // per-slot (`animation-composition` lists the same chain twice when one
    // property has two slots, so its order is not observable at all).
    expect(Object.keys(reregistered)).toHaveLength(parts.length)
    expect(reregistered).toEqual(order)
    expect(reregistered).not.toEqual(appended)

    // And the order it produced is B then A, not merely stable.
    const names = reregistered['animation-name'] as string

    expect(names.indexOf(b)).toBeGreaterThan(-1)
    expect(names.indexOf(b)).toBeLessThan(names.indexOf(a))
  })

  it('says the whole composition every time, and only when the slots moved', () => {
    const { addBase, creator } = setup()

    // With no slots at all the composition is the shared default for each longhand, which is what
    // lets an element carrying a control and no tween still resolve.
    expect(lists(addBase, 'animations')['animation-name']).toBe(
      'var(--jumi-animation-name)',
    )

    // The getter is the oracle: every ordering assertion in this file is written against it, and
    // the payload is what actually ships. The two have to agree after every mutation, not merely at
    // the end.
    const compare = (label: string) => {
      const flat = creator.animations

      for (const part of parts) {
        expect(lists(addBase, 'animations')[part], `${label} · ${part}`).toBe(
          flat[part],
        )
      }
    }

    const mutations: Array<[string, () => void]> = [
      [
        'a value on a first attribute',
        () => creator.property('opacity')('50', { modifier: null }),
      ],
      [
        'a second attribute',
        () => creator.property('rotate')('45deg', { modifier: null }),
      ],
      [
        'a third value on the first attribute',
        () => creator.property('opacity')('25', { modifier: null }),
      ],
      [
        'a re-registered value, which moves within its group',
        () => creator.property('opacity')('50', { modifier: null }),
      ],
      [
        'a phrase, which claims a slot of its own',
        () =>
          creator.property('background-color')('0:red|100:blue', {
            modifier: null,
          }),
      ],
      ['an effect', () => creator.effect('bounce-in')],
      [
        'a fourth value on the first attribute',
        () => creator.property('opacity')('75', { modifier: null }),
      ],
      ['a re-registered effect', () => creator.effect('bounce-in')],
      // A long group, so the lists stop being short: twenty slots resolve in one
      // declaration each, with nothing accumulating per slot.
      ...Array.from(
        { length: 12 },
        (_, index) =>
          [
            `value ${index + 1} of a long group`,
            () =>
              creator.property('rotate')(`${10 + index}deg`, {
                modifier: null,
              }),
          ] as [string, () => void],
      ),
    ]

    for (const [label, mutate] of mutations) {
      mutate()
      compare(label)
    }

    // One composition per mutation, on top of the one construction published — including the
    // re-registered effect, which changes nothing about *which* slots exist but does move one to
    // the end of the lists, and the lists are what is published. Reading the oracle publishes
    // nothing (see the test above); that is the gate that keeps this from being a publish-per-pass.
    const compositions = published(addBase).filter(
      entry => `${stagingMarker}animations-animation-name` in entry,
    )

    expect(compositions).toHaveLength(mutations.length + 1)

    // And a payload is bounded — one declaration per longhand, whatever the slot count. The lists get
    // longer; the payload does not get bigger. This is the property the linked representation existed to
    // provide, and stating it here means a change that reintroduces per-slot publication fails loudly
    // rather than quietly growing the stylesheet.
    for (const entry of compositions) {
      expect(Object.keys(entry)).toHaveLength(parts.length)
    }
  })
})

describe('transitions wiring', () => {
  /** Every payload rule published so far, in order. */
  const published = (addBase: ReturnType<typeof setup>['addBase']) =>
    addBase.mock.calls
      .map(([payload]) => payload[':root'] as CssInJs | undefined)
      .filter((entry): entry is CssInJs => Boolean(entry))

  /** The transitions kind's payload, later publications winning, prefix taken back off. */
  const payload = (addBase: ReturnType<typeof setup>['addBase']) => {
    const prefix = `${stagingMarker}transitions-`

    return Object.fromEntries(
      published(addBase)
        .flatMap(entry => Object.entries(entry))
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, value]) => [name.slice(prefix.length), value]),
    ) as Record<string, string>
  }

  const list = (addBase: ReturnType<typeof setup>['addBase']) =>
    payload(addBase)['transition']

  it('stages the composed list rather than a per-motion variable', () => {
    const { addBase, creator } = setup()

    creator.motion('background-color')

    // One chain per motion, inlined rather than assembled from a `--jumi-<motion>-transition`
    // variable: that variable would be dynamic too, and every dynamic declaration is another thing
    // the payload has to carry and the finalizer has to be told to write out.
    expect(list(addBase)).toContain(
      'var(--jumi-background-color-transition-property, background-color)',
    )
    expect(
      payload(addBase)['--jumi-background-color-transition'],
    ).toBeUndefined()
  })

  it('falls back to the global shorthand when no motion has been declared', () => {
    const { addBase } = setup()

    expect(payload(addBase)['--jumi-transition-duration']).toBe('0s')
    expect(payload(addBase)['--jumi-transition-behavior']).toBe('normal')

    // Staged with the same fallback, so an element with no motions composes the global shorthand
    // rather than nothing.
    expect(list(addBase)).toBe('var(--jumi-transition)')
  })

  it('declares the shorthand and the behavior on the composition', () => {
    const { addBase } = setup()

    // Both are real properties, so both ride the channel bound to a declaration — which is what
    // makes the composition complete without the finalizer knowing anything about transitions.
    expect(payload(addBase)['transition']).toBe('var(--jumi-transition)')
    expect(payload(addBase)['transition-behavior']).toBe(
      'var(--jumi-transition-behavior)',
    )
  })

  it('republishes the composed list when a motion arrives after a publication', () => {
    const { addBase, creator } = setup()
    const before = published(addBase).length

    creator.motion('scale')

    // A motion is aggregate state in the way a slot is, and the composition is built from the
    // stylesheet rather than from a utility Tailwind might revisit — so without this the new motion
    // never reaches the output. `incremental:check` pins the same thing end to end.
    expect(published(addBase).length).toBeGreaterThan(before)
    expect(list(addBase)).toContain(
      'var(--jumi-scale-transition-property, scale)',
    )
  })
})
