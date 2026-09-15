#!/usr/bin/env node
/**
 * Can CSS build an element-local list out of independently activated utilities?
 *
 * This is the falsification pass the CTO asked for, and it is the only question whose answer would
 * remove the aggregate's cost at the root rather than shrinking it. The problem the aggregate solves
 * is not concatenation, it is *counting*:
 *
 *   the stylesheet knows N slots
 *   the element activates 1–3
 *   the element receives N animation positions, because the declaration that produces its list
 *   cannot know which of the N it should contain
 *
 * The prior conclusion — "ordinary CSS cannot concatenate independently declared animation lists" —
 * is true but was reached by reasoning, not measurement, and the language has gained primitives since
 * (`@function`, `if()`, style queries, registered list syntax). Every one of them is exercised here
 * against the same concrete requirement, and each experiment reports what it actually did rather
 * than whether it parsed.
 *
 * The requirement, stated once and used by every row:
 *
 *   three elements each carry a *different* subset of three activating utilities, and each must end
 *   up with an animation-name list containing exactly its own subset, in stylesheet order, without a
 *   selector that enumerates the combination.
 *
 * Run: pnpm spike:local-list
 *
 * RESULT — see `engineering/research/style-cost.md`. Chromium 153.0.8010.12, 2026-09-13.
 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

const results = []

/**
 * Each experiment declares its CSS and its markup, then reports what the element resolved.
 *
 * `declared` is what the *stylesheet* says, `computed` is what the element got. The gap between the
 * two is the whole subject of this file.
 */
const experiment = async (name, { css, expected, html, property }) => {
  await page.setContent(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><style>${css}</style></head>
<body>${html}</body>
</html>`)

  const measured = await page.evaluate(
    ({ expected, property }) => {
      const read = id =>
        getComputedStyle(document.getElementById(id))
          .getPropertyValue(property)
          .trim()

      return {
        all: read('all'),
        expected,
        // One element per combination, so a mechanism that works only for the single-utility case is
        // visible rather than averaged away.
        only: read('only'),
        pair: read('pair'),
        positions: [read('only'), read('pair'), read('all')].map(
          value => value.split(',').length,
        ),
      }
    },
    { expected, property },
  )

  results.push({ name, ...measured })
}

/**
 * Which of the primitives actually work in this build, measured by using each one and reading the
 * result back. `CSS.supports()` cannot answer this for at-rules, and a mechanism that silently does
 * nothing would otherwise read as a falsified hypothesis when it is really an unsupported feature.
 */
const support = await page.evaluate(async () => {
  const probe = async (css, read) => {
    const id = `probe-${Math.random().toString(36).slice(2)}`
    const style = document.createElement('style')

    style.textContent = css(id.replace(/^/, '#'))

    const element = document.createElement('div')

    element.id = id
    document.head.append(style)
    document.body.append(element)

    const value = read(element)

    element.remove()
    style.remove()

    return value
  }

  return {
    '@function': await probe(
      selector =>
        `@function --probe-color() returns <color> { result: red; } ${selector} { color: --probe-color(); }`,
      element => getComputedStyle(element).color,
    ),
    'if()': await probe(
      selector =>
        `${selector} { --q: 1; width: if(style(--q: 1): 10px; else: 20px); }`,
      element => getComputedStyle(element).width,
    ),
    'registered list syntax': await probe(
      selector =>
        `@property --probe-ident { syntax: "<custom-ident>#"; inherits: false; initial-value: none; } ${selector} { --probe-ident: a; }`,
      element => getComputedStyle(element).getPropertyValue('--probe-ident'),
    ),
    'sibling-count()': await probe(
      selector => `${selector} { --probe-n: sibling-count(); }`,
      element => getComputedStyle(element).getPropertyValue('--probe-n'),
    ),
  }
})

/* ------------------------------------------------------------------ the experiments */

/**
 * 1 — the obvious one. Three utilities, each declaring the same custom property. The cascade picks
 * one; it cannot merge them. This is the baseline the rest are variations on.
 */
await experiment('cascade: three utilities set one property', {
  css: `
    .a { --jumi-names: a; }
    .b { --jumi-names: b; }
    .c { --jumi-names: c; }
    #only, #pair, #all { animation-name: var(--jumi-names, none); }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="a b"></div><div id="all" class="a b c"></div>',
  property: 'animation-name',
})

/**
 * 2 — the space toggle, the one hack CSS authors use to insert into a list conditionally. It is
 * inserted into a *space*-separated value, so it cannot express the requirement at all (which is a
 * comma list), and where it does apply the number of positions is authored into the declaration.
 * Measured with a comma so the insertion is at least well-formed, to show the count does not move.
 */
await experiment('space toggle: a token inserted a fixed number of times', {
  css: `
    .a, .b, .c { --t: ,; }
    .a { --has-a: 1; }
    .b { --has-b: 1; }
    .c { --has-c: 1; }
    #only, #pair, #all { animation-name: a var(--t) b var(--t) c; }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="a b"></div><div id="all" class="a b c"></div>',
  property: 'animation-name',
})

/**
 * 3 — a registered list-typed custom property. It accepts a comma list, which raises the obvious
 * hope: can two rules each *contribute* an item to it? The registration changes what a value may be,
 * not what the cascade does with two of them.
 */
await experiment('registered <custom-ident>#: two rules contribute items', {
  css: `
    @property --jumi-names { syntax: "<custom-ident>#"; inherits: false; initial-value: none; }
    .a { --jumi-names: a; }
    .b { --jumi-names: b; }
    .c { --jumi-names: c; }
    #only, #pair, #all { animation-name: var(--jumi-names, none); }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="a b"></div><div id="all" class="a b c"></div>',
  property: 'animation-name',
})

/**
 * 4 — `if()`, which evaluates a condition inline at computed-value time. This is the newest thing in
 * the language that feels like it ought to help. It selects between complete values; it has no way
 * to produce a value whose *length* depends on the condition.
 */
await experiment('if(): branch on which utility is present', {
  css: `
    .a { --has-a: 1; }
    .b { --has-b: 1; }
    .c { --has-c: 1; }
    #only, #pair, #all { animation-name: if(style(--has-a: 1): a; else: none); }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="a b"></div><div id="all" class="a b c"></div>',
  property: 'animation-name',
})

/**
 * 5 — `@function`, the newest primitive of all. A custom function can take arguments and return a
 * value. The argument list at the *call site* is written in the declaration, so a function can be
 * handed a fixed number of known-or-unset variables and can select among them — which is exactly
 * what `var()` fallback already does — but it cannot be handed "however many utilities are present".
 */
await experiment('@function: build a list from arguments', {
  css: `
    @function --jumi-list(--a, --b, --c) returns <custom-ident> {
      result: var(--a, var(--b, var(--c, none)));
    }
    .a { --a-name: a; }
    .b { --b-name: b; }
    .c { --c-name: c; }
    #only, #pair, #all { animation-name: --jumi-list(var(--a-name, none), var(--b-name, none), var(--c-name, none)); }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="a b"></div><div id="all" class="a b c"></div>',
  property: 'animation-name',
})

/**
 * 6 — style queries. A container can be queried for a custom property's value, so a rule can respond
 * to which utility is present — but the container is an ancestor, because a container cannot match
 * itself, so the utilities go on a wrapper. Each responding rule declares the whole property again,
 * which reproduces the cascade problem at a higher cost: there is no way for two queries to both
 * append.
 */
await experiment('@container style(): respond to which utility is present', {
  css: `
    .a, .b, .c { container-type: style; }
    .a { --has-a: 1; }
    .b { --has-b: 1; }
    @container style(--has-a: 1) { #only, #pair, #all { animation-name: a; } }
    @container style(--has-b: 1) { #only, #pair, #all { animation-name: b; } }
  `,
  html:
    '<div class="a"><div id="only"></div></div>' +
    '<div class="a b"><div id="pair"></div></div>' +
    '<div class="a b c"><div id="all"></div></div>',
  property: 'animation-name',
})

/**
 * 7 — the control. A single declaration reading one custom property *can* produce a list of any
 * length. The list is real and it works; the only question is who writes that property, and the
 * answer cannot be the utilities, because each of them can only write a whole value.
 */
await experiment('control: one property holding a whole list', {
  css: `
    .a { --jumi-names: a; }
    .b { --jumi-names: a, b; }
    .c { --jumi-names: a, b, c; }
    #only, #pair, #all { animation-name: var(--jumi-names, none); }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="b"></div><div id="all" class="c"></div>',
  property: 'animation-name',
})

/**
 * 8 — does anything in the language *count*? `sibling-index()` gives a child its position among
 * siblings, which is the one place CSS can read a number it did not author. It counts DOM siblings;
 * there is no equivalent for "how many of these classes are set", and the element in question has no
 * siblings to count.
 */
await experiment('counting: sibling-count() as the only numeric source', {
  css: `
    .a, .b, .c { --jumi-n: sibling-count(); }
    #only, #pair, #all { animation-name: var(--jumi-n, none); }
  `,
  html: '<div id="only" class="a"></div><div id="pair" class="a b"></div><div id="all" class="a b c"></div>',
  property: 'animation-name',
})

/* ------------------------------------------------------------------ the report */

await browser.close()

console.log('primitive support')
console.log(`   ${JSON.stringify(support)}`)

console.log(
  `\n${'experiment'.padEnd(52)} ${'only'.padEnd(14)} ${'pair'.padEnd(14)} ${'all'.padEnd(14)} positions`,
)

for (const row of results) {
  const cell = value =>
    (value.length > 12 ? `${value.slice(0, 11)}…` : value).padEnd(14)

  console.log(
    `   ${row.name.padEnd(52)} ${cell(row.only)} ${cell(row.pair)} ${cell(row.all)} ${row.positions.join('/')}`,
  )
}

console.log(
  `\nA mechanism works only if the three positions counts are 1, 2 and 3 — the element's own`,
)
console.log(
  `subset. Anything that reports 1/1/1 is cascade selection; anything that reports a fixed`,
)
console.log(`count regardless of the classes is a fixed-arity declaration.`)
