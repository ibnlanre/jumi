import type {
  AnimatableStandardPropertyType,
  Api,
  Collection,
  Creator,
  CssInJs,
  MatchComponentsPropertyFunction,
  MatchUtilitiesPropertyFunction,
  StaggerContext,
} from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { toPaintHex } from '@/helpers/paint'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyVariables } from '@/variables/property'

import { assemble } from '../assemble'

import cssEscape from 'css.escape'
import shorthash2 from 'shorthash2'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getCreator({ addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>(['animation', 'animation-composition', 'animation-timeline', 'interpolate-size'])
  const motions = new Set<string>()
  const seen = new Set<string>()

  const keyframes = new Map<string, Collection<CssInJs>>()
  const timelines = new Map<AnimatableStandardPropertyType, Set<string>>()

  // OPTIMIZATION: Using a Set allows O(1) deduplication and move-to-end,
  // replacing the O(N) Array indexOf/splice logic. JS Sets maintain insertion order.
  const values = new Map<AnimatableStandardPropertyType, Set<string>>()
  const composed = new Set<AnimatableStandardPropertyType>()

  // Deterministic alphabetical ordering for Sets of attribute/effect names.
  const sorted = <T extends string>(set: Set<T>): Array<T> => [...set].sort()

  const perValue = (attribute: AnimatableStandardPropertyType, value: string): CssInJs => {
    const id = shorthash2(value)
    let ids = values.get(attribute)

    if (!ids) {
      ids = new Set()
      values.set(attribute, ids)
    }

    // Move-to-end: a re-registered (variant/hover) value must land LAST in the
    // slot list so it wins under `animation-composition: replace`. Deleting and
    // re-adding it forces it to the back of the Set's insertion order.
    ids.delete(id)
    ids.add(id)

    return {
      [`--jumi-${attribute}-${id}-animation-name`]: `jumi-${attribute}-${id}`,
      [`--jumi-${attribute}-${id}`]: value,
    }
  }

  function computePropertyKeyframes() {
    const result: Record<string, CssInJs> = {}

    const register = (animationName: string, attribute: AnimatableStandardPropertyType, value: string) => {
      if (seen.has(animationName)) return
      seen.add(animationName)
      result[`@keyframes ${animationName}`] = { to: { [attribute]: value } }
    }

    for (const [attribute, ids] of values) {
      for (const id of ids) {
        register(`jumi-${attribute}-${id}`, attribute, css('var', `--jumi-${attribute}-${id}`))
      }
    }

    for (const attribute of composed) {
      register(`jumi-${attribute}`, attribute, css('var', `--jumi-${attribute}`))
    }

    for (const [attribute, stops] of timelines) {
      if (!stops.size) continue
      const base = css('var', `--jumi-${attribute}`)
      for (const stop of stops) {
        register(cssEscape(`jumi-${attribute}-${stop}`), attribute, propertyKeyframeValue(attribute, stop, base))
      }
    }

    if (Object.keys(result).length) addUtilities(result)
  }

  function propertyKeyframeValue(attribute: AnimatableStandardPropertyType, stop: string, fallback: string): string {
    const variable = cssEscape(`--jumi-${attribute}-${stop}`)
    const { dependencies = [], value = fallback } = propertyVariables[attribute]

    if (!dependencies.length) return css('var', variable)

    const expanded = dependencies.reduce((result, dependency) => {
      const part = propertyVariables[dependency].variable
      return result.replaceAll(`var(${part})`, `var(${cssEscape(`${part}-${stop}`)}, var(${part}))`)
    }, value)

    return css('var', variable, expanded)
  }

  function animationVariables(attribute: string, nameVar?: string, stop?: string): string {
    const timing = (part: string) => {
      const perAttribute = `--jumi-${attribute}-${part}`
      if (stop) {
        const perStop = cssEscape(`--jumi-${attribute}-${stop}-${part}`)
        return css('var', perStop, css('var', perAttribute, css('var', `--jumi-${part}`)))
      }
      return css('var', perAttribute, css('var', `--jumi-${part}`))
    }

    const name = stop
      ? css('var', cssEscape(`--jumi-${attribute}-${stop}-animation-name`), 'none')
      : css('var', nameVar ?? `--jumi-${attribute}-animation-name`, css('var', '--jumi-animation-name'))

    return join([
      name,
      timing('animation-duration'),
      timing('animation-timing-function'),
      timing('animation-delay'),
      timing('animation-iteration-count'),
      timing('animation-direction'),
      timing('animation-fill-mode'),
      timing('animation-play-state'),
    ], ' ')
  }

  function computeAnimationVariable(): CssInJs {
    const slots: Array<{ attribute: string, nameVar?: string, stop?: string, variable: string }> = []
    const shared = new Set<string>()

    for (const [attribute, ids] of values) {
      for (const id of ids) {
        slots.push({
          attribute,
          nameVar: `--jumi-${attribute}-${id}-animation-name`,
          variable: `--jumi-${attribute}-${id}-animation`,
        })
      }
    }

    for (const attribute of sorted(composed)) {
      shared.add(attribute)
    }

    for (const attribute of sorted(shared)) {
      slots.push({ attribute, variable: `--jumi-${attribute}-animation` })
    }

    for (const [attribute, stops] of timelines) {
      if (!stops.size) continue
      for (const stop of stops) {
        slots.push({ attribute, stop, variable: cssEscape(`--jumi-${attribute}-${stop}-animation`) })
      }
    }

    for (const attribute of sorted(effects)) {
      slots.push({ attribute, variable: `--jumi-${attribute}-animation` })
    }

    const animations = slots.reduce((acc, { attribute, nameVar, stop, variable }) => {
      acc[variable] = animationVariables(attribute, nameVar, stop)
      return acc
    }, {} as CssInJs)

    const baseAnimationVars = {
      'animation-composition': css('var', '--jumi-animation-composition'),
      'animation-timeline': css('var', '--jumi-animation-timeline'),
      'interpolate-size': css('var', '--jumi-interpolate-size'),
    }

    const animation = slots.length
      ? {
          animation: slots.map(({ variable }) => css('var', variable)).join(', '),
          ...baseAnimationVars,
        }
      : {
          animation: css('var', '--jumi-animation'),
          ...baseAnimationVars,
        }

    return merge(animation, animations)
  }

  const register = (attribute: AnimatableStandardPropertyType, modifier: null | string) => {
    properties.add(attribute)
    let stops = timelines.get(attribute)

    if (!stops) {
      stops = new Set<string>()
      timelines.set(attribute, stops)
    }

    if (modifier) stops.add(modifier)
  }

  function transitionVariables(attribute: string): string {
    return join([
      css('var', `--jumi-${attribute}-transition-property`, attribute),
      css('var', `--jumi-${attribute}-transition-duration`, css('var', '--jumi-transition-duration')),
      css('var', `--jumi-${attribute}-transition-timing-function`, css('var', '--jumi-transition-timing-function')),
      css('var', `--jumi-${attribute}-transition-delay`, css('var', '--jumi-transition-delay')),
    ], ' ')
  }

  function variables(type: 'animation' | 'effect' | 'transition') {
    return (attribute: string) => css('var', `--jumi-${attribute}-${type}`)
  }

  function computeEffectKeyframes() {
    for (const [attribute, effectValues] of keyframes) {
      if (seen.has(attribute)) continue
      seen.add(attribute)
      addUtilities(effectValues)
    }
  }

  const creator: Creator = {
    get animations(): CssInJs {
      const assembled = sorted(properties).reduce((acc, attribute) =>
        merge(acc, assemble(attribute)), {} as CssInJs)

      const animation = computeAnimationVariable()
      computePropertyKeyframes()
      computeEffectKeyframes()

      return merge(animation, assembled)
    },

    color: (attribute, parts = [], options: { paint?: boolean } = {}): MatchComponentsPropertyFunction => {
      const fn = creator.property(attribute, parts)
      return value => fn(options.paint ? toPaintHex(value) : value, { modifier: null })
    },

    effect(attribute): string {
      effects.add(attribute)
      keyframes.set(attribute, effectKeyframes[attribute])
      return `jumi-${attribute}`
    },

    get effects(): string[] { return sorted(effects) },

    motion(attribute): string {
      motions.add(attribute)
      return attribute
    },

    get motions(): string[] { return sorted(motions) },

    get properties(): string[] { return sorted(properties) },

    property: (attribute, parts = []): MatchComponentsPropertyFunction => {
      return (value, { modifier }) => {
        register(attribute, modifier)

        if (!parts.length && !modifier) return perValue(attribute, value)

        if (parts.length && !modifier) composed.add(attribute)

        const variable = (name: string) => {
          return modifier ? cssEscape(`--jumi-${name}-${modifier}`) : `--jumi-${name}`
        }

        const variables = parts.length
          ? parts.reduce((acc, part) => {
              const [property, transform] = Array.isArray(part) ? part : [part]
              const stored = transform ? transform(value) : value
              acc[variable(property)] = stored
              return acc
            }, {} as CssInJs)
          : { [variable(attribute)]: value }

        const animationName = modifier ? cssEscape(`jumi-${attribute}-${modifier}`) : `jumi-${attribute}`

        return modifier
          ? {
              [cssEscape(`--jumi-${attribute}-${modifier}-animation-name`)]: animationName,
              ...variables,
            }
          : {
              [`--jumi-${attribute}-animation-name`]: animationName,
              ...variables,
            }
      }
    },

    scope(part: string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        if (!modifier) return { [`--jumi-${part}`]: value }

        // OPTIMIZATION: Replaced modifier.split('.') with indexOf('.') to avoid string array allocations.
        const dotIdx = modifier.indexOf('.')
        if (dotIdx !== -1) {
          const attribute = modifier.slice(0, dotIdx)
          const stop = modifier.slice(dotIdx + 1)
          return { [cssEscape(`--jumi-${attribute}-${stop}-${part}`)]: value }
        }

        return { [`--jumi-${modifier}-${part}`]: value }
      }
    },

    stagger(part: string, expression: (context: StaggerContext) => string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        const length = modifier ? Number.parseInt(modifier, 10) : null

        const adaptive = {
          '& > *': {
            [`--jumi-stagger-${part}`]: expression({ index: null, length: null, value }),
          },
        }

        if (!length) return adaptive

        // OPTIMIZATION: Bypassed intermediate arrays & Object.fromEntries allocation.
        const fallback: Record<string, CssInJs> = {}
        for (let i = 0; i < length; i++) {
          fallback[`& > ${css(':nth-child', i + 1)}`] = {
            [`--jumi-stagger-${part}`]: expression({ index: i, length, value }),
          }
        }

        return [
          { '@supports (animation-delay: calc(sibling-index() * 1ms))': adaptive },
          { '@supports not (animation-delay: calc(sibling-index() * 1ms))': fallback },
        ]
      }
    },

    theme: (key, values) => {
      return flattenColorPalette(merge(theme(key), values))
    },

    transition(part: string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        if (!modifier) return { ...(value && { [`--jumi-transition-${part}`]: value }) }
        creator.motion(modifier)
        return { [`--jumi-${modifier}-transition-${part}`]: part === 'property' ? modifier : value }
      }
    },

    get transitions(): CssInJs {
      const activeMotions = sorted(motions)

      const motionSlots = activeMotions.reduce((acc, attribute) => {
        acc[`--jumi-${attribute}-transition`] = transitionVariables(attribute)
        return acc
      }, assemble('transition') as CssInJs)

      const transition = activeMotions.map(variables('transition')).join(', ') || css('var', '--jumi-transition')

      return merge(
        { transition, 'transition-behavior': css('var', '--jumi-transition-behavior') },
        motionSlots,
      )
    },
  }

  return creator
}
