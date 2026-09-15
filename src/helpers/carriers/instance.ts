import type { Declaration, Rule } from 'postcss'

/**
 * What a rule declares about a motion, read off the rule itself.
 *
 * Two passes need the same two facts — which slot a rule activates, and which **instance** of it the
 * rule wrote down — and they must agree, because they are the two halves of one mechanism: the finalizer
 * publishes a slot's value onto the rules that activate it, and the range pass publishes the range the
 * variant qualified onto the same rule. Deriving the instance in one pass and assuming the definition in
 * the other is a mistake this repository has already paid for once — measured, a ranged *named* phrase
 * fell back to the whole range when only the definition was assumed.
 */

/** The declarations of a rule itself, ignoring anything nested inside it. */
export const ownDeclarations = (rule: Rule) =>
  (rule.nodes ?? []).filter((node): node is Declaration => node.type === 'decl')

/**
 * What activates a motion: the generated variable a definition is named by.
 *
 *   .animate-rotate-45 { --jumi-rotate-3zWYd-animation-name: jumi-rotate-3zWYd; … }
 *   .transition-duration-500\/rotate { --jumi-rotate-transition-duration: 500ms; }
 *
 * Deliberately not "mentions a Jumi variable". A control declares a different property —
 * `.animation-duration-500 { --jumi-rotate-animation-duration: 500ms }` — and must stay inert on its own,
 * so the locator is the activation rather than anything in the namespace. The pattern needs at least one
 * segment between `--jumi-` and the suffix, which is what excludes the substrate
 * (`--jumi-animation-name`) by construction rather than by a blocklist.
 */
export const ACTIVATED_SLOT = /^--jumi-(.+)-animation-name$/

/**
 * A name, as the rule that declared it states it.
 *
 * The **key** is the instance's address inside the model (`attribute-id-hash`), and it is what the
 * definition-keyed activation cannot express: two names over identical frames share one activation
 * variable and are still two motions.
 */
export const LABELLED_SLOT = /^--jumi-(.+)-label$/

/**
 * Every slot key this rule can publish: the instance it named, or the definition's own when it named
 * none.
 *
 * A rule activates the **definition**, so the key cannot be read off the declaration alone — and the base
 * is not automatic. A rule that named its instance publishes that instance and no other, because the
 * unnamed instance of the definition is what a *different* candidate declared. Publishing both made an
 * element that named its motion run one keyframe twice — once at the scope's timing and once at the
 * name's — and the aggregate's position order then decided which of the two the browser kept. Measured,
 * with `animate-scale-110` and `animate-scale-110/loop` in one sheet: the same page resolved `0.9s` in one
 * candidate order and `1s` in the other.
 *
 * A composed tween is where the two coincide rather than collide: its label declaration is keyed by the
 * slot itself (`--jumi-filter-label`, not `--jumi-filter-…-<hash>-label`), so nothing here matches and the
 * base key *is* the named instance.
 */
export const instanceKeys = (rule: Rule, base: string): string[] => {
  const named = ownDeclarations(rule)
    .map(candidate => LABELLED_SLOT.exec(candidate.prop)?.[1])
    .filter(
      (key): key is string => key !== undefined && key.startsWith(`${base}-`),
    )

  return named.length ? named : [base]
}
