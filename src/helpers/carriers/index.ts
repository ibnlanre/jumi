import type { Container, Root, Rule } from 'postcss'

import type { Product, ViewTransitionStaging } from './view-transition'
import type { Collection } from '@/types'

import { RANGE_GRAMMAR, rangeAccepted, rangeReadings } from './animation-range'
import { ACTIVATED_SLOT, instanceKeys, ownDeclarations } from './instance'
import {
  emitViewTransitions,
  isStagingSelector,
  viewTransitionStaging,
} from './view-transition'

import cssEscape from 'css.escape'
import postcss from 'postcss'

/**
 * The carrier protocol, and the one engine that completes it.
 *
 * Jumi has no carrier class, and no dormant rule waiting to become one. An element opts in by
 * animating: a rule *activates* a slot when it declares the generated name variable a slot is
 * named by, and that is a fact this pass reads off the finished stylesheet, with variants and
 * `@apply` already resolved.
 *
 *   .animate-rotate-45 { --jumi-rotate-3zWYd-animation-name: jumi-rotate-3zWYd; … }
 *   .transition-duration-500\/rotate { --jumi-rotate-transition-duration: 500ms; }
 *
 * What an animating element needs is not in that rule, though, and cannot be: the composition is a
 * list of every slot in the stylesheet, and each entry is a `var()` over a slot variable that only
 * exists on the element. Tailwind emits the activation utilities as it discovers them, so no
 * utility can hold the list — it would be stale the moment another slot appeared, or one rule per
 * element.
 *
 * So the composition is written **after** the cascade rather than built out of it. The model
 * stages the data in a rule that is never output, and this pass reads it, derives the selectors
 * that animate, and synthesizes what a browser needs:
 *
 *   payload rule     → read the data and the element-local defaults, then remove the rule
 *   activation rule  → contributes its selector to the group its kind is written on
 *   anything else    → untouched
 *
 * Two rules come out of it per kind, and the split is what makes the cascade safe:
 *
 *   @layer utilities {
 *     .animate-rotate-45, .animate-scale-110 {           ← the defaults it resolves through
 *       --jumi-animation-duration: 1s;                   ← first in the layer, so a control wins
 *       --jumi-animation-delay: var(--jumi-stagger-animation-delay, 0s); …
 *     }
 *     … the activations, the controls, the variants Tailwind generated …
 *     .animate-rotate-45, .animate-scale-110 {           ← the composition
 *       animation-name: var(--jumi-rotate-3zWYd-animation-name, …), …;
 *       interpolate-size: var(--jumi-interpolate-size);
 *     }
 *   }
 *
 * **Two rules and not one, because they need opposite positions — and a rule has exactly one.**
 * The defaults must *lose* to the controls, which are ordinary utilities in this same layer, so
 * they open it; the composition must *beat* the author's utilities, so it closes it. Merged at
 * either end, one side is wrong, and both were measured: at the end the defaults beat the controls
 * (`1s` where the control says `500ms`), at the start the composition loses to a Tailwind
 * arbitrary utility. Lowering one rule's weight instead of moving it is not available either,
 * because specificity belongs to the **selector**, not to an individual declaration: one selector
 * list is one weight, so the defaults and the composition cannot be weaker and stronger than each
 * other from inside the same rule. `:where()` is the construct that would express it, and it is
 * the one that fails — a pseudo-element cannot appear inside it, and `before:` / `after:` are
 * ordinary usage. `carrier-locality.md`, "Why two rules and not one", holds the measurement and
 * the cost of the split.
 *
 * The defaults have to be declared on the element rather than published once on `:root`, because
 * they compose other custom properties the slot utilities write there: `--jumi-animation-delay`
 * reads `--jumi-stagger-animation-delay`, and a custom property containing `var()` resolves where
 * it is *declared*. On `:root` it resolves once, to the default, and every element inherits that
 * literal — measured, and it silently stops the stagger system. It is also what keeps a global
 * control on a wrapper out of the animations inside it: they declare the default themselves, and a
 * declaration beats inheritance, which is the scope rule `controls.md` documents.
 *
 * The composition goes into the utilities layer, at the end of the block that holds the
 * activations — after Tailwind's own utilities, before any utilities-layer block the author wrote
 * later. Measured against the carrier this replaces, across six competing declarations: the
 * position matters only against a Tailwind arbitrary utility, and only a position *before*
 * Tailwind's own utilities gets that one wrong.
 *
 * **The finished stylesheet carries no protocol.** `--jumi-staging-*` is a build-time name with a
 * zero-occurrence invariant, asserted by `css:check`, `vite:check` and `postcss:check`. When this
 * pass does not run the payload survives, and the checks fail loudly — a stronger signal than a
 * marker on a rule that may have been rewritten anyway, and one that cannot be mistaken for
 * output.
 *
 * That is the whole protocol, and it is deliberately tiny. It is a walk over a generic CSS AST —
 * PostCSS's, not Tailwind's — because the pass has to survive the constructs Tailwind emits and
 * the ones Jumi never sees: nested `@layer`/`@media`/`@supports` bodies, comments, strings,
 * `var()` fallbacks, custom-property values. A textual scan can be made to handle all of those,
 * which is not the same as being the right thing for the feature to depend on: CSS semantics are
 * not text semantics, and this investigation has already produced four bugs that looked exactly
 * like a text bug until a browser disagreed.
 */

/** The two kinds of composition. */
export type CarrierKind = 'animations' | 'transitions'

/**
 * A name the model refused to link, stated as a declaration of its own.
 *
 * The refusal travels in the **property** name rather than the value because CSS cannot keep a
 * name's leading or trailing whitespace in a value, and the property is the fact.
 */
const REFUSED_NAME = /^--jumi-name-.+-refused$/

/**
 * A name the model refused as already taken, stated as a declaration of its own.
 *
 * The second refusal, and a different one: the name is perfectly writable, but it is also a structural
 * address — a property Jumi animates — so a control written `/<name>` reads the property scope and not
 * this motion. Nothing is broken: the motion runs, its timing is the property's, and the author simply
 * cannot address it by that word.
 */
const SHADOWED_NAME = /^--jumi-name-.+-shadowed$/

/**
 * The prefix every staged declaration is written under, and the only thing a host needs to
 * recognize a payload. It reaches no browser, so it never has to be a property a browser applies.
 */
export const stagingMarker = '--jumi-staging-'

/**
 * How a payload names what it carries: `--jumi-staging-<kind>-<declaration>`.
 *
 * The kind is part of **every entry name**, not of a marker's value, and that is a correction
 * rather than a style. The first version put the kind in the marker's value, which read correctly
 * for as long as each payload stayed its own rule — and then `@tailwindcss/postcss` coalesced the
 * payload rules into one. Two markers then declared the same property with different values, one
 * won, and the animations composition was handed the transition's declarations while the
 * transitions composition was never built at all. A name cannot collide with a different name.
 *
 * The remainder of the name is the declaration it becomes, verbatim: `animation-name` for the
 * longhand a browser applies, `--jumi-rotate` for a custom property the element resolves through.
 * One rule, no special cases — and a payload still coalesced across kinds cannot mix them up.
 */
const stagedName = (prop: string) => prop.slice(stagingMarker.length)

/** Which kind a staged declaration is for, and what declaration it becomes. */
const stagedEntry = (prop: string) => {
  const rest = stagedName(prop)
  const boundary = rest.indexOf('-')
  const kind = rest.slice(0, boundary)

  if (kind !== 'animations' && kind !== 'transitions') return null

  return { kind: kind as CarrierKind, name: rest.slice(boundary + 1) }
}

/**
 * What activates a composition: a rule that declares the generated variable a slot is named by.
 *
 *   .animate-rotate-45 { --jumi-rotate-3zWYd-animation-name: jumi-rotate-3zWYd; … }
 *   .transition-duration-500\/rotate { --jumi-rotate-transition-duration: 500ms; }
 *
 * Deliberately not "mentions a Jumi variable". A control declares a different property —
 * `.animation-duration-500 { --jumi-rotate-animation-duration: 500ms }` — and must stay inert on
 * its own, so the locator is the activation rather than anything in the namespace. A global
 * `transition-duration-500` writes `--jumi-transition-duration`, which names no motion and is
 * inert for the same reason.
 *
 * Both patterns need at least one segment between `--jumi-` and the suffix, which is what
 * excludes the substrate (`--jumi-animation-name`, `--jumi-transition-property`) by construction
 * rather than by a blocklist — and the transition pattern requires `-transition-` outright, so
 * the stagger slot's `--jumi-stagger-animation-delay` is not mistaken for an activation.
 *
 * The animations pattern is `ACTIVATED_SLOT` rather than a second copy of it: it is the same fact —
 * "this declaration names a definition" — and two spellings of one fact is how the range pass and the
 * hoist came to disagree about which instance a rule meant (`./instance`).
 */
const ACTIVATION: Record<CarrierKind, RegExp> = {
  animations: ACTIVATED_SLOT,
  transitions:
    /^--jumi-.+-transition-(?:delay|duration|property|timing-function)$/,
}

/**
 * The eight components an `animation` shorthand carries — and therefore the eight a per-slot value
 * can hold. The three that are missing are missing for a reason: they are separate lists, declared
 * **after** the shorthand, because the shorthand cannot carry them.
 *
 * Measured, not assumed (Chromium 153): `animation-timeline` and `animation-range` are *reset* by
 * the shorthand — declared before it, a timeline computes back to `auto` and a range to `normal` —
 * while `animation-composition` survives it. All three are written after it anyway, so the emission
 * does not depend on which of them a given engine happens to reset.
 */
const SHORTHAND = [
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
]

/**
 * Written after the shorthand rather than carried inside it — two because it resets them, one
 * because it cannot set it.
 */
const AFTER_SHORTHAND = [
  'animation-composition',
  'animation-range',
  'animation-timeline',
]

/**
 * What an unset position falls back to, per component.
 *
 * Not a detail. `var(--unset-slot, none)` is fine for `animation-name`, where `none` is a keyword,
 * and fatal for `animation-duration`, where it is not: the substitution is invalid at computed-value
 * time and the *entire declaration* is dropped, so every position — including the live one — loses
 * its duration. Measured on the first build of this shape, caught by the parity check.
 */
const FALLBACK: Record<string, string> = {
  'animation-delay': '0s',
  'animation-direction': 'normal',
  'animation-duration': '0s',
  'animation-fill-mode': 'none',
  'animation-iteration-count': '1',
  'animation-name': 'none',
  'animation-play-state': 'running',
  'animation-timing-function': 'linear',
}

/**
 * The parts a name installs on the rule that declared it: every slot part except `animation-name`,
 * which no control addresses — there is no `/<name>` spelling for an animation's name.
 */
const namedParts = [
  ...SHORTHAND.filter(part => part !== 'animation-name'),
  ...AFTER_SHORTHAND,
]

/**
 * The slot a hoisted value belongs to, read off the activation variable.
 *
 *   --jumi-rotate-3zWYd-animation-name   →   rotate-3zWYd   →   --jumi-slot-rotate-3zWYd
 *
 * The name is derived from the activation rather than from a position in the list, because
 * positions are a fact about the stylesheet and the declaration is a fact about the *rule*: an
 * `@apply`, a variant and a plain utility all carry the same activation variable, and each needs
 * the matching value on itself — and which *instance* of that definition the rule means is read the same
 * way, by `instanceKeys`.
 */
const hoistedName = (slot: string) => `--jumi-slot-${slot}`

/** The slot a composition entry reads, or null when the entry is not a slot reference. */
const referencedSlot = (entry: string) => {
  const match = /^var\(--jumi-(.+?)-animation-name\b/.exec(entry.trim())

  return match ? match[1] : null
}

/**
 * The **instance** a chain entry addresses, when the author named one.
 *
 * Every part of a named motion carries `--jumi-slot-<instance>-<part>` as its outermost link, and
 * that is the only place the instance appears in the aggregate. `animation-name` is deliberately not
 * that place: it is keyed by the definition, because two names over identical frames share one
 * keyframe and therefore one activation variable. Reading the slot from the name alone collapsed two
 * instances onto one — measured, `…/enter` with `200ms/enter` beside `…/exit` with `1800ms/exit`
 * resolved `1.8s, 1.8s`, both positions reading the single hoist the last position won.
 */
const linkedSlot = (entry: string) => {
  const match = /^var\(--jumi-slot-(.+?)-animation-\w/.exec(entry.trim())

  return match ? match[1] : null
}

/**
 * Split a comma-separated value on its top-level commas.
 *
 * The payload's entries are `var(--a, var(--b))`, so a `split(',')` counts every fallback comma and
 * doubles the list — the same mistake `scripts/lib/css.mjs` exists to prevent on the script side,
 * and it has to be prevented here too or the two disagree about how long a list is.
 */
const splitTopLevel = (value: string) => {
  const parts: string[] = []
  let current = ''
  let depth = 0

  for (const char of value) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''

      continue
    }

    current += char
  }

  parts.push(current)

  return parts.map(part => part.trim()).filter(Boolean)
}

/** A rule activates a kind when one of its own declarations is an activation for it. */
const activates = (rule: Rule, pattern: RegExp) =>
  ownDeclarations(rule).some(declaration => pattern.test(declaration.prop))

export type Finalized = {
  /**
   * How many selectors the animations composition was written for. Zero means no composition was
   * built, which is the ordinary result on a stylesheet with no `animate-*` in it.
   */
  animations: number
  /** How many payload rules were consumed. Zero on a second pass, by construction. */
  staging: number
  /** The same for transitions, from the rules that declare a motion's transition chain. */
  transitions: number
  /** How many rules the view-transition pass wrote — identities plus pseudo-element rules. */
  viewTransitions: number
  /**
   * A candidate the author wrote that this pass could not honour, with the reason.
   *
   * Returned rather than printed, because this function is pure and the host owns the loud channel:
   * the PostCSS and Vite adapters turn each one into a `result.warn`, which survives to the terminal
   * of whoever is building. A refusal that were only a console call here would be invisible in a
   * bundler's output, and a refused candidate is otherwise indistinguishable from one that worked —
   * the page renders either way.
   */
  warnings: string[]
}

/**
 * The utilities-layer block the composition belongs in.
 *
 * The end of it, not the start: this pass appends, so the composition lands after everything
 * Tailwind generated for that layer and before any utilities-layer block the author wrote later.
 * Measured against the carrier this replaces, across six competing declarations, that is the only
 * placement that reproduces every winner — a position at the *start* of the layer loses to
 * Tailwind's own arbitrary utilities, which today's carrier beats.
 *
 * Walking up rather than taking the nearest ancestor keeps it at the outermost one, so an
 * activation nested in `@media` or `@supports` still contributes to one composition instead of a
 * separate rule inside each condition.
 */
const layerFor = (root: Root, rule: Rule) => {
  let layer: Container = root

  for (
    let node = rule.parent;
    node && node.type !== 'root';
    node = node.parent
  ) {
    if (
      node.type === 'atrule' &&
      node.name === 'layer' &&
      node.params.trim() === 'utilities'
    )
      layer = node
  }

  return layer
}

/**
 * The block the defaults belong at the top of: the first utilities layer with a body.
 *
 * First in the **layer**, not merely early in the stylesheet. A later `@layer utilities` block —
 * the author's own, or a second one Tailwind emitted — still comes after this one, so one `prepend`
 * puts the defaults ahead of every utility declaration the layer holds, which is the invariant
 * rather than a property of the order Tailwind happened to choose.
 */
const defaultsLayerFor = (root: Root) => {
  for (const node of root.nodes ?? []) {
    if (
      node.type !== 'atrule' ||
      node.name !== 'layer' ||
      node.params.trim() !== 'utilities'
    )
      continue
    if (node.nodes?.length) return node
  }

  return root
}

/**
 * Complete every composition in a stylesheet, in place.
 *
 * Three phases, because each one needs the document to have stopped moving. The payload is read
 * from the whole document first — later publications winning, exactly as a later declaration
 * would in the browser — and the rules that carried it are removed, so a payload rule can never
 * be mistaken for an activator of its own data. Then the activators are collected, in document
 * order, from what is left. Only then is anything written.
 *
 * That order is not an optimization. A staged name such as `--jumi-staging-animations-animation-name`
 * matches the activation pattern for `animations`, so a payload still in the document would add
 * `:root` to the selector list it is used to build. One pass would have this bug, and it would
 * present as a rule that looks right.
 *
 * `aggregate` is for a host that already holds the data: it is applied over whatever the
 * stylesheet staged, which is removed either way. It is keyed by **longhand**, because that is
 * what the data is once it is no longer in transit — `animation-name`, not
 * `--jumi-staging-animations-animation-name`. The element-local defaults are not part of it; those
 * compose custom properties that only the stylesheet knows, so they come from the payload.
 *
 * Reports what it built and does not serialize. A second pass finds nothing staged and produces
 * nothing, so it reports zero and leaves the document — and therefore the output — untouched.
 */
/**
 * Move the aggregate's per-position chains onto the rules that activate them, and return the shallow
 * list the composition is left with.
 *
 * The ownership rule is not "the utility rule owns its hoist". Ownership follows the **activation**:
 * Tailwind re-parents a utility body for a variant, copies it for `@apply`, and prefixes it for a
 * pseudo-element, and in every case what the finished stylesheet holds is a rule declaring
 * `--jumi-<slot>-animation-name`. Whichever rules hold that declaration must also hold
 * `--jumi-slot-<slot>`, or an element matching one of them resolves the position to its fallback and
 * quietly animates nothing.
 *
 * `@apply` is the case that makes the difference visible: the applied element carries
 * `.applied-motion` and never matches `.animate-rotate-45`, so a value published only on the
 * utility's own rule cannot reach it. Deriving the name from the activation rather than from a
 * position in the list is what makes the same code correct for all of them.
 *
 * The move is worth its complexity because of what it removes. The composition used to carry ten
 * lists of *every* slot, so an element that activates one slot resolved ten positions per slot in
 * the stylesheet; hoisted, it carries one shallow reference per position and resolves three — one
 * `animation` list plus the two the shorthand cannot hold. Measured on the effects catalogue: the
 * inspector's matched-style response fell from 965 KB to 413 KB, and recalc from 976 ms to 392 ms
 * over 1,000 animating elements. `engineering/research/style-cost.md` has the whole account.
 */
const hoist = (staged: Collection<string>, rules: Rule[]) => {
  const entries = Object.fromEntries(
    SHORTHAND.map(part => [part, splitTopLevel(staged[part] ?? '')]),
  )
  const positions = entries['animation-name'].map((entry, position) => {
    // The instance first, the definition only as a fallback: a name is what distinguishes two
    // motions that share one keyframe, and only a named part carries it.
    const slot =
      linkedSlot(entries['animation-duration']?.[position] ?? '') ??
      referencedSlot(entry)

    return slot
      ? {
          position,
          slot,
          value: SHORTHAND.map(
            part => entries[part][position] || FALLBACK[part],
          ).join(' '),
        }
      : null
  })
  const known = new Map(
    positions.flatMap(entry =>
      entry ? [[entry.slot, entry.value] as const] : [],
    ),
  )

  for (const rule of rules) {
    const own = ownDeclarations(rule)
    const published = new Set(own.map(declaration => declaration.prop))

    /**
     * Every slot key this rule can publish — the instances it named, or the definition's own when it named
     * none. The derivation is shared with the range pass, which has to agree with this one about which
     * instance a rule means.
     */
    for (const declaration of own) {
      const match = ACTIVATED_SLOT.exec(declaration.prop)

      if (!match) continue

      for (const key of instanceKeys(rule, match[1])) {
        const value = known.get(key)
        const prop = hoistedName(key)

        if (!value || published.has(prop)) continue

        published.add(prop)
        rule.append(postcss.decl({ prop, value }))
      }
    }

    // A named activation installs the name as this slot's address — **on this rule**, which is the
    // whole of the locality rule. The composition's chains read `--jumi-slot-<slot>-<part>`, so filling
    // it here means the name reaches the elements that wrote `.animate-fade-in/reveal` and no others.
    //
    // The alternative — putting the name in the chain itself — cannot be made element-local: a chain is
    // shared by every element matching the composition, so a name seen anywhere in the build became an
    // address everywhere, and which name won depended on candidate order. Measured: `#a` with
    // `animate-fade-in/reveal animation-duration-300/reveal animation-duration-900/loop` computed
    // `0.9s` forward and `0.3s` reversed, and `loop` named on another element reached it either way.
    for (const declaration of own) {
      const match = ACTIVATED_SLOT.exec(declaration.prop)

      if (!match) continue

      for (const key of instanceKeys(rule, match[1])) {
        const name = own.find(
          candidate => candidate.prop === cssEscape(`--jumi-${key}-label`),
        )?.value

        if (!name) continue

        for (const part of namedParts) {
          const prop = cssEscape(`--jumi-slot-${key}-${part}`)

          if (published.has(prop)) continue

          published.add(prop)
          rule.append(
            postcss.decl({
              prop,
              value: `var(${cssEscape(`--jumi-label-${name}-${part}`)})`,
            }),
          )
        }
      }
    }
  }

  return positions
    .map((entry, position) =>
      entry
        ? `var(${hoistedName(entry.slot)}, none)`
        : SHORTHAND.map(part => entries[part][position] || FALLBACK[part]).join(
            ' ',
          ),
    )
    .join(', ')
}

export function finalize(
  root: Root,
  aggregate?: Collection<string>,
): Finalized {
  const payload: Collection<Collection<string>> = {}
  const finalized: Finalized = {
    animations: 0,
    staging: 0,
    transitions: 0,
    viewTransitions: 0,
    warnings: [],
  }

  // Phase 1 — read the payload, and take the rules that carried it out of the document. Removal
  // during a walk is why this is an AST and not a string: the rule can go wherever it is nested.
  root.walkRules(rule => {
    const declarations = ownDeclarations(rule)
    const staged = declarations.filter(declaration =>
      declaration.prop.startsWith(stagingMarker),
    )

    if (!staged.length) return

    for (const declaration of staged) {
      const entry = stagedEntry(declaration.prop)

      if (!entry) continue

      ;(payload[entry.kind] ??= {})[entry.name] = declaration.value
    }

    rule.remove()
    finalized.staging += 1
  })

  for (const [longhand, value] of Object.entries(aggregate ?? {})) {
    ;(payload.animations ??= {})[longhand] = value
  }

  // Phase 1b — the view-transition staging rules, read and taken out of the document.
  //
  // Phase 1a — the range **composition** variant, published onto the motion it qualifies.
  //
  // `animation-range-entry:animate-fade-in` is an ordinary motion wrapped by a variant that returns
  // the identity selector, so the wrapped utility is emitted where a page applies it and the two facts
  // this needs are read off that rule: the range from the class the author typed, and the slot from the
  // activation the rule declares. One declaration per ranged slot is all it takes — the composition's
  // position for that slot already reads `var(--jumi-<slot>-animation-range, …)`.
  //
  // It runs *before* the view-transition staging below, because that walk removes the rules it takes:
  // a range stacked onto a view transition would otherwise vanish without a word.
  root.walkRules(rule => {
    for (const reading of rangeReadings(rule)) {
      if (!rangeAccepted(reading.range)) {
        finalized.warnings.push(
          `${reading.source}: "${reading.range}" is not a range Jumi can write. Use ${RANGE_GRAMMAR}.`,
        )

        continue
      }

      if (!reading.slot) {
        finalized.warnings.push(
          reading.motions > 1
            ? `${reading.source}: this rule declares ${reading.motions} motions, so a range cannot be told apart between them — put the variant on an animate-* candidate.`
            : `${reading.source}: a range qualifies a motion, and this candidate declares none — put the variant on an animate-* candidate.`,
        )

        continue
      }

      if (rule.selectors.every(isStagingSelector)) {
        finalized.warnings.push(
          `${reading.source}: a range cannot qualify a view transition motion yet, so it was dropped.`,
        )

        continue
      }

      rule.append(
        postcss.decl({
          prop: `--jumi-${reading.slot}-animation-range`,
          value: reading.range,
        }),
      )
    }
  })

  // Phase 1a — names, reported rather than published.
  //
  // `animate-fade-in/reveal` records its name in the rule it was written in — `--jumi-<slot>-label` —
  // and the composition reads it as the narrowest link of that slot's chain, filling
  // `--jumi-slot-<slot>-<part>` from `--jumi-label-<name>-<part>`. Neither of those needs this pass.
  // What does is the two cases the model refuses to link, each stated in a declaration of its own
  // because the model has no channel to say so; this is the channel.
  //
  // The first is unwritable: a name becomes a custom-property segment, where a whitespace character
  // cannot be written at all — measured, `css.escape('a b')` is `a\ b`, which is legal CSS but ends
  // PostCSS's identifier, so the build fails with `Unknown word b-animation-duration`. The *property*
  // carries the fact because CSS cannot carry a name's leading whitespace in a value — see
  // `refusedName` in `@/core`.
  //
  // The second is taken rather than unwritable: the name is a structural address, so `/<name>` on a
  // control reads the property scope and never this motion. Silent by default is the worst outcome
  // there — the control looks like it works — so it is said outright. A motion named after the property
  // *it* animates is not this case, and the model does not record it: one scope serves both readings.
  //
  // Deliberately *not* here: an "unused name" warning. Controls configure motion, they do not create
  // it — `animation-duration-500` with nothing to animate is inert, and `animation-duration-500/reveal`
  // with no motion named `reveal` is inert in exactly the same way. A conditional motion
  // (`motion-safe:animate-fade-in/reveal` beside an unconditional control) is a real pattern, not an
  // error, and warning about it would teach authors to stop naming things.
  const reported = new Set<string>()

  root.walkRules(rule => {
    for (const declaration of ownDeclarations(rule)) {
      if (reported.has(declaration.prop)) continue

      if (SHADOWED_NAME.test(declaration.prop)) {
        reported.add(declaration.prop)

        finalized.warnings.push(
          `"${declaration.value}" names a motion, but it is also a property Jumi animates, so a control written \`/${declaration.value}\` reads that property — every motion animating it, not this one. Reword the name to time this motion on its own.`,
        )

        continue
      }

      if (!REFUSED_NAME.test(declaration.prop)) continue

      reported.add(declaration.prop)

      // Reconstructed, because the whitespace that made the name unusable is exactly what a CSS value
      // cannot keep: PostCSS moves a leading one into `raws.between`. Quoting the name as it arrived is
      // the difference between a message about the author's class and a message about a stray `x`.
      const leading = ' '.repeat(
        Math.max(0, (declaration.raws.between ?? ': ').length - 2),
      )

      finalized.warnings.push(
        `"${leading}${declaration.value}" is not a name a control can address: a name cannot contain whitespace. Write it bare — \`/reveal\` — because in the bracketed form Tailwind reads \`_\` as a space.`,
      )
    }
  })

  // They are staging in the same sense a carrier payload is: the marker class matches no page, so
  // their declarations are data and not output. They are read *here* rather than after the
  // composition, because phase 2 finds activators by the declaration they hold and a staged motion
  // holds one — left in place, every view-transition candidate would contribute
  // `.…:where(.jumi-vt-old-hero)` to the element composition's selector list, which matches nothing.
  //
  // The rules are kept, not dropped. A staged rule *is* the motion, and it is replayed onto the
  // pseudo tree later in this pass; removing it only takes it out of the element's cascade.
  const stagedTransitions: ViewTransitionStaging[] = []
  let transitionLayer: Container = root

  root.walkRules(rule => {
    // One entry per staged **selector**, because a CSS optimizer merges rules that declare the same
    // thing: the docs build hands this pass one rule carrying six cards' staged selectors in a list,
    // where the CLI hands it six rules of one selector each. Measured — and it was the difference
    // between the feature working and quietly refusing every candidate in a page.
    const staging = viewTransitionStaging(rule)

    if (!staging.length) return

    // Read before the removal, because a detached rule has no ancestors to walk — and the at-rule
    // ancestry is what decides whether a wrapper transfers onto the pseudo tree at all.
    stagedTransitions.push(...staging)
    if (stagedTransitions.length === staging.length)
      transitionLayer = layerFor(root, rule)

    const remaining = rule.selectors.filter(
      selector => !isStagingSelector(selector),
    )

    // A rule carrying staging *and* something else: the rest of it is not this pass's to delete. In
    // practice the variant produces all-staging rules, so this is the safe side of a case that should
    // not arise rather than a case being handled.
    if (remaining.length) {
      rule.selectors = remaining

      return
    }

    const parent = rule.parent

    rule.remove()

    // A staged rule is often the only thing inside the condition wrapping it, and taking it out leaves
    // `@media (width >= 40rem) { }` behind. That is this pass's litter rather than the author's, so it
    // goes — but a layer is never removed, because `@layer utilities` means something even empty.
    let node = parent

    while (
      node &&
      node.type === 'atrule' &&
      node.name !== 'layer' &&
      !node.nodes?.length
    ) {
      const next = node.parent

      node.remove()
      node = next
    }
  })

  // Phase 2 — the rules that activate a slot, per kind, in document order.
  //
  // A rule contributes its selector once. Several rules can carry the same one — a utility emitted
  // twice, two `@apply` copies in one selector — and a selector list repeats what it is given.
  // Document order and not sorted order, because the output has to be byte-stable across a fresh
  // build and an incremental one: `walkRules` visits in document order and a `Set` keeps
  // first-insertion order, so the same stylesheet always produces the same list. Sorting would
  // order the selectors by name, which is not a fact about the page.
  const activators: Collection<Rule[]> = {}

  root.walkRules(rule => {
    for (const kind of Object.keys(ACTIVATION) as CarrierKind[]) {
      if (activates(rule, ACTIVATION[kind]))
        (activators[kind] ??= []).push(rule)
    }
  })

  // Phase 3 — synthesize what a browser applies, and leave nothing of the transport behind.
  //
  // Two consumers, one set of data. The element composition is what this pass has always written;
  // the view-transition emission needs the *same* substrate and the same aggregate, because a pseudo
  // tree is an element as far as the cascade is concerned — same `--jumi-slot-*` resolution, same
  // `var()` fallbacks. So the data is built once, and whether the element composition exists is a
  // separate question from whether the data does: a page whose only motion is a view transition
  // activates no slot on any element and still needs both halves for the pseudo tree.
  const data: Record<
    CarrierKind,
    { aggregate: Product[]; substrate: Product[] }
  > = {
    animations: { aggregate: [], substrate: [] },
    transitions: { aggregate: [], substrate: [] },
  }

  for (const kind of Object.keys(ACTIVATION) as CarrierKind[]) {
    const rules = activators[kind]
    const staged = payload[kind]

    // No payload means the stylesheet never staged one, which is not this pass's to invent: the
    // transport is still in the output, and the zero-occurrence invariant is what says so.
    if (!staged) continue

    // The animations aggregate is the one written as a **hoist**. Its payload is ten lists of every
    // slot in the stylesheet while an element activates one or two of them, so the deep chains move
    // onto the rules that activate the slot and the composition is left holding one shallow
    // reference per position. `transitions` composes a single shorthand already, so it is written
    // exactly as it was — this change is deliberately scoped to the aggregate that was measured.
    //
    // The staged view-transition rules are hoisted with the same call, and that is not a
    // convenience. A staged motion declares an activation, so it *is* an activator — it is just an
    // activator whose composition is written onto a pseudo tree instead of onto the element. The
    // publication the hoist appends (`--jumi-slot-<slot>`) is exactly what the emission has to
    // replay; without it the emitted composition applies and animates nothing, which is the failure
    // this pass already paid for once on the element side.
    const hoisted =
      kind === 'animations'
        ? hoist(staged, [
            ...(rules ?? []),
            ...new Set(stagedTransitions.map(entry => entry.rule)),
          ])
        : null
    const { aggregate, substrate } = data[kind]

    for (const [name, value] of Object.entries(staged)) {
      // A name that is itself a custom property is a default the element resolves through, and it
      // has to be declared *on the element*: it composes other custom properties the slot
      // utilities write there — `--jumi-animation-delay` reads `--jumi-stagger-animation-delay`,
      // which the stagger rule sets on the element — and a custom property containing `var()`
      // resolves where it is **declared**. Published on `:root` it resolves once, to the default,
      // and every element inherits that literal. Measured, and it stops the stagger system.
      if (name.startsWith('--')) {
        substrate.push({ prop: name, value })

        continue
      }

      if (hoisted) continue

      aggregate.push({ prop: name, value })
    }

    if (hoisted) {
      // The shorthand first, and the two it resets after it: `animation` sets `animation-composition`
      // and `animation-timeline` back to their initial values, so a rule that declares them before it
      // has already lost them by the time the cascade is done.
      aggregate.push({ prop: 'animation', value: hoisted })

      for (const part of AFTER_SHORTHAND) {
        if (staged[part]) aggregate.push({ prop: part, value: staged[part] })
      }

      for (const [name, value] of Object.entries(staged)) {
        if (
          name.startsWith('--') ||
          SHORTHAND.includes(name) ||
          AFTER_SHORTHAND.includes(name)
        )
          continue

        // Anything else the payload carries is not a position — `interpolate-size` is the one that
        // exists today — and is written verbatim, as it always was.
        aggregate.push({ prop: name, value })
      }
    }

    // The element side stops here when nothing activates a slot on an element. The data above is
    // still what the view-transition emission reads.
    if (!rules?.length) continue

    const selectors = [...new Set(rules.map(rule => rule.selector))]
    const group = selectors.join(',\n')
    const composition = postcss.rule({ selector: group })
    // The defaults are the weakest thing this pass writes: everything that exists to override them
    // — a control utility, an arbitrary custom-property utility, the author's own `--jumi-*` — is
    // an ordinary utility in this layer. So they go first in the layer and order settles it once,
    // structurally, rather than being left to where Tailwind happened to sort the composition.
    //
    // They are deliberately *not* `:where()`-wrapped, which is how this started: a pseudo-element
    // cannot appear inside `:where()`, and `before:` / `after:` are ordinary Jumi usage. The rule
    // was dropped as invalid, the substrate never arrived, and the composition's `var()` fallback
    // then made the whole declaration invalid at computed-value time on that pseudo-element.
    const defaults = postcss.rule({ selector: group })

    for (const { prop, value } of aggregate)
      composition.append(postcss.decl({ prop, value }))
    for (const { prop, value } of substrate)
      defaults.append(postcss.decl({ prop, value }))

    // A composition with no declarations is not one: a payload of nothing but defaults cannot
    // animate anything, and an empty rule would be noise in the output.
    if (!composition.nodes?.length) continue

    const layer = layerFor(root, rules[0])

    // Two rules, two jobs, two placements — and they cannot be collapsed into one, which is the
    // question their shared selector list invites. The defaults must lose to the controls, which are
    // ordinary utilities in this layer, so they open it; the composition must beat the author's
    // utilities, so it closes it. A rule has one position, and lowering one rule's weight instead is
    // not available: specificity belongs to the selector, not to a declaration, so one selector list
    // is one weight. `:where()` would express it and is the construct that breaks on pseudo-elements.
    if (defaults.nodes?.length) defaultsLayerFor(root).prepend(defaults)

    layer.append(composition)

    finalized[kind] = selectors.length
  }

  // Phase 4 — what a browser needs in order to pair the two sides and animate them, which no
  // candidate could have written: the identity belongs on the author's element and the animation on a
  // pseudo tree keyed by that identity. Reported rather than thrown, so one refused candidate names
  // itself and the rest of the page still builds.
  if (stagedTransitions.length) {
    const emission = emitViewTransitions(
      root,
      stagedTransitions,
      rule => activates(rule, ACTIVATION.animations),
      { ...data.animations, layer: transitionLayer },
    )

    finalized.viewTransitions = emission.emitted
    finalized.warnings.push(...emission.warnings)
  }

  return finalized
}

/**
 * The string boundary: read, walk, serialize.
 *
 * For a host that has CSS rather than an AST in hand — a CLI writing a file, a harness, a test. A
 * host that already owns an AST (PostCSS itself, or anything built on it) should call `finalize`
 * directly and skip the parse.
 */
export function finalizeCss(css: string, aggregate?: Collection<string>) {
  const root = postcss.parse(css)

  return { ...finalize(root, aggregate), css: root.toString() }
}
