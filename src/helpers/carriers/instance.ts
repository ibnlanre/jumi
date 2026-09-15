import type { Declaration, Rule } from 'postcss'

import cssEscape from 'css.escape'

/**
 * The instance key, and its parser — the one place the format is written down.
 *
 * A named slot is keyed by the author's own word, and the key has to be readable without being *guessable*.
 * The shape this replaces (`flick-Z2excak-rotate`) was readable, but its parse boundary was a fact about the
 * contents — three hyphen-joined pieces, one of them unbounded and hyphenated — so a name whose tail was
 * another instance's id absorbed its key: `foo-backdrop-filter-hue-rotate` on `rotate-x` and
 * `foo-backdrop-filter-hue` on `rotate` are one string when both ids are `rotate`. Readable, not exact.
 *
 * A length prefix moves the boundary from the contents into the shape:
 *
 *   --jumi-slot-5-flick-Z2excak-rotate
 *   --jumi-slot-24-flick-animation-duration-Z2excak-rotate
 *
 * The count is the length of the **emitted** name in UTF-16 code units — what `cssEscape` writes for it,
 * which is what a reader sees, and not always what the author typed (`foo.bar` occupies eight characters:
 * `foo\.bar`). Code units rather than code points because that is what `.length` and `.slice` measure, so a
 * reader that slices by the count cannot disagree with the writer that produced it.
 *
 * Decoding is then arithmetic and exact: read the digits, take that many units, and the rest is the id (up to
 * the next hyphen — `shorthash2` is base62, so an id holds none) and the attribute. Nothing is inferred from
 * which category a string happens to belong to, which is what makes the encoding injective by construction
 * rather than by corpus. Measured over 366,360 triples of the whole attribute vocabulary with adversarial
 * names — Unicode, characters CSS escapes, names that read like a part suffix — every one round-trips
 * (`scripts/spike-slot-boundary.mjs`, and `src/core/slot-key.test.ts` keeps it as a gate).
 */

/**
 * The text a name occupies in an emitted variable.
 *
 * `cssEscape` has a rule for the first character of the string it is given — a leading digit, or a `-` that
 * would read as a negative number — that never applies to a name here, because a Jumi variable is
 * `--jumi-slot-…` and the name is never at position 0. Escaping a prefixed sentinel and cutting it back off
 * models exactly the rule that does apply, and the compile check in the probe is what keeps that honest.
 */
const emitted = (name: string) => cssEscape(`x${name}`).slice(1)

/** `attribute` and `id` for a definition, `name` for one of its instances. */
export type ParsedInstance = { attribute: string; id: string; name: string }

/**
 * The key a **named** instance is addressed by.
 *
 * The name goes in as the author wrote it — escaping happens when the key becomes a variable name, where the
 * count and the text have to agree — and the count is of the text that will be there once it has escaped.
 */
export const instanceKey = (attribute: string, id: string, name: string) =>
  `${emitted(name).length}-${name}-${id}-${attribute}`

/**
 * The triple a named instance key spells, or null when the key is not one.
 *
 * Takes **emitted** text: the key as it appears inside a variable name, escaped, because that is what a
 * reader has — a rule's declarations are the stylesheet's own text. The name comes back in that form too,
 * which is all any reader in Jumi needs, since two keys are only ever compared with each other and never
 * with what the author typed.
 *
 * Null is one answer for every key that is not a named instance: a definition base (`rotate-Z2excak`), a
 * composed tween's or an effect's own key (`filter`, `bounce-in`), and anything malformed. Callers that need
 * to tell those apart compare what came back rather than asking again.
 */
export const parseInstanceKey = (key: string): null | ParsedInstance => {
  const cut = key.indexOf('-')

  if (cut < 1) return null

  const count = Number(key.slice(0, cut))

  if (!Number.isSafeInteger(count) || count < 1) return null

  const rest = key.slice(cut + 1)
  const name = rest.slice(0, count)

  if (name.length !== count || rest[count] !== '-') return null

  const body = rest.slice(count + 1)
  const end = body.indexOf('-')

  if (end < 1) return null

  return { attribute: body.slice(end + 1), id: body.slice(0, end), name }
}

/** The definition a key names, when the key is a named instance: `attribute-id`, as activation spells it. */
export const instanceDefinition = (key: string) => {
  const parsed = parseInstanceKey(key)

  return parsed ? `${parsed.attribute}-${parsed.id}` : null
}

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
 * It is `instanceKey`'s shape — the emitted length, the name, the id, the attribute — so an instance is both
 * readable in a stylesheet and exact to parse. See `instanceKey`, which is the only place that format is
 * stated.
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
 * **Parsed, not inferred.** This used to reconstruct the definition out of the base and the id's
 * hyphen-freeness — a rotation test that held only while an id could not be forged by a name whose tail
 * happened to be one, which is exactly what a readable key made possible. `parseInstanceKey` reads the triple
 * out of the key itself, so the comparison is between the definition the key names and the definition the rule
 * activated, and an id spelled inside a name has nothing left to collide with.
 *
 * A composed tween is where the two coincide rather than collide: its label declaration is keyed by the
 * slot itself (`--jumi-filter-label`, not `--jumi-filter-…-<hash>-label`), so nothing here parses and the
 * base key *is* the named instance.
 */
export const instanceKeys = (rule: Rule, base: string): string[] => {
  const named = ownDeclarations(rule)
    .map(candidate => LABELLED_SLOT.exec(candidate.prop)?.[1])
    .filter(
      (key): key is string =>
        key !== undefined && instanceDefinition(key) === base,
    )

  return named.length ? named : [base]
}
