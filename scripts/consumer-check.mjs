#!/usr/bin/env node
/**
 * Consumer check — does the **packed artifact** work, rather than the tree?
 *
 * Every other stage measures the repository, and they measure it from a position a consumer is never
 * in: the working directory has the TypeScript source, every dependency, and the lockfile — so a
 * module resolves *because the file is there*, not because the manifest published it. A consumer gets
 * a tarball, and the only things they can see are `files` and `exports`.
 *
 * That gap is not hypothetical. `moduleResolution: node16` gave a CommonJS consumer four TS1479s —
 * "the referenced file is an ECMAScript module and cannot be imported with `require`" — while
 * `nodenext` reported nothing and all seventeen stages stayed green. The map named one `types` per
 * entry; tsup emitted a `.d.cts` beside every `.d.ts`; nothing referenced them. A test that imports
 * `dist/` by path cannot see it, and `nodenext` alone cannot either: it models a Node that can
 * `require` ESM, so it passes without the declarations being right.
 *
 * So this stage asks the consumer's question from the consumer's position:
 *
 *   packed      `npm pack` — `files` and `exports` decide what exists, not the working tree
 *   listed      every entry point's four published files are in the tarball, not just on disk
 *   installed   into a clean fixture, so resolution starts at the published manifest
 *   compiled    `node16` **and** `nodenext`, CommonJS and ESM consumers, both must be error-free
 *   attributed  the declarations each condition actually resolves — `.d.cts` under `require`,
 *               `.d.ts` under `import` — asked of `--traceResolution`, since "it compiled" is also
 *               what a consumer gets from a declaration file that resolves by accident
 *   executed    `require` and `import` of the root entry, and resolution of all four in both systems
 *
 * It installs from the registry, because that is what installing is. The fixture lives in
 * `scripts/tmp-consumer`, which `.gitignore` covers, and it is emptied at the start of every run: a
 * `node_modules` left from yesterday would answer yesterday's question.
 *
 * Run: pnpm consumer:check
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { ensureBundle } from './bundle.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const dir = path.join(here, 'tmp-consumer')

ensureBundle()

const failures = []

/** Run a command in the fixture and return its stdout. A non-zero exit throws with both streams. */
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: dir, encoding: 'utf8', ...options })

/** Run a command whose failure is the answer, and hand back what it said. */
const attempt = (command, args, options = {}) => {
  try {
    return { output: run(command, args, options), status: 0 }
  } catch (error) {
    return {
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
      status: error.status ?? 1,
    }
  }
}

const claim = (held, label, detail) => {
  console.log(`    ${held ? '✓' : '✗'} ${label.padEnd(14)}${detail}`)
  if (!held) failures.push(`${label}: ${detail}`)
}

const firstLines = (text, count = 3) =>
  text
    .split('\n')
    .filter(line => line.trim())
    .slice(0, count)
    .join(' · ')

const tsc = path.join(root, 'node_modules', '.bin', 'tsc')
const entryPoints = ['', '/postcss', '/vite', '/view-transition']

rmSync(dir, { force: true, recursive: true })
mkdirSync(dir, { recursive: true })

/* ------------------------------------------------------------------------------------
 * What the manifest publishes
 * ---------------------------------------------------------------------------------- */

console.log('')

run('npm', ['pack', '--pack-destination', dir, '--silent'], { cwd: root })

const tarball = path.join(
  dir,
  readdirSync(dir).find(name => name.endsWith('.tgz')),
)
const listing = run('tar', ['-tzf', tarball])

const unlisted = []
for (const entry of entryPoints) {
  const name = entry ? entry.slice(1) : 'index'
  for (const extension of ['js', 'cjs', 'd.ts', 'd.cts'])
    if (!listing.includes(`package/dist/${name}.${extension}`))
      unlisted.push(`dist/${name}.${extension}`)
}

claim(
  unlisted.length === 0,
  'packed',
  unlisted.length
    ? `absent from the tarball — ${unlisted.join(', ')}`
    : `${readdirSync(dir).find(name => name.endsWith('.tgz'))}, ` +
        `all four entry points carry a runtime and a declaration file per condition`,
)

/* ------------------------------------------------------------------------------------
 * What an install brings
 * ---------------------------------------------------------------------------------- */

writeFileSync(
  path.join(dir, 'package.json'),
  `${JSON.stringify(
    { name: 'jumi-consumer-check', private: true, type: 'commonjs' },
    null,
    2,
  )}\n`,
)

const installed = attempt('npm', [
  'install',
  '--no-audit',
  '--no-fund',
  '--prefer-offline',
  tarball,
])

if (installed.status !== 0) {
  console.error(
    `\n✗ the tarball does not install: ${firstLines(installed.output)}`,
  )
  process.exit(1)
}

const packages = readdirSync(path.join(dir, 'node_modules')).filter(
  name => !name.startsWith('.'),
)

// The editor plugin is a devDependency of this repository and nothing a consumer runs. It was a
// runtime dependency once, which put eleven packages in every install for a language-service
// plugin the manifest never loads.
claim(
  !readdirSync(path.join(dir, 'node_modules')).includes('@astrojs'),
  'install tree',
  `no editor plugin, ${packages.length} packages: ${packages.join(' ')}`,
)

/* ------------------------------------------------------------------------------------
 * The consumers, compiled the two ways a consumer can be configured
 * ---------------------------------------------------------------------------------- */

const consumerSource = `import * as root from '@ibnlanre/jumi'
import * as postcss from '@ibnlanre/jumi/postcss'
import * as vite from '@ibnlanre/jumi/vite'
import * as viewTransition from '@ibnlanre/jumi/view-transition'

export const surfaces = { postcss, root, viewTransition, vite }
`

// The extension decides the module system, so one source is both consumers: `.ts` is CommonJS in a
// package without `"type": "module"`, and `.mts` is an ES module.
writeFileSync(path.join(dir, 'cjs-consumer.ts'), consumerSource)
writeFileSync(path.join(dir, 'esm-consumer.mts'), consumerSource)
writeFileSync(
  path.join(dir, 'tsconfig.json'),
  `${JSON.stringify(
    {
      compilerOptions: {
        module: 'node16',
        moduleResolution: 'node16',
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: 'ES2022',
        types: [],
      },
      files: ['cjs-consumer.ts', 'esm-consumer.mts'],
    },
    null,
    2,
  )}\n`,
)

console.log('')

for (const mode of ['node16', 'nodenext']) {
  const compiled = attempt(tsc, [
    '-p',
    dir,
    '--module',
    mode,
    '--moduleResolution',
    mode,
  ])

  claim(
    compiled.status === 0,
    `tsc ${mode}`,
    compiled.status === 0
      ? 'the CommonJS and the ESM consumer both compile'
      : firstLines(compiled.output, 4),
  )
}

/* ------------------------------------------------------------------------------------
 * Which declaration each condition is given
 * ---------------------------------------------------------------------------------- */

// "It compiled" is also what a consumer gets when a declaration resolves by accident, so the trace
// names the file. Pairing each resolution with the block that asked for it is what makes the answer
// about the *condition* rather than about the package.
const traced = attempt(tsc, [
  '-p',
  dir,
  '--module',
  'node16',
  '--moduleResolution',
  'node16',
  '--traceResolution',
]).output

const resolved = new Map()
let asking = null

for (const line of traced.split('\n')) {
  const opening = /^======== Resolving module '(.+)' from '(.+)'/.exec(line)
  if (opening) {
    asking = `${path.basename(opening[2])}|${opening[1]}`
    continue
  }

  const closing =
    /^======== Module name '(.+)' was successfully resolved to '(.+)' with Package ID/.exec(
      line,
    )
  if (closing && asking) {
    resolved.set(asking, closing[2])
    asking = null
  }
}

const wrong = []
for (const entry of entryPoints) {
  const specifier = `@ibnlanre/jumi${entry}`
  const required = resolved.get(`cjs-consumer.ts|${specifier}`)
  const imported = resolved.get(`esm-consumer.mts|${specifier}`)

  if (!required?.endsWith('.d.cts'))
    wrong.push(`${specifier} · require → ${required ?? 'nothing'}`)
  if (!imported?.endsWith('.d.ts') || imported.endsWith('.d.cts'))
    wrong.push(`${specifier} · import → ${imported ?? 'nothing'}`)
}

claim(
  wrong.length === 0,
  'declarations',
  wrong.length
    ? wrong.join('; ')
    : 'require reaches a .d.cts and import a .d.ts, for all four entry points',
)

/* ------------------------------------------------------------------------------------
 * Execution, not resolution
 * ---------------------------------------------------------------------------------- */

console.log('')

const executed = {}
for (const [system, args] of [
  [
    'require',
    [
      '-e',
      "process.stdout.write(Object.keys(require('@ibnlanre/jumi')).sort().join(','))",
    ],
  ],
  [
    'import',
    [
      '--input-type=module',
      '-e',
      "process.stdout.write(Object.keys(await import('@ibnlanre/jumi')).sort().join(','))",
    ],
  ],
]) {
  const result = attempt('node', args)
  executed[system] = result.status === 0 ? result.output.trim().split(',') : []

  claim(
    executed[system].length > 0,
    system,
    result.status === 0
      ? `the root entry executes and exports ${executed[system].length} names`
      : firstLines(result.output),
  )
}

// Named exports are the interop promise: a CommonJS consumer and an ES module consumer of the same
// artifact must see the same names, or a package is only usable from one side of the boundary.
const absent = executed.require.filter(name => !executed.import.includes(name))
claim(
  absent.length === 0,
  'interop',
  absent.length
    ? `${absent.join(', ')} reachable by require but not by import`
    : 'every name a require reaches is reachable from import',
)

const unresolved = []
for (const entry of entryPoints) {
  const specifier = `@ibnlanre/jumi${entry}`
  const required = attempt('node', [
    '-e',
    `process.stdout.write(require.resolve('${specifier}'))`,
  ])
  const imported = attempt('node', [
    '--input-type=module',
    '-e',
    `process.stdout.write(import.meta.resolve('${specifier}'))`,
  ])

  if (required.status !== 0 || !required.output.endsWith('.cjs'))
    unresolved.push(
      `${specifier} · require → ${firstLines(required.output, 1)}`,
    )
  if (imported.status !== 0 || !imported.output.endsWith('.js'))
    unresolved.push(`${specifier} · import → ${firstLines(imported.output, 1)}`)
}

claim(
  unresolved.length === 0,
  'resolved',
  unresolved.length
    ? unresolved.join('; ')
    : 'require reaches every .cjs and import every .js, for all four entry points',
)

if (failures.length) {
  console.error('\n✗ the published artifact does not hold for a consumer:')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  '\n✓ the tarball publishes every entry point, installs without the editor plugin,',
)
console.log(
  '  gives each condition the declaration for how it loads, and runs from both sides.\n',
)
