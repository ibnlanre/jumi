import type { Declaration, Root, Rule } from 'postcss'

import type { Collection } from '@/types'

import postcss from 'postcss'

/**
 * The carrier protocol, and the one engine that completes it.
 *
 * Jumi's carrier is a *class*: `animations` opts an element in, and the carrier declares the
 * shared composition state it needs. Tailwind expands that class — variants re-parent the
 * utility body (`variants.ts`: `r.nodes = selectors.map(selector => rule(selector, r.nodes))`),
 * and `@apply` copies it — so by the time CSS exists, one carrier has become several rules in
 * contexts Jumi never wrote:
 *
 *   .animations                    :is(.animations > *)        .animations::before
 *   (a motion-safe wrapper)        (an arbitrary variant)      (a copy @apply inlined)
 *
 * The aggregate those rules read is dynamic, and it cannot be published at a literal selector:
 * each entry is `var(--jumi-<slot>-…)`, the slot variables are declared by the `animate-*`
 * utilities **on the element**, and a `var()` chain in a custom property resolves where it is
 * *declared*. Published on `:root` the declaration is invalid and every carrier falls back to
 * `none`; published on `.animations` it never reaches a prefixed form. Both were measured.
 *
 * So the carrier marks itself, and the data is completed *after* Tailwind is done:
 *
 *   carrier marker present        → the aggregate goes in here
 *   staging marker present        → read the aggregate, then remove the rule
 *   anything else                 → untouched
 *
 * That is the whole protocol, and it is deliberately tiny. It is a walk over a generic CSS AST —
 * PostCSS's, not Tailwind's — because the pass has to survive the constructs Tailwind emits and
 * the ones Jumi never sees: nested `@layer`/`@media`/`@supports` bodies, comments, strings,
 * `var()` fallbacks, custom-property values. A textual scan can be made to handle all of those,
 * which is not the same as being the right thing for the feature to depend on: CSS semantics are
 * not text semantics, and this investigation has already produced four bugs that looked exactly
 * like a text bug until a browser disagreed.
 */

/** Marks a rule that carries a Jumi carrier, and therefore needs the aggregate injected. */
export const carrierMarker = '--jumi-carrier'

/**
 * Marks the rule the model stages its aggregate in. It exists only to be read and removed:
 * nothing in a browser ever consumes it, so it can never be a functional publication.
 */
export const stagingMarker = '--jumi-carrier-staging'

/** The properties the aggregate is carried in. One namespace, so staging and injection cannot
 * disagree about what counts as data. */
const aggregatePattern = /^--jumi-aggregate-/

export type Finalized = {
  /** How many carrier rules the aggregate was written into. Zero on a second pass, because the
   * injection replaces the declarations it finds rather than adding to them. */
  carriers: number
  /** How many staging rules were consumed. Zero on a second pass, by construction. */
  staging: number
}

/** The declarations of a rule itself, ignoring anything nested inside it. */
const ownDeclarations = (rule: Rule) =>
  (rule.nodes ?? []).filter((node): node is Declaration => node.type === 'decl')

const stages = (rule: Rule) => ownDeclarations(rule).some(decl => decl.prop === stagingMarker)
const carries = (rule: Rule) => ownDeclarations(rule).some(decl => decl.prop === carrierMarker)

/**
 * Complete every carrier in a stylesheet, in place.
 *
 * Two passes, because the order of the two kinds of rule is not a contract: the aggregate is read
 * from the whole document first — later publications winning, exactly as a later declaration would
 * in the browser — and only then written into the carriers. One pass would depend on every
 * publication preceding every carrier, which happens to be true today (base output is emitted
 * before utilities) and is not something to build on.
 *
 * `aggregate` is for a host that already holds the data: it is applied over whatever the
 * stylesheet staged, and the staging is removed either way. The stylesheet stays the normal
 * channel, which is what lets finalization be a pure function of the CSS it is given.
 *
 * Reports what it changed and does not serialize. A second pass finds nothing staged and nothing
 * to replace, so it reports zero and leaves the document — and therefore the output — untouched.
 */
export function finalize(root: Root, aggregate?: Collection<string>): Finalized {
  const staged = new Map<string, string>()
  const finalized: Finalized = { carriers: 0, staging: 0 }

  // Pass 1 — read the data, and take the rules that carried it out of the document. Removal
  // during a walk is why this is an AST and not a string: the rule can go wherever it is nested.
  root.walkRules((rule) => {
    if (!stages(rule)) return

    for (const declaration of ownDeclarations(rule)) {
      if (aggregatePattern.test(declaration.prop)) staged.set(declaration.prop, declaration.value)
    }

    rule.remove()
    finalized.staging += 1
  })

  for (const [property, value] of Object.entries(aggregate ?? {})) staged.set(property, value)

  // Pass 2 — write it into every carrier.
  root.walkRules((rule) => {
    if (!carries(rule)) return

    let changed = false

    for (const [property, value] of staged) {
      const existing = ownDeclarations(rule).find(declaration => declaration.prop === property)

      if (!existing) {
        rule.append({ prop: property, value })
        changed = true
        continue
      }

      if (existing.value === value) continue

      existing.value = value
      changed = true
    }

    if (changed) finalized.carriers += 1
  })

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
