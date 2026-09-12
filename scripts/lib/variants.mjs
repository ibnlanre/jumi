/**
 * A declarative variant model — a prototype to size the work, not production code.
 *
 * The question it answers: can Jumi describe the variants it actually needs with a small registry,
 * or does parity immediately drag it into Tailwind-scale complexity?
 *
 * The shape is deliberately one thing: **a variant is a list of steps, and a step is a media query
 * or a selector transform.** Composition is `&` substitution, left to right. Nothing else is
 * needed for the corpus, and the spike verifies the rendered result against what Tailwind emits.
 */

/** The variants Jumi's own corpora use. Ten entries, one per variant. */
export const registry = {
  '*': [{ selector: ':is(& > *)' }],
  'before': [{ selector: '&::before' }],
  'has-[…]': [{ selector: '&:has(:is(…))' }],
  'hover': [{ media: '(hover: hover)' }, { selector: '&:hover' }],
  'motion-reduce': [{ media: '(prefers-reduced-motion: reduce)' }],
  'motion-safe': [{ media: '(prefers-reduced-motion: no-preference)' }],
  'not-sm': [{ media: 'not (width >= 40rem)' }],
  'odd': [{ selector: '&:nth-child(odd)' }],
  'sm': [{ media: '(width >= 40rem)' }],
}

/**
 * `has-[.x]` carries its argument, and `[&:is(h1)]` is the host's arbitrary form, so both are a
 * rule rather than an entry.
 *
 * `has-` is the host's variant: one whose argument is a simple selector is wrapped
 * (`has-[.x]` -> `&:has(:is(.x))`), and one that is already complex is only respaced
 * (`has-[>button]` -> `&:has( > button)`). The second is a formatting detail of the host's variant
 * rather than a different shape, which is why the verified set uses the simple one.
 *
 * An arbitrary variant is the user's own selector applied verbatim, which is what replaced Jumi's
 * `is-*` and `where-*`. Nothing here is Jumi's: the variant surface is entirely the host's, and
 * that is the point of principle 9.
 */
export const arbitrary = [
  { match: /^has-\[(.+)\]$/, selector: argument => `&:has(:is(${argument.replace(/_/g, ' ')}))` },
  { match: /^\[(.+)\]$/, selector: argument => argument.replace(/_/g, ' ') },
]

/**
 * Split a variant list on `:` **outside brackets**.
 *
 * An arbitrary variant is the user's whole selector, so it contains its own colons:
 * `[&:is(h1)]:animate-fade-in` is one variant, not two. The candidate parser has the same rule,
 * which is a hint about where this shape keeps coming from: brackets are opaque at every layer.
 */
const segments = (variant) => {
  const found = []
  let current = ''
  let depth = 0

  for (const character of variant) {
    if (character === '[' || character === '(') depth += 1
    else if (character === ']' || character === ')') depth -= 1

    if (character === ':' && depth === 0) {
      found.push(current)
      current = ''
      continue
    }

    current += character
  }

  found.push(current)

  return found
}

/**
 * Expand a colon-separated variant list into steps.
 *
 * Opaque to everything else: a prefix the model does not know throws, because the whole point is
 * that its coverage is visible rather than assumed.
 */
export const steps = (variant) => {
  const found = []

  for (const name of segments(variant)) {
    const known = registry[name]

    if (known) {
      found.push(...known)
      continue
    }

    const rule = arbitrary.find(candidate => candidate.match.test(name))

    if (rule) {
      found.push({ selector: rule.selector(name.match(rule.match)[1].replace(/_/g, ' ')) })
      continue
    }

    throw new Error(`unknown variant: ${name}`)
  }

  return found
}

/** Render the steps around a class selector: media queries outward, selector transforms inward. */
export const render = (variant, base) => {
  const applied = steps(variant)
  const media = applied.filter(step => step.media).map(step => step.media)
  const selector = applied
    .filter(step => step.selector)
    .reduce((current, step) => step.selector.replace(/&/g, current), base)

  return { media, selector }
}
