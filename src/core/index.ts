import type { CarrierKind } from '@/helpers/carriers'
import type {
  AnimatableStandardPropertyType,
  Collection,
  Creator,
  CssInJs,
  MatchComponentsPropertyFunction,
  MatchUtilitiesPropertyFunction,
  PropertyType,
  StaggerContext,
} from '@/types'

import { assemble } from '@/helpers/assemble'
import { instanceKey, parseInstanceKey } from '@/helpers/carriers/instance'
import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { toPaintHex } from '@/helpers/paint'
import { replaceSlots } from '@/helpers/slots'
import { effectKeyframes } from '@/keyframes/effects'
import { isFullyAddressable } from '@/variables/composition'
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
  /**
   * The components this slot's candidates address — `scale-x` for `animate-scale-x-[…]` — as
   * **metadata for the timing chain**, not as identity. The chain reads the component's scope
   * outermost, because that is the address an author-facing control already writes
   * (`animation-duration-3000/scale-x` becomes `--jumi-scale-x-animation-duration`).
   *
   * Empty for a slot that addresses no component, and **more than one entry when several candidates
   * share the slot** — the shared composed slot a `scale-x` and a `scale-y` tween both join. That is
   * why it is a list rather than a name: a slot claiming two components has no single component
   * address, and the chain declines the rung rather than picking one.
   */
  components?: string[] | undefined
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
 * The parts an `animation` shorthand cannot carry, and which therefore have to be assigned as their
 * own declarations: `animation-composition`, `animation-range` and `animation-timeline` have no
 * section in the shorthand.
 *
 * Exported because two modules have to agree about the split and the split is one fact. `nameSlot`
 * registers these three as slot-keyed variables — the other seven travel inside the hoist, whose value
 * is published on the rule that named the motion — and `@/helpers/carriers` fills exactly these three
 * for a named instance. Two copies of this list is how the registration and the fill would come to
 * disagree, and a variable registered with nothing to fill it is the exact shape of the bug this pass
 * has already paid for once.
 */
export const separateParts = [
  'animation-composition',
  'animation-range',
  'animation-timeline',
] as const

/**
 * The parts the `animation` **shorthand** carries, and therefore the parts a phrase must never be written
 * into.
 *
 * One declaration, so one invalid component costs the whole thing. Measured: `animation-timing-function-[0:ease-out]`
 * left the element with `animation-name: none`, `animation-duration: 0s` and *zero* animations. The motion
 * does not misbehave, it disappears — and nothing about the page says a motion was ever intended.
 *
 * `animation-*` less the three the shorthand cannot carry, because those are declared separately: a nonsense
 * value there costs one longhand, which the cascade repairs through the fallback chain. Derived from
 * `separateParts` rather than restated, so the guard cannot drift from the split it depends on.
 */
const carriedByShorthand = (part: string) =>
  part.startsWith('animation-') &&
  !(separateParts as readonly string[]).includes(part)

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
 * Whether a token is a **structural address** — a property Jumi animates, or an effect — rather than a
 * name an author chose.
 *
 * This is the one discriminator that lets `/scale` mean one thing. A control's modifier used to be read
 * twice: as the property scope of every slot animating `scale`, and as the label address of any motion
 * named `scale`. One variable, two readers — so `animation-duration-1000/scale` set both, and an
 * author's `animation-duration-400/rotate` lost to a class they never wrote for that motion. Measured:
 * `1s, 1s`, where the author's own control said `400ms`.
 *
 * The vocabulary is deliberately **static** — the properties of `propertyVariables` and the effects of
 * `effectKeyframes` — and not "the attributes this stylesheet happens to animate". A structural address
 * is implicit, stable and part of Jumi's core model: `--jumi-rotate-animation-duration` is the rotate
 * property's scope whether or not a given page animates rotate. Reading it off the sheet instead would
 * make `/scale` change meaning when an unrelated element elsewhere started animating scale, which is the
 * same element-local inference this discriminator exists to remove, one level up.
 *
 * The cost is the accepted one: a motion labelled with the exact name of a property Jumi animates cannot
 * be addressed by that name. `animate-rotate-45/scale` beside `animation-duration-500/scale` is the
 * scale property's, and the rotate motion keeps its own scope. That label is not silently dropped —
 * `nameSlot` records it and the pass reports it — because the alternative is a control that looks like
 * it works.
 */
export const structuralAddress = (token: string) =>
  Object.hasOwn(propertyVariables, token) ||
  Object.hasOwn(effectKeyframes, token)

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
 * The name enters the key, so the key is a discriminator rather than a label. The aggregate's chains
 * are keyed by this string, and a name must not reach the composition: a name is something an author
 * writes on one element, and the composition is derived from the whole corpus. The address a person
 * writes down is `--jumi-label-<name>-<part>`, in a namespace of its own — so a name and a property can
 * never end up being the same custom property.
 *
 * A named instance carries its own length, and the format belongs to `instanceKey` in
 * `@/helpers/carriers/instance` — one statement of it, imported by the writer and the readers alike:
 *
 *   --jumi-slot-5-flick-Z2excak-rotate
 *   --jumi-slot-24-flick-animation-duration-Z2excak-rotate
 *
 * A length prefix is what makes the key *exact* rather than merely readable. Joined only by hyphens, the
 * name, the attribute and the id cannot be told apart by their contents — any name may hold a hyphen, so
 * `foo-accent` + `color` and `foo` + `accent-color` are one string, and even with the id between them a name
 * whose tail is another instance's id absorbs its key (`scripts/spike-slot-boundary.mjs` measures both).
 * The count puts the boundary in the shape instead: read the digits, take that many units, and the rest is
 * the id and the attribute. Unnamed slots keep `attribute-id`, where there is no name to delimit.
 */
const slotKey = (attribute: string, id?: string, name?: null | string) =>
  id
    ? name
      ? instanceKey(attribute, id, name)
      : `${attribute}-${id}`
    : attribute

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
   * The part tween instances that own their motion identity.
   *
   * A part tween on a **fully addressable** composite operates on one component of a composed
   * property — `scale-x` of `scale` — and that component is a property in its own right, so the
   * motion can be addressed and timed on its own. The three names are recorded apart rather than
   * collapsed into a key because here they genuinely diverge, and a reader that assumed
   * `key === attribute` would be wrong for every entry in this bucket:
   *
   *   attribute    the property the animation writes      `scale`
   *   component    the constituent it owns                `scale-x`
   *   key          the slot identity, and its address     `scale-x`
   *
   * Not folded into `composed`: a composed slot is one shared slot per attribute, which is exactly
   * the identity independence is being given up for.
   */
  const partTweens = new Map<
    string,
    {
      attribute: AnimatableStandardPropertyType
      component: string
      key: string
      nameVar: string
    }
  >()

  /**
   * What each candidate addresses on a composed attribute — the writer class a per-frame component
   * read depends on.
   *
   * A composed property's frame value is its composition, and a component of that composition is read
   * **frame-first**: `var(--jumi-scale-x-<id>-0, var(--jumi-scale-x))`. The key is written by a phrase
   * that *addresses* the component — `animate-scale-x-[0:1|100:0]` writes `--jumi-scale-x-<id>-0` —
   * and `<id>` is a hash of the frames alone, so a constituent phrase and a phrase over the same frames
   * on the composed attribute share it. That is what makes the read safe to emit: the writer exists as
   * a **class**, whether or not the stylesheet being compiled happens to contain it.
   *
   * Recorded where each candidate declares what it addresses, and deliberately **not** derived from the
   * dependency graph, because the two disagree in both directions: `box-shadow` declares
   * `box-shadow-inset`/`box-shadow-outset` as dependencies and no candidate addresses either, while
   * `scale` declares three components and candidates address all three. Neither table can stand in for
   * the other, and only this one answers the question the substitution asks.
   */
  const surfaces = new Map<AnimatableStandardPropertyType, Set<string>>()

  /**
   * The components each **slot** addresses, recorded where the slot is created.
   *
   * A slot's component is what an author-facing `/scale-x` control addresses, so the timing chain
   * has to read it — and it is not derivable from the slot key, which for a phrase is a hash of the
   * phrase's frames (`scale-1vrwYE`). Recorded per slot rather than read off `surfaces`, because
   * `surfaces` is keyed by attribute and answers a different question: which components *some*
   * candidate addresses, not which one this motion does.
   *
   * A `Set`, so two candidates sharing one slot accumulate rather than overwrite — and so the chain
   * can tell "one component" from "several", which is the distinction that decides whether a
   * component-specific rung is answerable at all.
   */
  const componentsOf = new Map<string, Set<string>>()

  /**
   * Record the components a motion addresses, against the slot it creates.
   *
   * A whole motion addresses none, and records none: `animate-scale-[2]` writes the property rather
   * than a component of it, so a component rung for its slot would be a read with no writer.
   */
  const recordComponents = (
    key: string,
    parts: ReadonlyArray<[string, ...unknown[]] | string>,
  ) => {
    const names = parts.map(part =>
      String(Array.isArray(part) ? part[0] : part),
    )

    if (!names.length) return

    const known = componentsOf.get(key)

    if (known) for (const name of names) known.add(name)
    else componentsOf.set(key, new Set(names))
  }

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
   * Record a name that is a structural address, so the build can report it.
   *
   * A different refusal from `refusedName`, and the difference is what an author should do about it: a
   * name with whitespace is unwritable, and one that collides with a property is writable but already
   * taken. `animate-rotate-45/scale` names the rotate motion `scale`, and `/scale` on a control is the
   * scale property's scope — every motion animating scale, and not this one. Nothing is broken and
   * nothing is ambiguous to the engine; the author's intent was simply unrepresentable, and a warning is
   * the only thing that can say so.
   *
   * The record replaces the label declaration rather than accompanying it, so the CSS carries no address
   * that nothing fills: with no label declared, the slot keeps the plain chain, and its timing is the
   * property scope's, which is what a control written `/<attribute>` addresses anyway.
   *
   * Naming a motion after the property it animates is *not* this case. One scope serves both readings,
   * so `animate-rotate-45/rotate` beside `animation-duration-400/rotate` is coincident rather than
   * ambiguous — documented behaviour, and not something to warn about.
   */
  const shadowedName = (name: string): CssInJs => ({
    [cssEscape(`--jumi-name-${shorthash2(name)}-shadowed`)]: name,
  })

  /**
   * Record an addressed timing phrase, as intent for the pass to act on.
   *
   * The handler cannot resolve this itself, and that is the whole shape of the feature. A control's
   * declarations are handed to the framework once, when that candidate is compiled, and a candidate is never
   * revisited — so a handler that enumerates the motions an address reaches can only ever see the ones
   * compiled *before* it. Measured on the differential: with the candidate list reversed, an addressed phrase
   * selected nothing at all and both motions read their base definitions.
   *
   * So the model records **what the author asked for** — an address, and the segments — and nothing else. The
   * pass turns that into a specialized definition and an instance selection, because it is the only place
   * that sees the finished stylesheet.
   *
   * Property name and value are one fact each, in the shape the name records already use: the hash keeps two
   * addresses on one rule from overwriting each other, and it is inert — nothing resolves it. `segmentIntent`
   * in the pass is its only reader, and it drops the declaration once it has.
   *
   * The address and the phrase share the value, separated by the first space, because the address is
   * guaranteed whitespace-free (`addressableName`) and the phrase may contain anything else — including `|`,
   * `:` and commas, all of which an easing function uses. Nothing has to be escaped, and nothing has to be
   * unescaped: a modifier carrying a dot would not survive being written into a property name.
   */
  const segmentRecord = (modifier: string, phrase: string): CssInJs => ({
    [cssEscape(`--jumi-segment-${shorthash2(`${modifier}|${phrase}`)}`)]:
      `${modifier} ${phrase}`,
  })

  /**
   * Name a slot: install an address for the elements that wrote the name, and say so in the rule.
   *
   * Nothing here reaches the aggregate, and that is the point. A name is element-local —
   * `animate-fade-in/reveal` names the motion for the elements matching *that* rule — so the name is
   * written where the value it configures is published. For the parts the `animation` shorthand
   * carries, that is the hoist's own value on that rule: the name becomes the first link of each part's
   * chain, and a control writes `--jumi-label-<name>-<part>`.
   *
   * The three parts the shorthand cannot carry are the exception, and the one exception is structural:
   * `animation-composition`, `animation-range` and `animation-timeline` are declared by the composition,
   * which is a single rule for every activating selector and therefore knows no names. The name reaches
   * them the only way a shared rule can — through a slot-keyed variable (`--jumi-slot-<key>-<part>`) that
   * the rule naming the motion fills from the label namespace (`--jumi-label-<name>-<part>`). Both are
   * registered non-inheriting for the reason above: a descendant that animates the same property must not
   * answer to a name declared above it, which is the same rule the activation variables follow.
   *
   * The label namespace is what makes a name unable to collide with a property. Structural addresses are
   * always `--jumi-<attribute>-<part>`, and `label-` is never an attribute, so `/scale` as a property and
   * `scale` as a name stop being one custom property. See `structuralAddress` for the reading that had to
   * change with it, and the one case it costs.
   *
   * Two names that cannot be linked are recorded instead, so the motion still runs and the pass can
   * report what it could not use: whitespace cannot be written at all (`refusedName`), and a name that is
   * a structural address is already taken (`shadowedName`).
   *
   * Returns the declaration that records the name, because the rule it belongs to is the host's for
   * an effect: the host spreads it into the rule it is already emitting.
   */
  const nameSlot = (key: string, attribute: string, name: string): CssInJs => {
    if (!addressableName(name)) return refusedName(name)

    // A structural address wins, and the name is reported rather than linked — except when the name is
    // this motion's own attribute, where one scope serves both readings and there is nothing to say.
    if (structuralAddress(name))
      return name === attribute ? {} : shadowedName(name)

    // The finalizer publishes a named instance under its own hoisted key, not
    // the shared definition key registered by the activation variable. Without
    // this registration, nested animating elements inherit the parent's instance.
    registerName(cssEscape(`--jumi-slot-${key}`))

    // A slot whose key does **not** spell its name still travels through a slot-keyed variable, filled on
    // the rule that named the motion. That is an effect -- whose key is the definition's own word, because
    // every name of that effect shares one slot -- and a composed tween, which has the same shape. The
    // chain cannot name them: the composition is one rule for every activating selector, so a name written
    // there would be whichever name was recorded last. Registered for the reason it always was, too — a
    // descendant that animates the same property must not answer to a name declared above it.
    if (parseInstanceKey(key)?.name !== name)
      for (const part of separateParts)
        registerName(cssEscape(`--jumi-slot-${key}-${part}`))

    for (const part of slotParts) {
      // The name's own variable lives in the label namespace, so it cannot be the property scope's:
      // a scope is `--jumi-<attribute>-<part>`, and no attribute is `label-…`. This used to be
      // registered under the name itself, with an exemption for the identity case, because there the
      // two roles really were one variable.
      //
      // `inherits: false` is what the separate parts' chains rest on: the composition is one rule for every
      // activating selector, so a label has to be present only where it was written or it becomes an address
      // everywhere. For a slot whose key spells its name the chain reads this variable directly, which is
      // why the slot-keyed registration above is conditional rather than gone — the shape that cannot read a
      // label still needs it, and a registration with nothing to fill it is an address that reads as silence.
      registerName(cssEscape(`--jumi-label-${name}-${part}`))
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
   * The properties a generated frame may animate **as themselves**: CSS's logical corner radii.
   *
   * These four are longhands in their own right, not components of anything. `border-radius` is the
   * *physical* shorthand, while these are an alternative set the platform resolves against the
   * element's direction and writing mode — measured 2026-09-16 in Chromium: the same four values
   * compute to `10px 20px 30px 40px` under `ltr`, `20px 10px 40px 30px` under `rtl`, and
   * `40px 10px 20px 30px` under `vertical-rl`.
   *
   * So they cannot be composed into `border-radius` without Jumi deciding that mapping itself, and a
   * build has no direction to decide it with. A frame that declares them lets the browser resolve, which
   * is the whole reason this list exists: it is the one fact a generated frame needs that the table does
   * not carry — that a part is a property the browser will place on its own.
   *
   * Recording it for these four is deliberately narrow. The general form is a property-kind fact on the
   * table's entries, and that is a migration rather than a first step.
   */
  const independentProperties = new Set<string>([
    'border-end-end-radius',
    'border-end-start-radius',
    'border-start-end-radius',
    'border-start-start-radius',
  ])

  /**
   * A phrase's keyframe: every frame folded into the one keyframe the phrase owns, because a frame does
   * not earn a keyframe of its own.
   *
   * `properties` is the list of parts a phrase addresses **as properties**, or `null` for the ordinary
   * case of components of a composition. When it is set, each part gets its own declaration reading its
   * own frame key — the outer read's shape, repeated — and the composed attribute is not written at all.
   * Synthesizing them back into it would put the logical-to-physical mapping in Jumi's hands instead of
   * the browser's.
   */
  const phraseKeyframe = (
    attribute: AnimatableStandardPropertyType,
    properties: null | string[],
    id: string,
    frames: Frame[],
    writesOuterFrame: boolean,
  ): CssInJs => {
    if (properties)
      return frames.reduce((acc, { offset }) => {
        acc[`${offset}%`] = Object.fromEntries(
          properties.map(property => [
            property,
            css(
              'var',
              cssEscape(`--jumi-${property}-${id}-${offset}`),
              css('var', `--jumi-${property}`),
            ),
          ]),
        )

        return acc
      }, {} as CssInJs)

    const fallback = css('var', `--jumi-${attribute}`)

    return frames.reduce((acc, { offset, value }) => {
      acc[`${offset}%`] = {
        [attribute]: propertyKeyframeValue(
          attribute,
          `${id}-${offset}`,
          fallback,
          writesOuterFrame,
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

  /**
   * A composition slot: `var(<name>)`, or `var(<name>, <fallback>)` where the fallback nests at most one
   * level. The syntax lives in `@/helpers/slots` because addressability is derived from the same read —
   * one statement of the slot shape, so a change to it cannot reach one consumer and not the other.
   */
  const hookSlot = (value: string, part: string, hook: string) =>
    replaceSlots(value, (match, name, fallback) =>
      name === part ? `var(${hook}, var(${name}${fallback}))` : match,
    )

  function propertyKeyframeValue(
    attribute: AnimatableStandardPropertyType,
    suffix: string,
    fallback: string,
    writesOuterFrame: boolean,
  ): string {
    const variable = cssEscape(`--jumi-${attribute}-${suffix}`)
    const { dependencies = [], value = fallback } = propertyVariables[attribute]

    // A composed property's value names its own components, so a frame's value is that composition —
    // `var(--jumi-scale-x) var(--jumi-scale-y) var(--jumi-scale-z)` — with every component a candidate
    // can address read frame-first instead:
    //
    //   `var(--jumi-scale-x-<id>-0, var(--jumi-scale-x)) var(--jumi-scale-y) var(--jumi-scale-z)`
    //
    // Both halves of that read are load-bearing. The frame key is written by a phrase addressing the
    // component, and because `<id>` hashes the frames and not the surface, `animate-scale-x-[0:1|100:0]`
    // and the composed phrase over the same frames agree on it — which is how an element carrying both
    // resolves each component at its own frame. The element-level fallback keeps a lone phrase honest:
    // no sibling wrote that key, so the component rests at the value the element already had.
    //
    // Made **only** for components in `surfaces`, i.e. where a candidate class exists to write the key.
    // `box-shadow-inset`/`box-shadow-outset` are the counter-example that makes the predicate
    // load-bearing: dependencies of `box-shadow` that no candidate addresses, so a hook for either
    // would be a read no phrase in the language can satisfy.
    const composed = dependencies.length
      ? dependencies.reduce((result, dependency) => {
          const part = propertyVariables[dependency].variable

          if (!surfaces.get(attribute)?.has(dependency)) return result

          return hookSlot(result, part, cssEscape(`${part}-${suffix}`))
        }, value)
      : fallback

    // The outer read is emitted only when **this phrase wrote that key**. A constituent-authored
    // phrase writes its parts' keys instead (`--jumi-scale-x-<id>-<offset>`), so its frame would
    // otherwise read a variable nothing fills — the second dead shape measured
    // (`--jumi-outline-<id>-<offset>`), where the value arrives through the composition above and
    // the outer branch could never win.
    //
    // `fallback` is the element's resting value: a phrase that does not pin a frame simply does not
    // have one, and any frame variable left unset still lands on the property's resting value rather
    // than its initial value.
    return writesOuterFrame ? css('var', variable, composed) : composed
  }

  function animationParts(
    attribute: string,
    nameVar?: string,
    key?: string,
  ): CssInJs {
    // At most five links, narrowest first: the **component** the motion addresses, the label or slot a
    // name wrote, the range variant's publication, the property's control, then the global default.
    // Folded from the inside out, so the most specific link is outermost and each one falls through to
    // the next — which is what keeps a `/rotate` control on a wrapper reaching a descendant, since the
    // property scope is a rung rather than the only link.
    const timing = (part: string) => {
      const links: string[] = []

      /**
       * The **component** scope, and the reason it is outermost.
       *
       * `animation-duration-3000/scale-x` writes `--jumi-scale-x-animation-duration`, and a part phrase
       * animating `scale-x` already owns a slot of its own with its own name — but its duration,
       * delay and easing read the *property* scope, so the control reached nothing. A motion that is
       * independently named and not independently timed is internally inconsistent, and that is the
       * whole of this rung.
       *
       * Made only when the slot addresses **exactly one** component. A slot several candidates share
       * — the composed `scale` slot both a `scale-x` and a `scale-y` tween join — has no single
       * component address, and picking one would hand `/scale-x` a motion the author never pointed
       * it at. Declining is the honest answer: those slots fall through to the property scope, which
       * is where they were before.
       *
       * Skipped when the component *is* the attribute (`animate-border-block-color` addresses
       * `border-block-color` on `border-block-color`), because the property scope below is then the
       * same address and a second rung would read the identical variable.
       */
      const components = componentsOf.get(key ?? attribute)

      if (components?.size === 1) {
        const [component] = [...components]

        if (component && component !== attribute)
          links.push(cssEscape(`--jumi-${component}-${part}`))
      }

      // The three the shorthand cannot carry, and only for an addressed slot. The other seven are swapped
      // for the label inside the hoist's **value** (`namedHoist`), and that value is published on the rule
      // that named the motion, so it is element-local without a chain link. These three have no shorthand
      // section to ride in — the composition declares them — so the name has to be read here.
      //
      // Locality is unaffected, and that is measured rather than hoped: `nameSlot` registers the label
      // `inherits: false`, so an element that wrote no name has no value for it and falls through the
      // chain. Checked with two names over one definition, a descendant, a bare sibling, a refused name
      // and both candidate orders (`scripts/spike-label-link.mjs` §2 — identical readings in every one).
      if (addressed.has(key ?? attribute)) {
        // Read back out of the key, never escaped again: the key holds the emitted text already, and
        // escaping it a second time is how `foo.bar` became `foo\\.bar` and stopped resolving.
        const { name } = parseInstanceKey(key ?? '') ?? {}
        const labelled =
          name && separateParts.includes(part as never) ? name : null

        links.push(
          cssEscape(
            labelled
              ? `--jumi-label-${labelled}-${part}`
              : `--jumi-slot-${key}-${part}`,
          ),
        )
      }

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
          components: [...(componentsOf.get(key) ?? [])],
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
      slots.push({
        attribute,
        components: [...(componentsOf.get(slotKey(attribute)) ?? [])],
        key: slotKey(attribute),
      })

    // A part tween that owns its identity, keyed by the **component** rather than the attribute. Its
    // `nameVar` is built from the component too, which is the one place a slot's name variable is not
    // `--jumi-<attribute>-<id>-…` — the attribute and the key diverge here by design.
    for (const key of [...partTweens.keys()].sort()) {
      const one = partTweens.get(key)

      if (!one) continue

      slots.push({
        attribute: one.attribute,
        components: [one.component],
        key: one.key,
        nameVar: one.nameVar,
      })
    }

    for (const [attribute, instances] of phrases) {
      for (const [key, id] of instances) {
        slots.push({
          attribute,
          components: [...(componentsOf.get(key) ?? [])],
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
      // Recorded at the declaration, not at the use: the substitution in `propertyKeyframeValue` asks
      // whether a writer *class* exists, so a candidate that is registered but never used is exactly as
      // relevant as one that is. Unregistering on use would make the answer depend on candidate order
      // — the shape that made the label links order-sensitive twice already.
      for (const part of parts) {
        const component = Array.isArray(part) ? part[0] : part
        const known = surfaces.get(attribute)

        if (known) known.add(component)
        else surfaces.set(attribute, new Set([component]))
      }

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
          recordComponents(key, parts)
          emitKeyframe(
            `jumi-${attribute}-${id}`,
            phraseKeyframe(
              attribute,
              // Every part a property the browser resolves on its own — and only then — makes this a
              // frame of properties rather than of one composed value. A mixed phrase (one of these
              // beside a component of a shorthand) is not a shape any candidate declares today, and it
              // falls through to the composition rather than guessing.
              parts.length &&
                parts.every(part =>
                  independentProperties.has(
                    Array.isArray(part) ? part[0] : part,
                  ),
                )
                ? parts.map(part => (Array.isArray(part) ? part[0] : part))
                : null,
              id,
              frameList,
              // Did this phrase write the attribute's own frame key? With no parts it writes
              // `--jumi-${attribute}-${id}-${offset}` and nothing else, so yes. With parts it writes the
              // parts' keys — and a part that *is* the attribute (`animate-border-block-color` declares
              // `color('border-block-color', ['border-block-color'])` in `src/properties/tween.ts`) means
              // the part key and the attribute key are the same name, so the read is this frame's only
              // possible consumer.
              //
              // The narrowing is the whole of the difference: `!parts.length` alone left that second
              // case reading nothing at all, measured as one of the candidates whose frame value was
              // written and never read.
              !parts.length ||
                parts.some(
                  part => (Array.isArray(part) ? part[0] : part) === attribute,
                ),
            ),
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
            // name here, then set `--jumi-label-${name}-…` from your own CSS. Also what the pass reads
            // to report a name it cannot address.
            ...named,
            ...variables,
          }
        }

        register(attribute)

        if (!parts.length)
          return perValue(attribute, value, modifier ?? undefined)

        // The same rule on the tween path: a candidate addressing properties animates those properties,
        // so a value addressed on a logical corner arrives as that corner and the browser places it.
        const independent =
          parts.length &&
          parts.every(part =>
            independentProperties.has(Array.isArray(part) ? part[0] : part),
          )
            ? parts.map(part => (Array.isArray(part) ? part[0] : part))
            : null

        const variables = parts.reduce((acc, part) => {
          const [property, transform] = Array.isArray(part) ? part : [part]
          acc[`--jumi-${property}`] = transform ? transform(value) : value
          return acc
        }, {} as CssInJs)

        /**
         * A part tween on a fully addressable composite **owns its motion identity**.
         *
         * The gate is `isFullyAddressable`, which is a fact about the graph and therefore fixed
         * before any candidate compiles — so this is not a decision that a later candidate can
         * invalidate, and nothing has to be retracted. What it buys is a slot an author's control
         * can address on its own: a `/scale-x` duration, delay or easing, which no part motion had
         * before, because every part tween of an attribute shared one identity.
         *
         * A whole tween on the same attribute is **orthogonal**. `animate-scale-[2]` registers
         * through `perValue` and keeps its own identity, so `scale` plus `scale-x` is two live
         * motions whatever order Tailwind discovers them in.
         *
         * One part only. A candidate addressing two components has no single identity to take, and
         * inventing one would put two constituents behind an address that names neither.
         */
        const component =
          parts.length === 1
            ? String(Array.isArray(parts[0]) ? parts[0][0] : parts[0])
            : null

        if (component && isFullyAddressable(attribute)) {
          const nameVar = `--jumi-${component}-animation-name`
          const endpoint = cssEscape(`--jumi-${component}-100`)
          const leaf = propertyVariables[component as PropertyType].variable

          partTweens.set(component, {
            attribute,
            component,
            key: component,
            nameVar,
          })

          // Recorded under the **component** so the timing chain reads the component scope
          // (`--jumi-scale-x-animation-duration`) as its narrowest rung — the address `/scale-x`
          // writes. Recorded here rather than left to the shared path because the slot key is no
          // longer the attribute, and nothing else would record it.
          recordComponents(component, parts)
          registerName(nameVar)

          /**
           * The frame hooks **only the owned component**.
           *
           * `scale: var(--jumi-scale-x-100, var(--jumi-scale-x)) var(--jumi-scale-y)
           * var(--jumi-scale-z)` — the other components read their element-level leaves, which is
           * what keeps a lone part tween animating the whole property to the value it always did.
           * A frame that hooked every addressable component would read `--jumi-scale-y-100`, which
           * nothing writes: a dead read, and the exact class this session has already paid for
           * twice.
           */
          emitKeyframe(`jumi-${component}`, {
            to: independent
              ? Object.fromEntries(
                  independent.map(property => [
                    property,
                    css('var', `--jumi-${property}`),
                  ]),
                )
              : {
                  [attribute]: hookSlot(
                    propertyVariables[attribute].value,
                    leaf,
                    cssEscape(`${leaf}-100`),
                  ),
                },
          })
          aggregateChanged()

          return {
            // Both, not either: the endpoint is what the animation reads, and the resting leaf is
            // what the element resolves to with no animation running. Writing only the endpoint
            // would move an element's resting value; writing only the leaf would give the
            // animation no target of its own.
            [endpoint]: String(variables[`--jumi-${component}`] ?? value),
            [nameVar]: `jumi-${component}`,
            ...(modifier ? nameSlot(component, component, modifier) : {}),
            ...variables,
          }
        }

        composed.add(attribute)
        registerName(`--jumi-${attribute}-animation-name`)
        recordComponents(slotKey(attribute), parts)

        emitKeyframe(
          `jumi-${attribute}`,
          independent
            ? {
                to: Object.fromEntries(
                  independent.map(property => [
                    property,
                    css('var', `--jumi-${property}`),
                  ]),
                ),
              }
            : { to: { [attribute]: css('var', `--jumi-${attribute}`) } },
        )
        aggregateChanged()

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
        // An unsupported shape emits nothing, the way a candidate the framework does not recognize emits
        // nothing — the same answer the motion matcher gives a non-phrase value
        // (`isPhrase(value) ? fn(value, extra) : {}` in the host).
        //
        // A timing phrase with an address is not unsupported: it is segment easing, recorded as **intent**
        // for the pass to act on (`segmentRecord`). Anyone else, and every unaddressed phrase, still emits
        // nothing: a phrase is not a `<time>` or an `<easing-function>`, and writing one into the chain makes
        // the whole `animation` shorthand invalid at computed-value time — the element reports
        // `animation-name: none` and the motion vanishes rather than misbehaving.
        //
        // The handler deliberately does **not** resolve the instances an address reaches. It cannot: a
        // candidate is compiled once and never revisited, so it would only ever see the motions that happened
        // to be compiled before it — measured, and it lost every selection when the candidate order was
        // reversed.
        //
        // No warning, deliberately. There is nothing contradictory to report: Jumi has no address, so it has
        // no intent to act on, and explaining an unsupported shape is not diagnostics — it is a second
        // language for the same candidate. Warnings stay where acceptance proves the author wrong.
        if (isPhrase(value) && carriedByShorthand(part)) {
          if (part !== 'animation-timing-function' || !modifier) return {}

          if (!addressableName(modifier)) return refusedName(modifier)

          return segmentRecord(modifier, value)
        }

        if (!modifier) return { [`--jumi-${part}`]: value }

        // The modifier names a property — `rotate` — or the name a declaration gave one of its
        // animations — `flick`, from `animate-rotate-[…]/flick`. Either way it is one word, so the
        // variable is the modifier and the part, in one of two namespaces: a structural token reads
        // the property scope every motion of that property answers to, and a name reads the label
        // namespace only the motion that declared it fills. One class is one address — which is what
        // stops `/scale` from configuring a motion named `scale` as well as the scale property.
        // Escaped, because a custom property name cannot carry a stray dot — and refused outright when
        // it carries whitespace, which is not a name any motion could have answered to and is not a
        // declaration PostCSS can parse.
        if (!addressableName(modifier)) return refusedName(modifier)

        return {
          [cssEscape(
            structuralAddress(modifier)
              ? `--jumi-${modifier}-${part}`
              : `--jumi-label-${modifier}-${part}`,
          )]: value,
        }
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

export function parsePhrase(value: string): Frame[] | null {
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
