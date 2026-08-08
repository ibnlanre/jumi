import type { AnimatableStandardPropertyType, Api, Collection, Creator, CssInJs, MatchComponentsPropertyFunction, MatchUtilitiesPropertyFunction } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyVariables } from '@/variables/property'

import { assemble } from '../assemble'

import shorthash2 from 'shorthash2'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getCreator({ addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>()
  const motions = new Set<string>()
  const seen = new Set<string>()

  const keyframes = new Map<string, Collection<CssInJs>>()
  const timelines = new Map<AnimatableStandardPropertyType, Set<string>>()
  const values = new Map<AnimatableStandardPropertyType, Set<string>>()
  const composed = new Set<AnimatableStandardPropertyType>()

  // Deterministic alphabetical ordering for Sets of attribute/effect names.
  // Per-value keyframe slots are deliberately NOT sorted: they rely on
  // registration order so base values stay ahead of variant (hover) values.
  const sorted = <T extends string>(set: Set<T>): T[] => Array.from(set).sort()

  // Per-value (no-stop) emission: a unique keyframe per value + target var, so
  // base and hover values coexist with independent keyframes. Used by the
  // simple (no parts, no modifier) branch of `property()`.
  const perValue = (attribute: AnimatableStandardPropertyType, value: string): CssInJs => {
    const id = shorthash2(value)
    let ids = values.get(attribute)

    if (!ids) {
      ids = new Set<string>()
      values.set(attribute, ids)
    }

    ids.add(id)

    return {
      [`--jumi-${attribute}-${id}-animation-name`]: `jumi-${attribute}-${id}`,
      [`--jumi-${attribute}-${id}`]: value,
    }
  }

  function computePropertyKeyframes() {
    // Per-value (no-stop) keyframes: a unique keyframe per value lets base and
    // hover keyframes coexist in the animation-name list (smooth transitions),
    // while a `to`-only body derives the from-state from the element's current
    // computed value, so native classes like `w-8` act as the resting state.
    // Note: no `calc-size` wrapper here — `interpolate-size: allow-keywords`
    // (set by `.animations`) already enables smooth `auto`→length tweens, and
    // wrapping the target in `calc-size(var(...), size)` actually snaps them.
    values.forEach((ids, attribute) => {
      ids.forEach((id) => {
        const animationName = `jumi-${attribute}-${id}`
        if (seen.has(animationName)) return
        seen.add(animationName)

        const base = css('var', `--jumi-${attribute}-${id}`)
        addUtilities({ [`@keyframes ${animationName}`]: { to: { [attribute]: base } } })
      })
    })

    // Composed (parts) keyframes: a shared `to`-only keyframe reading the
    // composed attribute variable.
    composed.forEach((attribute) => {
      const animationName = `jumi-${attribute}`
      if (seen.has(animationName)) return
      seen.add(animationName)

      const base = css('var', `--jumi-${attribute}`)
      addUtilities({ [`@keyframes ${animationName}`]: { to: { [attribute]: base } } })
    })

    // Stop usage: explicit `{stop}%` blocks reading the per-stop variables.
    timelines.forEach((stops, attribute) => {
      const animationName = `jumi-${attribute}-stops`

      if (!stops.size || seen.has(animationName)) return
      seen.add(animationName)

      const base = css('var', `--jumi-${attribute}`)
      const blocks = Array.from(stops).reduce((acc, stop) => {
        acc[`${stop}%`] = { [attribute]: propertyKeyframeValue(attribute, stop, base) }
        return acc
      }, {} as CssInJs)

      addUtilities({ [`@keyframes ${animationName}`]: blocks })
    })
  }

  function propertyKeyframeValue(attribute: AnimatableStandardPropertyType, stop: string, fallback: string): string {
    const variable = `--jumi-${attribute}-${stop}`
    const { dependencies = [], value } = propertyVariables[attribute]

    // No `var(--jumi-{attribute})` fallback: an unset stop variable makes this
    // declaration invalid at computed-value time, so a stop block belonging to
    // ANOTHER element sharing the keyframe is dropped instead of snapping to
    // the `auto` base.
    if (!dependencies.length) return css('var', variable)

    const expanded = dependencies.reduce((result, dependency) => {
      const part = propertyVariables[dependency]?.variable ?? `--jumi-${dependency}`
      return result.replaceAll(`var(${part})`, `var(${part}-${stop}, var(${part}))`)
    }, value ?? fallback)

    return css('var', variable, expanded)
  }

  function animationVariables(attribute: string, nameVar?: string): string {
    return join([
      css('var', nameVar ?? `--jumi-${attribute}-animation-name`, css('var', '--jumi-animation-name')),
      css('var', `--jumi-${attribute}-animation-duration`, css('var', '--jumi-animation-duration')),
      css('var', `--jumi-${attribute}-animation-timing-function`, css('var', '--jumi-animation-timing-function')),
      css('var', `--jumi-${attribute}-animation-delay`, css('var', '--jumi-animation-delay')),
      css('var', `--jumi-${attribute}-animation-iteration-count`, css('var', '--jumi-animation-iteration-count')),
      css('var', `--jumi-${attribute}-animation-direction`, css('var', '--jumi-animation-direction')),
      css('var', `--jumi-${attribute}-animation-fill-mode`, css('var', '--jumi-animation-fill-mode')),
      css('var', `--jumi-${attribute}-animation-play-state`, css('var', '--jumi-animation-play-state')),
    ], ' ')
  }

  function computeAnimationVariable(): CssInJs {
    const slots: Array<{ attribute: string, nameVar?: string, variable: string }> = []
    const shared = new Set<string>()

    // Per-value slots: one full animation cycle per registered value, so base
    // and hover values coexist in the animation-name list. Registration order
    // (base utilities are matched before variant utilities) puts base values
    // first and variant values last, so the active/hover keyframe wins under
    // `replace` composition.
    values.forEach((ids, attribute) => {
      Array.from(ids).forEach((id) => {
        slots.push({
          attribute,
          nameVar: `--jumi-${attribute}-${id}-animation-name`,
          variable: `--jumi-${attribute}-${id}-animation`,
        })
      })
    })

    // Shared slots for composed attributes (parts-based values).
    sorted(composed).forEach((attribute) => {
      shared.add(attribute)
    })

    // Shared slots for stop-based attributes.
    timelines.forEach((stops, attribute) => {
      if (stops.size) shared.add(attribute)
    })

    sorted(shared).forEach((attribute) => {
      slots.push({ attribute, variable: `--jumi-${attribute}-animation` })
    })

    // Effect slots (each effect is its own full cycle).
    sorted(effects).forEach((attribute) => {
      slots.push({ attribute, variable: `--jumi-${attribute}-animation` })
    })

    const animations = slots.reduce((acc, { attribute, nameVar, variable }) => {
      acc[variable] = animationVariables(attribute, nameVar)
      return acc
    }, {} as CssInJs)

    const animation = slots.length
      ? {
          'animation': slots.map(({ variable }) => css('var', variable)).join(', '),
          'animation-composition': css('var', '--jumi-animation-composition'),
          'animation-timeline': css('var', '--jumi-animation-timeline'),
          'interpolate-size': css('var', '--jumi-interpolate-size'),
        }
      : {
          'animation': css('var', '--jumi-animation'),
          'animation-composition': css('var', '--jumi-animation-composition'),
          'animation-timeline': css('var', '--jumi-animation-timeline'),
          'interpolate-size': css('var', '--jumi-interpolate-size'),
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

      const animation = computeAnimationVariable()

      computePropertyKeyframes()
      computeEffectKeyframes()

      return merge(
        animation,
        properties,
        assemble('animation'),
        assemble('animation-composition'),
        assemble('animation-timeline'),
        assemble('interpolate-size'),
      )
    },

    color: (attribute, parts = []): MatchComponentsPropertyFunction => {
      // Colors always animate per-value: their modifier (if any) is a Tailwind
      // opacity fraction already baked into the value via `color-mix()`, never
      // a keyframe stop. Reuse `property()` with the modifier forced to `null`
      // so the stop path is unreachable and the composed/per-value paths apply.
      const fn = creator.property(attribute, parts)
      return value => fn(value, { modifier: null })
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
        // A modifier on a non-color property is a keyframe stop: an arbitrary
        // `/[N]` modifier (e.g. `/[12]`) flows straight through Tailwind as the
        // bare number, producing a `12%` keyframe block. Colors never reach
        // this path: they use the dedicated `color()` creator, which forces
        // the modifier to `null` (Tailwind resolves color modifiers to opacity
        // fractions baked into the value via `color-mix()`, never keyframe
        // stops).
        register(attribute, modifier)

        // Simple (no parts, no modifier): a per-value keyframe + target var, so
        // base and hover values coexist with independent keyframes.
        if (!parts.length && !modifier) return perValue(attribute, value)

        if (parts.length && !modifier) composed.add(attribute)

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
          [`--jumi-${attribute}-animation-name`]: modifier ? `jumi-${attribute}-stops` : `jumi-${attribute}`,
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
