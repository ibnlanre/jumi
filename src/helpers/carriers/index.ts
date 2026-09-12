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
 *   carrier marker present        → inject the current aggregate
 *   staging marker present        → read the aggregate, then remove the rule
 *   anything else                 → untouched
 *
 * That is the whole protocol, and it is deliberately tiny. The finalizer knows nothing about
 * Tailwind's selectors, variants, AST or pipeline — it recognises two Jumi declarations in a
 * stylesheet, which is why `*:animations`, `before:animations`, compound variants and `@apply`
 * all behave identically, and why Jumi needs no fork to get there.
 */

/** Marks a rule that carries a Jumi carrier, and therefore needs the aggregate injected. */
export const carrierMarker = '--jumi-carrier'

/**
 * Marks the rule the model stages its aggregate in. It exists only to be read and removed:
 * nothing in a browser ever consumes it, so it can never be a functional publication.
 */
export const stagingMarker = '--jumi-carrier-staging'

export type Finalized = {
  /** How many carrier rules the aggregate was written into. Zero on a second pass, because
   * the injection replaces the declarations it finds rather than adding to them. */
  carriers: number
  /** The stylesheet, with every carrier completed and the staging removed. */
  css: string
  /** How many staging rules were consumed. Zero on a second pass, by construction. */
  staging: number
}

/**
 * Leaf rules only: `@layer`, `@media` and `@supports` bodies contain braces, so `[^{}]*`
 * cannot span them. Nested rules are still reachable — `@keyframes` steps match, and are
 * simply left alone — which is all this needs.
 */
const rule = /([^{}]+)\{([^{}]*)\}/g

const carries = (body: string) => /--jumi-carrier\s*:/.test(body)
const stages = (body: string) => /--jumi-carrier-staging\s*:/.test(body)
const aggregate = /(--jumi-aggregate-[\w-]+)\s*:\s*([^;]*);?/g

/** Replace a declaration in place, or append it. */
const inject = (body: string, staged: Map<string, string>) => {
  let next = body

  for (const [property, value] of staged) {
    const existing = new RegExp(`${property}\\s*:\\s*[^;]*;?`)

    if (existing.test(next)) {
      next = next.replace(existing, `${property}: ${value};`)
      continue
    }

    // A text edit, not a parse: a body that ends mid-declaration still has to stay valid.
    const separator = /[;{]\s*$/.test(next) ? '' : ';'

    next = `${next}${separator}${property}: ${value};`
  }

  return next
}

/**
 * Complete every carrier in a stylesheet.
 *
 * Pure and idempotent: the aggregate travels in the stylesheet as staging, so a second pass
 * finds nothing staged, injects nothing, and removes nothing. That matters for hosts — a
 * PostCSS plugin and a Vite plugin can both run over the same output, and neither has to know
 * whether the other already did.
 */
export function finalize(css: string): Finalized {
  const staged = new Map<string, string>()

  for (const match of css.matchAll(rule)) {
    if (!stages(match[2])) continue

    for (const [, property, value] of match[2].matchAll(aggregate)) {
      // Later publications win, exactly as a later declaration would in the browser.
      staged.set(property, value.trim())
    }
  }

  const finalized: Finalized = { carriers: 0, css, staging: 0 }

  finalized.css = css.replace(rule, (whole, selector, body) => {
    if (stages(body)) {
      finalized.staging += 1

      return ''
    }

    if (!carries(body)) return whole

    const completed = inject(body, staged)

    // A carrier that already holds exactly this aggregate is not written again: `inject`
    // replaces declarations in place, so the second pass over a finalized stylesheet is
    // byte-identical and reports zero.
    if (completed === body) return whole

    finalized.carriers += 1

    return `${selector}{${completed}}`
  })

  return finalized
}
