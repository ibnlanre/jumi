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

/** One frame of a phrase: a value at a percentage of the animation. */
type Frame = {
  offset: number
  value: string
}

/** One animation in `.animations`, addressed by its attribute and, optionally,
 * the variable that declares its name. */
type Slot = {
  attribute: string
  nameVar?: string
}

export function getCreator({ addBase, addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>(['animation', 'animation-composition', 'animation-timeline', 'interpolate-size'])
  const motions = new Set<string>()
  const seen = new Set<string>()

  const keyframes = new Map<string, Collection<CssInJs>>()

  // A phrase — `0:16deg,58:0deg` — declares the frames of its own animation, so
  // it owns a keyframe no other declaration can name. Identity IS the phrase:
  // two elements share a keyframe only when they declared the identical thing,
  // which is what makes the frames safe to trust. A keyframe shared per
  // attribute cannot work — every element animating that property would run the
  // union of everyone's offsets, and CSS has no way to skip a frame.
  const phrases = new Map<AnimatableStandardPropertyType, Map<string, Frame[]>>()
  // Names already registered as non-inheriting.
  const registered = new Set<string>()

  /**
   * Register a slot's activation variable as non-inheriting, the moment the slot
   * exists.
   *
   * `.animate-*` utilities declare their animation name on the element itself
   * (`--jumi-{attribute}-{id}-animation-name`), but custom properties inherit by
   * default. Without this, any descendant that also opts into `animations`
   * resolves an ANCESTOR's name and re-runs its animation with the descendant's
   * own timing — e.g. the hero orbit's `animate-rotate-[360deg]` leaking into
   * nested petals, which then spun at the petal's duration instead of the
   * orbit's.
   *
   * Registering here rather than while `.animations` is assembled matters twice
   * over. Tailwind evaluates that utility once per candidate — `animations`,
   * `*:animations`, `before:animations`, `hover:animations` — so assembling
   * there re-emitted every registration once per candidate, and any slot created
   * AFTER the last of those evaluations was never registered at all. The
   * `registered` set keeps it to one registration per name.
   *
   * The shared `--jumi-animation-name` control is deliberately left inheritable,
   * so a parent can still cascade one named animation into its subtree.
   */
  const registerName = (name: string) => {
    if (registered.has(name)) return
    registered.add(name)
    addBase({ [`@property ${name}`]: { inherits: 'false', syntax: '"*"' } })
  }
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

    registerName(`--jumi-${attribute}-${id}-animation-name`)

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

    // A frame does not earn a keyframe of its own: `computePropertyKeyframes`
    // folds every frame of a phrase into the one keyframe that phrase owns.

    for (const [attribute, ids] of values) {
      for (const id of ids) {
        register(`jumi-${attribute}-${id}`, attribute, css('var', `--jumi-${attribute}-${id}`))
      }
    }

    for (const attribute of composed) {
      register(`jumi-${attribute}`, attribute, css('var', `--jumi-${attribute}`))
    }

    for (const [attribute, byId] of phrases) {
      const fallback = css('var', `--jumi-${attribute}`)

      for (const [id, frames] of byId) {
        const animationName = `jumi-${attribute}-${id}`
        if (seen.has(animationName)) continue
        seen.add(animationName)

        result[`@keyframes ${animationName}`] = frames.reduce((acc, { offset, value }) => {
          acc[`${offset}%`] = { [attribute]: propertyKeyframeValue(attribute, `${id}-${offset}`, fallback) }
          return acc
        }, {} as CssInJs)
      }
    }

    if (Object.keys(result).length) addUtilities(result)
  }

  function propertyKeyframeValue(attribute: AnimatableStandardPropertyType, suffix: string, fallback: string): string {
    const variable = cssEscape(`--jumi-${attribute}-${suffix}`)
    const { dependencies = [], value = fallback } = propertyVariables[attribute]

    // The fallback is the element's resting value: a phrase that does not pin a
    // frame simply does not have one, and any frame variable left unset still
    // lands on the property's resting value rather than its initial value.
    if (!dependencies.length) return css('var', variable, fallback)

    const expanded = dependencies.reduce((result, dependency) => {
      const part = propertyVariables[dependency].variable
      return result.replaceAll(`var(${part})`, `var(${cssEscape(`${part}-${suffix}`)}, var(${part}))`)
    }, value)

    return css('var', variable, expanded)
  }

  function animationParts(attribute: string, nameVar?: string): CssInJs {
    const timing = (part: string) => {
      return css('var', `--jumi-${attribute}-${part}`, css('var', `--jumi-${part}`))
    }

    const name = css('var', nameVar ?? `--jumi-${attribute}-animation-name`, css('var', '--jumi-animation-name'))

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

    // Composed tweens resolve one shared `jumi-{attribute}` keyframe, so they
    // resolve one shared slot. A phrase never joins them: it owns its keyframe
    // and therefore claims a slot of its own.
    for (const attribute of composed) shared.add(attribute)

    for (const attribute of sorted(shared)) {
      slots.push({ attribute })
    }

    for (const [attribute, byId] of phrases) {
      for (const id of byId.keys()) {
        slots.push({ attribute, nameVar: `--jumi-${attribute}-${id}-animation-name` })
      }
    }

    for (const attribute of sorted(effects)) {
      slots.push({ attribute })
    }

    // One animation per slot, written as longhand sub-property LISTS. Chromium
    // re-parses the `animation` shorthand when var() chains resolve inside it,
    // and shuffles values between slots: a fill-mode keyword lands in
    // `animation-name` (the `forwards, forwards, …` you see in the inspector)
    // and slots get dropped. Longhand lists keep every slot bound to its own
    // var chain. The `--jumi-animation-*` defaults the chains fall back to come
    // from `assemble('animation')` at the end of `.animations`.
    const animation = slots.length
      ? slots.reduce((acc, { attribute, nameVar }) => {
          const parts = animationParts(attribute, nameVar)
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

  const register = (attribute: AnimatableStandardPropertyType) => {
    properties.add(attribute)
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
      registerName(`--jumi-${attribute}-animation-name`)
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
      return (value) => {
        const frameList = parsePhrase(value)

        // A phrase declares this animation's frames, so it owns the keyframe —
        // and with it the property. Nothing else contributes to it, so its
        // frames are safe to trust and nothing has to be shared.
        if (frameList) {
          register(attribute)

          const id = shorthash2(phraseKey(frameList))

          let byId = phrases.get(attribute)

          if (!byId) {
            byId = new Map()
            phrases.set(attribute, byId)
          }

          byId.set(id, frameList)
          registerName(`--jumi-${attribute}-${id}-animation-name`)

          const variables = frameList.reduce((acc, { offset, value: frame }) => {
            const suffix = `${id}-${offset}`

            if (!parts.length) {
              acc[cssEscape(`--jumi-${attribute}-${suffix}`)] = frame
              return acc
            }

            for (const part of parts) {
              const [property, transform] = Array.isArray(part) ? part : [part]
              acc[cssEscape(`--jumi-${property}-${suffix}`)] = transform ? transform(frame) : frame
            }

            return acc
          }, {} as CssInJs)

          return {
            [`--jumi-${attribute}-${id}-animation-name`]: `jumi-${attribute}-${id}`,
            ...variables,
          }
        }

        register(attribute)

        if (!parts.length) return perValue(attribute, value)

        composed.add(attribute)
        registerName(`--jumi-${attribute}-animation-name`)

        const variables = parts.reduce((acc, part) => {
          const [property, transform] = Array.isArray(part) ? part : [part]
          acc[`--jumi-${property}`] = transform ? transform(value) : value
          return acc
        }, {} as CssInJs)

        return {
          [`--jumi-${attribute}-animation-name`]: `jumi-${attribute}`,
          ...variables,
        }
      }
    },

    scope(part: string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        if (!modifier) return { [`--jumi-${part}`]: value }

        // The modifier names a property, so the property is escaped: a custom
        // property name cannot carry an unescaped dot, and
        // `animation-duration-300/[scale.1]` would otherwise emit
        // `--jumi-scale.1-animation-delay`, which the browser drops along with
        // the declaration it belongs to.
        return { [cssEscape(`--jumi-${modifier}-${part}`)]: value }
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
 * Read a phrase — `0:16deg,58:0deg` — out of a tween value. A phrase declares
 * the frames of its own animation, which is what makes its keyframe private:
 * identity is the declaration, so nothing can be shared by accident.
 *
 * Frames split on commas at nesting depth 0, so `rgb(0,0,0)` stays one value,
 * and each frame splits on its FIRST colon, so `url(data:image/png;base64,x)`
 * stays one value. The offset is a bare number — the percentage is implied.
 *
 * Anything that is not a phrase returns `null`, leaving the value to be treated
 * as a plain tween. No plain CSS value begins `number:`, and ratios are written
 * with a slash, so the leading test is unambiguous.
 */
function parsePhrase(value: string): Frame[] | null {
  if (!/^\s*\d+(?:\.\d+)?\s*:/.test(value)) return null

  const frames = new Map<number, string>()

  for (const frame of splitFrames(value)) {
    const colon = frame.indexOf(':')
    if (colon === -1) return null

    const offset = Number(frame.slice(0, colon).trim())
    const content = frame.slice(colon + 1).trim()

    if (!Number.isFinite(offset) || !content) return null

    // A repeated offset: the last declaration wins, the same way it would in
    // any other cascade.
    frames.set(offset, content)
  }

  // Ordered by offset, so `0:a,50:b` and `50:b,0:a` are one keyframe.
  return [...frames]
    .sort(([a], [b]) => a - b)
    .map(([offset, content]) => ({ offset, value: content }))
}

/**
 * The phrase's identity — its frames in canonical order. Two elements hash to
 * one keyframe exactly when they declared the same frames.
 */
function phraseKey(frames: Frame[]): string {
  return frames.map(frame => `${frame.offset}:${frame.value}`).join(',')
}

/**
 * Split a phrase into frames on top-level commas only, so a value that carries
 * its own commas or strings — `rgb(0,0,0)`, `url("a,b")` — stays intact.
 */
function splitFrames(value: string): string[] {
  const frames: string[] = []
  let depth = 0
  let quote = ''
  let start = 0

  for (let index = 0; index < value.length; index++) {
    const char = value[index]

    if (quote) {
      if (char === quote) quote = ''
      continue
    }

    if (char === '"' || char === '\'') quote = char
    else if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      frames.push(value.slice(start, index))
      start = index + 1
    }
  }

  frames.push(value.slice(start))

  return frames
}
