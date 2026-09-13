import type { CarrierKind } from '@/helpers/carriers'
import type {
    AnimatableStandardPropertyType,
    Collection,
    Creator,
    CssInJs,
    MatchComponentsPropertyFunction,
    MatchUtilitiesPropertyFunction,
    StaggerContext,
} from '@/types'

import { assemble } from '@/helpers/assemble'
import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { toPaintHex } from '@/helpers/paint'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyVariables } from '@/variables/property'

import cssEscape from 'css.escape'
import shorthash2 from 'shorthash2'

export type ModelOptions = {
  sink: ModelSink
  theme: ThemeSource
}

/** Everything the model needs from its host: where theme values come from, and
 * the two things it emits. Nothing else in this module knows the host. */
export type ModelSink = {
  /** Emit keyframe rules. */
  keyframes(rules: Collection<CssInJs>): void
  /** Publish what a kind's composition needs, as data that is never output.
   *
   * This is **staging**. It has to be re-emittable, because a slot registered after a pass has
   * published would otherwise never reach the stylesheet — Tailwind will not revisit the candidate
   * it cached — and it cannot be output, because the composition only resolves where the
   * activations are: every entry is a `var()` over a slot variable that exists on the element.
   *
   * A payload names every entry `--jumi-staging-<kind>-<declaration>` — the kind in the **name**,
   * so two payloads coalesced into one rule cannot collide — and what the declaration *is* decides
   * how it is read: a longhand is composition, a custom property is a default the element resolves
   * through. Those defaults have to be declared on the element rather than once on `:root`, because
   * they compose custom properties the slot utilities write there.
   */
  payload(kind: CarrierKind, variables: Collection<string>): void
  /** Register a slot's activation name as non-inheriting.
   *
   * This is the only asymmetry in what the model publishes, and it is the difference between
   * **state** and **configuration**.
   *
   * A shared control is configuration: `--jumi-animation-duration: 500ms` on a wrapper is a useful
   * thing to write, and it stays useful precisely because it is inherited — the elements that
   * declared their own default beat it, and the ones that did not take it. Nothing registers those,
   * and nothing should.
   *
   * An activation name is state: it says *this* element runs *this* animation. Inherited into a
   * descendant that also animates, it says the descendant runs it too — and because the composition
   * lists every slot in the stylesheet, the descendant always has a position to read it into. That
   * is the hero orbit's `animate-rotate-[360deg]` leaking into nested petals, which then spun at the
   * petal's duration. There is no configuration an author could want there, and no `var()` fallback
   * that can prevent it, because a fallback applies only when a property is unset.
   *
   * `behaviour:check` asserts this in a browser: a nested animating element must run its own slot
   * and not its ancestor's.
   */
  property(name: string): void
}

/** How the model resolves a theme value. The shape of the values map is the
 * host's business; Jumi only ever hands it straight back to the host. */
export type ThemeSource = Creator['theme']

/** One frame of a phrase: a value at a percentage of the animation. */
type Frame = {
  offset: number
  value: string
}

/** One animation in the composition, addressed by its attribute and, optionally,
 * the variable that declares its name. `label` is the name its declaration gave
 * it with `/[flick]`, which is the same word a control addresses it by. */
type Slot = {
  attribute: string
  label?: string | undefined
  nameVar?: string | undefined
}

/** Every `animation-*` longhand that applies to ONE animation in the list, so a
 * slot can be timed, sequenced and composed on its own. The chain reads each of
 * these, and `scope` writes each of them, so they are also the links a label has
 * to register. `animation-name` is not among them: a slot's name comes from its
 * own `nameVar`, and the shared `--jumi-animation-name` is not scoped per slot. */
const slotParts = [
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-play-state',
  'animation-timeline',
  'animation-timing-function',
] as const

/**
 * Jumi's semantic model — every decision between a candidate's value and the CSS
 * Jumi emits: what a phrase owns, which slot a label addresses, which names are
 * registered, which keyframes exist. It knows nothing about Tailwind; the host
 * supplies a theme lookup and two sinks.
 *
 * Lifetime: one model per plugin/compiler instance, created where the adapter is
 * created. Every registry below — `values`, `phrases`, `composed`, `effects`,
 * `labels`, `registered` — is therefore per-instance, and slots accumulate across
 * every candidate that instance compiles. That is why a slot can be created after
 * the composition's lists were first assembled, and why a registration is emitted
 * from the slot's own creation rather than from a getter here.
 *
 * Adapter assumption: the host keeps that instance alive for the lifetime of its
 * compiler. Tailwind does — measured, the plugin function runs once per compiler
 * and one instance serves every later `build()` — and the aggregate's
 * re-emission depends on it: a slot registered after a pass has published has to
 * be able to see the slots that pass registered.
 */
export function createJumiModel({ sink, theme: themeSource }: ModelOptions): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>(['animation', 'animation-composition', 'animation-timeline', 'interpolate-size'])
  const motions = new Set<string>()
  // Keyframes already emitted — by animation name for values, composed tweens and
  // phrases, by effect name for effects. Emission happens where a slot becomes
  // real, so this is what keeps a re-registration (`hover:`, a variant, a second
  // element declaring the same phrase) from emitting a second copy.
  const seen = new Set<string>()

  // A phrase — `0:16deg|58:0deg` — declares the frames of its own animation, so
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
   * default. Without this, any descendant that also animates resolves an
   * ANCESTOR's name and re-runs its animation with the descendant's
   * own timing — e.g. the hero orbit's `animate-rotate-[360deg]` leaking into
   * nested petals, which then spun at the petal's duration instead of the
   * orbit's.
   *
   * Registering at the slot's creation rather than from the composition keeps it
   * complete: the composition is derived from the *finished* stylesheet, so a
   * registration written there would arrive a pass too late for a utility
   * compiled after it. There is no point during a build where every slot is
   * known. The `registered` set keeps it to one registration per name, however
   * often a variant re-declares the same value.
   *
   * The shared `--jumi-animation-*` controls are left unregistered, which is a
   * different question from cascading. The derived defaults rule declares them on
   * every animating element, and a declaration beats inheritance, so a global
   * control written on an ancestor never reaches a descendant's animations
   * (measured: a wrapper's `--jumi-animation-duration: 5s` still leaves a child
   * at `1s`).
   * The link that does cross that boundary is the property scope, because
   * nothing declares `--jumi-{attribute}-animation-{part}` on the element: a
   * `/rotate` control on a wrapper does reach inside it (measured: `500ms`).
   */
  const registerName = (name: string) => {
    if (registered.has(name)) return
    registered.add(name)
    sink.property(name)

    // The hoisted value the aggregate publishes a slot under inherits the same obligation, for the
    // same reason and at the same moment: it is an ordinary custom property, so without a
    // registration a descendant resolves an *ancestor's* slot and re-runs that animation. Measured
    // on `behaviour:check`'s non-inheritance arm — the inner element ran the outer's
    // `jumi-rotate-3zWYd`. Deriving the name here is what keeps the registration and the
    // finalizer's publication in step: both read it off the activation variable.
    const slot = /^--jumi-(.+)-animation-name$/.exec(name)?.[1]
    const hoisted = slot ? `--jumi-slot-${slot}` : null

    if (hoisted && !registered.has(hoisted)) {
      registered.add(hoisted)
      sink.property(hoisted)
    }
  }
  // OPTIMIZATION: Using a Set allows O(1) deduplication and move-to-end,
  // replacing the O(N) Array indexOf/splice logic. JS Sets maintain insertion order.
  const values = new Map<AnimatableStandardPropertyType, Set<string>>()
  // The name a declaration gave its slot — `/[flick]` on a phrase — keyed
  // `attribute:id`. The control side spells the same word in `/[flick]`, so the
  // two meet on one element-local variable instead of a number that depends on
  // what else the page happens to animate.
  const labels = new Map<string, string>()

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
    emitKeyframe(`jumi-${attribute}-${id}`, { to: { [attribute]: css('var', `--jumi-${attribute}-${id}`) } })
    aggregateChanged()

    return {
      [`--jumi-${attribute}-${id}-animation-name`]: `jumi-${attribute}-${id}`,
      [`--jumi-${attribute}-${id}`]: value,
    }
  }
  /**
   * Emit a keyframe the first time its name is seen.
   *
   * Emission belongs at the point where a slot's existence is certain — the
   * registration itself — and not in the aggregate getter, which Tailwind is
   * free never to ask again once it has cached that candidate. Ownership is the
   * reason: a phrase causing a keyframe to exist is a fact about the phrase, and
   * an aggregate that happens to enumerate slots is the wrong place for it.
   */
  const emitKeyframe = (name: string, body: CssInJs) => {
    if (seen.has(name)) return
    seen.add(name)
    sink.keyframes({ [`@keyframes ${name}`]: body })
  }

  /**
   * A phrase's keyframe: every frame folded into the one keyframe the phrase
   * owns, because a frame does not earn a keyframe of its own.
   */
  const phraseKeyframe = (attribute: AnimatableStandardPropertyType, id: string, frames: Frame[]): CssInJs => {
    const fallback = css('var', `--jumi-${attribute}`)

    return frames.reduce((acc, { offset, value }) => {
      acc[`${offset}%`] = { [attribute]: propertyKeyframeValue(attribute, `${id}-${offset}`, fallback) }
      return acc
    }, {} as CssInJs)
  }

  /** An effect's keyframes, emitted the first time the effect is seen. */
  const emitEffectKeyframes = (attribute: string) => {
    if (seen.has(attribute)) return
    seen.add(attribute)
    sink.keyframes(effectKeyframes[attribute])
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

  function animationParts(attribute: string, nameVar?: string, label?: string): CssInJs {
    // Every `animation-*` longhand that applies to ONE animation in the list, so
    // a slot can be timed, sequenced and composed on its own. Three links,
    // narrowest first: the label a declaration gave this animation, then the
    // property's own control, then the global default. `/[rotate]` writes the
    // middle link; `/[flick]` — the same word the declaration used — writes the
    // first. Only a labelled slot offers that first link: an unlabelled one has
    // no name to be addressed by, so it keeps the shorter chain.
    const timing = (part: string) => {
      const chain = css('var', `--jumi-${attribute}-${part}`, css('var', `--jumi-${part}`))

      return label === undefined
        ? chain
        : css('var', cssEscape(`--jumi-${label}-${part}`), chain)
    }

    const name = css('var', nameVar ?? `--jumi-${attribute}-animation-name`, css('var', '--jumi-animation-name'))

    return {
      ...Object.fromEntries(slotParts.map(part => [part, timing(part)])),
      'animation-name': name,
    }
  }

  /**
   * The slots, in the model's precedence order — the order the browser resolves
   * the lists by, and therefore the thing every representation has to reproduce
   * exactly.
   *
   * Extracted because two representations read it: the flat lists that
   * `animations` returns (the oracle every list assertion is written against)
   * and the linked chain that is published. Sharing one order is what makes
   * comparing them meaningful.
   */
  function computeSlots(): Slot[] {
    const slots: Slot[] = []
    const shared = new Set<AnimatableStandardPropertyType>()

    for (const [attribute, ids] of values) {
      for (const id of ids) {
        slots.push({ attribute, nameVar: `--jumi-${attribute}-${id}-animation-name` })
      }
    }

    // Composed tweens resolve one shared `jumi-{attribute}` keyframe, so they
    // resolve one shared slot. A phrase never joins them: it owns its keyframe
    // and therefore claims a slot of its own.
    for (const attribute of composed) shared.add(attribute)

    for (const attribute of sorted(shared)) slots.push({ attribute })

    for (const [attribute, byId] of phrases) {
      for (const id of byId.keys()) {
        slots.push({
          attribute,
          label: labels.get(`${attribute}:${id}`),
          nameVar: `--jumi-${attribute}-${id}-animation-name`,
        })
      }
    }

    for (const attribute of sorted(effects)) slots.push({ attribute })

    return slots
  }

  function computeAnimationVariable(): CssInJs {
    const slots = computeSlots()

    // One animation per slot, written as longhand sub-property LISTS. Chromium
    // re-parses the `animation` shorthand when var() chains resolve inside it,
    // and shuffles values between slots: a fill-mode keyword lands in
    // `animation-name` (the `forwards, forwards, …` you see in the inspector)
    // and slots get dropped. Longhand lists keep every slot bound to its own
    // var chain. The `--jumi-animation-*` defaults the chains fall back to are
    // declared by the defaults rule the finalizer derives, on the element.
    const animation = slots.length
      ? slots.reduce((acc, { attribute, label, nameVar }) => {
          const parts = animationParts(attribute, nameVar, label)
          for (const part in parts) {
            acc[part] = acc[part] ? `${acc[part]}, ${parts[part]}` : parts[part]
          }
          return acc
        }, {} as CssInJs)
      : {
          'animation-composition': css('var', '--jumi-animation-composition'),
          'animation-delay': css('var', '--jumi-animation-delay'),
          'animation-direction': css('var', '--jumi-animation-direction'),
          'animation-duration': css('var', '--jumi-animation-duration'),
          'animation-fill-mode': css('var', '--jumi-animation-fill-mode'),
          'animation-iteration-count': css('var', '--jumi-animation-iteration-count'),
          'animation-name': css('var', '--jumi-animation-name'),
          'animation-play-state': css('var', '--jumi-animation-play-state'),
          'animation-timeline': css('var', '--jumi-animation-timeline'),
          'animation-timing-function': css('var', '--jumi-animation-timing-function'),
        }

    // Composition and timeline now live in the slot list, so they are declared
    // here only for elements that animate nothing at all. Leaving them in both
    // would let this single value overwrite the per-slot list.
    const baseAnimationVars = {
      'interpolate-size': css('var', '--jumi-interpolate-size'),
    }

    return merge(animation, baseAnimationVars)
  }

  /** Every longhand a slot contributes an entry to. */
  const aggregateParts = [...slotParts, 'animation-name']

  let registrations = 0
  // -1 means nothing has published yet, so the first change still has to.
  let publishedAt = -1

  /**
   * What the animations composition declares, as data — keyed by the **declaration** it becomes,
   * because that is the one thing the far end cannot invent.
   *
   * Flat lists, staged only to be *consumed*: `@/helpers/carriers` reads them off the finished
   * stylesheet and builds the rule that carries them. The browser never reads this, which is what
   * makes it safe to publish the data away from the element it belongs to — a rule nothing
   * consumes cannot be wrong.
   */
  const animationPayload = (): Collection<string> => {
    const lists = computeAnimationVariable()

    return Object.fromEntries([
      ...aggregateParts
        .filter(part => typeof lists[part] === 'string')
        .map(part => [part, lists[part] as string]),
      // A real property rather than a custom one, and it rides the same channel anyway: a staged
      // name carries the declaration it becomes, so `interpolate-size` needs no special case and
      // cannot drift from the name it is written under.
      ['interpolate-size', css('var', '--jumi-interpolate-size')],
    ])
  }

  /**
   * What the transitions composition declares, from the same reasoning. The list depends on which
   * motions exist, so it travels with the same freshness: a motion registered after a pass has
   * published has to be able to reach the stylesheet.
   */
  const transitionPayload = (): Collection<string> => ({
    'transition': transitionList(),
    'transition-behavior': css('var', '--jumi-transition-behavior'),
  })

  /**
   * The defaults an animating element resolves through, published once per property.
   *
   * Incremental rather than a snapshot, because the set only ever grows: a full republication on
   * every pass would write every earlier property's defaults again each time, making the transport
   * quadratic in the number of properties for no gain.
   */
  const substrated = new Set<string>()
  let transitionSubstrate = false

  const publishSubstrate = () => {
    const variables: Collection<string> = {}

    for (const attribute of sorted(properties)) {
      if (substrated.has(attribute)) continue
      substrated.add(attribute)

      for (const [property, value] of Object.entries(assemble(attribute))) {
        if (value !== undefined) variables[property] = value
      }
    }

    if (Object.keys(variables).length) sink.payload('animations', variables)

    if (transitionSubstrate) return
    transitionSubstrate = true

    const transitions: Collection<string> = {}

    for (const [property, value] of Object.entries(assemble('transition'))) {
      if (value !== undefined) transitions[property] = value
    }

    sink.payload('transitions', transitions)
  }

  /**
   * Publish the payload if the slot set has moved since it was last published.
   *
   * Called once while the model is being built, and again whenever a slot appears after a pass has
   * already published. Publishing at construction is not an optimization: nothing reads the model
   * any more, so without it a stylesheet with no slots at all would publish nothing, and a build
   * that never ran the finalizer would leave no trace of the protocol for the checks to find.
   */
  const publish = () => {
    publishSubstrate()

    if (publishedAt === registrations) return
    publishedAt = registrations

    sink.payload('animations', animationPayload())
    sink.payload('transitions', transitionPayload())
  }

  /**
   * Aggregate state changed: republish if a pass has already published.
   *
   * Named for what it means rather than for slots, because a motion is one of the things that has
   * to reach a composition late and a slot is no longer the only one.
   */
  const aggregateChanged = () => {
    registrations += 1
    if (publishedAt !== -1) publish()
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

  /**
   * The composed `transition` shorthand: one entry per motion, each the four-link chain that
   * motion's utilities fill in on the element.
   *
   * Inlined, rather than assembled from a `--jumi-<motion>-transition` variable per motion. That
   * intermediate would be dynamic too — which motions exist is — and every dynamic declaration has
   * to be staged and materialized separately. A composed list is one declaration, and one
   * declaration is one staged part.
   */
  function transitionList(): string {
    const active = sorted(motions)

    return active.length
      ? active.map(attribute => transitionVariables(attribute)).join(', ')
      : css('var', '--jumi-transition')
  }

  const creator: Creator = {
    /**
     * The aggregate's own slot lists, in the model's order — what the data
     * channel publishes, and what the adapter stages for the finalizer.
     */
    get animations(): CssInJs {
      const assembled = sorted(properties).reduce((acc, attribute) =>
        merge(acc, assemble(attribute)), {} as CssInJs)

      const animation = computeAnimationVariable()

      return merge(animation, assembled)
    },

    color: (attribute, parts = [], options: { paint?: boolean } = {}): MatchComponentsPropertyFunction => {
      const fn = creator.property(attribute, parts)
      return value => fn(options.paint ? toPaintHex(value) : value, { modifier: null })
    },

    effect(attribute): string {
      effects.add(attribute)
      registerName(`--jumi-${attribute}-animation-name`)
      emitEffectKeyframes(attribute)
      aggregateChanged()
      return `jumi-${attribute}`
    },

    get effects(): string[] { return sorted(effects) },

    motion(attribute): string {
      if (motions.has(attribute)) return attribute

      motions.add(attribute)
      // A motion is aggregate state in exactly the way a slot is: if a pass has already published,
      // the composed list has to be re-said or the new motion never reaches the carrier — the
      // `transitions` candidate was compiled once and Tailwind will not revisit it.
      aggregateChanged()

      return attribute
    },

    get motions(): string[] { return sorted(motions) },

    get properties(): string[] { return sorted(properties) },

    property: (attribute, parts = []): MatchComponentsPropertyFunction => {
      return (value, { modifier }) => {
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
          emitKeyframe(`jumi-${attribute}-${id}`, phraseKeyframe(attribute, id, frameList))
          aggregateChanged()

          // `/[flick]` names this slot, so a control — or your own CSS — can
          // address it on its own. Every link the chain then reads is registered
          // non-inheriting, for the reason a phrase name is: a label names ONE
          // animation, on the element that declared it, so a descendant that
          // happens to use the same word must not answer to it. Skipped when the
          // label is the attribute itself, because that name is the property
          // scope's, and a scope cascades into subtrees on purpose.
          if (modifier) {
            labels.set(`${attribute}:${id}`, modifier)

            if (modifier !== attribute) {
              for (const part of slotParts) registerName(cssEscape(`--jumi-${modifier}-${part}`))
            }
          }

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
            // The frame variables are keyed by a hash of the phrase, which nobody
            // can write by hand. The label is the address a person CAN write, so
            // the rule states it: read the slot's name here, then set
            // `--jumi-${attribute}-${label}-…` from your own CSS.
            ...(modifier ? { [`--jumi-${attribute}-${id}-label`]: modifier } : {}),
            ...variables,
          }
        }

        register(attribute)

        if (!parts.length) return perValue(attribute, value)

        composed.add(attribute)
        registerName(`--jumi-${attribute}-animation-name`)
        emitKeyframe(`jumi-${attribute}`, { to: { [attribute]: css('var', `--jumi-${attribute}`) } })
        aggregateChanged()

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

        // The modifier names a property — `rotate` — or the label a declaration
        // gave one of its animations — `rotate-flick`, from
        // `animate-rotate-[…]/[rotate-flick]`. Either way it is one word, so the
        // variable is just the modifier and the part. Escaped, because a custom
        // property name cannot carry a stray dot or space.
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
      return themeSource(key, values)
    },

    transition(part: string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        if (!modifier) return { ...(value && { [`--jumi-transition-${part}`]: value }) }
        creator.motion(modifier)
        return { [`--jumi-${modifier}-transition-${part}`]: part === 'property' ? modifier : value }
      }
    },

  }

  // Publish once, before anything can read the model.
  //
  // Nothing reads it as a side effect any more — a utility used to, and the candidate that asked for
  // it is gone. Without this a page with no Jumi motion at all would stage nothing, and a build that
  // never ran the finalizer would leave no trace of the protocol behind for the checks to find.
  publish()

  return creator
}

/**
 * Read a phrase — `0:16deg;58:0deg` — out of a tween value. A phrase declares
 * the frames of its own animation, which is what makes its keyframe private:
 * identity is the declaration, so nothing can be shared by accident.
 *
 * Frames split on PIPES at nesting depth 0, and each frame splits on its FIRST
 * colon, so `url(data:image/png;base64,x)` stays one value.
 *
 * A pipe rather than the obvious semicolon, which is where this started:
 * **Tailwind will not carry a `;` through an arbitrary value.** A candidate
 * containing one is dropped silently, so every phrase simply stopped compiling -
 * six keyframes gone from the canonical corpus, and nothing logged. Measured
 * against `@`, `%`, `|`, `!`, `~` and `^`, all of which are carried. `%` and `!`
 * are ruled out anyway, being legal in a CSS value (`50%`, `!important`), which
 * is the same reason the comma could not stay the frame separator.
 *
 * The offset is a bare number — the percentage is implied — and one frame may
 * name several offsets, so `0,100:45deg` is the two of them at once.
 *
 * Anything that is not a phrase returns `null`, leaving the value to be treated
 * as a plain tween. No plain CSS value begins `number:`, and ratios are written
 * with a slash, so the leading test is unambiguous.
 */
function parsePhrase(value: string): Frame[] | null {
  if (!/^\s*\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?)*\s*:/.test(value)) return null

  const frames = new Map<number, string>()

  for (const frame of splitFrames(value)) {
    const colon = frame.indexOf(':')
    if (colon === -1) return null

    const content = frame.slice(colon + 1).trim()
    if (!content) return null

    for (const part of frame.slice(0, colon).split(',')) {
      const text = part.trim()
      const offset = Number(text)

      if (!text || !Number.isFinite(offset)) return null

      // A repeated offset: the last declaration wins, the same way it would in
      // any other cascade.
      frames.set(offset, content)
    }
  }

  // Ordered by offset, so `0:a|50:b` and `50:b|0:a` are one keyframe.
  return [...frames]
    .sort(([a], [b]) => a - b)
    .map(([offset, content]) => ({ offset, value: content }))
}

/**
 * The phrase's identity — its frames in canonical order, which is the phrase's
 * own text: `0:16deg|58:0deg`. Two elements hash to one keyframe exactly when
 * they declared the same frames.
 *
 * A join is sound only because a value can never hold the joiner: `splitFrames`
 * has already cut every top-level pipe, so one survives only inside parentheses
 * or quotes — and read as a boundary there, the frame after it fails to name an
 * offset, so the value is not a phrase at all.
 *
 * That distinction is not academic. `0:0deg,50:0deg` is read as ONE frame —
 * offset 0, value `0deg,50:0deg` — so a comma join would give it the same key as
 * the two-frame `0:0deg|50:0deg`, and one spelling would silently share, and
 * overwrite, the other's keyframe.
 */
function phraseKey(frames: Frame[]): string {
  return frames.map(frame => `${frame.offset}:${frame.value}`).join('|')
}

/**
 * Split a phrase into frames on top-level pipes only, so a value that carries
 * its own punctuation, parentheses or strings — `rgb(0,0,0)`, `url("a|b")` —
 * stays intact.
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
    else if (char === '|' && depth === 0) {
      frames.push(value.slice(start, index))
      start = index + 1
    }
  }

  frames.push(value.slice(start))

  return frames
}
