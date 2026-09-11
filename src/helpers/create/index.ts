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

/** One animation in `.animations`, addressed by its attribute and, optionally,
 * its alias or the variable that declares it. */
type Slot = {
  alias?: string
  attribute: string
  nameVar?: string
}

export function getCreator({ addBase, addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>(['animation', 'animation-composition', 'animation-timeline', 'interpolate-size'])
  const motions = new Set<string>()
  const seen = new Set<string>()

  const keyframes = new Map<string, Collection<CssInJs>>()

  // `/[1]`, `/[50]` — named instances of an attribute's animation. Each alias
  // owns a keyframe and an animation slot, so it can carry its own timing.
  // Reach for one when you want separately driven tracks.
  const aliases = new Map<AnimatableStandardPropertyType, Set<string>>()

  // `/[at-50%]` — frame offsets contributed to the attribute's SHARED
  // `jumi-{attribute}` keyframe. Several stop utilities extend ONE timeline
  // instead of racing as separate same-property animations, where
  // `animation-composition: replace` would discard all but the last.
  const stops = new Map<AnimatableStandardPropertyType, Set<number>>()

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

    // A frame does not earn a keyframe of its own: every `/[at-*]` utility used
    // in the build folds into the attribute's shared `jumi-{attribute}`
    // keyframe, ordered by offset. One element then runs ONE animation whose
    // frames all share a single pair of endpoints, which is what keeps the
    // return leg coherent under `infinite` and `alternate`. A stop an element
    // does not pin resolves to the base variable — its resting value.
    const registerStop = (attribute: AnimatableStandardPropertyType, offset: number) => {
      const animationName = `jumi-${attribute}`
      const key = `@keyframes ${animationName}`
      const blocks = result[key] ?? (result[key] = {})

      blocks[`${offset}%`] = {
        [attribute]: propertyKeyframeValue(attribute, `at-${offset}`, css('var', `--jumi-${attribute}`)),
      }
    }

    for (const [attribute, ids] of values) {
      for (const id of ids) {
        register(`jumi-${attribute}-${id}`, attribute, css('var', `--jumi-${attribute}-${id}`))
      }
    }

    for (const attribute of composed) {
      register(`jumi-${attribute}`, attribute, css('var', `--jumi-${attribute}`))
    }

    for (const [attribute, offsets] of stops) {
      if (!offsets.size) continue
      for (const offset of [...offsets].sort((a, b) => a - b)) registerStop(attribute, offset)
    }

    for (const [attribute, ids] of aliases) {
      if (!ids.size) continue
      const base = css('var', `--jumi-${attribute}`)
      for (const id of ids) {
        register(cssEscape(`jumi-${attribute}-${id}`), attribute, propertyKeyframeValue(attribute, id, base))
      }
    }

    if (Object.keys(result).length) addUtilities(result)
  }

  function propertyKeyframeValue(attribute: AnimatableStandardPropertyType, suffix: string, fallback: string): string {
    const variable = cssEscape(`--jumi-${attribute}-${suffix}`)
    const { dependencies = [], value = fallback } = propertyVariables[attribute]

    // The fallback is what an element that does NOT pin this frame resolves to.
    // Stopped tweens share one keyframe per attribute, so the frame set is the
    // union of every stop used in the build: a frame another element pinned
    // must land on this element's resting value, never on the property's
    // initial value.
    if (!dependencies.length) return css('var', variable, fallback)

    const expanded = dependencies.reduce((result, dependency) => {
      const part = propertyVariables[dependency].variable
      return result.replaceAll(`var(${part})`, `var(${cssEscape(`${part}-${suffix}`)}, var(${part}))`)
    }, value)

    return css('var', variable, expanded)
  }

  function animationParts(attribute: string, nameVar?: string, alias?: string): CssInJs {
    const timing = (part: string) => {
      const perAttribute = `--jumi-${attribute}-${part}`
      if (alias) {
        const perAlias = cssEscape(`--jumi-${attribute}-${alias}-${part}`)
        return css('var', perAlias, css('var', perAttribute, css('var', `--jumi-${part}`)))
      }
      return css('var', perAttribute, css('var', `--jumi-${part}`))
    }

    const name = alias
      ? css('var', cssEscape(`--jumi-${attribute}-${alias}-animation-name`), 'none')
      : css('var', nameVar ?? `--jumi-${attribute}-animation-name`, css('var', '--jumi-animation-name'))

    return {
      'animation-delay': timing('animation-delay'),
      'animation-direction': timing('animation-direction'),
      'animation-duration': timing('animation-duration'),
      'animation-fill-mode': timing('animation-fill-mode'),
      'animation-iteration-count': timing('animation-iteration-count'),
      'animation-name': name,
      'animation-play-state': timing('animation-play-state'),
      'animation-timing-function': timing('animation-timing-function'),
    }
  }

  /**
   * Register every slot's activation variable as non-inheriting.
   *
   * `.animate-*` utilities declare their animation name on the element itself
   * (`--jumi-{attribute}-{id}-animation-name`), but custom properties inherit by
   * default. Without this, any descendant that also opts into `animations`
   * resolves an ANCESTOR's name and re-runs its animation with the descendant's
   * own timing — e.g. the hero orbit's `animate-rotate-[360deg]` leaking into
   * nested petals, which then spun at the petal's 2400ms duration instead of the
   * orbit's 24s. Activation is element-local, so the name slots are registered
   * with `inherits: false`; an unset name still resolves to the `var()` fallback
   * each slot already declares.
   *
   * The shared `--jumi-animation-name` control is deliberately left inheritable,
   * so a parent can still cascade one named animation into its subtree.
   */
  function computeAnimationRegister(slots: Slot[]) {
    const names = new Set<string>()

    for (const { alias, attribute, nameVar } of slots) {
      if (nameVar) names.add(nameVar)
      else if (alias) names.add(cssEscape(`--jumi-${attribute}-${alias}-animation-name`))
      else names.add(`--jumi-${attribute}-animation-name`)
    }

    const register = sorted(names).reduce((acc, name) => {
      acc[`@property ${name}`] = { inherits: 'false', syntax: '"*"' }
      return acc
    }, {} as Record<string, CssInJs>)

    if (Object.keys(register).length) addBase(register)
  }

  function computeAnimationVariable(): CssInJs {
    const slots: Slot[] = []
    const shared = new Set<AnimatableStandardPropertyType>()

    for (const [attribute, ids] of values) {
      for (const id of ids) {
        slots.push({
          attribute,
          nameVar: `--jumi-${attribute}-${id}-animation-name`,
        })
      }
    }

    // Composed tweens and stops resolve the same `jumi-{attribute}` keyframe, so
    // they resolve the same slot: a stop never adds a second animation of the
    // property it belongs to.
    for (const attribute of composed) shared.add(attribute)
    for (const attribute of stops.keys()) shared.add(attribute)

    for (const attribute of sorted(shared)) {
      slots.push({ attribute })
    }

    for (const [attribute, ids] of aliases) {
      if (!ids.size) continue
      for (const id of ids) {
        slots.push({ alias: id, attribute })
      }
    }

    for (const attribute of sorted(effects)) {
      slots.push({ attribute })
    }

    computeAnimationRegister(slots)

    // One animation per slot, written as longhand sub-property LISTS. Chromium
    // re-parses the `animation` shorthand when var() chains resolve inside it,
    // and shuffles values between slots: a fill-mode keyword lands in
    // `animation-name` (the `forwards, forwards, …` you see in the inspector)
    // and slots get dropped. Longhand lists keep every slot bound to its own
    // var chain. The `--jumi-animation-*` defaults the chains fall back to come
    // from `assemble('animation')` at the end of `.animations`.
    const animation = slots.length
      ? slots.reduce((acc, { alias, attribute, nameVar }) => {
          const parts = animationParts(attribute, nameVar, alias)
          for (const part in parts) {
            acc[part] = acc[part] ? `${acc[part]}, ${parts[part]}` : parts[part]
          }
          return acc
        }, {} as CssInJs)
      : {
          'animation-delay': css('var', '--jumi-animation-delay'),
          'animation-direction': css('var', '--jumi-animation-direction'),
          'animation-duration': css('var', '--jumi-animation-duration'),
          'animation-fill-mode': css('var', '--jumi-animation-fill-mode'),
          'animation-iteration-count': css('var', '--jumi-animation-iteration-count'),
          'animation-name': css('var', '--jumi-animation-name'),
          'animation-play-state': css('var', '--jumi-animation-play-state'),
          'animation-timing-function': css('var', '--jumi-animation-timing-function'),
        }

    const baseAnimationVars = {
      'animation-composition': css('var', '--jumi-animation-composition'),
      'animation-timeline': css('var', '--jumi-animation-timeline'),
      'interpolate-size': css('var', '--jumi-interpolate-size'),
    }

    return merge(animation, baseAnimationVars)
  }

  const register = (attribute: AnimatableStandardPropertyType, modifier: null | string) => {
    properties.add(attribute)
    if (!modifier) return

    let ids = aliases.get(attribute)

    if (!ids) {
      ids = new Set<string>()
      aliases.set(attribute, ids)
    }

    ids.add(modifier)
  }

  const registerStop = (attribute: AnimatableStandardPropertyType, offset: number) => {
    properties.add(attribute)

    let offsets = stops.get(attribute)

    if (!offsets) {
      offsets = new Set<number>()
      stops.set(attribute, offsets)
    }

    offsets.add(offset)
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
        const offset = modifier ? stopOffset(modifier) : null

        // `/[at-50%]` and `/[at-50]` name the same frame, so the modifier is
        // respelled from the parsed offset before it reaches a variable name:
        // there is no `%` to escape and both spellings share one stop variable.
        const stop = offset === null ? null : `at-${offset}`

        if (offset === null) register(attribute, modifier)
        else registerStop(attribute, offset)

        if (!parts.length && !stop && !modifier) return perValue(attribute, value)

        if (parts.length && !stop && !modifier) composed.add(attribute)

        const suffix = stop ?? modifier

        const variable = (name: string) => {
          return suffix ? cssEscape(`--jumi-${name}-${suffix}`) : `--jumi-${name}`
        }

        const variables = parts.length
          ? parts.reduce((acc, part) => {
              const [property, transform] = Array.isArray(part) ? part : [part]
              const stored = transform ? transform(value) : value
              acc[variable(property)] = stored
              return acc
            }, {} as CssInJs)
          : { [variable(attribute)]: value }

        // A stop feeds the attribute's shared timeline, which reads the frame
        // variables by offset — so it activates the attribute-wide slot rather
        // than claiming a slot of its own.
        if (stop) {
          return {
            [`--jumi-${attribute}-animation-name`]: `jumi-${attribute}`,
            ...variables,
          }
        }

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

/**
 * Read the frame offset out of a stop modifier — `at-50%` → `50`, `at-12.5` →
 * `12.5`. The `at-` prefix is what separates a STOP from an ALIAS: `/[at-50%]`
 * adds a frame to the attribute's shared timeline, while `/[1]` names an
 * instance with a keyframe of its own. Anything that does not parse as an
 * offset returns `null`, so the modifier keeps its alias meaning.
 */
function stopOffset(modifier: string): null | number {
  const match = /^at-(\d+(?:\.\d+)?)%?$/.exec(modifier)
  return match ? Number(match[1]) : null
}
