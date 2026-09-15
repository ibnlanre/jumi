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
 * The **key** is the instance's address inside the model, and it is what the definition-keyed activation
 * cannot express: two names over identical frames share one activation variable and are still two motions.
 * It spells the name first, then the definition id, then the attribute — `flick-Z2excak-rotate` — so the
 * instance is readable in a stylesheet and the id, being base62, still delimits the two variable-length
 * segments. See `slotKey` in `src/core` for why that order and not the other.
 */
export const LABELLED_SLOT = /^--jumi-(.+)-label$/

/**
 * Whether a labelled slot is an **instance of the definition** a rule activated.
 *
 * The two keys are rotations of each other rather than one being a prefix of the other — the rule
 * activated `rotate-Z2excak` and the slot is `flick-Z2excak-rotate` — so the test is not a prefix test and
 * cannot be done by string search alone. The id is what makes it decidable: it is base62, so it holds no
 * hyphen, and therefore the **last** hyphen in the base separates the attribute from the id even when the
 * attribute has hyphens of its own (`background-color-23M1JK` → `background-color` + `23M1JK`). Every
 * hyphen on the name's side is therefore free to be a hyphen.
 *
 * A base with no hyphen at all is a composed tween or an effect (`filter`, `bounce-in`), whose labelled
 * slot is keyed by the base itself and matched by equality — `--jumi-filter-label`, not
 * `--jumi-filter-…-label`.
 */
const instanceOf = (key: string, base: string) => {
  const cut = base.lastIndexOf('-')

  if (cut < 0) return false

  return key.endsWith(`-${base.slice(cut + 1)}-${base.slice(0, cut)}`)
}

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
    .filter((key): key is string => key !== undefined && instanceOf(key, base))

  return named.length ? named : [base]
}
