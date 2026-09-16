#!/usr/bin/env node
/**
 * Probe: the escaped underscore, against Tailwind's `_`-for-space convention.
 *
 * `rangeFromSelector` ends with `value.replace(/_/g, ' ')`, and that line is deliberately **not** part of
 * the serialization cleanup: what it decodes is an author's class name, not a sheet an optimizer has been
 * through. Different failure class, different question — so it gets its own probe rather than a rewrite.
 *
 * The question, precisely: after Tailwind has parsed a candidate, what reaches Jumi for `_`, and what
 * reaches it for `\_`? And then what does the range reader do with each — apply it, refuse it, or apply the
 * wrong thing? A refusal is an acceptable answer and a wrong range is not, which is the distinction this
 * measures.
 *
 * Read the output as three facts: the spelling Tailwind emitted, the declaration that shipped, and whether
 * a range came out at all.
 */
import { compiler, finalizeCss, snapshot } from './lib/compile.mjs'

const MINIMAL = `@import 'tailwindcss' source(none);\n@plugin "../../dist/index.js";\n`

/**
 * Three spellings of one intent.
 *
 *   `_`  — Tailwind's space, which is what an author writes for `10% 20%`
 *   `\_` — an escaped underscore, which is what an author writes meaning the character itself
 *   the named range — the control, which must keep working whatever the two above do
 */
const candidates = [
  'animation-range-[10%_20%]:animate-fade-in',
  'animation-range-[10%\\_20%]:animate-fade-in',
  'animation-range-entry:animate-fade-in',
]

const instance = await compiler(MINIMAL, snapshot)
const emitted = await instance.build(candidates)
const shipped = finalizeCss(emitted).css

const lines = (css, pattern) =>
  css
    .split('\n')
    .map(line => line.trim())
    .filter(line => pattern.test(line))

const show = (text, pattern) => {
  const found = lines(text, pattern)

  console.log(`  ${found.length ? '' : '(nothing)'}`)

  for (const line of found)
    console.log(`  ${line.length > 150 ? `${line.slice(0, 150)}…` : line}`)
}

console.log(
  `\nemitted — ${candidates.length} candidates, lines naming a range:`,
)
show(emitted, /range/i)

console.log('\nshipped — what the finalizer wrote into a rule:')
show(shipped, /animation-range/)

console.log(
  '\nWhat to read: a spelling that ships `animation-range: 10% 20%` was understood; a spelling that ships\nnothing was refused — which is the safe outcome, and the one that would matter if `\\_` ever reached the\nreader as a space. A spelling that ships a *different* range than the author asked for is the failure\nthis probe exists to rule out.\n',
)
