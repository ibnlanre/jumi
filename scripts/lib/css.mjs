/**
 * CSS value helpers shared by the measurement scripts.
 *
 * Every count in these scripts has to agree on where an entry ends, and that is easy to get
 * wrong: the aggregate lists are comma-separated `var(--a, var(--b))` entries, so splitting on
 * `,` splits inside the nested fallback. `var(a, var(b))` is one entry but two commas — a
 * `split(',')` counts it as two and doubles every slot metric. The splitter lives here so the
 * scripts cannot disagree.
 *
 * The aggregate is flat, and it is *completed* before any of this runs: `finalize` copies the
 * ten lists into every carrier, so a stylesheet has one copy per carrier and they all hold the
 * same thing. Reading one is reading a single declaration — which is the point of shipping it
 * that way, and the reason there is no chain to walk any more.
 */

/**
 * The aggregate list for one longhand: one declaration, read from any carrier.
 *
 * Every carrier holds the same lists, so the last declaration in the file is the one a
 * browser resolving the last carrier would apply; which copy is read makes no difference.
 */
export function aggregateList(css, part = 'animation-name') {
  return lastDeclaration(css, `--jumi-aggregate-${part}`)
}

/** The slots the browser applies: the entries in the aggregate name list. */
export function aggregateSlots(css) {
  return splitTopLevel(aggregateList(css)).length
}

/**
 * The last value of a declaration in the file.
 *
 * The aggregate is written into every carrier and a later declaration of the same property
 * wins in the cascade, so the last one is the one a browser applies to the last carrier.
 */
export function lastDeclaration(css, property) {
  const matches = [...css.matchAll(new RegExp(`${property}\\s*:\\s*([^;]+);`, 'g'))]

  return matches.at(-1)?.[1].trim() ?? ''
}

/** Split a CSS value on its top-level commas, ignoring nested `()`, `[]` and strings. */
export function splitTopLevel(value) {
  const parts = []
  let current = ''
  let depth = 0
  let quote = ''

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (quote) {
      if (char === '\\') {
        current += char + (value[i + 1] ?? '')
        i += 1
      }
      else {
        if (char === quote) quote = ''
        current += char
      }
      continue
    }

    if (char === '"' || char === '\'') {
      quote = char
      current += char
      continue
    }

    if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    else if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }

    current += char
  }

  parts.push(current)

  return parts.map(part => part.trim()).filter(Boolean)
}
