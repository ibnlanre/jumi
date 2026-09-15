import type { Api, CssInJs } from '@/types'

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

describe('per-attribute timing controls', () => {
  const cases: Array<[string, string, string]> = [
    ['animation-delay', '2000ms', 'width'],
    ['animation-duration', '3000ms', 'rotate'],
    ['animation-direction', 'alternate', 'width'],
    ['animation-fill-mode', 'both', 'rotate'],
    ['animation-iteration-count', '3', 'scale'],
    ['animation-play-state', 'paused', 'width'],
    ['animation-timing-function', 'ease', 'scale'],
  ]

  it.each(cases)('scopes %s to its property', (control, value, modifier) => {
    const { controls } = setup()

    expect(controls[control].fn(value, { modifier })).toEqual({
      [`--jumi-${modifier}-${control}`]: value,
    })
  })

  it('addresses a name in the label namespace, which no property can occupy', () => {
    const { controls } = setup()

    // One class, one address, and the split is what makes that true: a structural token reads the
    // property scope, and anything else reads the motion that declared it as a name. Sharing one
    // namespace, `animation-duration-1000/scale` reached the scale property *and* every motion named
    // `scale` — measured, and it cost an author their own `/rotate` control on such a motion.
    expect(
      controls['animation-duration'].fn('1000ms', { modifier: 'scale' }),
    ).toEqual({ '--jumi-scale-animation-duration': '1000ms' })

    expect(
      controls['animation-duration'].fn('400ms', { modifier: 'flick' }),
    ).toEqual({ '--jumi-label-flick-animation-duration': '400ms' })

    // An effect is a structural address too: it is a motion's name in the same sense a property is,
    // and `animate-fade-in/fade-in` has to keep reaching it.
    expect(
      controls['animation-duration'].fn('600ms', { modifier: 'fade-in' }),
    ).toEqual({ '--jumi-fade-in-animation-duration': '600ms' })
  })

  it('writes the global variable without a modifier', () => {
    const { controls } = setup()

    expect(
      controls['animation-direction'].fn('alternate', { modifier: null }),
    ).toEqual({
      '--jumi-animation-direction': 'alternate',
    })
  })

  it('addresses a labelled animation with the label as its modifier', () => {
    const { controls } = setup()

    // `/rotate-flick` is the animation whose declaration carried that name — how two animations of one
    // property, summed by `animation-composition: add`, are given independent timing. A slot that is
    // never addressed reads the property's variable instead. The label namespace is what keeps the two
    // readings apart: `--jumi-rotate-animation-timing-function` is the rotate property's scope, and no
    // name can be it.
    expect(
      controls['animation-timing-function'].fn('ease-out', {
        modifier: 'rotate-flick',
      }),
    ).toEqual({
      '--jumi-label-rotate-flick-animation-timing-function': 'ease-out',
    })
  })

  it('records an addressed phrase as intent, and never as a value', () => {
    const { controls } = setup()

    // The record is the whole model-side job of segment easing. It carries the address and the phrase — the
    // address first, because an address is guaranteed whitespace-free and a phrase may contain anything else
    // an easing function uses — and it resolves nothing: which instances an address reaches is a fact about
    // the finished stylesheet, which a candidate compiled once can never know.
    const recorded = controls['animation-timing-function'].fn('0:step-start', {
      modifier: 'first',
    }) as CssInJs
    const [property] = Object.keys(recorded)

    // The kind is in the property and the hash is what keeps two addresses on one rule from overwriting each
    // other; the facts are in the value. Asserting the data rather than a literal hash keeps this test about
    // the record and not about the hash function.
    expect(property).toMatch(/^--jumi-segment-[\w-]+$/)
    expect(recorded[property]).toBe('first 0:step-start')

    // And the phrase is nowhere near the chain, at any address: written into it, the shorthand becomes
    // invalid at computed-value time and the motion vanishes (measured — `animation-name: none`, zero
    // animations).
    expect(recorded).not.toHaveProperty(
      '--jumi-label-first-animation-timing-function',
    )
    expect(recorded).not.toHaveProperty('--jumi-animation-timing-function')
  })

  it('emits nothing for a phrase on a part the shorthand carries', () => {
    const { controls } = setup()

    // Measured: written into the chain, this left the element with `animation-name: none`, `0s` and *zero*
    // animations — the shorthand is one declaration, so one invalid component takes the motion with it.
    //
    // An unaddressed phrase emits **nothing**: with no address there is no intent to act on, and the shape is
    // unsupported, which is the answer a framework gives a candidate it does not recognize. Nothing is
    // recorded either, because a record exists to be acted on.
    expect(
      controls['animation-timing-function'].fn('0:ease-out', {
        modifier: null,
      }),
    ).toEqual({})

    // Every other part of the shorthand, because it is the shorthand that cannot hold a phrase and not one
    // chain — and only `animation-timing-function` has a segment form to record.
    expect(
      controls['animation-duration'].fn('0:1s', { modifier: 'flick' }),
    ).toEqual({})

    // A scalar is untouched: this is a guard about phrases, and it must not read as one about controls.
    expect(
      controls['animation-timing-function'].fn('ease-out', { modifier: null }),
    ).toEqual({ '--jumi-animation-timing-function': 'ease-out' })
  })

  it('leaves a phrase on a part the shorthand cannot carry alone', () => {
    const { controls } = setup()

    // The boundary is the shorthand and not the prefix. `animation-composition`, `animation-range` and
    // `animation-timeline` are declared on their own, so a phrase there costs one longhand — which the
    // fallback chain repairs — rather than the whole `animation` value. Guarding those too would be a
    // wider rule than the failure justifies.
    expect(
      controls['animation-composition'].fn('0:add', { modifier: 'flick' }),
    ).toEqual({ '--jumi-label-flick-animation-composition': '0:add' })
  })
})
describe('transition controls', () => {
  it.each([
    ['transition-property', 'background-color'],
    ['transition-duration', 'background-color'],
    ['transition-delay', 'background-color'],
    ['transition-timing-function', 'background-color'],
  ])(
    '%s with a `/{attr}` modifier registers the attribute as a motion',
    (control, modifier) => {
      const { controls, creator } = setup()
      const motion = vi.spyOn(creator, 'motion')

      controls[control].fn('value', { modifier })

      expect(motion).toHaveBeenCalledWith(modifier)
    },
  )

  it('writes the scoped timing var alongside the motion registration', () => {
    const { controls } = setup()

    expect(
      controls['transition-duration'].fn('500ms', {
        modifier: 'background-color',
      }),
    ).toEqual({
      '--jumi-background-color-transition-duration': '500ms',
    })
  })

  it('keeps the global form when no modifier is present', () => {
    const { controls } = setup()

    expect(
      controls['transition-behavior'].fn('allow-discrete', { modifier: null }),
    ).toEqual({
      '--jumi-transition-behavior': 'allow-discrete',
    })
  })
})
describe('stagger utilities', () => {
  it('uses a count-free sibling-index() rule when no count modifier is given', () => {
    const { controls } = setup()

    expect(
      controls['animate-stagger-forward'].fn('100ms', { modifier: null }),
    ).toEqual({
      '& > *': {
        '--jumi-stagger-animation-delay': 'calc((sibling-index() - 1) * 100ms)',
      },
    })
  })

  it('uses sibling-count() and sibling-index() for a count-free backward stagger', () => {
    const { controls } = setup()

    expect(
      controls['animate-stagger-backward'].fn('150ms', { modifier: null }),
    ).toEqual({
      '& > *': {
        '--jumi-stagger-animation-delay':
          'calc((sibling-count() - sibling-index()) * 150ms)',
      },
    })
  })

  it('prefers the adaptive rule and emits an nth-child fallback when a count is given', () => {
    const { controls } = setup()

    expect(
      controls['animate-stagger-forward'].fn('100ms', { modifier: '5' }),
    ).toEqual([
      {
        '@supports (animation-delay: calc(sibling-index() * 1ms))': {
          '& > *': {
            '--jumi-stagger-animation-delay':
              'calc((sibling-index() - 1) * 100ms)',
          },
        },
      },
      {
        '@supports not (animation-delay: calc(sibling-index() * 1ms))': {
          '& > :nth-child(1)': {
            '--jumi-stagger-animation-delay': 'calc(100ms * 0)',
          },
          '& > :nth-child(2)': {
            '--jumi-stagger-animation-delay': 'calc(100ms * 1)',
          },
          '& > :nth-child(3)': {
            '--jumi-stagger-animation-delay': 'calc(100ms * 2)',
          },
          '& > :nth-child(4)': {
            '--jumi-stagger-animation-delay': 'calc(100ms * 3)',
          },
          '& > :nth-child(5)': {
            '--jumi-stagger-animation-delay': 'calc(100ms * 4)',
          },
        },
      },
    ])
  })

  it('reverses the nth-child fallback for a backward stagger', () => {
    const { controls } = setup()

    expect(
      controls['animate-stagger-backward'].fn('150ms', { modifier: '4' }),
    ).toEqual([
      {
        '@supports (animation-delay: calc(sibling-index() * 1ms))': {
          '& > *': {
            '--jumi-stagger-animation-delay':
              'calc((sibling-count() - sibling-index()) * 150ms)',
          },
        },
      },
      {
        '@supports not (animation-delay: calc(sibling-index() * 1ms))': {
          '& > :nth-child(1)': {
            '--jumi-stagger-animation-delay': 'calc(150ms * 3)',
          },
          '& > :nth-child(2)': {
            '--jumi-stagger-animation-delay': 'calc(150ms * 2)',
          },
          '& > :nth-child(3)': {
            '--jumi-stagger-animation-delay': 'calc(150ms * 1)',
          },
          '& > :nth-child(4)': {
            '--jumi-stagger-animation-delay': 'calc(150ms * 0)',
          },
        },
      },
    ])
  })
})
