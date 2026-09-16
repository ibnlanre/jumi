#!/usr/bin/env node
/**
 * The serializations a stylesheet can arrive in, and how to tell whether a pass survived one.
 *
 * This exists because a defect proved Jumi's compiler path can feed the pass CSS in more than one
 * serialization form. `namedHoist` looked for `var(--jumi-slot-<key>-<part>, ` — a comma and a space,
 * which is how Jumi writes it — inside text that had arrived *from the sheet*. The docs pipeline had
 * already minified that text, so the link read `,(`, the search matched nothing, and seven parts kept
 * the slot-keyed address while the one link Jumi built in the same call kept its label. Two producers,
 * two spacings, one silent divergence, and only the second output was ever looked at.
 *
 * So a serialization here is a **perturbation of the text a pass is about to read**, never a style
 * preference: it is applied to the sheet before the pass sees it, which is the only place these
 * defects can hide. `as-emitted` is the control.
 *
 * What is *not* here is as important. A minifier must not be imitated beyond the whitespace that is
 * genuinely insignificant, or the harness would fail on its own damage: `animation: 1s ease` keeps its
 * spaces, because removing them changes the value. Only separators are touched, and only around the
 * characters whose surrounding whitespace the CSS grammar makes optional.
 *
 * The other two axes the audit asked for are not serializations at all — escaped custom-property names
 * and nested `var()` fallbacks are properties of the *corpus* — so they are measured off the emitted
 * sheet by {@link coverage} and reported rather than pretended.
 */
import postcss from 'postcss'

/** A perturbation of the emitted stylesheet, applied before the pass reads it. */
/**
 * Apply a replacement to the text outside quoted strings.
 *
 * A serializer that edits indiscriminately is not a serializer, it is a corruptor: doubling a space
 * inside `content: "a b"` changes the string's value, and a harness that does that fails on its own
 * damage — which teaches whoever reads it to distrust the check. These corpora happen to hold no such
 * string, and that is exactly the kind of fact that stops being true quietly.
 */
const outsideStrings = (css, run) => {
  let out = ''
  let index = 0

  while (index < css.length) {
    const quote = css[index]

    if (quote !== '"' && quote !== "'") {
      let end = index

      while (end < css.length && css[end] !== '"' && css[end] !== "'") end += 1

      out += run(css.slice(index, end))
      index = end

      continue
    }

    let end = index + 1

    while (end < css.length && css[end] !== quote) {
      if (css[end] === '\\') end += 1
      end += 1
    }

    out += css.slice(index, end + 1)
    index = end + 1
  }

  return out
}

export const serializations = [
  {
    name: 'as-emitted',
    note: 'the control: what the build emits, before anything else has seen it',
    run: css => css,
  },
  {
    name: 'minified',
    note: 'separators only — collapse runs, and drop the space around braces, semicolons and colons',
    run: css =>
      css
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};])\s*/g, '$1')
        .replace(/:\s+/g, ':')
        .replace(/,\s+/g, ',')
        .trim(),
  },
  {
    name: 'formatted',
    note: 'pretty-printed: newlines and indentation inside rules, no comma touched',
    run: css =>
      css
        .replace(/\{/g, ' {\n  ')
        .replace(/;/g, ';\n  ')
        .replace(/\s*\}/g, '\n}\n'),
  },
  {
    name: 'tight-comma',
    note: 'one perturbation only: no whitespace after any comma — which is where the bug lived',
    run: css => css.replace(/,\s+/g, ','),
  },
  {
    name: 'wide-comma',
    note: 'the other direction: a newline after every comma',
    run: css => css.replace(/,/g, ',\n  '),
  },
  {
    name: 'padded-parens',
    note: 'whitespace just inside **every** function paren — `var( …`, `:where( …` — which is legal, and which no literal can predict',
    run: css =>
      outsideStrings(css, text =>
        text.replace(/\(/g, '( ').replace(/\)/g, ' )'),
      ),
  },
]

/** Every whitespace character, anywhere in a value — the equivalence this harness compares under. */
export const canonical = value => value.replace(/\s+/g, '')

/**
 * The declarations whose meaning this harness is responsible for.
 *
 * Slot and label variables are the link layer itself; `animation` and `transition` carry the shorthand
 * that reads them; `view-transition-name` is how the view-transition pass records that it recognised a
 * staged rule at all — the marker readers' own output, and the only place a failure to read a marker
 * becomes visible in the sheet.
 */
const CARRIER =
  /^(?:--jumi-(?:slot|label)-|animation(?:-|$)|transition(?:-|$)|view-transition-)/

/**
 * A stylesheet's carrier semantics: the property, and the value with its whitespace removed.
 *
 * Removing whitespace is what makes this a *semantic* comparison and not a byte one. Two spellings of
 * one link chain differ by spacing and must compare equal — that is not the defect. A link that is
 * present in one spelling and absent in the other is, and it survives canonicalization because it is a
 * difference in the tokens rather than in the space between them.
 */
export const semantics = css => {
  const items = []

  postcss.parse(css).walkDecls(declaration => {
    if (!CARRIER.test(declaration.prop)) return

    items.push({
      canonical: canonical(declaration.value),
      prop: declaration.prop,
      raw: declaration.value,
    })
  })

  return items
}

/** One declaration as a comparable key. */
export const keyOf = item => `${item.prop}=${item.canonical}`

/**
 * How deeply `var()` calls nest inside one value.
 *
 * A count of `var(` would not do: a composition lists dozens of them one after another, so the number
 * grows with how many motions a page has rather than with how deep the fallbacks go. What this has to
 * measure is nesting — a fallback holding another `var()`, and that one holding a third — because that
 * is the shape a textual lookup has to survive.
 */
const fallbackDepth = value => {
  const stack = []
  let open = 0
  let deepest = 0

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '(') {
      const isVar = value.startsWith('var(', index - 3)

      stack.push(isVar)

      if (isVar) deepest = Math.max(deepest, (open += 1))

      continue
    }

    if (value[index] === ')' && stack.pop()) open -= 1
  }

  return deepest
}

/**
 * Whether the input exercise the two corpus-shaped axes, so a differential cannot pass by having
 * nothing to compare.
 *
 * `distinctValues` is the load-bearing one and it is here because this repository has already paid for
 * its absence: a browser differential once reported five families "identical" while every sample in
 * them was the same number, which is agreement about nothing.
 */
export const coverage = css => {
  const items = semantics(css)
  const values = items.map(item => item.canonical)
  const joined = values.join('\u0000')

  return {
    declarations: items.length,
    distinctValues: new Set(values).size,
    /** An escaped name inside a slot or label variable — the escaping axis, measured not assumed. */
    escapedNames: (css.match(/--jumi-(?:slot|label)-[^:,;{}]*\\/g) ?? [])
      .length,
    /** Deepest `var()` fallback chain in any carried value — the nesting axis. */
    fallbackDepth: Math.max(0, ...values.map(fallbackDepth)),
    /** A hoist whose own value carries a name link: the fact the minified build silently lost. */
    labelInHoist: items.some(
      item =>
        item.prop.startsWith('--jumi-slot-') &&
        item.canonical.includes('--jumi-label-'),
    ),
    labelLinks: (joined.match(/--jumi-label-/g) ?? []).length,
    /** Links to a slot's selected keyframe — what a timing phrase writes and only it writes. */
    selectionLinks: (
      joined.match(/--jumi-slot-[^,)]+-animation-name[,)]/g) ?? []
    ).length,
    /**
     * Identities the view-transition pass wrote, which is its answer to reading a marker.
     *
     * The marker readers expose nothing else: a marker they fail to read looks exactly like a rule that
     * was never staging, so the count is the only visible difference between the two.
     */
    viewTransitionNames: items.filter(item =>
      item.prop.startsWith('view-transition-name'),
    ).length,
  }
}
