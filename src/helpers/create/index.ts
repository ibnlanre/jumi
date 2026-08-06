import type { AnimatableStandardPropertyType, Api, Collection, Creator, CssInJs, TailwindTheme } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'

import { assemble } from '../assemble'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getCreator({ addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>()
  const motions = new Set<string>()
  const seen = new Set<string>()

  const keyframes = new Map<string, Collection<CssInJs>>()
  const timelines = new Map<AnimatableStandardPropertyType, Set<string>>()

  const creator = {
    get animations() {
      const properties = creator.properties.reduce((acc, attribute) =>
        merge(acc, assemble(attribute)), {} as CssInJs)

      const attributes = creator.properties.concat(creator.effects)
      const animation = computeAnimationVariable(attributes)

      computePropertyKeyframes()
      computeEffectKeyframes()
      return merge(animation, properties, assemble('animation'))
    },

    effect(attribute: string): string {
      effects.add(attribute)
      keyframes.set(attribute, effectKeyframes[attribute])
      return `jumi-${attribute}`
    },

    get effects() { return Array.from(effects).sort() },

    motion(attribute: string): string {
      motions.add(attribute)
      return attribute
    },

    get motions() { return Array.from(motions).sort() },

    get properties() { return Array.from(properties).sort() },

    property(attribute: AnimatableStandardPropertyType, modifier: null | string, value: string): CssInJs {
      properties.add(attribute)

      if (modifier) {
        let stops = timelines.get(attribute)

        if (!stops) {
          stops = new Set<string>()
          timelines.set(attribute, stops)
        }

        stops.add(modifier)
      }

      const variable = modifier ? `--jumi-${attribute}-${modifier}` : `--jumi-${attribute}`

      return {
        [`--jumi-${attribute}-animation-name`]: `jumi-${attribute}`,
        [variable]: value,
      }
    },

    theme: (key: TailwindTheme, values?: Collection) => {
      return flattenColorPalette(merge(theme(key), values))
    },

    get transitions() {
      const motions = creator.motions.reduce((acc, attribute) => {
        acc[`--jumi-${attribute}-transition`] = transitionVariables(attribute)
        return acc
      }, {} as CssInJs)

      const transition
        = creator.motions.map(variables('transition')).join(', ')
          || css('var', '--jumi-transition')

      return merge({ transition }, motions, assemble('transition'))
    },
  }

  function computePropertyKeyframes() {
    timelines.forEach((stops, attribute) => {
      if (seen.has(attribute)) return

      const animationName = `jumi-${attribute}`
      const fallback = css('var', `--jumi-${attribute}`)

      const blocks = stops.size
        ? Array.from(stops).reduce((acc, stop) => {
            const variable = `--jumi-${attribute}-${stop}`
            acc[`${stop}%`] = { [attribute]: css('var', variable, fallback) }
            return acc
          }, {} as CssInJs)
        : { to: { [attribute]: fallback } }

      seen.add(attribute)
      addUtilities({ [`@keyframes ${animationName}`]: blocks })
    })
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
        }
      : { animation: css('var', '--jumi-animation') }

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

  return creator
}
