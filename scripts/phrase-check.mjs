#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
/**
 * The phrase contract, as a permanent gate stage.
 *
 * Jumi's animation language says a phrase — `0:0%|100:100%` — is how one property gets its own frames.
 * A phrase is not a CSS value of any type, so Tailwind used to refuse the candidate before the matcher
 * ran, and every matcher that declares a scalar type was silently unable to take one. The fix is a second
 * handler under the same prefix that takes only phrases; this stage holds the four things that make that
 * safe, because it is now the one doorway around the host's type check:
 *
 *   1. **Two handlers may share a prefix**, and Tailwind consults them per value, in either order. The
 *      architecture rests on that, and a host upgrade could take it away — so it is measured here rather
 *      than believed (`scripts/phrase-check/probe.mjs`, which imports nothing from Jumi).
 *   2. **A scalar keeps the host's validation.** `[4rem]` reaches the typed handler; `[abc]` produces no
 *      rule at all, exactly as it would without a phrase handler present.
 *   3. **A named value reaches the typed handler**, never the phrase route — which is why Jumi's phrase
 *      handler declares no `values`.
 *   4. **Every typed tween matcher accepts a phrase.** The list is derived from the source on each run, so
 *      matcher 162 is covered the day it is written rather than the day someone updates a count.
 *
 * The false-positive direction — *only* phrases take the bypass — is a property of `isPhrase`, and is
 * pinned in `src/core/index.test.ts` against an adversarial corpus. It is not repeated here.
 *
 * Run: pnpm phrase:check
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const { build, compiler } = await import('./lib/compile.mjs')

const PROBE_DIR = path.join(here, 'phrase-check')

const probeEntry = `
@import "tailwindcss";
@plugin "./probe.mjs";
`

const jumiEntry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

const failures = []
let asserted = 0

const check = (label, condition, detail) => {
  asserted += 1
  if (!condition) failures.push(label)

  console.log(
    `  ${condition ? '✓' : '✗'} ${label}${detail === undefined ? '' : ` — ${detail}`}`,
  )
}

/** The class a selector starts with, walked rather than matched: a `]` inside a character class closes it. */
const classToken = selector => {
  if (selector[0] !== '.') return null

  for (let index = 1; index < selector.length; index += 1) {
    if (selector[index] === '\\') {
      index += 1

      continue
    }

    if ('.:#[]>+~ '.includes(selector[index])) return selector.slice(1, index)
  }

  return selector.slice(1)
}

/**
 * Every class a sheet writes a rule **with declarations** for.
 *
 * An empty rule is a refusal, not an acceptance: Tailwind writes the selector and leaves the body empty
 * when a handler declines the value. Counting rules rather than declarations reports refused candidates as
 * emitted, which is how `animate-font-family-[!]` first looked like a leak.
 */
const classRules = css => {
  const found = new Map()

  postcss.parse(css).walkRules(rule => {
    if (!rule.nodes?.length) return

    for (const selector of rule.selectors ?? []) {
      const token = classToken(selector.trim())

      if (token) found.set(token.replace(/\\(.)/g, '$1'), rule.toString())
    }
  })

  return found
}

const ownerOf = (rules, candidate) =>
  /--probe-owner: ([a-z]+)/.exec(rules.get(candidate) ?? '')?.[1] ?? null

// ── 1 · the host contract the architecture rests on ─────────────────────────────────────────────
console.log('\n· the host: two handlers, one prefix')

const PROBE_CANDIDATES = [
  'probe-a-[4rem]',
  'probe-a-[abc]',
  'probe-a-[0:0%|100:100%]',
  'probe-b-[4rem]',
  'probe-b-[abc]',
  'probe-b-[0:0%|100:100%]',
  'probe-b2-[4rem]',
  'probe-b2-[abc]',
  'probe-b2-[0:0%|100:100%]',
  'probe-c-[abc]',
  'probe-d-100',
  'probe-d-[4rem]',
  'probe-d-[abc]',
  'probe-d-[0:0%|100:100%]',
]

const probed = build(await compiler(probeEntry, PROBE_DIR), PROBE_CANDIDATES)
const probeRules = classRules(probed.css)
const owner = candidate => ownerOf(probeRules, candidate)

check(
  'a typed handler alone refuses a phrase, and accepts only its own type',
  owner('probe-a-[4rem]') === 'typed' &&
    owner('probe-a-[abc]') === null &&
    owner('probe-a-[0:0%|100:100%]') === null,
  `[4rem] → ${owner('probe-a-[4rem]')}, [abc] → ${owner('probe-a-[abc]') ?? 'no rule'}, phrase → ${owner('probe-a-[0:0%|100:100%]') ?? 'no rule'}`,
)

check(
  'a second handler beside it takes the phrase, and the typed one keeps the scalar',
  owner('probe-b-[4rem]') === 'typed' &&
    owner('probe-b-[0:0%|100:100%]') === 'phrase',
  `[4rem] → ${owner('probe-b-[4rem]')}, phrase → ${owner('probe-b-[0:0%|100:100%]')}`,
)

check(
  'and the scalar validation survives the second handler',
  owner('probe-b-[abc]') === null,
  `[abc] → ${owner('probe-b-[abc]') ?? 'no rule'}`,
)

check(
  'registration order is irrelevant, which is what makes this safe to rely on',
  ['[4rem]', '[abc]', '[0:0%|100:100%]'].every(
    value => owner(`probe-b-${value}`) === owner(`probe-b2-${value}`),
  ),
  `forward ${['[4rem]', '[abc]', '[0:0%|100:100%]'].map(value => owner(`probe-b-${value}`) ?? 'none').join(' / ')}` +
    ` · reversed ${['[4rem]', '[abc]', '[0:0%|100:100%]'].map(value => owner(`probe-b2-${value}`) ?? 'none').join(' / ')}`,
)

check(
  'an untyped handler alone would make an invalid scalar valid — the shape not in use',
  owner('probe-c-[abc]') === 'any',
  `[abc] → ${owner('probe-c-[abc]')}`,
)

check(
  'a named value goes to the typed handler, and a phrase to the phrase handler',
  owner('probe-d-100') === 'typed' &&
    owner('probe-d-[4rem]') === 'typed' &&
    owner('probe-d-[0:0%|100:100%]') === 'phrase',
  `100 → ${owner('probe-d-100')}, [4rem] → ${owner('probe-d-[4rem]')}, phrase → ${owner('probe-d-[0:0%|100:100%]')}`,
)

// ── 2 · the table, derived rather than counted ──────────────────────────────────────────────────
//
// Read out of the source so matcher 162 is covered automatically. What is asserted is the *claim* — every
// typed tween matcher accepts a phrase — and not a number, because a number would be the thing that rots.
console.log('\n· the table: every typed tween matcher')

const table = readFileSync(
  path.join(root, 'src', 'properties', 'tween.ts'),
  'utf8',
)
const TYPED = []

{
  let current = null

  for (const line of table.split('\n')) {
    const matcher = /^\s*'([a-z-]+)':\s*\{/.exec(line)

    if (matcher) current = matcher[1]

    const declared = /^\s*type:\s*(.+?),?$/.exec(line)

    if (declared && current) {
      const types = declared[1]

      if (!types.includes("'any'") && !types.includes("'*'"))
        TYPED.push([current, types])

      current = null
    }
  }
}

const swept = build(await compiler(jumiEntry, root), [
  ...TYPED.flatMap(([name]) => [
    `${name}-[0:initial|100:initial]`,
    `${name}-[abc]`,
  ]),
  // The representative strict pair, in a real spelling: a length-percentage is where phrases were first
  // found to vanish, and it is the one matcher whose invalid scalar the host refuses *and* that must take
  // a phrase. Compiled here rather than in its own build, so the assertion below reads rules this build
  // produced — the first version asserted against a candidate no build had ever compiled.
  'animate-offset-distance-[abc]',
  'animate-offset-distance-[0:0%|100:100%]',
])

const sweptRules = classRules(swept.css)
const lost = TYPED.filter(
  ([name]) => !sweptRules.has(`${name}-[0:initial|100:initial]`),
)
const loose = TYPED.filter(([name]) => sweptRules.has(`${name}-[abc]`))

/**
 * A list for a failure message: a few names, then how many more.
 *
 * Falsifying this stage — restoring the world where no phrase reaches Jumi — refuses *every* typed
 * matcher, and the first version of this message printed all 161 of them. A stage that buries its reason
 * in two hundred lines is a stage nobody reads, so the count carries the scale and the names carry the
 * shape.
 */
const sample = names =>
  `${names.slice(0, 5).join(', ')}${names.length > 5 ? `, and ${names.length - 5} more` : ''}`

check(
  'every one of them accepts a valid phrase',
  lost.length === 0,
  `${TYPED.length} matchers derived from the source, ${lost.length} refused` +
    `${lost.length ? ` (${sample(lost.map(([name]) => name))})` : ''}`,
)

// Reported, not asserted. Whether an invalid scalar is refused is Tailwind's grammar for the property, and
// Jumi preserves whatever the host does rather than claiming the matcher types are complete CSS
// validation — `animate-font-family-[abc]` is a valid family name, and `animate-width-[abc]` is accepted
// because that matcher's type list contains `any`. A count that moved would be worth a look; a matcher on
// this list is not a defect.
console.log(
  `  · accepted an invalid scalar (host grammar, not asserted): ${loose.length}` +
    `${loose.length ? ` — ${sample(loose.map(([name]) => name))}` : ''}`,
)

// The one representative that is both typed and strict: a length-percentage, which is where phrases were
// first found to vanish.
check(
  'a strict typed matcher still refuses an invalid scalar, and still takes a phrase',
  !sweptRules.has('animate-offset-distance-[abc]') &&
    sweptRules.has('animate-offset-distance-[0:0%|100:100%]'),
  `[abc] → ${sweptRules.has('animate-offset-distance-[abc]') ? 'emitted' : 'no rule'}, phrase → ${sweptRules.has('animate-offset-distance-[0:0%|100:100%]') ? 'emitted' : 'no rule'}`,
)

// ── 3 · values that merely look like a phrase ───────────────────────────────────────────────────
//
// End to end, on the real table: arbitrary values carrying colons, pipes and functions must keep the
// scalar route. This is the same doorway as above, seen from the other side — the grammar itself is pinned
// in the unit corpus.
console.log('\n· values that resemble a phrase, but are not one')

const LOOKALIKES = [
  [
    'a data URL',
    'animate-background-image-[url(data:image/png;base64,iVBORw0KGgo=)]',
  ],
  [
    'a colour function',
    'animate-background-color-[color-mix(in_srgb,red_50%,blue)]',
  ],
  ['a value with a colon and no offset', 'animate-width-[calc(1px:2px)]'],
]

const lookalikes = build(
  await compiler(jumiEntry, root),
  LOOKALIKES.map(([, candidate]) => candidate),
)
const lookalikeRules = classRules(lookalikes.css)

for (const [kind, candidate] of LOOKALIKES) {
  check(
    `${kind} keeps the scalar route`,
    lookalikeRules.has(candidate),
    candidate,
  )
}

console.log(
  `\n  ${asserted - failures.length}/${asserted} phrase-contract behaviours hold`,
)

if (failures.length) {
  console.error('\n✗ phrases and scalars do not route as the contract says:')

  for (const failure of failures) console.error(`  ${failure}`)

  console.error(
    "\n  Scalars must keep the host's validation, and only phrases take the bypass.",
  )
  process.exit(1)
}

console.log(
  '\n✓ scalars keep the host type check, phrases reach Jumi, and one shared prefix is enough',
)
