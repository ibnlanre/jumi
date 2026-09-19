#!/usr/bin/env node
/**
 * Consumer check — does the **packed artifact** work, rather than the tree?
 *
 * Every other stage measures the repository, and they measure it from a position a consumer is never
 * in: the working directory has the TypeScript source, every dependency, and the lockfile — so a
 * module resolves *because the file is there*, not because the manifest published it. A consumer gets
 * a tarball, and the only things they can see are `files` and `exports`.
 *
 * That gap is not hypothetical, and neither half of it is.
 *
 *   moduleResolution: node16   a CommonJS consumer got four TS1479s — "the referenced file is an
 *                              ECMAScript module and cannot be imported with `require`" — because the
 *                              export map named one `types` per entry, so the `.d.cts` files that
 *                              shipped were never referenced. `nodenext` reported nothing: it models a
 *                              Node that can `require` ESM.
 *   skipLibCheck: true         the first version of this stage passed while the published
 *                              `postcss.d.cts` could not resolve a name at all (`TS2305`, the
 *                              dependency's require-side declaration is an `export =`) and
 *                              `vite.d.cts` imported two ES modules from a CommonJS declaration. The
 *                              skip hides errors *in the declarations under test* — which is the whole
 *                              surface a consumer's first compile touches.
 *   a fixture inside the repo  a directory under `scripts/` resolves the repository's own
 *                              `node_modules` by walking up, so absent optional peers were found
 *                              anyway and an arm could type-check an integration against packages its
 *                              install had never provided.
 *
 * So this stage asks the consumer's question from the consumer's position:
 *
 *   packed      `npm pack` — `files` and `exports` decide what exists, not the working tree
 *   listed      every entry point's four published files are in the tarball, not just on disk
 *   size        a packed ceiling, which catches embedded source coming back without freezing bytes
 *   armed       one **isolated** arm per integration, each in its own directory under the system
 *               temporary directory with only that integration's peers — and a plugin-only arm that
 *               must not be able to see them, asserted rather than assumed
 *   compiled    `node16` **and** `nodenext`, CommonJS and ESM consumers, with declaration checking on
 *   attributed  the declarations each condition actually resolves — `.d.cts` under `require`,
 *               `.d.ts` under `import` — asked of `--traceResolution`, since "it compiled" is also
 *               what a consumer gets from a declaration file that resolves by accident
 *   executed    `require` and `import` of each arm's entries, and resolution of each in both systems
 *   mapped      every shipped file's map is published, parses, keeps its mappings and carries no
 *               embedded source — and a failure inside the installed package resolves to a `src/*.ts`
 *               position, which is the one thing the maps are for (ruled B, 2026-09-19)
 *
 * It installs from the registry, because that is what installing is. Each arm's fixture is emptied at
 * the start of every run: a `node_modules` left from yesterday would answer yesterday's question.
 *
 * Run: pnpm consumer:check
 */
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

import { ensureBundle } from './bundle.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

ensureBundle()

const failures = []

/** Run a command and return its stdout. A non-zero exit throws with both streams attached. */
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, encoding: 'utf8', ...options })

/** Run a command whose failure is the answer, and hand back what it said. */
const attempt = (command, args, options) => {
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

/**
 * A ceiling, not the measured size. The maps with their embedded source were 1,070,498 bytes packed;
 * with the mappings alone they are ~388,000. Freezing that number would churn with every feature Jumi
 * grows, so the claim is about the shape: the mappings cannot get near the old figure, so anything
 * approaching it means `sourcesContent` came back.
 */
const packedCeiling = 600_000

/**
 * One arm per integration, plus the plugin on its own.
 *
 * The arms exist because the peers differ: `@tailwindcss/postcss` and the `vite` pair are optional, so
 * a consumer who imports one integration has it and a consumer who imports another does not. Each arm
 * installs only its own, and asserts the others are *absent* — the isolation claim, which is what the
 * first version of this stage could not make while its fixture sat inside the repository.
 */
const arms = [
  { entries: ['', '/view-transition'], label: 'plugin only', peers: [] },
  {
    entries: ['/postcss'],
    label: 'PostCSS integration',
    peers: ['@tailwindcss/postcss'],
  },
  {
    compilerOptions: { lib: ['ESNext'], types: ['node'] },
    entries: ['/vite'],
    label: 'Vite integration',
    // `@types/node` is not a convenience here. Vite's own declarations import `node:http` and expect the
    // `node` types, and Rolldown's want a modern `lib` — so a consumer of this integration has both. An arm
    // that provisioned only the package would report Vite's environment requirements as Jumi's defects.
    peers: ['vite', '@tailwindcss/vite', '@types/node'],
  },
]

const identifier = entry =>
  entry
    ? entry.slice(1).replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
    : 'root'

const fixture = label =>
  path.join(tmpdir(), `jumi-consumer-${label.replace(/\s+/g, '-')}`)

/* ------------------------------------------------------------------------------------
 * What the manifest publishes
 * ---------------------------------------------------------------------------------- */

console.log('')

const packDir = path.join(tmpdir(), 'jumi-consumer-pack')
rmSync(packDir, { force: true, recursive: true })
mkdirSync(packDir, { recursive: true })

run('npm', ['pack', '--pack-destination', packDir, '--silent'], { cwd: root })

const tarball = path.join(
  packDir,
  readdirSync(packDir).find(name => name.endsWith('.tgz')),
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
    : `${path.basename(tarball)}, all four entry points carry a runtime and a declaration file per condition`,
)

const packedBytes = statSync(tarball).size

claim(
  packedBytes < packedCeiling,
  'size',
  `${packedBytes.toLocaleString()} bytes packed, ceiling ${packedCeiling.toLocaleString()}`,
)

/* ------------------------------------------------------------------------------------
 * One isolated install per arm, and what each of them compiles and runs
 * ---------------------------------------------------------------------------------- */

for (const arm of arms) {
  const dir = fixture(arm.label)
  arm.dir = dir

  rmSync(dir, { force: true, recursive: true })
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    path.join(dir, 'package.json'),
    `${JSON.stringify(
      {
        name: path.basename(dir),
        private: true,
        type: 'commonjs',
      },
      null,
      2,
    )}\n`,
  )

  const installed = attempt(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--prefer-offline',
      tarball,
      ...arm.peers,
    ],
    { cwd: dir },
  )

  if (installed.status !== 0) {
    console.error(
      `\n✗ ${arm.label}: the tarball does not install: ${firstLines(installed.output)}`,
    )
    process.exit(1)
  }

  const packages = readdirSync(path.join(dir, 'node_modules')).filter(
    name => !name.startsWith('.'),
  )

  console.log(
    `\n    ${arm.label} · ${packages.length} packages` +
      `${arm.peers.length ? ` · ${arm.peers.join(', ')}` : ' · no integration peers'}`,
  )

  claim(
    !packages.includes('@astrojs'),
    'install tree',
    `no editor plugin, ${packages.length} packages`,
  )

  // Isolation is a claim, not a property of the address. Every peer this arm did not install has to be
  // unresolvable here, or the arm is borrowing the repository's dependencies rather than standing alone.
  const foreign = arms
    .flatMap(other => other.peers)
    .filter(peer => !arm.peers.includes(peer))
  const borrowed = []
  for (const peer of foreign) {
    // The probe answers rather than throws: an absent module is the expected answer here, and letting
    // Node print its `MODULE_NOT_FOUND` stack would bury the claims it is evidence for.
    const resolved = attempt(
      'node',
      [
        '-e',
        `try { process.stdout.write(require.resolve('${peer}')) } catch {}`,
      ],
      { cwd: dir },
    )

    if (resolved.output.trim()) borrowed.push(`${peer} → ${resolved.output}`)
  }

  claim(
    borrowed.length === 0,
    'isolated',
    borrowed.length
      ? `resolved from outside this install: ${borrowed.join(', ')}`
      : `${foreign.join(', ')} do not resolve from this install`,
  )

  const consumerSource = `${arm.entries
    .map(
      entry => `import * as ${identifier(entry)} from '@ibnlanre/jumi${entry}'`,
    )
    .join('\n')}

export const surfaces = { ${arm.entries.map(identifier).join(', ')} }
${
  arm.entries.includes('/view-transition')
    ? `
import { createViewTransition, type ViewTransitionOutcome } from '@ibnlanre/jumi/view-transition'
const controller = createViewTransition({ concurrency: 'auto' })
const open = controller.wrap((value: boolean) => value, { onDecline(reason) { const text: string = reason } })
const result: Promise<ViewTransitionOutcome> = open(true)
// @ts-expect-error argument types survive wrapping
open('true')
// @ts-expect-error async operations are not accepted
controller.wrap(async () => {})
// @ts-expect-error lifecycle belongs to the operation
createViewTransition({ onTransitionStart() {} })
const once: Promise<ViewTransitionOutcome> = controller.run(() => {}, { concurrency: 'supersede' })
// @ts-expect-error one-off updates must also be synchronous
controller.run(async () => {})
// @ts-expect-error the standalone runtime helper is no longer public
import { runViewTransition } from '@ibnlanre/jumi/view-transition'
`
    : ''
}
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
          // On purpose, and it is the point of this stage rather than a detail: with
          // `skipLibCheck: true` the published `postcss.d.cts` resolved no `PluginOptions` at all and
          // `vite.d.cts` imported two ES modules from a CommonJS declaration, and every claim here
          // stayed green. The skip hides errors *in the declarations being tested*.
          skipLibCheck: false,
          strict: true,
          target: 'ES2022',
          types: [],
          ...arm.compilerOptions,
        },
        files: ['cjs-consumer.ts', 'esm-consumer.mts'],
      },
      null,
      2,
    )}\n`,
  )

  for (const mode of ['node16', 'nodenext']) {
    const compiled = attempt(
      tsc,
      ['-p', dir, '--module', mode, '--moduleResolution', mode],
      { cwd: dir },
    )

    claim(
      compiled.status === 0,
      `tsc ${mode}`,
      compiled.status === 0
        ? `the CommonJS and the ESM consumer compile, declarations checked`
        : firstLines(compiled.output, 4),
    )
  }

  // "It compiled" is also what a consumer gets when a declaration resolves by accident, so the trace
  // names the file. Pairing each resolution with the block that asked for it is what makes the answer
  // about the *condition* rather than about the package.
  const traced = attempt(
    tsc,
    [
      '-p',
      dir,
      '--module',
      'node16',
      '--moduleResolution',
      'node16',
      '--traceResolution',
    ],
    { cwd: dir },
  ).output

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
  for (const entry of arm.entries) {
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
      : `require reaches a .d.cts and import a .d.ts, for ${arm.entries.length} entry point${arm.entries.length === 1 ? '' : 's'}`,
  )

  // Execution, not resolution: the entry has to load from both sides of the boundary, which for the
  // integrations means the optional peer is genuinely present and genuinely loadable.
  const execute = (specifier, system) =>
    system === 'require'
      ? attempt(
          'node',
          [
            '-e',
            `process.stdout.write(Object.keys(require('${specifier}')).sort().join(','))`,
          ],
          { cwd: dir },
        )
      : attempt(
          'node',
          [
            '--input-type=module',
            '-e',
            `process.stdout.write(Object.keys(await import('${specifier}')).sort().join(','))`,
          ],
          { cwd: dir },
        )

  const execution = []
  const executionProblems = []
  for (const entry of arm.entries) {
    const specifier = `@ibnlanre/jumi${entry}`
    const required = execute(specifier, 'require')
    const imported = execute(specifier, 'import')

    execution.push({
      imported: imported.output.trim().split(','),
      required: required.output.trim().split(','),
      specifier,
    })

    if (required.status !== 0 || !required.output.trim())
      executionProblems.push(
        `require('${specifier}') → ${firstLines(required.output, 1)}`,
      )
    if (imported.status !== 0 || !imported.output.trim())
      executionProblems.push(
        `import('${specifier}') → ${firstLines(imported.output, 1)}`,
      )
  }

  claim(
    executionProblems.length === 0,
    'execute',
    executionProblems.length
      ? executionProblems.join('; ')
      : `${arm.entries.length} entry point${arm.entries.length === 1 ? '' : 's'} execute from both module systems`,
  )

  // Construction, not loading. `Object.keys` proves a module parses; it cannot prove the call works — and
  // the Vite entry's defect was exactly that: `require('@ibnlanre/jumi/vite')()` threw while the module
  // loaded cleanly, so the claim above held while the package was unusable from CommonJS. Every entry
  // whose default export is a factory is constructed, and both sides must build the same plugin names —
  // the shape, not just the count.
  const CONSTRUCTED = {
    // One reader per entry, because "constructed" means something different on each side of the
    // boundary: the Vite factory returns a plugin array, and the PostCSS factory returns a processor
    // whose `plugins` a PostCSS run consumes. Both are read off the call itself, and CommonJS and ES
    // modules must read the same thing.
    '/postcss':
      "made && Array.isArray(made.plugins) ? 'v' + made.version + ' ' + made.plugins.length + ' plugin(s)' : null",
    '/vite': "Array.isArray(made) ? made.map(one => one.name).join(',') : null",
  }

  const construct = (specifier, system, shape) => {
    // The call a consumer writes, not a call that happens to work: `require('@ibnlanre/jumi/vite')()`
    // from CommonJS and `(await import('@ibnlanre/jumi/vite')).default()` from ES modules. Both spellings
    // are in the README, so both are the claim.
    const call =
      system === 'require'
        ? `require('${specifier}')()`
        : `(await import('${specifier}')).default()`

    return attempt(
      'node',
      [
        ...(system === 'import' ? ['--input-type=module'] : []),
        '-e',
        `const made = ${call}\nconst shape = ${shape}\nprocess.stdout.write(shape === null ? 'INVALID' : shape)`,
      ],
      { cwd: dir },
    )
  }

  const constructions = []
  const constructionProblems = []

  for (const [entry, shape] of Object.entries(CONSTRUCTED)) {
    if (!arm.entries.includes(entry)) continue

    const specifier = `@ibnlanre/jumi${entry}`
    const required = construct(specifier, 'require', shape)
    const imported = construct(specifier, 'import', shape)
    const constructed = result =>
      result.status === 0 &&
      result.output.trim().length > 0 &&
      result.output.trim() !== 'INVALID'

    constructions.push({ specifier })

    if (!constructed(required))
      constructionProblems.push(
        `require('${specifier}')() → ${firstLines(required.output, 1)}`,
      )
    if (!constructed(imported))
      constructionProblems.push(
        `import('${specifier}')() → ${firstLines(imported.output, 1)}`,
      )
    if (
      constructed(required) &&
      constructed(imported) &&
      required.output.trim() !== imported.output.trim()
    )
      constructionProblems.push(
        `require('${specifier}')() → [${required.output.trim()}] but import → [${imported.output.trim()}]`,
      )
  }

  claim(
    constructions.length === 0 || constructionProblems.length === 0,
    'construct',
    constructions.length === 0
      ? 'no integration entry in this arm'
      : constructionProblems.length
        ? constructionProblems.join('; ')
        : `${constructions.length} integration entr${constructions.length === 1 ? 'y' : 'ies'} construct the same shape from both module systems`,
  )

  // Named exports are the interop promise: a CommonJS consumer and an ES module consumer of the same
  // artifact must see the same names, or a package is only usable from one side of the boundary.
  const absent = execution.flatMap(shape =>
    shape.required.filter(name => !shape.imported.includes(name)),
  )
  claim(
    absent.length === 0,
    'interop',
    absent.length
      ? `${absent.join(', ')} reachable by require but not by import`
      : 'every name a require reaches is reachable from import',
  )

  const unresolved = []
  for (const entry of arm.entries) {
    const specifier = `@ibnlanre/jumi${entry}`
    const required = attempt(
      'node',
      ['-e', `process.stdout.write(require.resolve('${specifier}'))`],
      { cwd: dir },
    )
    const imported = attempt(
      'node',
      [
        '--input-type=module',
        '-e',
        `process.stdout.write(import.meta.resolve('${specifier}'))`,
      ],
      { cwd: dir },
    )

    if (required.status !== 0 || !required.output.endsWith('.cjs'))
      unresolved.push(
        `${specifier} · require → ${firstLines(required.output, 1)}`,
      )
    if (imported.status !== 0 || !imported.output.endsWith('.js'))
      unresolved.push(
        `${specifier} · import → ${firstLines(imported.output, 1)}`,
      )
  }

  claim(
    unresolved.length === 0,
    'resolve',
    unresolved.length
      ? unresolved.join('; ')
      : `require reaches the .cjs and import the .js of ${arm.entries.length} entry point${arm.entries.length === 1 ? '' : 's'}`,
  )
}

/* ------------------------------------------------------------------------------------
 * The maps: published, parseable, and without the source they used to embed
 * ---------------------------------------------------------------------------------- */

console.log('')

const [pluginArm] = arms
const published = path.join(pluginArm.dir, 'node_modules', '@ibnlanre', 'jumi')
const mapProblems = []

for (const entry of entryPoints) {
  const name = entry ? entry.slice(1) : 'index'

  for (const format of ['js', 'cjs']) {
    const file = path.join(published, 'dist', `${name}.${format}`)
    const reference = /\/\/# sourceMappingURL=(\S+)/.exec(
      readFileSync(file, 'utf8'),
    )?.[1]

    if (!reference) {
      mapProblems.push(`${name}.${format} names no map`)

      continue
    }

    const mapFile = path.join(path.dirname(file), reference)

    if (!existsSync(mapFile)) {
      mapProblems.push(
        `${name}.${format} points at ${reference}, which is not published`,
      )

      continue
    }

    let map = null
    try {
      map = JSON.parse(readFileSync(mapFile, 'utf8'))
    } catch (error) {
      mapProblems.push(
        `${reference} does not parse: ${firstLines(String(error.message), 1)}`,
      )

      continue
    }

    // B, ruled 2026-09-19: the mappings ship, the embedded source does not. The maps were 74% of the
    // tarball and 2,978,204 bytes of that was `sourcesContent`, which no measured consumer path read.
    if ('sourcesContent' in map)
      mapProblems.push(`${reference} still embeds its source`)
    if (!map.version || !Array.isArray(map.sources) || !map.mappings)
      mapProblems.push(`${reference} is missing version, sources or mappings`)

    const absolute = (map.sources ?? []).filter(
      source => source.startsWith('/') || source.startsWith('file:'),
    )
    if (absolute.length)
      mapProblems.push(`${reference} names an absolute source: ${absolute[0]}`)
  }
}

claim(
  mapProblems.length === 0,
  'maps',
  mapProblems.length
    ? mapProblems.join('; ')
    : 'eight maps published and referenced, mappings intact, no embedded source, no absolute sources',
)

// The value the ruling was made to keep, asserted where it is delivered — the installed package, not
// the build. A failure raised inside Jumi's own shipped code must name a `src/*.ts` position; the
// same call with an unusable map names `dist/index.cjs`, which is the reading this rules out.
writeFileSync(
  path.join(pluginArm.dir, 'map-trace.cjs'),
  `const jumi = require('@ibnlanre/jumi')

try {
  jumi.finalizeCss(null)
  console.log('no error raised')
} catch (error) {
  console.log(error.stack)
}
`,
)

const mappedTrace = run('node', ['--enable-source-maps', 'map-trace.cjs'], {
  cwd: pluginArm.dir,
})
const mapped = /@ibnlanre\/jumi\/src\/[^\s)]+\.ts:\d+:\d+/.exec(mappedTrace)
const unmapped = /@ibnlanre\/jumi\/dist\/[^\s)]+\.(?:c|m)?js:\d+/.exec(
  mappedTrace,
)

claim(
  Boolean(mapped) && !unmapped,
  'mapped trace',
  mapped
    ? `a failure in the installed package names ${mapped[0]}`
    : `no src/ position in the trace — ${firstLines(mappedTrace, 2)}`,
)

if (failures.length) {
  console.error('\n✗ the published artifact does not hold for a consumer:')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  '\n✓ the tarball publishes every entry point, installs without the editor plugin, gives each',
)
console.log(
  '  condition the declaration for how it loads, keeps its maps without embedded source, and runs',
)
console.log(
  '  from both sides — in three isolated arms, with declaration checking on.\n',
)
