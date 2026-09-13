#!/usr/bin/env node
/**
 * SPIKE — what does a variant actually do to Jumi's output?
 *
 * The dependency-gap inventory needs one measured thing: how much of a *stylesheet* Jumi would have
 * to emit itself. Discovery and parsing are proven ownable (3a/3b), so what is left is the
 * transformation a variant applies, and this prints it for every variant Jumi's own corpora use.
 *
 * Variants found in `css-snapshot/fixture.html`, `variant.html` and `examples/index.html`:
 *
 *   sm  not-sm  motion-safe  motion-reduce  hover  before  hover:before  *  *:odd
 *   has-[.x]  [&:is(h1)]
 *
 * Every one of them is the host's. Jumi's own `is-*`/`where-*` were removed in favour of the host's
 * arbitrary form (`[&:is(h1)]`), and its `has-*` was removed because the host's built-in is richer —
 * see principle 9 of `CONTRIBUTING.md`.
 *
 * Each variant is compiled twice, one candidate each, so the output is attributable without parsing
 * anything Jumi's finalizer would have touched: the carrier and the utility.
 *
 * Run: node scripts/spike-variants.mjs
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { arbitrary, registry, render } from './lib/variants.mjs'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const variants = [
  'hover',
  'before',
  'hover:before',
  '*',
  '*:odd',
  'sm',
  'not-sm',
  'motion-safe',
  'motion-reduce',
  '[&:is(h1)]',
  '[&:where(p)]',
  'has-[.x]',
]

const { compile } = await import('@tailwindcss/node')

const dir = mkdtempSync(path.join(here, '.variants-'))

writeFileSync(
  path.join(dir, 'entry.css'),
  `@import "tailwindcss" source(none);\n@plugin ${JSON.stringify(path.join(root, 'dist', 'index.js'))};\n`,
)

/** The at-rule chain and selector of every rule mentioning the candidate, minus the theme layer. */
const wrappers = (css, tag) => {
  const found = []

  postcss.parse(css).walkAtRules((atRule) => {
    atRule.walkRules((rule) => {
      if (rule.selector.includes(tag)) found.push(chain(rule))
    })
  })

  return found
}

const chain = (rule) => {
  const parts = []
  let parent = rule.parent

  while (parent && parent.type === 'atrule') {
    parts.unshift(`@${parent.name} ${parent.params}`)
    parent = parent.parent
  }

  return `${parts.join(' ')} ${rule.selector}`.trim()
}

/**
 * What the host wrapped a rule in: the media queries around it, and the selector with the class
 * token replaced by `&` — Jumi's form, so the prototype's render can be compared to it directly.
 * `@layer` is deliberately not part of this: layers are placement, not transformation.
 */
const wrapperOf = (css, tag) => {
  let found = null

  postcss.parse(css).walkRules((rule) => {
    const at = rule.selector.indexOf(tag)
    if (found || at === -1) return

    const media = []
    let parent = rule.parent

    while (parent && parent.type === 'atrule') {
      if (parent.name === 'media') media.unshift(parent.params)
      parent = parent.parent
    }

    // The class token starts at the first `.` that is not escaped: `has-[\.x]` contains a literal
    // dot inside the class name, and a naive lastIndexOf finds that one.
    let start = -1

    for (let index = at; index >= 0; index -= 1) {
      let slashes = 0

      for (let before = index - 1; before >= 0 && rule.selector[before] === '\\'; before -= 1) slashes += 1

      if (rule.selector[index] === '.' && slashes % 2 === 0) {
        start = index
        break
      }
    }

    found = {
      media,
      selector: start === -1
        ? rule.selector
        : `${rule.selector.slice(0, start)}&${rule.selector.slice(at + tag.length)}`,
    }
  })

  return found
}

console.log('variant transformation, measured against a prototype model\n')
console.log(`${'variant'.padEnd(16)}  ${'media'.padEnd(34)}  selector                        model`)

let matched = 0

for (const variant of variants) {
  const instance = await compile(readFileSync(path.join(dir, 'entry.css'), 'utf8'), { base: dir, onDependency() {} })
  const css = instance.build([`${variant}:animate-rotate-45`])

  const utility = wrapperOf(css, 'animate-rotate-45')
  const mine = render(variant, '&')

  // The utility is the witness: a variant re-parents the class body, so what the host emits is the
  // model's transformation applied to that class. A second witness used to be read here — the
  // `animations` carrier, on the grounds that it was the one that moved — and when the carrier left
  // userland `wrapperOf` returned null for it, which this comparison counted as a mismatch. The
  // spike then reported 0/12 and still exited 0, which is the failure mode `engineering/README.md`
  // warns about, so the count is now the exit code.
  const same = Boolean(utility)
    && JSON.stringify(utility) === JSON.stringify({ media: mine.media, selector: mine.selector })

  if (same) matched += 1

  console.log(
    `${variant.padEnd(16)}  ${(utility?.media.join(' ') ?? '(none)').slice(0, 32).padEnd(34)}  `
    + `${(utility?.selector ?? '(none)').slice(0, 30).padEnd(32)}  ${same ? 'match' : 'DIFFERS'}`,
  )

  if (!same) {
    console.log(`                  host ${JSON.stringify(utility)}`)
    console.log(`                  model ${JSON.stringify({ media: mine.media, selector: mine.selector })}`)
  }
}

console.log(`\n${matched}/${variants.length} transformations reproduced by the prototype`
  + ` (${Object.keys(registry).length} registry entries + ${arbitrary.length} arbitrary rules)`)
console.log('class escaping is not modelled: the comparison normalises the class token to `&`')

if (matched !== variants.length) process.exitCode = 1

rmSync(dir, { force: true, recursive: true })
