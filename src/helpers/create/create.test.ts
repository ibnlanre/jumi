import type { Api, CssInJs } from '@/types'

import { describe, expect, it, vi } from 'vitest'

import { carrierMarker, stagingMarker } from '@/helpers/carriers'
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

    creator.property('rotate')('0:0deg,58:0deg', { modifier: 'rotate-flick' })
    creator.property('rotate')('0:0deg,100:90deg', { modifier: null })
    const animations = creator.animations

    // A labelled slot reads its label's variable first, so `/[rotate-flick]`
    // times that animation on its own — which is how two animations of one
    // property, summed by `animation-composition: add`, are timed apart. The
    // label is the whole handle: the property is not repeated in front of it.
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

  it('registers every link a labelled slot reads, so a label cannot inherit', () => {
    const { addBase, creator } = setup()

    creator.property('rotate')('0:16deg,58:0deg', { modifier: 'flick' })
    creator.animations

    const utilities = registered(addBase)
    const parts = Object.keys(creator.animations)
      .filter(part => part.startsWith('animation-') && part !== 'animation-name')

    expect(parts.length).toBeGreaterThan(0)

    for (const part of parts) {
      expect(utilities[`@property --jumi-flick-${part}`]).toEqual({
        inherits: 'false',
        syntax: '"*"',
      })
    }
  })

  it('leaves the link inheritable when a label is the attribute name', () => {
    const { addBase, creator } = setup()

    // `/[rotate]` on `animate-rotate` resolves to the property scope's own
    // variable, so registering it here would make a scope stop cascading.
    creator.property('rotate')('0:16deg,58:0deg', { modifier: 'rotate' })
    creator.animations

    const utilities = registered(addBase)

    expect(utilities['@property --jumi-rotate-animation-duration']).toBeUndefined()
    expect(utilities['@property --jumi-rotate-animation-timing-function']).toBeUndefined()
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

  it('leaves the shared animation controls unregistered', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.effect('fade-in')
    creator.animations

    // Unregistered is not the same as cascading: `.animations` declares these
    // defaults on every element, and a declaration beats inheritance, so a
    // global control written on an ancestor never reaches a descendant's
    // animations. Registering them would add a block per name and change
    // nothing a page could observe.
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

describe('the aggregate', () => {
  const parts = [
    'animation-composition',
    'animation-delay',
    'animation-direction',
    'animation-duration',
    'animation-fill-mode',
    'animation-iteration-count',
    'animation-name',
    'animation-play-state',
    'animation-timeline',
    'animation-timing-function',
  ]

  // `sink.aggregate` writes `{ ':root': {…} }`, so every publish is one `addBase`
  // call. Several are expected and they accumulate: a later declaration wins, and
  // nothing is ever retracted.
  /** Every name a publication carries: the ten animation lists, plus the composed transition list. */
  const stagedNames = [...parts, 'transition'].map(part => `--jumi-aggregate-${part}`)
  const staged = (addBase: ReturnType<typeof setup>['addBase']) =>
    addBase.mock.calls
      .map(([payload]) => payload[':root'] as CssInJs | undefined)
      .filter((lists): lists is CssInJs => Boolean(lists))

  /** Every declaration staged so far, later publications winning. */
  const data = (addBase: ReturnType<typeof setup>['addBase']) =>
    Object.assign({}, ...staged(addBase)) as Record<string, string>

  /** The aggregate alone: exactly what `@/helpers/carriers` materializes into a carrier. */
  const lists = (addBase: ReturnType<typeof setup>['addBase']) =>
    Object.fromEntries(Object.entries(data(addBase)).filter(([name]) => name !== stagingMarker))

  it('marks the carrier, because the carrier is what has to be found in the output', () => {
    const { creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    const utility = creator.animationUtility

    // The marker is a declaration on the carrier body, so whatever Tailwind does with
    // that body — re-parenting it for a variant, copying it for `@apply` — it goes
    // with it. That is how the finalizer finds every place the aggregate has to be
    // written, including the places a literal selector cannot name.
    expect(utility[carrierMarker]).toBe('animations')

    // The `animation-*` declarations are reads, not data: each names a part in the staging
    // namespace and falls back to the matching control. They are how the carrier says which parts
    // it wants, so the finalizer writes exactly those and no others — which is also what keeps
    // this carrier and the `transitions` one from being handed each other's list.
    const declared = Object.keys(utility).filter(name => name.startsWith('animation-'))

    expect(declared.sort()).toEqual([...parts].sort())
    expect(utility['animation-name'])
      .toBe('var(--jumi-aggregate-animation-name, var(--jumi-animation-name))')
    expect(utility['interpolate-size']).toBe('var(--jumi-interpolate-size)')
  })

  it('stages the ten flat lists on a rule nothing reads, marked for the finalizer', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animationUtility

    const id = shorthash2('50')

    // The whole aggregate, all eleven lists, and nothing else but the marker that says
    // what they are.
    expect(Object.keys(data(addBase)).sort())
      .toEqual([...stagedNames, stagingMarker].sort())

    // Each entry is the slot reference itself. `var(--jumi-<slot>-animation-name)` is
    // declared *on the element* by the `animate-*` utility, so these lists only
    // resolve where the carrier ended up — which is precisely why they are staged
    // rather than published.
    expect(lists(addBase)['--jumi-aggregate-animation-name'])
      .toBe(`var(--jumi-opacity-${id}-animation-name, var(--jumi-animation-name))`)

    // Only custom properties travel, and only through base: a longhand there would sit
    // in a weaker layer, competing with the utilities supposed to beat it.
    expect(Object.keys(data(addBase)).every(name => /^--jumi-/.test(name))).toBe(true)
  })

  it('republishes when a slot registers after a pass has already published', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animationUtility // a pass publishes the chain it can see
    creator.property('rotate')('45deg', { modifier: null }) // …then a slot appears

    // Tailwind will not revisit the candidate it cached, so the only way that
    // slot reaches the element is a fresh publication.
    expect(staged(addBase)).toHaveLength(2)

    const names = lists(addBase)['--jumi-aggregate-animation-name'] as string

    expect(names).toContain('--jumi-opacity-')
    expect(names).toContain('--jumi-rotate-')
  })

  it('publishes once per change to the slot set, not once per read', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animationUtility

    // Tailwind recompiles the accumulated candidate set whenever anything changed, so
    // the same slot set arrives here over and over. Re-saying it is pure cost — the
    // finalizer would inject an identical declaration — so a publication is gated on
    // the registration count rather than on being read.
    creator.animationUtility
    creator.animations
    creator.animationUtility

    expect(staged(addBase)).toHaveLength(1)

    creator.property('rotate')('45deg', { modifier: null })
    creator.animationUtility

    expect(staged(addBase)).toHaveLength(2)
  })

  it('publishes nothing until the utility is read', () => {
    const { addBase, creator } = setup()

    creator.property('opacity')('50', { modifier: null })
    creator.animations

    // The data getter is not a publish point: a parse with no carrier candidate emits
    // no rule to consume the data, so there is nothing to publish.
    expect(staged(addBase)).toEqual([])
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

    const aggregateFor = (sequence: string[]) => {
      const scope = setup()

      for (const value of sequence) scope.creator.property('opacity')(value, { modifier: null })
      scope.creator.animationUtility

      return lists(scope.addBase)
    }

    const reregistered = aggregateFor([first, second, first])
    const order = aggregateFor([second, first])
    const appended = aggregateFor([first, second])

    // The whole aggregate, all ten lists at once: `A → B → A` resolves to exactly
    // what `B → A` would have. Comparing the aggregate rather than each list's
    // entries is what makes the relationship atomic — and it is also the only
    // way to state it for the lists whose entries are per-attribute rather than
    // per-slot (`animation-composition` lists the same chain twice when one
    // property has two slots, so its order is not observable at all).
    expect(Object.keys(reregistered)).toHaveLength(stagedNames.length)
    expect(reregistered).toEqual(order)
    expect(reregistered).not.toEqual(appended)

    // And the order it produced is B then A, not merely stable.
    const names = reregistered['--jumi-aggregate-animation-name'] as string

    expect(names.indexOf(b)).toBeGreaterThan(-1)
    expect(names.indexOf(b)).toBeLessThan(names.indexOf(a))
  })

  it('says the whole aggregate every time, and only when the slots moved', () => {
    const { addBase, creator } = setup()

    // A pass publishes what it can see. With no slots at all the aggregate is the
    // shared default for each longhand, which is what the fallback in the carrier's
    // declaration duplicates — and what makes a carrier with no slots still resolve.
    creator.animationUtility
    expect(staged(addBase)).toHaveLength(1)
    expect(lists(addBase)['--jumi-aggregate-animation-name']).toBe('var(--jumi-animation-name)')

    // The getter is the oracle: every ordering assertion in this file is written
    // against it, and staging is what actually ships. The two have to agree after
    // every mutation, not merely at the end.
    const compare = (label: string) => {
      const flat = creator.animations

      for (const part of parts) {
        expect(lists(addBase)[`--jumi-aggregate-${part}`], `${label} · ${part}`).toBe(flat[part])
      }
    }

    const mutations: Array<[string, () => void]> = [
      ['a value on a first attribute', () => creator.property('opacity')('50', { modifier: null })],
      ['a second attribute', () => creator.property('rotate')('45deg', { modifier: null })],
      ['a third value on the first attribute', () => creator.property('opacity')('25', { modifier: null })],
      ['a re-registered value, which moves within its group', () => creator.property('opacity')('50', { modifier: null })],
      ['a phrase, which claims a slot of its own', () => creator.property('background-color')('0:red,100:blue', { modifier: null })],
      ['an effect', () => creator.effect('bounce-in')],
      ['a fourth value on the first attribute', () => creator.property('opacity')('75', { modifier: null })],
      ['a re-registered effect', () => creator.effect('bounce-in')],
      // A long group, so the lists stop being short: twenty slots resolve in one
      // declaration each, with nothing accumulating per slot.
      ...Array.from({ length: 12 }, (_, index) => [
        `value ${index + 1} of a long group`,
        () => creator.property('rotate')(`${10 + index}deg`, { modifier: null }),
      ] as [string, () => void]),
    ]

    for (const [label, mutate] of mutations) {
      mutate()
      compare(label)
    }

    // One publication per mutation, on top of the one the first pass made — including
    // the re-registered effect, which changes nothing about *which* slots exist but
    // does move one to the end of the lists, and the lists are what is published.
    // A read that follows no registration publishes nothing (see the test above);
    // that is the gate that keeps this from being a publish-per-pass.
    const publications = staged(addBase)

    expect(publications).toHaveLength(mutations.length + 1)

    // And a publication is bounded — one declaration per longhand plus the marker,
    // whatever the slot count. The lists get longer; the publication does not get
    // bigger. This is the property the linked representation existed to provide, and
    // it is stated here so that a future change that reintroduces per-slot emission
    // fails loudly rather than quietly growing the stylesheet.
    for (const payload of publications) {
      expect(Object.keys(payload)).toHaveLength(stagedNames.length + 1)
    }
  })
})

describe('transitions wiring', () => {
  /** Every declaration staged so far, later publications winning. */
  const stagedLists = (addBase: ReturnType<typeof setup>['addBase']) =>
    Object.assign({}, ...addBase.mock.calls
      .map(([payload]) => payload[':root'] as CssInJs | undefined)
      .filter((lists): lists is CssInJs => Boolean(lists))) as Record<string, string>

  const list = (addBase: ReturnType<typeof setup>['addBase']) =>
    stagedLists(addBase)['--jumi-aggregate-transition']

  it('marks the carrier and leaves the composed list to staging', () => {
    const { addBase, creator } = setup()

    creator.motion('background-color')
    const transitions = creator.transitions

    // Constant, like `animations`: the marker, the fallback the composed list replaces, and the
    // controls. Nothing in the body depends on which motions exist.
    expect(transitions[carrierMarker]).toBe('transitions')
    expect(transitions['transition']).toBe('var(--jumi-transition)')
    expect(transitions['transition-behavior']).toBe('var(--jumi-transition-behavior)')

    // The list itself is staged, one chain per motion, inlined rather than assembled from a
    // `--jumi-<motion>-transition` variable — that variable would be dynamic too, and every dynamic
    // declaration is another part the finalizer would have to be told to write.
    expect(list(addBase)).toContain(
      'var(--jumi-background-color-transition-property, background-color)',
    )
    expect(transitions['--jumi-background-color-transition']).toBeUndefined()
  })

  it('falls back to the global shorthand when no motion has been declared', () => {
    const { addBase, creator } = setup()
    const transitions = creator.transitions

    expect(transitions['transition']).toBe('var(--jumi-transition)')
    expect(transitions['transition-behavior']).toBe('var(--jumi-transition-behavior)')
    expect(transitions['--jumi-transition-behavior']).toBe('normal')

    // Staged with the same fallback, so a carrier with no motions materializes the global
    // shorthand rather than nothing.
    expect(list(addBase)).toBe('var(--jumi-transition)')
  })

  it('republishes the composed list when a motion arrives after a pass published', () => {
    const { addBase, creator } = setup()

    creator.animationUtility // a pass publishes
    const before = addBase.mock.calls.length

    creator.motion('scale')

    // A motion is aggregate state in the way a slot is, and `transitions` is a candidate Tailwind
    // compiled once and will not revisit — so without this the new motion never reaches the
    // carrier. `incremental:check` pins the same thing end to end.
    expect(addBase.mock.calls.length).toBe(before + 1)
    expect(list(addBase)).toContain('var(--jumi-scale-transition-property, scale)')
  })
})
