/**
 * `var()` references in a CSS component value, read structurally.
 *
 * This exists because a regex over `var(...)` is the wrong shape of reader for a value that nests. The
 * audit had to be told twice, in one route, that its pattern was wrong:
 *
 *   - a pattern requiring `)` immediately after the inner name could not see
 *     `var(--a, var(--b, opacity(1)))` at all, so correct CSS was reported as two dead reads;
 *   - widening it to allow a fallback made the outer `var()` match and consume the `var(` of the hook
 *     nested inside its fallback, so 20 further correct reads were reported as dead.
 *
 * Both are the same defect: the pattern was a description of one expression's *text*, and the expressions
 * Jumi emits are nested. So the reader walks the value instead — balanced parentheses, strings stepped
 * over — and answers with every reference it reaches, whatever shape the nesting takes:
 *
 *   var(--a)
 *   var(--a, red)
 *   var(--a, var(--b))
 *   var(--a, var(--b, opacity(1)))
 *   var(--a, calc(var(--b) * 2))
 *   var(--a, url("data:image/svg+xml,<svg/>"))
 *
 * No special case per shape, and no shape that another one can hide behind.
 *
 * The invariant, which the tests hold it to: **every syntactically reachable `var()` in the value is
 * reported exactly once**, in source order. Nested references are reported as well as the reference that
 * contains them, and the array is sorted by offset, so a caller can read a reference's fallback as "the
 * next entry, when it starts where this one's fallback does".
 */

/** A character that can be part of an identifier, so `var(` is not matched inside `myvar(`. */
const IDENT = /[\w-]/

/** One level of whitespace, for finding where a fallback's first token begins. */
const SPACE = /\s/

/**
 * The index just past the string that starts at `from`.
 *
 * An escape steps over the next character, which is why `"a\"b"` ends after the `b` rather than at the
 * first quote: a CSS string's delimiters are the ones the tokenizer would see, not the ones a reader
 * scanning for a quote would.
 */
const endOfString = (value, from) => {
  const quote = value[from]
  let i = from + 1

  while (i < value.length) {
    if (value[i] === '\\') {
      i += 2
      continue
    }

    if (value[i] === quote) return i + 1

    i += 1
  }

  return value.length
}

/**
 * The index of the `)` matching the `(` at `open`, or the end of the value.
 *
 * Truncated input is answered rather than thrown on: a gate that hangs or dies on a malformed sheet is
 * worse than one that reports what it could read, and the caller is a check whose failure message is the
 * thing a person reads at that point.
 */
const matchingParen = (value, open) => {
  let depth = 0
  let i = open

  while (i < value.length) {
    const char = value[i]

    if (char === '"' || char === "'") {
      i = endOfString(value, i)
      continue
    }

    if (char === '\\') {
      i += 2
      continue
    }

    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (!depth) return i
    }

    i += 1
  }

  return value.length
}

/**
 * A `var()`'s arguments, split structurally: the custom-property name, and where its fallback begins.
 *
 * Splitting on the first comma *outside* a string or a nested function is the whole point — a fallback may
 * contain commas of its own (`url("data:image/svg+xml,<svg/>")`, `rgba(0, 0, 0, 0)`), and a reader that
 * split on text would take the first one it found.
 */
const splitArguments = (value, from, to) => {
  let i = from

  while (i < to) {
    const char = value[i]

    if (char === '"' || char === "'") {
      i = endOfString(value, i)
      continue
    }

    if (char === '(') {
      i = matchingParen(value, i) + 1
      continue
    }

    if (char === ',') {
      let next = i + 1
      while (next < to && SPACE.test(value[next])) next += 1

      return {
        fallbackStart: next < to ? next : -1,
        name: value.slice(from, i).trim(),
      }
    }

    i += 1
  }

  return { fallbackStart: -1, name: value.slice(from, to).trim() }
}

/**
 * Every `var()` reference in `value`, in source order.
 *
 * Each entry is `{ name, offset, fallbackStart }`: the custom-property name, the index of the `var`
 * keyword, and the index of the first non-space character of the fallback — or `-1` where the reference
 * has none. Because the array is sorted, a reference's fallback *begins with* a `var()` exactly when the
 * next entry's `offset` equals this one's `fallbackStart`, which is how a caller tells a direct fallback
 * from a fallback that merely contains one.
 */
export const varReferences = value => {
  const found = []
  walk(value, 0, value.length, found)

  return found.sort((one, two) => one.offset - two.offset)
}

const walk = (value, start, end, found) => {
  let i = start

  while (i < end) {
    const char = value[i]

    if (char === '"' || char === "'") {
      i = endOfString(value, i)
      continue
    }

    // A `var()` whose name is preceded by an identifier character is part of a longer identifier
    // (`myvar(`), and a `var()` inside a string was already stepped over above.
    if (
      !IDENT.test(value[i - 1] ?? '') &&
      value.slice(i, i + 4).toLowerCase() === 'var('
    ) {
      const open = i + 3
      const close = Math.min(matchingParen(value, open), end)
      const { fallbackStart, name } = splitArguments(value, open + 1, close)

      found.push({ fallbackStart, name, offset: i })

      // The fallback is a value in its own right, so it is walked. This is the recursion the regex could
      // not express: the reference that contains a reference is reported, and so is the one it contains.
      if (fallbackStart >= 0) walk(value, fallbackStart, close, found)

      i = close + 1
      continue
    }

    // Any other function — `calc(...)`, `url(...)`, `blur(...)`, a nested group — is walked too, since a
    // `var()` may be its argument. The character scan is what keeps `var()` adjacent to another function
    // (`blur(var(--a))`) from being missed.
    if (char === '(') {
      const close = Math.min(matchingParen(value, i), end)
      walk(value, i + 1, close, found)
      i = close + 1
      continue
    }

    i += 1
  }
}
