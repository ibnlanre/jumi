#!/usr/bin/env node
/**
 * PostCSS check — does `jumi/postcss` hold, in both shapes?
 *
 * `vite:check` covers the integration Tailwind recommends; this covers the other one, and it is
 * cheap enough to run without a browser because everything it asserts is in the emitted CSS that
 * PostCSS hands back.
 *
 * Three configurations, and the third is the point:
 *
 *   composed      `postcss([jumi()])`                        — one entry replaces Tailwind's
 *   explicit      `[tailwind(), jumiFinalizer()]`            — Tailwind first, finalizer after
 *   reversed      `[jumiFinalizer(), tailwind()]`            — the finalizer listed *first*
 *
 * The finalizer runs in `OnceExit`, which is what makes the third case work: with `Once` it would
 * finalize an empty document and report success, exactly the way a Vite `post` transform did before
 * that was measured. Order-independence is a claim in the plugin's docstring, so it is asserted
 * here rather than assumed.
 *
 * Run: pnpm postcss:check
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  compositionScope,
  expectedDeclarations,
  protocolState,
} from './lib/css.mjs'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const dir = path.join(here, 'tmp-postcss')

console.log('· bundling jumi')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const tailwind = (await import('@tailwindcss/postcss')).default
const jumiModule = await import(path.join(root, 'dist', 'postcss.js'))
const { default: jumi, jumiFinalizer } = jumiModule

/* ------------------------------------------------------------------------------------
 * A fixture with every activation shape, compiled through PostCSS
 * ---------------------------------------------------------------------------------- */

mkdirSync(dir, { recursive: true })
writeFileSync(
  path.join(dir, 'index.html'),
  `
<div id="direct" class="animate-rotate-45"></div>
<div id="descendant" class="*:animate-rotate-45"><i></i></div>
<div id="pseudo" class="before:content-[''] before:animate-scale-110"></div>
<div id="applied" class="applied-motion"></div>
<div id="motionless" class="transition-duration-500"></div>
<div id="transitioning" class="transition-duration-500/background-color"></div>
`,
)

/** The bundle a stylesheet registers by path, since the fixtures are not an installed package. */
const jumiBundle = path.join(root, 'dist', 'index.js')

const registered = `@import "tailwindcss" source(none);
@plugin "${jumiBundle}";

@source "./index.html";

.applied-motion {
  @apply animate-rotate-45;
}
`

/**
 * The same file with no directive at all: `jumi()` is what registers it. Writing it as a
 * *subtraction* from the registered file keeps the two fixtures identical in every other byte,
 * which is what makes the equivalence claim about registration and nothing else.
 */
const injected = registered.replace(`@plugin "${jumiBundle}";\n`, '')

writeFileSync(path.join(dir, 'in.css'), registered)

const failures = []

/** What the protocol requires of any emitted stylesheet, whatever produced it. */
const structure = (label, css) => {
  const { animations, declarations, leaks, transitions } = protocolState(css)
  const leaked = Object.entries(leaks).filter(([, count]) => count > 0)
  const slots = (css.match(/--jumi-[\w-]+-animation-name:/g) ?? []).length
  const expected = expectedDeclarations({ animations, transitions })
  // Four ways in — the utility itself, a descendant variant, a pseudo-element variant, and the
  // rule `@apply` inlined — and one for transitions.
  const selectors = compositionScope(css, 'animations')
  const transitionSelectors = compositionScope(css, 'transitions')
  const held =
    selectors === 4 &&
    transitionSelectors === 1 &&
    declarations === expected &&
    !leaked.length

  console.log(
    `\n    ${held ? '✓' : '✗'} ${label}: ${css.length.toLocaleString()} bytes,` +
      ` ${selectors} animation + ${transitionSelectors} transition selectors,` +
      ` ${declarations} declarations written, ${slots} slots,` +
      ` ${leaked.length ? `${leaked.map(([name, count]) => `${count} ${name}`).join(', ')} left` : 'no protocol left'}`,
  )

  if (leaked.length)
    failures.push(
      `${label}: the transport reached the output — ${leaked.map(([name, count]) => `${count} ${name}`).join(', ')}`,
    )
  if (selectors !== 4)
    failures.push(
      `${label}: the animation composition covers ${selectors} selectors, expected the four activation shapes`,
    )
  if (transitionSelectors !== 1)
    failures.push(
      `${label}: the transition composition covers ${transitionSelectors} selectors, expected the one motion`,
    )
  if (declarations !== expected)
    failures.push(
      `${label}: ${declarations} declarations, expected ${expected}`,
    )
  // A global control declares a different property and names no motion, so it must stay inert: it
  // is the case that separates "activates a slot" from "mentions a Jumi variable".
  if (
    /--jumi-transition-duration: 500ms/.test(css) &&
    transitionSelectors !== 1
  ) {
    failures.push(`${label}: a global control was read as an activation`)
  }

  // The data has to be the compiled one: a slot for a scanned candidate, in every carrier.
  if (!/jumi-rotate-/.test(css))
    failures.push(
      `${label}: no slot for animate-rotate-45 — Tailwind did not run`,
    )

  return css
}

/* ------------------------------------------------------------------------------------
 * The configurations
 * ---------------------------------------------------------------------------------- */

const cases = [
  // One entry replaces Tailwind's, and it registers Jumi in the stylesheet too.
  {
    css: injected,
    label: 'postcss · composed, registering',
    plugins: () => [jumi({ plugin: jumiBundle })],
  },
  // The same stylesheet as a project that writes the directive itself.
  {
    css: registered,
    label: 'postcss · composed, explicit',
    plugins: () => [jumi({ plugin: jumiBundle })],
  },
  {
    css: registered,
    label: 'postcss · finalizer after Tailwind',
    plugins: () => [tailwind({ base: dir }), jumiFinalizer()],
  },
  {
    css: registered,
    label: 'postcss · finalizer before Tailwind',
    plugins: () => [jumiFinalizer(), tailwind({ base: dir })],
  },
  {
    css: registered,
    label: 'postcss · composed, optimize: false',
    plugins: () => [jumi({ tailwind: { optimize: false } })],
  },
]

console.log('')

const output = new Map()

for (const test of cases) {
  const result = await postcss(test.plugins()).process(test.css, {
    from: path.join(dir, 'in.css'),
  })

  output.set(test.label, result.css)
  structure(test.label, result.css)
}

/* ------------------------------------------------------------------------------------
 * The claims that are about registration rather than about the aggregate
 * ---------------------------------------------------------------------------------- */

const registered1 = output.get('postcss · composed, registering')
const explicit = output.get('postcss · composed, explicit')

// A stylesheet that is not a Tailwind entrypoint is not Jumi's to touch: no directive is added, and
// nothing about it changes.
const plain = await postcss([jumi({ plugin: jumiBundle })]).process(
  '.card { color: red; }',
  { from: path.join(dir, 'plain.css') },
)

const claims = [
  {
    actual: registered1 === explicit,
    detail:
      'the directive Jumi adds and the directive an author writes compile identically',
    label: 'equivalent',
  },
  {
    actual: !plain.css.includes('@plugin'),
    detail: 'a stylesheet that is not an entrypoint is untouched',
    label: 'untouched',
  },
]

console.log('')

for (const claim of claims) {
  console.log(
    `    ${claim.actual ? '✓' : '✗'} ${claim.label.padEnd(12)}${claim.detail}`,
  )
  if (!claim.actual)
    failures.push(`registration · ${claim.label}: ${claim.detail}`)
}

if (failures.length) {
  console.error('\n✗ the PostCSS integration does not hold:')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  "\n✓ one entry replaces Tailwind's, registration is identical whether it is written or added,",
)
console.log(
  '  the finalizer works on either side of it, and no publication reaches the stylesheet.\n',
)
