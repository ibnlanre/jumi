#!/usr/bin/env node
/**
 * Which symbol a position in a file belongs to.
 *
 * This exists because an audit of *semantic* rewrites should not identify its subjects by their spelling.
 * The first version did: every registry entry carried a line of source, so an entry for a regex-heavy line
 * carried that line's escaping, and transcribing it was both painful and dangerous — a miscount between two
 * and four backslashes produced an entry that classified nothing, silently, twice.
 *
 * A **symbol** is the top-level declaration a position sits inside, resolved by brace depth. It survives
 * reformatting because braces do not move, which is the property that makes a registry entry maintainable:
 * re-indent, re-wrap or rename a local and the entry still identifies the operation. Rename the *symbol* and
 * the entry should break — that is a real change of ownership, and re-reading it is warranted.
 *
 * Depth is counted over code only. Braces inside strings, template literals and comments are blanked first,
 * because this repository is full of them — CSS in template literals (`:where(.jumi-vt-…)`), JSX-ish prose,
 * and `{` in comments — and a crude counter would put the wrong symbol on a line and be believed.
 */

/** Replace everything that is not code with spaces, keeping every newline so offsets stay honest. */
export const codeOf = text => {
  const out = [...text]
  let index = 0

  const blank = (from, to) => {
    for (let at = from; at < to && at < text.length; at += 1)
      if (text[at] !== '\n') out[at] = ' '
  }

  while (index < text.length) {
    const two = text.slice(index, index + 2)

    if (two === '//') {
      const end = text.indexOf('\n', index)

      blank(index, end === -1 ? text.length : end)
      index = end === -1 ? text.length : end

      continue
    }

    if (two === '/*') {
      const end = text.indexOf('*/', index + 2)
      const stop = end === -1 ? text.length : end + 2

      blank(index, stop)
      index = stop

      continue
    }

    const quote = text[index]

    if (quote === '"' || quote === "'" || quote === '`') {
      out[index] = ' '
      index += 1

      while (index < text.length && text[index] !== quote) {
        if (text[index] === '\\') {
          blank(index, index + 2)
          index += 2

          continue
        }

        if (text[index] !== '\n') out[index] = ' '
        index += 1
      }

      if (index < text.length) {
        out[index] = ' '
        index += 1
      }

      continue
    }

    index += 1
  }

  return out.join('')
}

/**
 * The top-level declarations of a file, in source order.
 *
 * Line-anchored and depth-tracked. The first version matched a sticky pattern at every depth-0 offset, which
 * should be equivalent and was not: it reported declarations whose name did not appear at the offset it
 * claimed, which is the kind of answer that gets believed and used. A declaration keyword begins a line, so
 * reading lines is both simpler and checkable by eye.
 *
 * Depth comes from the blanked code, so a brace inside a string or a comment cannot open a block, and
 * indentation is ignored entirely — re-indenting a file does not move a symbol.
 */
export const symbolsOf = text => {
  const lines = codeOf(text).split('\n')
  const declaration =
    /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/
  const found = []
  let depth = 0

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trimStart()

    if (depth === 0) {
      const match = declaration.exec(trimmed)

      if (match) found.push({ line: index + 1, name: match[1] })
    }

    for (const char of line) {
      if (char === '{') depth += 1
      if (char === '}') depth -= 1
    }
  }

  return found
}

/**
 * The symbol a byte offset belongs to, or `'<module>'` for code outside every declaration.
 *
 * The **last** declaration that starts at or before the offset, which is what makes this the enclosing
 * symbol rather than the nearest one: a `const` inside a function body is at depth > 0 and therefore not a
 * symbol at all, so it cannot shadow the function that holds it.
 */
export const symbolAt = (text, offset) => {
  const line = text.slice(0, offset).split('\n').length
  let current = '<module>'

  for (const symbol of symbolsOf(text))
    if (symbol.line <= line) current = symbol.name
    else break

  return current
}
