import type { AtRule, Container, Declaration, Root, Rule } from 'postcss'

import postcss from 'postcss'

/**
 * View transitions: the second thing Jumi emits after the cascade, and it is not a carrier.
 *
 * A carrier solves a *locality* problem — the composition is a fact about the stylesheet and has to
 * land on an element only the browser knows. This solves a *reachability* problem: the pseudo tree
 * `::view-transition-old(<identity>)` hangs off the root element, not off the element the author
 * wrote, and every way of naming a slot is `@property { inherits: false }`. So no utility, no
 * variant and no `@apply` can put an animation on it. See
 * `engineering/research/view-transitions.md` for why that is structural rather than an API gap.
 *
 * What the adapter does instead is *stage*: a `view-transition-<side>/<identity>:` variant marks the
 * rule it wraps with a class that matches no page, so the motion never reaches the source element,
 * and the author's own class stays in the selector so this pass can find it again.
 *
 *   view-transition-old/hero:animate-fade-out
 *   →  .view-transition-old\/hero\:animate-fade-out:where(.jumi-vt-old-hero) {
 *        --jumi-fade-out-animation-name: jumi-fade-out;
 *      }
 *
 * Three facts are then recovered **from the CSS and never from the variant callback**: the side and
 * the identity from the marker class, and the source selector from everything before it. That is
 * what makes the configuration-time probe Tailwind performs — a callback with no candidate, whose
 * value is a sentinel — harmless by construction rather than by a guard. A probe instantiates no
 * rule, so there is nothing to read.
 *
 * ## Participation and motion are separate products
 *
 * The staged rule above establishes that `hero.old` **exists**. A control staged the same way —
 * `view-transition-old/hero:animation-duration-300` — does not, and must not: Jumi's oldest invariant
 * is that *controls configure motion, they do not create it*, and a duration utility that put a
 * `view-transition-name` on the element would be that invariant's view-transition-shaped exception.
 * So a group is only emitted when something in it is **motion-bearing**:
 *
 *   motion-bearing candidate  →  establishes (identity, side), and names the element
 *   control-only candidate    →  contributes to a group that already exists, and is inert alone
 *
 * Measured, this is not a new distinction: a motion stages an *activation*
 * (`--jumi-<slot>-animation-name`), which is exactly the declaration the carrier pass already uses
 * to find the rules that animate, and `animation-duration-300` stages `--jumi-animation-duration`, a
 * name with no slot in it. The two passes agree because they are asking the same question.
 *
 * ## What a transferable wrapper conditions
 *
 * A variant stacked outside this one either survives onto the pseudo tree or it does not, and the
 * test is the **shape of the emitted selector** rather than a list of variant names — so it holds
 * for variants Tailwind adds later. If the remainder is exactly one class selector with every `:`
 * escaped, the variant's own meaning is an at-rule and can be carried; if it carries unescaped
 * compound text or a relational `:is(…)`, it refers to the source element's state and means nothing
 * on a pseudo tree that is not a descendant of that element. Those are refused rather than
 * silently mis-emitted.
 *
 * For the ones that transfer, the wrapper is **not** distributed onto both products:
 *
 *   motion-safe:   stripped from the identity. Jumi already owns this policy — its own emission
 *                  wraps in `@media (prefers-reduced-motion: no-preference)` — so honouring it a
 *                  second time on the identity does not quiet the motion, it deletes the
 *                  participation. Measured: under `reduce`, an identity inside that wrap builds no
 *                  `::view-transition-group` at all, so nothing travels (P22).
 *   everything else  kept on both. `sm:`, `supports-[…]:` and their successors are the author
 *                  saying when this screen should be a transition at all, and that is theirs to
 *                  say — measured: an `sm:`-wrapped identity under an unmatched query builds no
 *                  group, which is the author's own condition doing the author's own work.
 *
 * `motion-reduce:` is refused outright, and deliberately chosen rather than left to fall out of
 * wrapper handling. Jumi has already decided that its own view-transition motion does not run under
 * reduced motion and that the browser's cross-fade remains; a wrapper expressing the opposite cannot
 * be honoured without contradicting that, so it is reported and dropped.
 *
 * ## The invariants
 *
 * Design law, not implementation detail. Each is a decision a plausible future change could quietly
 * reverse, and the two that carry the most weight are falsified end to end in
 * `scripts/view-transition-check.mjs`, against a real browser, where reversing them breaks a real page:
 * strip the `motion-safe:` handling and reduced-motion participation disappears; treat a control as
 * motion-bearing and a duration utility builds a transition group of its own.
 *
 *  1. A view-transition control never establishes participation.
 *  2. A motion-bearing candidate establishes its own identity.
 *  3. Candidates for one identity contribute independently; no "winner" is selected.
 *  4. A side with no motion stays entirely browser-owned — listed nowhere, so its `animation` is never
 *     replaced and the browser's cross-fade survives.
 *  5. `motion-safe:` suppresses Jumi's motion, never the transition identity.
 *  6. `motion-reduce:` is invalid for Jumi view-transition motion.
 *  7. Other transferable at-rule conditions apply to participation *and* to that side's motion.
 *  8. Source-state and relational variants are refused rather than approximately translated.
 *  9. Jumi never emits onto `::view-transition-group()`.
 * 10. Jumi restores `mix-blend-mode: plus-lighter` whenever it replaces a side's UA animation.
 * 11. An at-rule this pass empties is pruned; a structural layer never is.
 *
 * The unit tests are named after the rules rather than after the mechanisms, so a failure reads as "the
 * invariant broke" instead of as an assertion about a string.
 */

/** A declaration as this pass replays it, in the order the emitted rule needs it. */
export type Product = { prop: string; value: string }

/** The two sides of a transition, and the only values the variant accepts. */
export type ViewTransitionSide = 'new' | 'old'

/**
 * The prefix a staged rule's marker class is built from.
 *
 * The identity is appended to it, and the result is a class — so the identity reaching this point has
 * already been through {@link identityAccepted}, and the parser below can be exact rather than
 * defensive. `[\w-]` is the accepted grammar, which is why an escaped or quoted identity never
 * arrives here.
 */
const markerPrefix = 'jumi-vt-'

/**
 * The markers for the candidates this pass refuses, one per reason.
 *
 * Two rather than one because the reasons need different sentences and the author needs the right one:
 * `view-transition-old:animate-fade-in` is missing a name, and `view-transition-old/none:animate-fade-in`
 * has one the browser will not accept. A single marker could only report them together, and "the name
 * after the `/` is invalid" is not a useful sentence to receive about a class with no `/` in it.
 *
 * Both match no page, for the same reason the valid marker uses one: the utility's declarations must not
 * reach the element. A refusal that fell back to `&` would put the motion on the source element, where
 * it would run as a second animation over the real one.
 */
const invalidPrefix = 'jumi-vt-invalid-'

/** Why a candidate was refused, from the marker the variant left behind. */
export type ViewTransitionRefusal = 'missing' | 'name'

const invalidMarker = (reason: ViewTransitionRefusal) =>
  `${invalidPrefix}${reason}`

/**
 * Whether a selector is view-transition staging.
 *
 * The test is the **marker shape**, not the prefix, and the difference is the one way this pass could
 * delete something that is not its own. The pass removes staging from the document, so a prefix test
 * would remove any author rule whose selector merely mentions `.jumi-vt-old-hero` — a class an author
 * could reasonably write, since this file documents it. Requiring a trailing `:where(.jumi-vt-…)`
 * admits nothing an author would write by accident, and still admits a *malformed* marker, which is the
 * case that has to be collected so it can be reported rather than silently dropped.
 */
export const isStagingSelector = (selector: string) =>
  STAGING_SHAPE.test(selector)

/**
 * What the variant returns for a side and an identity.
 *
 * `&:where(…)` and not `&`: the wrapper still matches the author's element, so the finalizer can
 * recover the selector, while the `:where()` half matches nothing, so the declarations never apply.
 */
export const viewTransitionMarker = (
  side: ViewTransitionSide,
  identity: string,
) => `&:where(.${markerPrefix}${side}-${identity})`

/** The same selector, for a candidate this pass refuses. */
export const viewTransitionInvalidMarker = (reason: ViewTransitionRefusal) =>
  `&:where(.${invalidMarker(reason)})`

/**
 * The identity grammar, which is a transcription of what the platform accepts and not a guess.
 *
 * Measured against Chromium 153 across fifteen hostile names (P21), in three places each: accepted as
 * `view-transition-name`, accepted as `::view-transition-old(X)`, and actually **building** a group.
 * The three columns disagree, which is why neither validity column alone is the test:
 *
 *   `hero` `my-card-2` `--foo` `HERO` `_x`   both, and the group is built — and none of them needs
 *                                            escaping, so concatenation is faithful
 *   `none`                                   both validity columns say yes, and **no group is
 *                                            built at all** — it is the keyword meaning "no name"
 *   `auto`                                   parses as a pseudo argument, is not a name
 *   `initial` `inherit` `unset` `revert`      are names, do not parse as a pseudo argument
 *   `1hero` `hero)` `hero{` `a b`            malformed; `)` and `{` would break the selector
 *
 * So the rule is: a valid identifier, not a reserved keyword, validated **before** the selector is
 * built and refused rather than handed to the parser to rescue. A malformed `view-transition-name`
 * fails *open* — the page renders and the element simply never travels — so the one failure mode
 * this must not have is silence.
 *
 * `revert-layer` is in the reserved set without being measured: it is the same family as the four
 * CSS-wide keywords that were, and a keyword list that is missing its newest member is the kind of
 * omission that reads as deliberate.
 */
const IDENTIFIER = /^(?:--[\w-]+|-?[A-Za-z_][\w-]*)$/

const RESERVED = new Set([
  'auto',
  'inherit',
  'initial',
  'none',
  'revert',
  'revert-layer',
  'unset',
])

export const identityAccepted = (identity: string) =>
  IDENTIFIER.test(identity) && !RESERVED.has(identity.toLowerCase())

/**
 * Exactly one class selector, every `:` escaped — the shape a variant leaves behind when its own
 * meaning is an environment rather than a state.
 *
 * `.hover\:view-transition-old\/hero\:animate-fade-out:hover` fails this and should: the trailing
 * `:hover` is about the source element, and there is no element in the pseudo tree for it to be
 * about.
 */
const SINGLE_CLASS = /^\.(?:\\.|[^:\\])+$/

/** The marker a staged rule ends with, and the two facts it carries. */
const MARKER = new RegExp(`:where\\(\\.${markerPrefix}(old|new)-([\\w-]+)\\)$`)

/**
 * The marker's shape without its content, for deciding what is staging rather than what it says.
 *
 * Wider than {@link MARKER} on purpose, so a marker this pass cannot read is still recognised as its
 * own — collected, taken out of the element's cascade, and reported — instead of being left in the
 * output as a rule that matches nothing and says nothing.
 */
const STAGING_SHAPE = new RegExp(`:where\\(\\.${markerPrefix}[^)]*\\)$`)

/** A media query Jumi owns, so it never conditions participation. */
const JUMI_OWNED_QUERY =
  /^\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)$/i

/**
 * The query that contradicts Jumi's own policy, and is refused rather than translated.
 *
 * `@media (prefers-reduced-motion: no-preference)` around Jumi's emission is a decision, not a
 * default: the browser's cross-fade is what should remain under `reduce`. An author asking for the
 * opposite would get a rule that can never run, and a silent no-op is worse than a refusal.
 */
const REFUSED_QUERY = /^\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)$/i

/** A condition a staged rule sits inside. */
export type Condition = { name: string; params: string }

/**
 * A staged rule and the conditions it sat inside, read **while the document still holds it**.
 *
 * The order is the point. This pass takes staging out of the document, and a detached PostCSS rule has
 * no ancestors — so a reader that walked up from the rule at emission time would find no conditions
 * and every wrapper would silently stop transferring. Read where the rule still is, carry the answer.
 *
 * One entry per **selector**, not per rule, and that is not the same thing. A CSS optimizer merges rules
 * that declare the same thing, so a page with six cards arrives as one rule with six staged selectors in
 * a list — measured in the docs build, which is the only pipeline here that optimizes. A reader that
 * assumed one selector per rule took the whole list for a single candidate, found it was not one class,
 * and refused every card in the page while reporting each one politely. See `readStaged`.
 */
export type ViewTransitionStaging = {
  conditions: Condition[]
  rule: Rule
  selector: string
}

/** A staged rule, read back out of the emitted stylesheet. */
type Staged = {
  /** The at-rules it sits inside, outermost first, minus the layer this pass places itself. */
  conditions: Condition[]
  /** Its own declarations, which is what gets replayed onto the pseudo tree. */
  declarations: Product[]
  identity: string
  /** Whether it establishes the group, or only configures one. */
  motion: boolean
  side: ViewTransitionSide
  /** The author's element, as a selector this pass can write a `view-transition-name` onto. */
  source: string
}

const ownDeclarations = (rule: Rule) =>
  (rule.nodes ?? []).filter((node): node is Declaration => node.type === 'decl')

/**
 * The conditions a staged rule sits inside, outermost first, and one entry per staged selector.
 *
 * `@layer` is skipped because this pass places its own output: the identity rule belongs in the
 * utilities layer with the utilities, and the pseudo rules at the top level, and re-wrapping either
 * in a layer copied from the staging site would be a second, accidental placement.
 */
export const viewTransitionStaging = (rule: Rule): ViewTransitionStaging[] => {
  const staging = rule.selectors.filter(isStagingSelector)

  if (!staging.length) return []

  const conditions: Condition[] = []

  for (
    let node = rule.parent;
    node && node.type !== 'root';
    node = node.parent
  ) {
    const at = node as AtRule

    if (at.type === 'atrule' && at.name !== 'layer')
      conditions.unshift({ name: at.name, params: at.params })
  }

  return staging.map(selector => ({ conditions, rule, selector }))
}

/**
 * The same shape, recovered from the emitted selector: side, identity, and the source element.
 *
 * Returns the refusal's own reason rather than a bare `'invalid'`, so the message an author gets names
 * the thing they actually got wrong.
 */
const readStaged = (
  staging: ViewTransitionStaging,
  isMotion: (rule: Rule) => boolean,
): null | Staged | ViewTransitionRefusal => {
  const { rule, selector } = staging
  const refused = new RegExp(
    `:where\\(\\.${invalidPrefix}(missing|name)\\)$`,
  ).exec(selector)

  if (refused) return refused[1] as ViewTransitionRefusal

  const marker = MARKER.exec(selector)

  if (!marker) return null

  return {
    conditions: staging.conditions,
    declarations: ownDeclarations(rule).map(({ prop, value }) => ({
      prop,
      value,
    })),
    identity: marker[2],
    motion: isMotion(rule),
    side: marker[1] as ViewTransitionSide,
    source: selector.slice(0, marker.index),
  }
}

/**
 * The candidate as the author wrote it, for a message.
 *
 * What a staged selector holds is the author's class with every character an identifier cannot hold
 * escaped, plus the marker or the compound selector the offending variant appended —
 * `.hover\:view-transition-old\/hero\:animate-fade-out:hover:where(.jumi-vt-old-hero)`. Printing that at
 * somebody prints Jumi's internals back at them, and the whole point of a refusal is that the author can
 * act on it.
 *
 * So: the leading `.` comes off, everything from the first **unescaped** colon onward goes — which is
 * exactly the marker and the variant's own compound, colons escaped inside the class included — and the
 * escapes come out. One helper for all four messages, which is also how the internal marker stops
 * leaking into them; an earlier version tried to strip it with a pattern and failed, because inside a
 * template literal `\\$` is a literal dollar sign rather than an end anchor.
 */
const authored = (selector: string) => {
  const body = selector.replace(/^\./, '')
  let cut = body.length

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] === '\\') {
      index += 1

      continue
    }

    if (body[index] === ':') {
      cut = index

      break
    }
  }

  return body.slice(0, cut).replace(/\\(.)/g, '$1')
}

export type ViewTransitionProducts = {
  /** One `view-transition-name` per motion-bearing candidate, with the conditions it keeps. */
  identities: Array<{
    conditions: Condition[]
    identity: string
    source: string
  }>
  /**
   * One per (identity, side, conditions) — the unit the owning rule and the side rule are both built
   * from, so that a transferable wrapper applies to a side's participation *and* to its motion.
   */
  units: Array<{
    conditions: Condition[]
    declarations: Product[]
    identity: string
    /** Whether this condition set carries a motion-bearing candidate, and therefore owns the side. */
    motion: boolean
    side: ViewTransitionSide
  }>
  /** A candidate the author wrote and this pass cannot honour, with the reason. */
  warnings: string[]
}

/**
 * A stable key for a condition set.
 *
 * Two staged rules with the same at-rule ancestry are the same condition set however differently they
 * were written, because the ancestry is what the emitted CSS wraps in. Joined with a separator no
 * at-rule name or parameter contains, so `media` + `x` cannot collide with a parameter reading `x&media`.
 */
const conditionKey = (conditions: Condition[]) =>
  conditions
    .map(condition => `${condition.name} ${condition.params}`)
    .join('\u0000')

/**
 * The conditions a product keeps.
 *
 * `motion-safe:` is dropped and everything else is kept, and that is the whole wrapper rule. It is a
 * decision about an at-rule rather than about a class name: the author's class is unchanged either way,
 * because the class carries the condition's *spelling*, not its meaning.
 */
const kept = (conditions: Condition[]) =>
  conditions.filter(condition => !JUMI_OWNED_QUERY.test(condition.params))

/**
 * Read the staged rules and say what the products are, without writing anything.
 *
 * Kept apart from the emission so the decisions that are not mechanical can be seen and tested on their
 * own: which candidates establish a group, which wrappers survive, and which of them own a side.
 *
 * The grouping key includes the conditions, and that is not an implementation detail. It is what makes
 * a transferable wrapper mean the same thing on both products: `sm:view-transition-old/hero:A` beside an
 * unconditioned `view-transition-new/hero:B` has to give an old side that is Jumi's above the breakpoint
 * and the browser's below it, with the new side unaffected. Grouping a side's candidates into one
 * unconditioned product would honour the wrapper for the name and silently discard it for the motion.
 */
export const viewTransitionProducts = (
  staging: ViewTransitionStaging[],
  isMotion: (rule: Rule) => boolean,
) => {
  const products: ViewTransitionProducts = {
    identities: [],
    units: [],
    warnings: [],
  }
  /** (side, identity) → condition key → the staged rules written under it. */
  const groups = new Map<string, Map<string, Staged[]>>()
  const named = new Set<string>()

  for (const entry of staging) {
    const staged = readStaged(entry, isMotion)

    // Unreachable as the variant is written today: it returns a well-formed marker or one of the two
    // refusal markers, and both are read above. It is reported rather than skipped because the
    // alternative is a candidate that disappears — the pass takes every staging rule out of the document
    // whether or not it could read it. That is the one class of failure this pass is not allowed to have.
    if (staged === null) {
      products.warnings.push(
        `Jumi could not read \`${entry.selector}\` as a view transition candidate, so nothing was` +
          ' emitted for it. That is a bug in Jumi rather than in the class — please report it at' +
          ' https://github.com/ibnlanre/jumi/issues',
      )

      continue
    }

    if (staged === 'missing') {
      products.warnings.push(
        `Jumi left \`${authored(entry.selector)}\` out: it names no transition, so there is` +
          ' nothing for the browser to pair. Write the name of the thing that moves between the `/`' +
          ' and the `:` — `view-transition-old/hero:animate-fade-out` — and Jumi writes the' +
          ' `view-transition-name` for you.',
      )

      continue
    }

    if (staged === 'name') {
      products.warnings.push(
        // Built by concatenation rather than as one template literal, because the prose names a `/` in
        // backticks and that is a backtick inside a template literal — which closes it. Measured: this
        // message read `NaN browser accepts as a transition name` for exactly that reason.
        'Jumi left `' +
          authored(entry.selector) +
          '` out: the name after the `/` is not one the' +
          ' browser accepts as a transition name. Use a plain name such as `hero` or `my-card-2` —' +
          ' `none`, `auto`, and the CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`,' +
          ' `revert-layer`) are all reserved.',
      )

      continue
    }

    const refused = staged.conditions.find(condition =>
      REFUSED_QUERY.test(condition.params),
    )

    if (refused) {
      products.warnings.push(
        `Jumi left \`${authored(staged.source)}\` out: you asked for it under` +
          " `prefers-reduced-motion: reduce`, and Jumi's view transition motion never runs there — the" +
          " browser's own cross-fade is what remains instead. Write it without `motion-reduce:` and it" +
          ' will run whenever motion is allowed.',
      )

      continue
    }

    if (!SINGLE_CLASS.test(staged.source)) {
      products.warnings.push(
        `Jumi left \`${authored(staged.source)}\` out: the motion has to run on the browser\'s snapshot` +
          ' of your element, and this variant is about the element itself — there is no `:hover` or' +
          ' `:checked` on the other side for it to be about. Variants that describe the environment do' +
          ' transfer: `sm:`, `supports-[…]:`, `motion-safe:`.',
      )

      continue
    }

    staged.conditions = kept(staged.conditions)

    const key = `${staged.side}:${staged.identity}`
    const group = groups.get(key) ?? new Map<string, Staged[]>()
    const set = group.get(conditionKey(staged.conditions)) ?? []

    set.push(staged)
    group.set(conditionKey(staged.conditions), set)
    groups.set(key, group)

    // And **every** motion-bearing candidate names the element, not just the first one for the
    // identity. Two rules declaring the same name with the same value do not conflict, and one rule
    // per candidate is what makes the conditions compose: `sm:` on one side and no wrapper on the
    // other has to mean "participates in either case", and no single rule can say that. Picking one
    // candidate's conditions for the whole identity would make one side's wrapper silently govern the
    // other's participation, decided by whichever rule Tailwind happened to emit first.
    if (!staged.motion || named.has(staged.source)) continue

    named.add(staged.source)
    products.identities.push({
      conditions: staged.conditions,
      identity: staged.identity,
      source: staged.source,
    })
  }

  for (const [key, sets] of groups) {
    const separator = key.indexOf(':')
    const side = key.slice(0, separator) as ViewTransitionSide
    const identity = key.slice(separator + 1)

    // The invariant, in one line: a control cannot make an element participate. A side with no motion
    // anywhere in it is dropped silently, which is how an `animation-duration-500` with no `animate-*`
    // already behaves — inert, and not worth a warning, because writing the control on the way to
    // writing both is ordinary.
    if (![...sets.values()].some(set => set.some(entry => entry.motion)))
      continue

    for (const set of sets.values()) {
      products.units.push({
        conditions: set[0].conditions,
        // Document order within a condition set, so a later candidate wins the cascade against an
        // earlier one on the pseudo rule exactly as it would on the element.
        declarations: set.flatMap(entry => entry.declarations),
        identity,
        // Ownership follows the motion, not the declarations: a control written under a condition no
        // motion shares contributes its declaration but must not take the side away from the browser.
        motion: set.some(entry => entry.motion),
        side,
      })
    }
  }

  return products
}

const wrap = (node: Rule, conditions: Condition[]) => {
  let wrapped: Container = node

  for (const condition of [...conditions].reverse()) {
    wrapped = postcss
      .atRule({ name: condition.name, params: condition.params })
      .append(wrapped)
  }

  return wrapped
}

export type ViewTransitionEmission = {
  /** The rules written. */
  emitted: number
  warnings: string[]
}

/**
 * Write the products into the stylesheet.
 *
 * Two destinations, because they belong in two places for two reasons:
 *
 *   the identity   onto the author's own element, in the utilities layer, where it is an ordinary
 *                  declaration that happens to be the one the browser pairs the two sides by
 *   the motion     onto the pseudo tree, at the top level, in its own `@supports` block — never
 *                  merged into a utility rule, because an unrecognised selector in a comma list
 *                  invalidates the whole rule, and a browser without view transitions would lose the
 *                  animation along with the transition (measured, P8)
 */
export function emitViewTransitions(
  root: Root,
  staging: ViewTransitionStaging[],
  isMotion: (rule: Rule) => boolean,
  data: { aggregate: Product[]; layer: Container; substrate: Product[] },
): ViewTransitionEmission {
  const products = viewTransitionProducts(staging, isMotion)
  const emission: ViewTransitionEmission = {
    emitted: 0,
    warnings: products.warnings,
  }

  for (const { conditions, identity, source } of products.identities) {
    const rule = postcss.rule({ selector: source })

    rule.append(postcss.decl({ prop: 'view-transition-name', value: identity }))
    data.layer.append(wrap(rule, conditions))
    emission.emitted += 1
  }

  if (!products.units.length) return emission

  const preference = postcss.atRule({
    name: 'media',
    params: '(prefers-reduced-motion: no-preference)',
  })
  const pseudo = ({
    identity,
    side,
  }: {
    identity: string
    side: ViewTransitionSide
  }) => `::view-transition-${side}(${identity})`

  const supports = postcss.atRule({
    name: 'supports',
    // The capability is a fact about the browser, not about a name, so one guard covers the block — a
    // browser that parses one of these pseudo-elements parses the rest. The side named is the first
    // unit's own, rather than always `old`: the two are equivalent as a capability test, and writing
    // the side that actually exists keeps the guard readable as a statement about this stylesheet.
    params: `selector(${pseudo(products.units[0])})`,
  })

  // Ownership, grouped by condition set rather than emitted per unit. Taking a side from the browser
  // means declaring an `animation` on it, and that act has to sit inside exactly the conditions the
  // author put on that side's motion: `sm:…old:animate-fade-out` beside an unconditioned
  // `new:animate-fade-in` must leave the old side to the browser's cross-fade below the breakpoint,
  // not replace it with a list of `none`s. In the ordinary case every unit is unconditioned, the groups
  // collapse to one, and this is the single shared rule it has always been — the substrate and the
  // aggregate are facts about the stylesheet, identical for every side, so the grouping costs nothing
  // until a wrapper actually differs.
  //
  // Ownership follows the motion and not the declarations: a control under a condition no motion shares
  // contributes its declaration below, but does not take the side away from the browser.
  const owning = new Map<string, typeof products.units>()

  for (const unit of products.units) {
    if (!unit.motion) continue

    const key = conditionKey(unit.conditions)
    const group = owning.get(key) ?? []

    group.push(unit)
    owning.set(key, group)
  }

  for (const group of owning.values()) {
    const [first] = group
    const rule = postcss.rule({ selector: group.map(pseudo).join(',\n') })

    for (const { prop, value } of [...data.substrate, ...data.aggregate]) {
      rule.append(postcss.decl({ prop, value }))
    }

    preference.append(wrap(rule, first.conditions))
    emission.emitted += 1
  }

  for (const unit of products.units) {
    const rule = postcss.rule({ selector: pseudo(unit) })

    for (const { prop, value } of unit.declarations)
      rule.append(postcss.decl({ prop, value }))

    // Re-declared rather than left to the browser's own animation, because the emitted `animation`
    // *replaces* that animation and takes its `-ua-mix-blend-mode-plus-lighter` with it. Measured with
    // opacities and seek time held equal: the composited pixel differs, so the blend is load-bearing
    // and `normal` is not a safe default (P19).
    rule.append(postcss.decl({ prop: 'mix-blend-mode', value: 'plus-lighter' }))

    preference.append(wrap(rule, unit.conditions))
    emission.emitted += 1
  }

  supports.append(preference)
  root.append(supports)

  return emission
}
