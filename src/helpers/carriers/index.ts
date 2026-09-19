import type {
  AtRule,
  ChildNode,
  Container,
  Declaration,
  Root,
  Rule,
} from 'postcss'

import type { Product, ViewTransitionStaging } from './view-transition'
import type { Collection } from '@/types'

import {
  parsePhrase,
  phraseOffsetRefusal,
  separateParts,
  structuralAddress,
} from '@/core'

import {
  classToken,
  RANGE_GRAMMAR,
  rangeAccepted,
  rangeReadings,
} from './animation-range'
import {
  ACTIVATED_SLOT,
  instanceKeys,
  LABELLED_SLOT,
  ownDeclarations,
  parseInstanceKey,
} from './instance'
import {
  emitViewTransitions,
  isStagingSelector,
  viewTransitionStaging,
} from './view-transition'

import cssEscape from 'css.escape'
import postcss from 'postcss'
import shorthash2 from 'shorthash2'

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
 * A phrase the model refused to write, stated as a declaration of its own.
 *
 * The same shape as the name markers above, one reason further along: the phrase route is a documented
 * grammar with a documented domain, and an offset outside it is refused by the pass that can say so.
 */
const PHRASE_REFUSED = /^--jumi-phrase-.+-refused$/

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
 * The payload entry that says which **slot** each composition position belongs to.
 *
 * It rides in the `animations` payload rather than a kind of its own, and that is a decision about atomicity
 * rather than about tidiness: a position is only meaningful beside the lists it indexes, and two publications
 * are two chances to arrive out of step. This is the same payload, read in the same pass, consumed at the same
 * moment.
 *
 * It is **transport** — read here, never written — which is why `TRANSPORT` exists.
 */
const POSITIONS = 'slot'

/**
 * Payload entries that are read by this pass and never written to the composition.
 *
 * Every other entry in the payload becomes a declaration, because every other entry *is* one: a longhand is a
 * part of the composition, and a custom property is a default the element resolves through. This one is
 * neither — it says what the composition's positions are, which is not something a browser applies — so it is
 * the one name the emission loop skips.
 *
 * Named as a set rather than an inline comparison so that "the payload carries entries that are not
 * declarations" is one statement a reader can find, and `behaviour-check.mjs` asserts the consequence: no
 * `slot` declaration reaches a stylesheet.
 */
const TRANSPORT = new Set([POSITIONS])

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
 *
 * Taken from the model rather than restated here: `nameSlot` registers exactly these three as
 * slot-keyed variables and the fill below assigns exactly these three, so the list is one fact with two
 * readers. Restated, the two drift — and a slot variable registered with nothing to fill it is an
 * address that reads as silence.
 */
const AFTER_SHORTHAND: string[] = [...separateParts]

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
 * The parts a name writes **into the hoist's value**: the shorthand's own, less `animation-name`,
 * which no control addresses — there is no `/<name>` spelling for an animation's name, so the hoist reads
 * that one from the definition's activation variable.
 */
const shorthandParts = SHORTHAND.filter(part => part !== 'animation-name')

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

/** A literal made safe to put in a pattern. */
const escapePattern = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A `var()` link whose head is swapped, matched however the sheet spaced it.
 *
 * The whitespace is not decoration and this is not defensive spelling. A link Jumi builds reads
 * `var(--jumi-slot-<key>-<part>, …`, and the text it is matched against **came off the sheet** — which a
 * minifier may already have been through, in which case the same link reads `,(` and a literal written
 * with the space matches nothing at all. That is the whole failure: the seven parts kept the slot-keyed
 * address while the one link built in the same call kept its label, so the sheet contained both spellings
 * and neither looked wrong on its own. Two producers, two spacings.
 *
 * Measured by building the docs site against an unminified CLI build of the same commit: the docs — the
 * only pipeline here that optimizes — swapped nothing.
 */
const linkHead = (variable: string) =>
  new RegExp(`var\\(\\s*${escapePattern(variable)}\\s*,\\s*`, 'g')

/**
 * A whole `var(<variable>, var(<fallback>))` link, for the one swap that wraps rather than splices.
 *
 * Whole, because the replacement has to close a paren the match opened: consuming only the head would leave
 * the wrapper unbalanced, and consuming the tail separately would be a second textual assumption about the
 * fallback instead of one about the link.
 */
const wholeLink = (variable: string, fallback: string) =>
  new RegExp(
    `var\\(\\s*${escapePattern(variable)}\\s*,\\s*var\\(\\s*${escapePattern(fallback)}\\s*\\)\\s*\\)`,
  )

/**
 * The hoist's value with the author's name as the first link of every part the shorthand carries.
 *
 * The name goes into the **value**, not into a variable the value reads, because this value is published
 * on the rule that named the motion and is therefore element-local. That locality is the whole reason the
 * name can be written here at all: the composition is one rule for every activating selector, so a name
 * written there became an address everywhere and which name won depended on candidate order — measured as
 * `0.9s` forward and `0.3s` reversed on `animate-fade-in/reveal animation-duration-300/reveal
 * animation-duration-900/loop`.
 *
 * It replaces the link the fill used to supply (`--jumi-slot-<key>-<part>`), and the chain behind it is
 * untouched: a control writes `--jumi-label-<name>-<part>`, and the fallbacks still reach the definition
 * and then the shared default. A rule that named nothing gets its value back unchanged.
 */
const namedHoist = (
  own: Declaration[],
  value: string,
  key: string,
  selected: ReadonlyMap<string, string>,
) => {
  // The key is already the text a variable name holds — it was parsed out of one — so the label declaration
  // is built by concatenation. Escaping it again escapes the escapes: a name that needs one (`foo.bar` →
  // `foo\.bar`) became `foo\\.bar`, the lookup missed, and the control that named the motion reached
  // nothing.
  const name = own.find(
    candidate => candidate.prop === `--jumi-${key}-label`,
  )?.value

  if (!name) return value

  // The name position gains one link, and only where something actually selects one: a motion nothing eased
  // keeps the value it had, so an instance pays for the link only when it uses it.
  const definition = own.find(candidate =>
    ACTIVATED_SLOT.test(candidate.prop),
  )?.value

  // The selection link is a whole link wrapped, and the search for it is the same lesson as the seven
  // below: Jumi writes this one with `, ` and the value it searches came off the sheet. Minified, that
  // space is gone — and this link is the *entire* output of a timing phrase, so a phrase that stopped
  // matching did not look broken, it looked unapplied.
  const selectedValue =
    definition && selected.has(key)
      ? value.replace(
          wholeLink(`--${definition}-animation-name`, '--jumi-animation-name'),
          `var(${cssEscape(`--jumi-slot-${key}-animation-name`)}, var(--${definition}-animation-name, var(--jumi-animation-name)))`,
        )
      : value

  // Both swaps go through the one helper, because the reason one of them was wrong is the reason the other
  // one could be: a link Jumi built with a space in it, searched for inside text that came off the sheet.
  return shorthandParts.reduce(
    (text, part) =>
      text.replaceAll(
        linkHead(`${hoistedName(key)}-${part}`),
        `var(${cssEscape(`--jumi-label-${name}-${part}`)}, `,
      ),
    selectedValue,
  )
}

/**
 * Why nothing here reads the instance out of a chain any more.
 *
 * The instance used to be recovered from the **text** of a position's timing entry: the addressed slot link
 * was written outermost, so `^var\(\s*--jumi-slot-<count>-…` read it off the head. That made two questions
 * one question — *which instance does this position belong to* and *where does a rung sit in the fallback
 * chain* — and they are not the same fact.
 *
 * Building the component scope outermost, so `animation-duration-3000/scale-x` could time a part phrase, moved
 * the slot link out of the head and **every** named motion on a constituent stopped animating: the pass read
 * the position as the definition, published no hoist, and the element resolved `animation-name: none` with
 * zero instances. Measured on `blur`, which has no typed leaves at all — the first suspect was the typed-leaf
 * work, and it was innocent.
 *
 * Restoring the reader by moving the rung back inside would have paid for an implementation constraint with
 * cascade precedence, and precedence is the author-facing fact of the two. So the instance travels as **data**:
 * the composition publishes the slot at each position (`--jumi-staging-positions-slot`), and `hoist` matches
 * those against `instanceKeys` — produced by the same `instanceText`, so the two sides are the same text and
 * nothing is parsed.
 *
 * Three corrections were made to the readers this replaces, and every one of them was a fix to the *shape of
 * the text*: a part-shaped instance name read `flick` out of `flick-animation-duration`; a space just inside
 * the parens made the head test miss; and a lazy attribute swallowed the fallback that carries the same part
 * again. None can recur, because there is no text to read. The arms that recorded them — `n`, `o` and
 * `padded-parens` — stay, and now hold the data path instead.
 */

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

/**
 * A timing phrase the model recorded for this pass: `--jumi-segment-<hash>: <address> <phrase>`.
 *
 * The model records **intent** and this pass acts on it, because every fact the action needs is a fact about
 * the finished stylesheet: which instances an address reaches, and what the definition they select looks
 * like. A handler in the model sees only the motions compiled before it — measured, and with the candidate
 * list reversed it selected nothing at all.
 */
const SEGMENT_RECORD = /^--jumi-segment-[\w-]+$/

/** A recorded timing phrase's segments: the offset, and the easing governing the segment after it. */
type Segment = { offset: number; value: string }

/** The keyframe rule a definition was emitted as, or null when nothing emitted it. */
const keyframeOf = (root: Root, name: string): AtRule | null => {
  let found: AtRule | null = null

  root.walkAtRules('keyframes', atRule => {
    if (atRule.params.trim() === name) found = atRule
  })

  return found
}

/**
 * The numeric offsets a keyframe selector names, or null when it names something this has no business
 * matching.
 *
 * **Structural, not textual**, because a keyframe selector is not a number: `from` and `to` are 0% and 100%,
 * one rule can group several selectors (`10%, 30%, 50%`), and a range keyframe names offsets no segment
 * phrase can mean. Normalizing here is what lets a phrase's offsets — always numbers — be compared against
 * emitted CSS at all.
 */
const keyframeOffsets = (selector: string): null | number[] => {
  const offsets = selector.split(',').map(part => {
    const text = part.trim().toLowerCase()

    if (text === 'from') return 0
    if (text === 'to') return 100

    const offset = Number.parseFloat(text)

    return Number.isFinite(offset) ? offset : null
  })

  return offsets.every(offset => offset !== null) ? (offsets as number[]) : null
}

/**
 * A definition, cloned with the phrase's easings written into the frames it names, or null when the phrase
 * cannot be satisfied.
 *
 * Cloned from the **emitted** keyframe rather than from a frame list kept beside it, so specialization works
 * against the thing that ships — every model transformation already applied — and nothing has to be held in
 * step with it. That is what removed the model-side registries this feature was first planned around, and it
 * is why an effect specializes for free: its frames are emitted with numeric offsets like any other.
 *
 * **Atomic.** Every offset the phrase names has to exist in the definition, or nothing is cloned at all. A
 * phrase naming `0` and `100` that attached only one of them would look accepted while part of its intent
 * silently vanished, and half a specialization is harder to notice than none. An offset that cannot be
 * matched is unsupported rather than wrong, so it is silent for now — the same answer the model gives the
 * unaddressed form.
 *
 * **Splitting is the sharp edge.** A keyframe rule may group selectors, and a timing function attaches to
 * the whole rule, so targeting one offset inside a group means splitting that group into per-easing rules.
 * This is why offsets are normalized before anything is compared.
 *
 * `null` is one operational answer — *do not select a clone* — for three causes the pass never needs to tell
 * apart: an unsupported shape, an unmatched offset, and a specialization that would change nothing.
 */
const specialize = (root: Root, definition: string, segments: Segment[]) => {
  const name = `${definition}-segment-${shorthash2(
    segments.map(segment => `${segment.offset}:${segment.value}`).join('|'),
  )}`

  if (keyframeOf(root, name)) return name

  const original = keyframeOf(root, definition)

  if (!original) return null

  const available = new Set(
    (original.nodes ?? [])
      .filter(node => node.type === 'rule')
      .flatMap(frame => keyframeOffsets(frame.selector) ?? []),
  )

  if (!segments.every(segment => available.has(segment.offset))) return null

  const clone = original.clone()
  const rebuilt: ChildNode[] = []
  let written = 0

  for (const frame of clone.nodes ?? []) {
    const rule = frame.type === 'rule' ? frame : null
    const offsets = rule ? keyframeOffsets(rule.selector) : null

    if (!rule || !offsets) {
      rebuilt.push(frame)

      continue
    }

    // One rule per easing, in the order the selectors were written. A frame nothing targets stays whole,
    // which is the common case and keeps the clone identical to the definition it came from.
    const groups = new Map<null | string, number[]>()

    for (const offset of offsets) {
      const easing =
        segments.find(segment => segment.offset === offset)?.value ?? null

      groups.set(easing, [...(groups.get(easing) ?? []), offset])
    }

    if (groups.size === 1 && groups.has(null)) {
      rebuilt.push(frame)

      continue
    }

    for (const [easing, group] of groups) {
      const split = rule.clone()

      split.selector = group.map(offset => `${offset}%`).join(', ')

      if (easing) {
        split.append({ prop: 'animation-timing-function', value: easing })
        written += 1
      }

      rebuilt.push(split)
    }
  }

  if (!written) return null

  clone.removeAll()

  for (const node of rebuilt) clone.append(node)

  clone.params = name
  original.parent?.append(clone)

  return name
}

/**
 * The **attribute** a definition belongs to, read off the rule that carries it.
 *
 * A definition key is `<attribute>-<id>` for a phrase or a single value and the attribute alone for a composed
 * tween or an effect, and an id is `shorthash2`'s base62 — `instance.ts` states that invariant and relies on it
 * — so an id holds no hyphen. The last segment is therefore the id exactly when there is one, and which case
 * applies is a question about an **attribute**, which the model answers (`structuralAddress`) rather than a
 * guess about the shape of the name.
 */
const attributeOf = (base: string) => {
  if (structuralAddress(base)) return base

  const cut = base.lastIndexOf('-')

  return cut > 0 ? base.slice(0, cut) : base
}

/**
 * The instances an address reaches: a name, or a property scope.
 *
 * Both go through `instanceKeys`, the one derivation of what a rule means. That is what makes a property
 * address wider than a name in exactly the right way: a rule that named its motion is both its named instance
 * *and* one of the property's instances, so `/rotate` reaches it either way, while `/first` reaches only the
 * rule whose label carries that word.
 */
const addressedInstances = (root: Root, address: string) => {
  const found: Array<{ definition: string; key: string }> = []

  root.walkRules(rule => {
    const own = ownDeclarations(rule)
    const activation = own.find(node => ACTIVATED_SLOT.test(node.prop))

    if (!activation) return

    const base = ACTIVATED_SLOT.exec(activation.prop)?.[1]
    const definition = activation.value

    if (!base) return

    // A property address reaches the instances of *that* property, and which property a rule belongs to is
    // read off the rule rather than off the shape of a generated name.
    //
    // It used to ask whether the definition's *name* began with the address, which let `/padding` select
    // `padding-left`: an attribute may itself contain hyphens, so the longer attribute's definition begins
    // with the shorter address and the record specialised the wrong property's motion. Measured, `/padding`
    // beside a `padding-left` phrase emitted a `-segment-` clone of that phrase's definition and eased it,
    // while the scalar `/property` spelling had no such reach.
    const structural =
      structuralAddress(address) && attributeOf(base) === address

    const named = own.find(node => LABELLED_SLOT.test(node.prop))?.value

    if (!structural && named !== address) return

    for (const key of instanceKeys(rule, base)) found.push({ definition, key })
  })

  return found
}

/**
 * Register a selection non-inheriting, where the element can see it.
 *
 * The model registers everything else, and this is the exception that shows why it normally does: a
 * registration written by this pass arrives after the composition has been built, which is fatal for a
 * variable the composition resolves *during* the pass. Nothing resolves a selection until the browser does,
 * and a custom-property registration applies document-wide wherever it sits — so here it is safe, and here it
 * has to be, because the instance a selection is keyed by is only known once the sheet is whole.
 */
const registerSelection = (root: Root, variable: string) => {
  const layers: AtRule[] = []

  root.walkAtRules('layer', atRule => {
    if (atRule.params.trim() === 'base') layers.push(atRule)
  })

  const registration = postcss.atRule({ name: 'property', params: variable })

  registration.append({ prop: 'inherits', value: 'false' })
  registration.append({ prop: 'syntax', value: '"*"' })

  const base = layers[0] ?? null

  if (base) base.append(registration)
  else
    root.prepend(
      postcss.atRule({
        name: 'layer',
        nodes: [registration],
        params: 'base',
      }),
    )
}

/**
 * Turn every recorded timing phrase into the selection it asks for, and answer with them by instance key.
 *
 * The return value is what the hoist reads: a motion's name position references its selection **only when
 * something actually selected one**, so a motion nothing eased is untouched and no instance pays for a link
 * it does not use.
 */
const segmentSelections = (root: Root) => {
  const selected = new Map<string, string>()
  const variables = new Set<string>()

  root.walkRules(rule => {
    for (const declaration of ownDeclarations(rule)) {
      if (!SEGMENT_RECORD.test(declaration.prop)) continue

      const [address, ...rest] = declaration.value.trim().split(' ')
      const segments: Segment[] = parsePhrase(rest.join(' ')) ?? []

      // Read, then gone: a record is intent, not output. Left in place it would ship a property nothing
      // resolves, which is the obligation `--jumi-staging-*` is already under.
      declaration.remove()

      if (!address || !segments.length) continue

      // A record the reporting pass refuses specializes nothing. That pass states the reason, and without
      // this the selection would publish the clone its message says was dropped — the pass that warns and the
      // pass that acts have to read the same boundary.
      if (phraseOffsetRefusal(segments) !== null) continue

      for (const { definition, key } of addressedInstances(root, address)) {
        const specialized = specialize(root, definition, segments)

        if (!specialized) continue

        const variable = cssEscape(`--jumi-slot-${key}-animation-name`)

        // Written back onto **this** rule — the one carrying the phrase — and never onto the motion's. That
        // ownership is what keeps a selection element-local: declared on the motion's rule it would reach
        // every element animating that motion, which is the leak the design exists to prevent.
        rule.append({ prop: variable, value: specialized })
        selected.set(key, specialized)
        variables.add(variable)
      }
    }
  })

  for (const variable of variables) registerSelection(root, variable)

  return selected
}

/**
 * Move the aggregate's per-position chains onto the rules that activate them.
 *
 * `slots` is the payload's `positions` list — the slot each position belongs to, position-aligned with the
 * lists and published by the composition that built them. It is passed in rather than read off the chains
 * because the instance and the precedence order are different facts, and only one of them is the author's:
 * see the note above on why the text reader is gone.
 */
const hoist = (
  staged: Collection<string>,
  rules: Rule[],
  selected: ReadonlyMap<string, string>,
  slots: ReadonlyArray<string>,
) => {
  const entries = Object.fromEntries(
    SHORTHAND.map(part => [part, splitTopLevel(staged[part] ?? '')]),
  )

  /**
   * The slot at each position, or `null` where the composition named none.
   *
   * A sheet with no slots publishes the ten shared fallbacks as **one** position and no keys — the single
   * shape with no instance to name — and a position past the end of the list is the same absence, so both
   * fall back to the shared chain rather than to an address nothing fills.
   */
  const at = entries['animation-name'].map(
    (_, position) => slots[position] ?? null,
  )

  const valueAt = (position: number) =>
    SHORTHAND.map(part => entries[part][position] || FALLBACK[part]).join(' ')

  const known = new Map(
    at.flatMap((slot, position) =>
      slot ? [[slot, valueAt(position)] as const] : [],
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
        rule.append(
          postcss.decl({ prop, value: namedHoist(own, value, key, selected) }),
        )
      }
    }

    // A named activation installs the name as this slot's address — **on this rule**, which is the
    // whole of the locality rule.
    //
    // The three the shorthand cannot carry are filled here for the slots that need it, and only those.
    //
    // A slot whose key spells its name — a value or a phrase, `5-alpha-3zWYd-rotate` — reads the label
    // directly in the composition's chain, so there is nothing to fill and this loop skips it. A slot whose
    // key does not — an **effect**, which keys by the definition because every name of it shares one slot,
    // and a composed tween — cannot be named in that chain at all: the composition is one rule for every
    // activating selector, so a name written there would be whichever name was recorded last. For those,
    // and only those, the name still travels through this variable, written on this rule, which is what
    // makes it element-local.
    //
    // Measured before the scoping: with the fills gone unconditionally, a named effect's three parts read
    // `--jumi-slot-fade-in-animation-composition` with nothing writing it while a named value's read the
    // label, so the effect quietly fell back and the control was ignored.
    for (const declaration of own) {
      const match = ACTIVATED_SLOT.exec(declaration.prop)

      if (!match) continue

      for (const key of instanceKeys(rule, match[1])) {
        const name = own.find(
          candidate => candidate.prop === `--jumi-${key}-label`,
        )?.value

        if (!name || parseInstanceKey(key)?.name === name) continue

        for (const part of AFTER_SHORTHAND) {
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

  return at
    .map((slot, position) =>
      slot ? `var(${hoistedName(slot)}, none)` : valueAt(position),
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

      /**
       * The phrase route's domain, reported where the record is.
       *
       * A phrase is the one doorway around the host's type check, and its offsets are a grammar the
       * architecture document states as 0-100 — a boundary this pass had no way to know about: measured
       * through the shipped bundle, `animate-opacity-[0:0|150:1]` produced a `150%` stop the engine
       * discards, and no message at all. The phrase is dropped rather than published, so nothing is left
       * for the browser to throw away, and the message quotes the class because that is what the author can
       * edit.
       */
      if (PHRASE_REFUSED.test(declaration.prop)) {
        reported.add(declaration.prop)

        const offset = phraseOffsetRefusal(parsePhrase(declaration.value) ?? [])
        const source = classToken(rule.selector).replace(/\\(.)/g, '$1')

        finalized.warnings.push(
          `"${source}": a phrase's offsets are percentages in 0-100, and this one writes ${offset} — the animation was dropped rather than left for the browser to discard.`,
        )

        continue
      }

      /**
       * And the same domain on a **selection** phrase — the timing a control asks its slot for.
       *
       * A different record with a different consequence: the refusal above drops a motion that was never
       * written, while this one drops a *request*, so the timing the slot would have been specialized to
       * falls back to the property scope's. Reported for the same reason, against the same boundary, because
       * one grammar with two readers must not have two doors.
       */
      if (SEGMENT_RECORD.test(declaration.prop)) {
        const [, ...rest] = declaration.value.trim().split(' ')
        const offset = phraseOffsetRefusal(parsePhrase(rest.join(' ')) ?? [])

        if (offset === null) continue

        reported.add(declaration.prop)

        const source = classToken(rule.selector).replace(/\\(.)/g, '$1')

        finalized.warnings.push(
          `"${source}": a phrase's offsets are percentages in 0-100, and this one writes ${offset} — the selection was dropped, so the slot keeps its own timing.`,
        )

        continue
      }

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
    const selected = segmentSelections(root)

    // A composition with activators and no position list cannot place anything: every named motion would
    // quietly lose its address and fall back to the shared chain — the motion still runs, which is exactly
    // why silence here is the wrong answer. It is a protocol error rather than a stylesheet one, and the only
    // way to make it is for a host to supply the aggregate without the `slot` entry the model publishes.
    if (kind === 'animations' && rules?.length && !staged[POSITIONS])
      finalized.warnings.push(
        'the animations payload carries a composition but no position list, so no slot can be placed on the rules that activate it. A host supplying the aggregate must stage `slot` beside the lists.',
      )

    const hoisted =
      kind === 'animations'
        ? hoist(
            staged,
            [
              ...(rules ?? []),
              ...new Set(stagedTransitions.map(entry => entry.rule)),
            ],
            selected,
            staged[POSITIONS] ? splitTopLevel(staged[POSITIONS]) : [],
          )
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
        // Transport first, and as a statement of its own, because it is a different reason from the three
        // below: they are declarations the composition writes somewhere else, and this one is not a
        // declaration at all. It has been read by now — `hoist` matched it against the rules — and writing it
        // would put a `slot:` property into every activating rule, which no browser applies and no author
        // asked for.
        if (TRANSPORT.has(name)) continue

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
