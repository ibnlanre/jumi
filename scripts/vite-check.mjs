#!/usr/bin/env node
/**
 * Vite check — does `jumi/vite` hold in the pipeline users actually run?
 *
 * Everything else drives Tailwind's `compile()` directly. This drives `@tailwindcss/vite`, in
 * both modes, because the interesting question is about *lifecycle* rather than whether CSS can be
 * finalized:
 *
 *   dev    the stylesheet is served as a JS module; is there a hook where it is still CSS?
 *   build  Tailwind optimizes before returning its CSS; does the marker survive that?
 *   incr   a candidate appears while the dev server is running; does the data reach the carrier?
 *
 * It answers them the way this investigation has twice been forced to: by asking a browser what it
 * computed, not by reading the emitted text. The structural assertions (staging removed, ten
 * declarations per carrier) are the supporting act.
 *
 * The first finding is the reason `jumiFinalizer()` declares no `enforce`, and it contradicts the
 * obvious reading of the source: Tailwind's plugins are `pre`, so `post` *sounds* like the right
 * seat — but at `post` Vite hands over the JS wrapper in dev and an empty string in build, because
 * its own CSS→JS/bundle step has already run. Probed on Vite 7 with Tailwind 4.3.3: at `pre`,
 * `normal` and `post` in dev the module is JS,JS,CSS… and only `normal` is CSS in *both* modes.
 * `post` would have looked like a working integration that silently never finalized a stylesheet.
 *
 * Run: pnpm vite:check
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { build, createServer, preview } from 'vite'

import { ensureBundle } from './bundle.mjs'
import {
  compositionRules,
  countedParts,
  expectedDeclarations,
  protocolState,
  transitionRules,
} from './lib/css.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const dir = path.join(here, 'tmp-vite')

ensureBundle()

// Both of these are CJS-interop defaults: the function sits on `default`.
const tailwind = (await import('@tailwindcss/vite')).default
const vite = await import(path.join(root, 'dist', 'vite.js'))

/** The documented entry: `plugins: [jumi()]` — it replaces `tailwindcss()`. */
const jumi = vite.default

/** The laboratory form: keep Tailwind's entry and add the finalizer after it. */
const { jumiFinalizer } = vite

// The composition has to be real, not a plugin that happens to be first in the array: if `jumi()`
// stopped including Tailwind's plugins, every other check here would still pass and every user
// would get a build with no Tailwind in it at all.
const composed = jumi().map(plugin => plugin.name)

if (
  !composed.includes('jumi') ||
  !composed.some(name => name?.includes('tailwindcss'))
) {
  console.error(
    `✗ jumi() does not compose Tailwind's plugins: ${composed.join(', ')}`,
  )
  process.exit(1)
}

console.log(`· jumi() composes: ${composed.join(', ')}`)

/* ------------------------------------------------------------------------------------
 * A fixture with every activation context, plus one that grows while the server runs.
 * ---------------------------------------------------------------------------------- */

const CONTEXTS = `
    <div id="direct" class="animate-rotate-45"></div>
    <div id="descendant" class="*:animate-rotate-45"><i></i></div>
    <div id="pseudo" class="before:content-[''] before:animate-scale-110"></div>
    <div id="applied" class="applied-motion"></div>
    <div id="bare" class="animation-duration-500"></div>
    <div id="grown" class="animation-duration-500"></div>
    <div id="transitioning" class="transition-property/background-color transition-duration-[300ms]"></div>

    <!--
      View transitions, and they are here for a reason that is not coverage for their own sake. Several
      cards with the *same* motion is the shape a CSS optimizer merges into one rule with a selector
      list — and a pass that reads one marker per rule refuses every card in the page when that happens.
      It did: the docs build handed the emitter one rule carrying six cards, and every instrument here
      passed while the feature did nothing in a browser. Measured through the real bundler rather than
      the CLI, because the CLI does not merge.
    -->
    <div id="vt-a" class="view-transition-old/vt-a:animate-fade-out view-transition-new/vt-a:animate-fade-in"></div>
    <div id="vt-b" class="view-transition-old/vt-b:animate-fade-out view-transition-new/vt-b:animate-fade-in"></div>
    <div id="vt-c" class="view-transition-old/vt-c:animate-fade-out view-transition-new/vt-c:animate-fade-in"></div>
`

/** The same shape as `behaviour:check`: the contexts are the product promise. */
const CHECKS = [
  { key: 'direct', selector: '#direct', utility: 'animate-rotate-45' },
  {
    key: 'descendant',
    selector: '#descendant > i',
    utility: 'animate-rotate-45',
  },
  {
    key: 'pseudo',
    pseudo: '::before',
    selector: '#pseudo',
    utility: 'animate-scale-110',
  },
  { key: 'applied', selector: '#applied', utility: 'animate-rotate-45' },
]

const html = classes => `<!doctype html>
<html>
  <head><script type="module" src="/main.js"></script></head>
  <body>
${classes}
  </body>
</html>
`

const stylesheet = `@import "tailwindcss" source(none);

@source "./index.html";

.applied-motion {
  @apply animate-rotate-45;
}
`

/**
 * The fixture deliberately does **not** name `@plugin "jumi"`: `jumi()` is what registers it, which
 * is the whole point of the integration owning Jumi's lifecycle. `explicit.css` is the same file
 * with the directive written by hand, and the two have to compile to the same CSS.
 */
const registered = {
  entry:
    '@import "tailwindcss" source(none);\n\n@source "./index.html";\n\n.applied-motion {\n  @apply animate-rotate-45;\n}\n',
  explicit:
    '@import "tailwindcss" source(none);\n@plugin "jumi";\n\n@source "./index.html";\n\n.applied-motion {\n  @apply animate-rotate-45;\n}\n',
}

mkdirSync(dir, { recursive: true })
writeFileSync(path.join(dir, 'index.html'), html(CONTEXTS))
writeFileSync(path.join(dir, 'main.js'), 'import "./style.css"\n')
writeFileSync(path.join(dir, 'style.css'), stylesheet)
writeFileSync(path.join(dir, 'explicit.css'), registered.explicit)

// A second, independent Tailwind entrypoint. "There is one Tailwind stylesheet" is exactly the
// assumption worth breaking: each compilation is its own registration and its own finalization.
writeFileSync(path.join(dir, 'second.css'), registered.entry)

// Not an entrypoint: no Tailwind import, so nothing about it is Jumi's to touch.
const plain = '.card {\n  color: red;\n}\n'

writeFileSync(path.join(dir, 'plain.css'), plain)

// A local package so the *default* specifier (`jumi`) resolves from inside the fixture, the way it
// does for a user who installed the package. Everything else here passes a path.
const shim = path.join(dir, 'node_modules', 'jumi')

mkdirSync(shim, { recursive: true })
writeFileSync(
  path.join(shim, 'package.json'),
  JSON.stringify({ main: 'index.cjs', name: 'jumi', version: '0.0.0' }),
)
writeFileSync(
  path.join(shim, 'index.cjs'),
  `module.exports = require(${JSON.stringify(path.join(root, 'dist', 'index.cjs'))})\n`,
)

// The fixture for the arm that registers nothing: Jumi's directive, written by hand, as a project
// that prefers the two-entry shape would write it.
const explicitDir = path.join(dir, 'explicit')

mkdirSync(explicitDir, { recursive: true })
writeFileSync(path.join(explicitDir, 'index.html'), html(CONTEXTS))
writeFileSync(path.join(explicitDir, 'main.js'), 'import "./style.css"\n')
writeFileSync(
  path.join(explicitDir, 'style.css'),
  `@import "tailwindcss" source(none);

@source "./index.html";
@plugin "${path.join(root, 'dist', 'index.js')}";

.applied-motion {
  @apply animate-rotate-45;
}
`,
)

/* ------------------------------------------------------------------------------------
 * Reading the answer out of a browser
 * ---------------------------------------------------------------------------------- */

const slotReader = css => utility => {
  const escaped = utility.replace(
    /[[\]()/.:%'\\]/g,
    character => `\\${character}`,
  )

  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!match[1].includes(escaped)) continue

    const name = /--jumi-[\w-]+-animation-name:\s*([\w-]+);/.exec(match[2])?.[1]

    if (name) return name
  }

  return null
}

const measure = (page, check) =>
  page.evaluate(
    ({ pseudo, selector }) => {
      const element = document.querySelector(selector)

      return element
        ? getComputedStyle(element, pseudo).animationName
        : '(absent)'
    },
    { pseudo: check.pseudo ?? null, selector: check.selector },
  )

const resolving = name =>
  name
    .split(',')
    .map(part => part.trim())
    .filter(part => part !== 'none')

/**
 * The transition a browser applies to the element.
 *
 * `transition-property` is the composed shorthand resolved, so it is the one reading that says both
 * things at once: that the list reached this element, and which motions it lists. Nothing about the
 * AST is consulted, which is the point of asking a browser.
 */
const transitioning = (page, selector = '#transitioning') =>
  page.evaluate(selector => {
    const element = document.querySelector(selector)

    return element ? getComputedStyle(element).transitionProperty : '(absent)'
  }, selector)

const browser = await chromium.launch()
const failures = []

/** Ask the matrix of a live page, and report a row per context. */
const matrix = async (label, url, slots) => {
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'load' })

  // The styles arrive with the JS module, so the first paint can precede them.
  await page
    .waitForFunction(
      selector =>
        getComputedStyle(
          document.querySelector(selector),
        ).animationName.includes('jumi-'),
      '#direct',
      { timeout: 15_000 },
    )
    .catch(() => {})

  const rows = []

  for (const check of CHECKS) {
    const measured = await measure(page, check)
    const expected = slots(check.utility)
    const pass = expected !== null && measured.includes(expected)

    rows.push({ check, measured: resolving(measured), pass })

    if (!pass) {
      failures.push(
        `${label} · ${check.key}: "${measured.slice(0, 40)}" does not include ${expected ?? '(no slot in the CSS)'}`,
      )
    }
  }

  const bare = await measure(page, { selector: '#bare' })

  if (resolving(bare).length)
    failures.push(`${label} · bare carrier resolved "${bare.slice(0, 40)}"`)

  console.log(`\n  ${label}\n`)
  for (const { check, measured, pass } of rows) {
    console.log(
      `    ${pass ? '✓' : '✗'} ${check.key.padEnd(12)}${measured.join(' + ') || 'none'}`,
    )
  }
  console.log(
    `    ${resolving(bare).length ? '✗' : '✓'} bare carrier    ${resolving(bare).join(' + ') || 'nones only'}`,
  )

  return page
}

/** The identities the view-transition fixture carries, one per card. */
const VIEW_TRANSITIONS = ['vt-a', 'vt-b', 'vt-c']

/** What the protocol requires of any emitted stylesheet, whatever produced it. */
const structure = (label, css) => {
  const { animations, declarations, leaks, transitions } = protocolState(css)
  const leaked = Object.entries(leaks).filter(([, count]) => count > 0)
  const expected = expectedDeclarations({ animations, transitions })

  console.log(
    `\n    ${!leaked.length && animations ? '✓' : '✗'} ${label}: ${css.length.toLocaleString()} bytes,` +
      ` ${animations} + ${transitions} compositions, ${declarations} declarations written,` +
      ` ${leaked.length ? `${leaked.map(([name, count]) => `${count} ${name}`).join(', ')} left` : 'no protocol left'}`,
  )

  if (leaked.length)
    failures.push(
      `${label}: the transport reached the output — ${leaked.map(([name, count]) => `${count} ${name}`).join(', ')}`,
    )
  if (!animations) failures.push(`${label}: no composition reached the output`)
  if (declarations !== expected) {
    // Say which properties each composition declared, and which the counter saw. The totals alone cannot
    // distinguish "a longhand is missing" from "an extra rule was counted", and those need opposite fixes.
    const declared = [...compositionRules(css), ...transitionRules(css)]
      .map(rule =>
        (rule.nodes ?? [])
          .filter(
            node =>
              node.type === 'decl' && /^(animation|transition)/.test(node.prop),
          )
          .map(node => node.prop)
          .join('+'),
      )
      .join(' | ')
    const counted = countedParts(css)

    failures.push(
      `${label}: ${declarations} declarations for ${animations} + ${transitions} compositions, expected ${expected}` +
        ` — declared: ${declared}` +
        ` — counted: ${counted.join('+')}`,
    )
  }

  /**
   * View transitions, asserted here so every build shape gets them rather than one dedicated arm.
   *
   * The three cards declare the *same* motion deliberately: that is what a CSS optimizer merges into a
   * single rule with a selector list, and a pass that reads one marker per rule refuses all three while
   * reporting each politely — a bug that read like an authoring mistake, passed every instrument in this
   * repository, and left the feature doing nothing in a browser. Through the bundler and not the CLI,
   * because the CLI does not merge.
   */
  const named = VIEW_TRANSITIONS.filter(id =>
    new RegExp(`view-transition-name:\\s*${id}\\b`).test(css),
  )
  const animated = VIEW_TRANSITIONS.filter(id =>
    css.includes(`::view-transition-old(${id})`),
  )

  console.log(
    `    ${named.length === VIEW_TRANSITIONS.length && animated.length === VIEW_TRANSITIONS.length ? '✓' : '✗'}` +
      ` ${label}: view transitions ${named.length}/${VIEW_TRANSITIONS.length} named,` +
      ` ${animated.length}/${VIEW_TRANSITIONS.length} animated,` +
      ` ${css.includes('jumi-vt-') ? 'staging LEFT' : 'no staging'}`,
  )

  if (named.length !== VIEW_TRANSITIONS.length) {
    failures.push(
      `${label}: ${named.length} of ${VIEW_TRANSITIONS.length} view-transition identities reached the output`,
    )
  }

  if (animated.length !== VIEW_TRANSITIONS.length) {
    failures.push(
      `${label}: ${animated.length} of ${VIEW_TRANSITIONS.length} view-transition sides reached the output`,
    )
  }

  if (css.includes('jumi-vt-'))
    failures.push(`${label}: view-transition staging reached the output`)

  return css
}

/* ------------------------------------------------------------------------------------
 * dev — the served stylesheet, and a candidate that arrives while it is running
 * ---------------------------------------------------------------------------------- */

const server = await createServer({
  configFile: false,
  logLevel: 'silent',
  plugins: jumi(),
  root: dir,
  server: { port: 0 },
})

await server.listen()

const devUrl = server.resolvedUrls.local[0]

console.log(`\n· dev server on ${devUrl}`)

// `?direct` is the stylesheet rather than the JS module that wraps it — the same CSS the browser
// receives, which is what makes the slot expectation come from the artifact and not from a fixture.
const { code: devCss } = await server.transformRequest('/style.css?direct')

structure('dev', devCss)

const slots = slotReader(devCss)
const page = await matrix('dev · matrix', devUrl, slots)

// The transitions carrier's obligation, read the way a user would see it: one motion resolves on
// the element before anything changes.
const transitionsBefore = await transitioning(page)

console.log(
  `\n    ${transitionsBefore.includes('background-color') ? '✓' : '✗'} transitions: the composed shorthand reaches the element — ${transitionsBefore}`,
)

if (!transitionsBefore.includes('background-color')) {
  failures.push(
    `dev · transitions: "${transitionsBefore}" does not include background-color`,
  )
}

// A candidate appears while the server is running: this is the path where Tailwind's cache and
// Jumi's staging both have to produce a *new* aggregate, and the only proof is the computed value.
// Both carriers grow at once, because a slot and a motion are the same class of state.
const grownClasses = CONTEXTS.replace(
  'id="grown" class="animation-duration-500"',
  'id="grown" class="animate-shake"',
).replace(
  'transition-property/background-color transition-duration',
  'transition-property/background-color transition-property/scale transition-duration',
)

writeFileSync(path.join(dir, 'index.html'), html(grownClasses))

const grown = await page
  .waitForFunction(
    selector =>
      getComputedStyle(document.querySelector(selector)).animationName.includes(
        'jumi-shake',
      ),
    '#grown',
    { polling: 500, timeout: 20_000 },
  )
  .then(() => true)
  .catch(() => false)

console.log(
  `\n    ${grown ? '✓' : '✗'} incremental: a slot added while the server ran`,
)

if (!grown)
  failures.push(
    'dev · incremental: animate-shake never reached the carrier after the source changed',
  )

// The same acceptance for the second carrier. `scale` was not on the page when `transitions` was
// first compiled, so this is the case where the carrier's own body would have been reused stale.
const transitionsAfter = await transitioning(page)
const both = ['background-color', 'scale'].every(property =>
  transitionsAfter.includes(property),
)

console.log(
  `    ${both ? '✓' : '✗'} incremental: a motion added while the server ran — ${transitionsAfter}`,
)

if (!both)
  failures.push(
    `dev · transitions: "${transitionsAfter}" never gained scale after the source changed`,
  )

const { code: grownCss } = await server.transformRequest('/style.css?direct')

structure('dev · after the edit', grownCss)

if (!grownCss.includes('--jumi-scale-transition-property')) {
  failures.push(
    'dev · transitions: the composed list still omits the new motion after the edit',
  )
}

await page.close()

/* ------------------------------------------------------------------------------------
 * registration — the phases, and the stylesheets they must not touch
 * ---------------------------------------------------------------------------------- */

/**
 * Registration, in dev: the entrypoint compiled Jumi, a *second* entrypoint compiled Jumi without
 * being told to, and a stylesheet that is not an entrypoint was left alone.
 *
 * The two setups are compared for byte-equality in build mode instead, not here. A dev server has
 * history — `style.css` has been compiled and recompiled while `explicit.css` has not — and
 * Tailwind's `@property` registrations come out in that history's order, so the same bytes are not
 * what dev produces. Asserting equality through that would be asserting nothing.
 */
const devOf = async path2 => (await server.transformRequest(path2)).code

const injected = await devOf('/style.css?direct')
const second = await devOf('/second.css?direct')
const untouched = await devOf('/plain.css?direct')

console.log('\n  registration\n')

const registration = [
  {
    actual: injected.includes('jumi-rotate-'),
    detail: 'the entrypoint compiled Jumi',
    label: 'entrypoint',
  },
  {
    actual: second.includes('jumi-rotate-'),
    detail: 'a second entrypoint compiled Jumi on its own',
    label: 'second',
  },
  {
    actual: untouched.includes('color: red'),
    detail: 'a stylesheet that is not an entrypoint is untouched',
    label: 'untouched',
  },
]

for (const check of registration) {
  console.log(
    `    ${check.actual ? '✓' : '✗'} ${check.label.padEnd(12)}${check.detail}`,
  )
  if (!check.actual)
    failures.push(`registration · ${check.label}: ${check.detail}`)
}

// The second entrypoint is a whole compilation of its own: same invariant as the first, asserted
// separately because that is the assumption being tested.
structure('dev · second entrypoint', second)

await server.close()

/* ------------------------------------------------------------------------------------
 * build — with and without Tailwind's optimizer
 * ---------------------------------------------------------------------------------- */

const builds = [
  {
    label: 'build · optimize',
    out: 'dist-optimized',
    plugins: () => jumi(),
    root: dir,
  },
  {
    label: 'build · optimize: false',
    out: 'dist-plain',
    plugins: () => jumi({ tailwind: { optimize: false } }),
    root: dir,
  },
  // The laboratory shape: Tailwind's entry plus the finalizer, with the directive written by hand.
  // It needs its own fixture, because this arm registers nothing — which is the distinction being
  // kept alive: `jumi()` owns registration, `jumiFinalizer()` assumes somebody else did it.
  {
    label: 'build · two entries',
    out: 'dist',
    plugins: () => [tailwind(), jumiFinalizer()],
    root: explicitDir,
  },
]

// Both fixtures scan the same HTML, including the candidate the incremental step added, so the two
// builds are the same compilation and their output can be compared byte for byte.
writeFileSync(path.join(explicitDir, 'index.html'), html(grownClasses))

const previews = []

for (const step of builds) {
  const outDir = path.join(step.root, step.out)

  await build({
    build: { emptyOutDir: true, outDir },
    configFile: false,
    logLevel: 'silent',
    plugins: step.plugins(),
    root: step.root,
  })

  const assets = path.join(outDir, 'assets')
  const cssFile = readdirSync(assets).find(file => file.endsWith('.css'))
  const css = structure(
    step.label,
    readFileSync(path.join(assets, cssFile), 'utf8'),
  )

  const instance = await preview({
    build: { outDir },
    configFile: false,
    logLevel: 'silent',
    preview: { port: 0 },
    root: step.root,
  })

  previews.push(instance)

  const url = instance.resolvedUrls.local[0]
  const built = await matrix(`${step.label} · matrix`, url, slotReader(css))

  await built.close()
}

/* ------------------------------------------------------------------------------------
 * equivalence — the one-step setup and the two-entry setup are the same build
 * ---------------------------------------------------------------------------------- */

/** Where two stylesheets diverge, so a failure says what it is instead of "not equal". */
const difference = (a, b) => {
  let at = 0

  while (at < Math.min(a.length, b.length) && a[at] === b[at]) at += 1

  return (
    ` (${a.length} vs ${b.length} bytes; from byte ${at}: ` +
    `${JSON.stringify(a.slice(at, at + 60))} vs ${JSON.stringify(b.slice(at, at + 60))})`
  )
}

const assetOf = outDir => {
  const assets = path.join(outDir, 'assets')

  return readFileSync(
    path.join(
      assets,
      readdirSync(assets).find(file => file.endsWith('.css')),
    ),
    'utf8',
  )
}

/** Both built from the same fixture, fresh, with the directive added by Jumi in one and written by
 * hand in the other. Byte-equality here is the migration guarantee: an existing project can keep
 * `@plugin "jumi"` and see no change, and a new one can stop writing it and see none either. */
const oneStep = assetOf(path.join(dir, 'dist-optimized'))
const twoEntries = assetOf(path.join(explicitDir, 'dist'))
const equivalent = oneStep === twoEntries

console.log(`\n  equivalence\n`)
console.log(
  `    ${equivalent ? '✓' : '✗'} the same CSS from injected and hand-written registration` +
    (equivalent ? '' : difference(oneStep, twoEntries)),
)

if (!equivalent)
  failures.push(
    `equivalence: injected and hand-written registration disagree${difference(oneStep, twoEntries)}`,
  )

await browser.close()

for (const instance of previews) await instance.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

if (failures.length) {
  console.error('\n✗ the Vite integration does not hold:')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  '\n✓ the matrix holds in dev and in every build shape, staging never ships, and a slot',
)
console.log('  added while the dev server runs reaches the carrier.\n')
