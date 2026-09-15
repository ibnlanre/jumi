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
   * A reset is the other tool for this, and it is the one that was used before registration existed:
   * write the base variables back to their initial values on every element, and let the utility on the
   * child supersede the reset. That is where the derived defaults rule comes from, and it still works
   * for configuration, because configuration has a known value to write. It cannot work for state: a
   * reset is a *rule*, so it would have to enumerate the activation names, and the set is not known
   * when a utility is emitted — slots accumulate across a build, and one can be created after a pass
   * has already published its lists. One rule per slot matching every element, against one
   * registration per name that matches nothing.
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
 * the variable that declares its name. `key` is the slot's own address, which is what a
 * per-element control chain reads before the property scope and the global default. */
type Slot = {
  attribute: string
  key?: string | undefined
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
  'animation-range',
  'animation-timeline',
  'animation-timing-function',
] as const

/**
 * Whether a name is one a control can address.
 *
 * Measured, and it is not a style rule: a name becomes a custom-property segment
 * (`--jumi-<name>-animation-duration`), and **PostCSS ends the identifier at an escaped space** —
 * `css.escape('a b')` is `a\ b`, which is legal CSS but does not survive the parse. The build fails
 * with `Unknown word b-animation-duration`, so a name containing whitespace cannot be written at all.
 * Refusing to write it is what keeps a name from being able to break a build; the pass in
 * `@/helpers/carriers` reports it, because the model has no channel to warn through.
 */
export const addressableName = (name: string) =>
  name.length > 0 && !/[\s\u0000-\u001F\u007F]/.test(name)

/**
 * A slot's key: the name a slot is addressed by throughout the model, and the middle of its
 * variable names. `attribute-id` for a phrase or a single value (identity is the value), the
 * attribute for a composed tween or an effect (identity is the property or the effect).
 *
 * A name the author gave the motion is part of the key, and that is the whole of motion-instance
 * identity: two motions may share one generated keyframe — same frames, same `id` — and still be two
 * slots, addressed and timed independently. Folding the name into the keyframe instead would emit
 * the same `@keyframes` twice; leaving it out of the key, which is what this used to do, made two
 * named motions collapse into one, with the second name simply replacing the first.
 *
 * The name enters **hashed**, so the key is a discriminator rather than the name itself. The
 * aggregate's chains are keyed by this string, and a name must not reach the composition: a name is
 * something an author writes on one element, and the composition is derived from the whole corpus.
 * The address a person writes down is `--jumi-<name>-<part>`, which is unchanged.
 */
const slotKey = (attribute: string, id?: string, name?: null | string) =>
  id ? `${attribute}-${id}${name ? `-${shorthash2(name)}` : ''}` : attribute

/**
 * A matcher that reads its modifier as a **name** — every motion candidate — carries this tag, so the
 * host can declare `modifiers: 'any'` for it without keeping a second list of matcher names in step.
 */
export const nameable = Symbol('jumi.nameable')

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
export function createJumiModel({
  sink,
  theme: themeSource,
}: ModelOptions): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>([
    'animation',
    'animation-composition',
    'animation-range',
    'animation-timeline',
    'interpolate-size',
  ])
  const motions = new Set<string>()
  // Keyframes already emitted — by animation name for values, composed tweens and
  // phrases, by effect name for effects. Emission happens where a slot becomes
  // real, so this is what keeps a re-registration (`hover:`, a variant, a second
  // element declaring the same phrase) from emitting a second copy.
  const seen = new Set<string>()

  // A phrase — `0:16deg|58:0deg` — declares the frames of its own animation, so
  // it owns a keyframe no other declaration can name. Identity of the
  // *definition* IS the phrase: two elements share a keyframe only when they
  // declared the identical thing, which is what makes the frames safe to trust.
  // A keyframe shared per attribute cannot work — every element animating that
  // property would run the union of everyone's offsets, and CSS has no way to
  // skip a frame.
  //
  // Keyed by the **instance** (the slot key, which carries a name when the
  // author gave one) and valued by the definition it rides on. One definition,
  // many instances: `…/enter` and `…/exit` over identical frames are two slots
  // over one keyframe, which is the difference between naming a motion and
  // cloning it.
  const phrases = new Map<AnimatableStandardPropertyType, Map<string, string>>()
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
  // Keyed by instance for the same reason the phrases are: the value is the
  // definition (a hash of the value), the key is what the author addressed.
  const values = new Map<AnimatableStandardPropertyType, Map<string, string>>()

  const composed = new Set<AnimatableStandardPropertyType>()

  /**
   * The slots some candidate gave a name to.
   *
   * A boolean per slot, and deliberately not the names: a name never reaches the composition — that
   * is the locality rule — so all the aggregate may know is that this slot has an address to read,
   * which is a link in its chain rather than a value in it. Measured: adding the link for every slot
   * cost 51% more staged bytes for the whole corpus, and only named slots can use it.
   */
  const addressed = new Set<string>()

  // Deterministic alphabetical ordering for Sets of attribute/effect names.
  const sorted = <T extends string>(set: Set<T>): Array<T> => [...set].sort()

  /**
   * Record a name that cannot be addressed, so the build can report it.
   *
   * A control whose name cannot be written — `/[_x]` reaches the model as ` x`, because `_` is
   * Tailwind's space in an arbitrary value — has nothing to configure: the motion side drops the same
   * name, so the control would address no slot even if it were written. What it must not do is write
   * the custom property anyway, which is a build failure rather than a silent no-op (see
   * `addressableName`).
   *
   * The **fact** is in the property name and not in the value, which is a correction rather than a
   * style: CSS text cannot carry a name's leading or trailing whitespace in a declaration's value —
   * PostCSS moves it into `raws.between` — so a value-based record stayed silent for exactly the names
   * `_` produces. The value still carries the name as written, for the message; the hash in the key
   * keeps two refused names from overwriting one another, and dedupes the report when both sides
   * record the same one.
   */
  const refusedName = (name: string): CssInJs => ({
    [cssEscape(`--jumi-name-${shorthash2(name)}-refused`)]: name,
  })

  /**
   * Name a slot: install an address for the elements that wrote the name, and say so in the rule.
   *
   * Nothing here reaches the aggregate, and that is the point. A name is element-local —
   * `animate-fade-in/reveal` names the motion for the elements matching *that* rule — so the address
   * it installs is the slot-keyed variable the composition's chains already read
   * (`--jumi-slot-<key>-<part>`), filled from the name's own variable. Both are registered
   * non-inheriting: a descendant that animates the same property must not answer to a name declared
   * above it, which is the same rule the activation variables follow.
   *
   * A name the build cannot write — whitespace — is recorded instead of linked, so the motion still
   * runs and the pass can report what it could not use.
   *
   * Returns the declaration that records the name, because the rule it belongs to is the host's for
   * an effect: the host spreads it into the rule it is already emitting.
   */
  const nameSlot = (key: string, attribute: string, name: string): CssInJs => {
    if (!addressableName(name)) return refusedName(name)

    for (const part of slotParts) {
      // The slot's address is always registered: it is how a name reaches one motion, and a
      // descendant that animates the same property must not answer to a name declared above it.
      registerName(cssEscape(`--jumi-slot-${key}-${part}`))

      // The name's own variable is registered the same way, with one exemption: when the name *is*
      // the attribute, that variable is the property scope's (`--jumi-rotate-animation-duration`),
      // and a scope cascades into subtrees on purpose. Registering it here would quietly turn
      // `animate-rotate-[…]/rotate` into a private address.
      if (name !== attribute) registerName(cssEscape(`--jumi-${name}-${part}`))
    }

    // Publicly visible state, so a republish is owed: the slot's chain gains its address link only
    // when the slot is named, and a name recorded after a pass has published would otherwise be an
    // address nothing reads. Measured on the differential: the link is what carries the name.
    if (!addressed.has(key)) {
      addressed.add(key)
      aggregateChanged()
    }

    return { [cssEscape(`--jumi-${key}-label`)]: name }
  }

  const perValue = (
    attribute: AnimatableStandardPropertyType,
    value: string,
    name?: string,
  ): CssInJs => {
    const id = shorthash2(value)
    const key = slotKey(attribute, id, name)
    let instances = values.get(attribute)

    if (!instances) {
      instances = new Map()
      values.set(attribute, instances)
    }

    // Move-to-end: a re-registered (variant/hover) value must land LAST in the
    // slot list so it wins under `animation-composition: replace`. Deleting and
    // re-adding it forces it to the back of the insertion order — and because the
    // key names the instance, two differently named instances of one value keep
    // an order of their own instead of overwriting each other.
    instances.delete(key)
    instances.set(key, id)

    registerName(`--jumi-${attribute}-${id}-animation-name`)
    emitKeyframe(`jumi-${attribute}-${id}`, {
      to: { [attribute]: css('var', `--jumi-${attribute}-${id}`) },
    })
    aggregateChanged()

    return {
      [`--jumi-${attribute}-${id}-animation-name`]: `jumi-${attribute}-${id}`,
      [`--jumi-${attribute}-${id}`]: value,
      ...(name ? nameSlot(key, attribute, name) : {}),
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
  const phraseKeyframe = (
    attribute: AnimatableStandardPropertyType,
    id: string,
    frames: Frame[],
  ): CssInJs => {
    const fallback = css('var', `--jumi-${attribute}`)

    return frames.reduce((acc, { offset, value }) => {
      acc[`${offset}%`] = {
        [attribute]: propertyKeyframeValue(
          attribute,
          `${id}-${offset}`,
          fallback,
        ),
      }
      return acc
    }, {} as CssInJs)
  }

  /** An effect's keyframes, emitted the first time the effect is seen. */
  const emitEffectKeyframes = (attribute: string) => {
    if (seen.has(attribute)) return
    seen.add(attribute)
    sink.keyframes(effectKeyframes[attribute])
  }

  function propertyKeyframeValue(
    attribute: AnimatableStandardPropertyType,
    suffix: string,
    fallback: string,
  ): string {
    const variable = cssEscape(`--jumi-${attribute}-${suffix}`)
    const { dependencies = [], value = fallback } = propertyVariables[attribute]

    // The fallback is the element's resting value: a phrase that does not pin a
    // frame simply does not have one, and any frame variable left unset still
    // lands on the property's resting value rather than its initial value.
    if (!dependencies.length) return css('var', variable, fallback)

    const expanded = dependencies.reduce((result, dependency) => {
      const part = propertyVariables[dependency].variable
      return result.replaceAll(
        `var(${part})`,
        `var(${cssEscape(`${part}-${suffix}`)}, var(${part}))`,
      )
    }, value)

    return css('var', variable, expanded)
  }

  function animationParts(
    attribute: string,
    nameVar?: string,
    key?: string,
  ): CssInJs {
    // Three links, narrowest first: the address a *name* installed, then a per-slot publication,
    // then the property's control, then the global default. Folded from the inside out, so the most
    // specific link is outermost and each one falls through to the next.
    const timing = (part: string) => {
      const links: string[] = []

      // What `/<name>` installed, on the rule that declared the name. Only a named slot has it.
      if (addressed.has(key ?? attribute))
        links.push(cssEscape(`--jumi-slot-${key}-${part}`))

      // The range composition variant, which publishes under the slot's **key** and not its
      // attribute: `attribute-id` for a phrase or a single value, where one attribute names a
      // property several slots share and only the key identifies which of them was qualified.
      //
      // Read here for exactly that reason, and it is not a detail: measured, a phrase's publication
      // went to `--jumi-opacity-sluPU-animation-range` while its chain read
      // `--jumi-opacity-animation-range`, so `animation-range-entry:animate-opacity-[0:0|100:1]`
      // emitted, validated, and did nothing. Effects and composed tweens hid it, because for them the
      // key *is* the attribute. Nothing else publishes per slot after the composition is built.
      if (part === 'animation-range' && key && key !== attribute)
        links.push(cssEscape(`--jumi-${key}-${part}`))

      links.push(`--jumi-${attribute}-${part}`)

      return links.reduceRight(
        (fallback, link) => css('var', link, fallback),
        css('var', `--jumi-${part}`),
      )
    }

    const name = css(
      'var',
      nameVar ?? `--jumi-${attribute}-animation-name`,
      css('var', '--jumi-animation-name'),
    )

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

    for (const [attribute, instances] of values) {
      // The key is the instance; the activation variable belongs to the definition, so two instances
      // of one value resolve one keyframe.
      for (const [key, id] of instances) {
        slots.push({
          attribute,
          key,
          nameVar: `--jumi-${attribute}-${id}-animation-name`,
        })
      }
    }

    // Composed tweens resolve one shared `jumi-{attribute}` keyframe, so they
    // resolve one shared slot. A phrase never joins them: it owns its keyframe
    // and therefore claims a slot of its own.
    for (const attribute of composed) shared.add(attribute)

    for (const attribute of sorted(shared))
      slots.push({ attribute, key: slotKey(attribute) })

    for (const [attribute, instances] of phrases) {
      for (const [key, id] of instances) {
        slots.push({
          attribute,
          key,
          nameVar: `--jumi-${attribute}-${id}-animation-name`,
        })
      }
    }

    for (const attribute of sorted(effects))
      slots.push({ attribute, key: slotKey(attribute) })

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
      ? slots.reduce((acc, { attribute, key, nameVar }) => {
          const parts = animationParts(attribute, nameVar, key)
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
          'animation-iteration-count': css(
            'var',
            '--jumi-animation-iteration-count',
          ),
          'animation-name': css('var', '--jumi-animation-name'),
          'animation-play-state': css('var', '--jumi-animation-play-state'),
          'animation-range': css('var', '--jumi-animation-range'),
          'animation-timeline': css('var', '--jumi-animation-timeline'),
          'animation-timing-function': css(
            'var',
            '--jumi-animation-timing-function',
          ),
        }

    // `interpolate-size` is deliberately not declared here, and the reason is not stylistic. It is
    // **inherited**, so writing it on a carrier opts the whole descendant subtree in: measured, a child
    // with no motion of its own computed `allow-keywords` and its own `width: 200px → auto` transition
    // interpolated, while an identical transition outside the subtree did not start at all. Jumi owns the
    // motion it writes; it does not get to change how the browser treats CSS it does not. An element opts
    // in with the `interpolate-size-*` utility, and knows it is opting its descendants in too.
    return animation
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
    return join(
      [
        css('var', `--jumi-${attribute}-transition-property`, attribute),
        css(
          'var',
          `--jumi-${attribute}-transition-duration`,
          css('var', '--jumi-transition-duration'),
        ),
        css(
          'var',
          `--jumi-${attribute}-transition-timing-function`,
          css('var', '--jumi-transition-timing-function'),
        ),
        css(
          'var',
          `--jumi-${attribute}-transition-delay`,
          css('var', '--jumi-transition-delay'),
        ),
      ],
      ' ',
    )
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
      const assembled = sorted(properties).reduce(
        (acc, attribute) => merge(acc, assemble(attribute)),
        {} as CssInJs,
      )

      const animation = computeAnimationVariable()

      return merge(animation, assembled)
    },

    color: (
      attribute,
      parts = [],
      options: { paint?: boolean } = {},
    ): MatchComponentsPropertyFunction => {
      const fn = creator.property(attribute, parts)
      // The modifier is handed through rather than dropped: a colour tween is a motion like any
      // other, so `animate-background-color-red/reveal` names it the same way `animate-opacity-50/…`
      // does. It used to be consumed and discarded, which is how "every motion may be named" and
      // "colours are the exception" could both look true.
      const painted: MatchComponentsPropertyFunction = (value, { modifier }) =>
        fn(options.paint ? toPaintHex(value) : value, { modifier })

      return Object.assign(painted, { [nameable]: true as const })
    },

    effect(attribute): string {
      effects.add(attribute)
      registerName(`--jumi-${attribute}-animation-name`)
      emitEffectKeyframes(attribute)
      aggregateChanged()
      return `jumi-${attribute}`
    },

    get effects(): string[] {
      return sorted(effects)
    },

    motion(attribute): string {
      if (motions.has(attribute)) return attribute

      motions.add(attribute)
      // A motion is aggregate state in exactly the way a slot is: if a pass has already published,
      // the composed list has to be re-said or the new motion never reaches the carrier — the
      // `transitions` candidate was compiled once and Tailwind will not revisit it.
      aggregateChanged()

      return attribute
    },

    get motions(): string[] {
      return sorted(motions)
    },

    name: (attribute, name) => nameSlot(attribute, attribute, name),

    get properties(): string[] {
      return sorted(properties)
    },

    property: (attribute, parts = []): MatchComponentsPropertyFunction => {
      const fn: MatchComponentsPropertyFunction = (value, { modifier }) => {
        const frameList = parsePhrase(value)

        // A phrase declares this animation's frames, so it owns the keyframe —
        // and with it the property. Nothing else contributes to it, so its
        // frames are safe to trust and nothing has to be shared.
        if (frameList) {
          register(attribute)

          const id = shorthash2(phraseKey(frameList))
          const key = slotKey(attribute, id, modifier)

          let instances = phrases.get(attribute)

          if (!instances) {
            instances = new Map()
            phrases.set(attribute, instances)
          }

          instances.set(key, id)
          registerName(`--jumi-${attribute}-${id}-animation-name`)
          emitKeyframe(
            `jumi-${attribute}-${id}`,
            phraseKeyframe(attribute, id, frameList),
          )
          aggregateChanged()

          // `animate-opacity-[0:0|100:1]/reveal` names this slot, so a control — or your own CSS —
          // can address it on its own. Skipped when the name is the attribute itself, because that
          // name is the property scope's, and a scope cascades into subtrees on purpose.
          const named = modifier ? nameSlot(key, attribute, modifier) : {}

          const variables = frameList.reduce(
            (acc, { offset, value: frame }) => {
              const suffix = `${id}-${offset}`

              if (!parts.length) {
                acc[cssEscape(`--jumi-${attribute}-${suffix}`)] = frame
                return acc
              }

              for (const part of parts) {
                const [property, transform] = Array.isArray(part)
                  ? part
                  : [part]
                acc[cssEscape(`--jumi-${property}-${suffix}`)] = transform
                  ? transform(frame)
                  : frame
              }

              return acc
            },
            {} as CssInJs,
          )

          return {
            [`--jumi-${attribute}-${id}-animation-name`]: `jumi-${attribute}-${id}`,
            // The frame variables are keyed by a hash of the phrase, which nobody can write by hand.
            // The name is the address a person CAN write, so the rule states it: read the slot's
            // name here, then set `--jumi-${name}-…` from your own CSS. Also what the pass reads to
            // report a name it cannot address.
            ...named,
            ...variables,
          }
        }

        register(attribute)

        if (!parts.length)
          return perValue(attribute, value, modifier ?? undefined)

        composed.add(attribute)
        registerName(`--jumi-${attribute}-animation-name`)
        emitKeyframe(`jumi-${attribute}`, {
          to: { [attribute]: css('var', `--jumi-${attribute}`) },
        })
        aggregateChanged()

        const variables = parts.reduce((acc, part) => {
          const [property, transform] = Array.isArray(part) ? part : [part]
          acc[`--jumi-${property}`] = transform ? transform(value) : value
          return acc
        }, {} as CssInJs)

        return {
          [`--jumi-${attribute}-animation-name`]: `jumi-${attribute}`,
          ...(modifier ? nameSlot(attribute, attribute, modifier) : {}),
          ...variables,
        }
      }

      // Tagged, not wrapped: the host has to know which matchers read their modifier as a *name*,
      // because that is what decides whether Tailwind accepts a bare `/reveal` on them at all. No
      // second list of matcher names can stay in step with four hundred entries.
      return Object.assign(fn, { [nameable]: true as const })
    },

    scope(part: string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        if (!modifier) return { [`--jumi-${part}`]: value }

        // The modifier names a property — `rotate` — or the name a declaration gave one of its
        // animations — `flick`, from `animate-rotate-[…]/flick`. Either way it is one word, so the
        // variable is just the modifier and the part. Escaped, because a custom property name
        // cannot carry a stray dot — and refused outright when it carries whitespace, which is not
        // a name any motion could have answered to and is not a declaration PostCSS can parse.
        if (!addressableName(modifier)) return refusedName(modifier)

        return { [cssEscape(`--jumi-${modifier}-${part}`)]: value }
      }
    },

    stagger(
      part: string,
      expression: (context: StaggerContext) => string,
    ): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        const length = modifier ? Number.parseInt(modifier, 10) : null

        const adaptive = {
          '& > *': {
            [`--jumi-stagger-${part}`]: expression({
              index: null,
              length: null,
              value,
            }),
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
          {
            '@supports (animation-delay: calc(sibling-index() * 1ms))':
              adaptive,
          },
          {
            '@supports not (animation-delay: calc(sibling-index() * 1ms))':
              fallback,
          },
        ]
      }
    },

    theme: (key, values) => {
      return themeSource(key, values)
    },

    transition(part: string): MatchUtilitiesPropertyFunction {
      return (value, { modifier }) => {
        if (!modifier)
          return { ...(value && { [`--jumi-transition-${part}`]: value }) }
        // Same refusal, same reason: a motion name is the middle of a custom property's name here
        // too, and the declaration it would produce is the one PostCSS cannot parse.
        if (!addressableName(modifier)) return refusedName(modifier)

        creator.motion(modifier)

        return {
          [cssEscape(`--jumi-${modifier}-transition-${part}`)]:
            part === 'property' ? modifier : value,
        }
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
/**
 * Whether a value is a phrase — a value that declares its own frames rather than naming a CSS scalar.
 *
 * Exported because the host needs the same test: a phrase is not a CSS value of any type, so a matcher
 * that declares one never sees it (Tailwind validates the arbitrary value before the function runs),
 * and the way a phrase reaches Jumi is a *second* handler under the same utility prefix that takes only
 * phrases. Both sides have to agree on what one is, so the grammar is stated once.
 */
export const isPhrase = (value: string) => parsePhrase(value) !== null

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

    if (char === '"' || char === "'") quote = char
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
