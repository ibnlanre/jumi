import type { AnimatableStandardPropertyType, Api, Collection, Creator, CssInJs, MatchUtilitiesPropertyFunction } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyVariables } from '@/variables/property'

import { assemble } from '../assemble'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
export function getCreator({ addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>()
  const motions = new Set<string>()
  const seen = new Set<string>()
  const sizing = new Set<AnimatableStandardPropertyType>([
    'block-size',
    'flex-basis',
    'height',
    'inline-size',
    'max-block-size',
    'max-height',
    'max-inline-size',
    'max-width',
    'min-block-size',
    'min-height',
    'min-inline-size',
    'min-width',
    'width',
  ])

  const keyframes = new Map<string, Collection<CssInJs>>()
  const timelines = new Map<AnimatableStandardPropertyType, Set<string>>()

  function computePropertyKeyframes() {
    timelines.forEach((stops, attribute) => {
      if (seen.has(attribute)) return

      const animationName = `jumi-${attribute}`
      const base = css('var', `--jumi-${attribute}`)
      const fallback = sizing.has(attribute)
        ? css('calc-size', base, 'size')
        : base

      const blocks = stops.size
        ? Array.from(stops).reduce((acc, stop) => {
            acc[`${stop}%`] = { [attribute]: propertyKeyframeValue(attribute, stop, fallback) }
            return acc
          }, {} as CssInJs)
        : { to: { [attribute]: fallback } }

      seen.add(attribute)
      addUtilities({ [`@keyframes ${animationName}`]: blocks })
    })
  }

  function propertyKeyframeValue(attribute: AnimatableStandardPropertyType, stop: string, fallback: string): string {
    const variable = `--jumi-${attribute}-${stop}`
    const { dependencies = [], value } = propertyVariables[attribute]

    if (!dependencies.length) return css('var', variable, fallback)

    const expanded = dependencies.reduce((result, dependency) => {
      const part = propertyVariables[dependency]?.variable ?? `--jumi-${dependency}`
      return result.replaceAll(`var(${part})`, `var(${part}-${stop}, var(${part}))`)
    }, value ?? fallback)

    return css('var', variable, expanded)
  }

  function computeAnimationVariable(attributes: string[]): CssInJs {
    const longhand = (constituent: string) => {
      return attributes.map((attribute) => {
        const variable = `--jumi-${attribute}-animation-${constituent}`
        const fallback = css('var', `--jumi-animation-${constituent}`)

        return css('var', variable, fallback)
      }).join(', ') || css('var', `--jumi-animation-${constituent}`)
    }

    const animation = attributes.length
      ? {
          'animation-composition': longhand('composition'),
          'animation-delay': longhand('delay'),
          'animation-direction': longhand('direction'),
          'animation-duration': longhand('duration'),
          'animation-fill-mode': longhand('fill-mode'),
          'animation-iteration-count': longhand('iteration-count'),
          'animation-name': longhand('name'),
          'animation-play-state': longhand('play-state'),
          'animation-timeline': longhand('timeline'),
          'animation-timing-function': longhand('timing-function'),
          'interpolate-size': css('var', '--jumi-interpolate-size'),
        }
      : {
          'animation': css('var', '--jumi-animation'),
          'interpolate-size': css('var', '--jumi-interpolate-size'),
        }

    return animation
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
    return (attribute: string) => {
      const variable = join(['--jumi', attribute, type], '-')
      return css('var', variable)
    }
  }

  function computeEffectKeyframes() {
    keyframes.forEach((timelines, attribute) => {
      if (seen.has(attribute)) return
      seen.add(attribute)
      addUtilities(timelines)
    })
  }

  const creator = {
    get animations(): CssInJs {
      const properties = creator.properties.reduce((acc, attribute) =>
        merge(acc, assemble(attribute)), {} as CssInJs)

      const attributes = creator.properties.concat(creator.effects)
      const animation = computeAnimationVariable(attributes)

      computePropertyKeyframes()
      computeEffectKeyframes()

      return merge(animation, properties, assemble('animation'))
    },

    effect(attribute): string {
      effects.add(attribute)
      keyframes.set(attribute, effectKeyframes[attribute])
      return `jumi-${attribute}`
    },

    get effects(): string[] { return Array.from(effects).sort() },

    motion(attribute): string {
      motions.add(attribute)
      return attribute
    },

    get motions(): string[] { return Array.from(motions).sort() },

    get properties(): string[] { return Array.from(properties).sort() },

    property: (attribute, parts = []): MatchUtilitiesPropertyFunction => {
      const register = (modifier: null | string) => {
        properties.add(attribute)
        let stops = timelines.get(attribute)

        if (!stops) {
          stops = new Set<string>()
          timelines.set(attribute, stops)
        }

        if (modifier) stops.add(modifier)
      }

      return (value, { modifier }) => {
        register(modifier)

        const variable = (name: string) => {
          return modifier ? `--jumi-${name}-${modifier}` : `--jumi-${name}`
        }

        const variables = parts.length
          ? parts.reduce((acc, part) => {
              const [property, transform] = Array.isArray(part) ? part : [part]
              const stored = transform ? transform(value) : value
              acc[variable(property)] = stored
              return acc
            }, {} as CssInJs)
          : { [variable(attribute)]: value }

        return {
          [`--jumi-${attribute}-animation-name`]: `jumi-${attribute}`,
          ...variables,
        }
      }
    },

    theme: (key, values) => {
      return flattenColorPalette(merge(theme(key), values))
    },

    get transitions(): CssInJs {
      const motions = creator.motions.reduce((acc, attribute) => {
        acc[`--jumi-${attribute}-transition`] = transitionVariables(attribute)
        return acc
      }, {} as CssInJs)

      const transition
        = creator.motions.map(variables('transition')).join(', ')
          || css('var', '--jumi-transition')

      return merge({ transition }, motions, assemble('transition'))
    },
  } satisfies Creator

  return creator
}
