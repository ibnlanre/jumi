#!/usr/bin/env node
/**
 * The gate, run so that it cannot report a green summary it did not earn — and run **concurrently**, so the
 * wall clock is the longest chain rather than the sum of every stage.
 *
 * `check` used to be a chain of `&&`, and a chain has one failure mode that matters here: it stops at the first
 * failure and says nothing about the rest. The reader sees the output end after `test:run`, and the checks that
 * never ran are indistinguishable from the ones that passed. That is not hypothetical — it is how a composition
 * fingerprint in `incremental-build` stayed stale for a whole representation change without anyone seeing it.
 *
 * So the stages are a list rather than a chain, and the reporting names every one of them: the ones that did not
 * run say `not run` in as many characters as the ones that did.
 *
 * The list is still **ordered**, and the order is a dependency order rather than a preference:
 *
 *   `bundle`     every stage below loads `dist/`, so it cannot start until the bundle exists — and it is the
 *                only thing that builds it. Nine of the seventeen stages below used to run `pnpm run bundle`
 *                themselves. That was invisible while the gate ran them one at a time, and became a race the
 *                moment it did not: `tsup` is `clean: true`, so each of them emptied the directory its peers
 *                were resolving `../dist/index.js` out of, and `behaviour` failed with exactly that message.
 *                They now call `ensureBundle()`, a no-op for a caller that exports `JUMI_BUNDLE=prebuilt` —
 *                which is what this file hands to the stages it pools. See `scripts/bundle.mjs`. The premise
 *                is not left to a comment: the pool fingerprints `dist/` and fails if it moved.
 *   `prepare`    the site's own sources are in this TypeScript project, so `types` cannot resolve without the
 *                vendored declarations
 *   everything   after those two, independent: seventeen stages that share nothing but the tree they read
 *
 * Those first two run alone and stream their output, because they are the root of every other stage and their
 * logs are worth watching live. The remaining seventeen run through a **pool** (`--jobs`, default 4) with their
 * output buffered per stage and printed as each one finishes: interleaving seventeen streams would make a failure
 * unreadable, and a failure is the one thing this script exists to report clearly.
 *
 * What does not change is the contract on failure: **no stage starts after one has failed.** The relaxation is
 * only for stages that were already running when it happened — they cannot be un-run — and the summary says so
 * in as many words rather than pretending the gate stopped in time.
 *
 * Run: `pnpm check` · `node scripts/check.mjs css behaviour` · `node scripts/check.mjs --jobs=8` · `--serial`
 */
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { cpus } from 'node:os'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const STAGES = [
  // First, and it is a prerequisite rather than a check. The root `tailwind.config.ts` imports
  // `./dist/index.js`, and every harness from `css` down loads the finalizer out of it, so on a fresh
  // clone the `types` stage fails with `Cannot find module './dist/index.js'` and the gate stops before
  // it has checked anything. Measured on a clean tree: without this stage `pnpm check` cannot run at
  // all. A gate that only works on the machine that last built is not a gate.
  {
    about: 'the shipped bundle, which every stage below loads',
    label: 'bundle',
    run: ['run', 'bundle'],
  },
  // Also a prerequisite rather than a check, and for the same reason as `bundle`: the site's own sources
  // are in this TypeScript project (`include: ["./**/*.ts"]` covers `docs/`), and they import the vendored
  // modules. `docs/astro.config.ts` imports `./vendor/jumi-vite.js`, the demo's module imports
  // `../../vendor/jumi-view-transition.js`, and `allowJs` is false — so without the vendored declarations
  // the very next stage fails with `Cannot find module`. That is the point rather than a nuisance: it is
  // what makes a missing declaration a gate failure instead of a silent loss of types, which is how the
  // demo's script went unchecked (`tsc` cannot parse `.astro`) and how `docs/vendor/` could once have
  // disappeared without anything noticing.
  {
    about: 'the vendored modules the site imports, with their declarations',
    label: 'prepare',
    run: ['run', 'docs:prepare'],
  },
  {
    about: 'the public surface compiles',
    label: 'types',
    run: ['run', 'check-types'],
  },
  {
    about: 'src, scripts and the site sources are clean',
    label: 'lint',
    run: [
      'exec',
      'eslint',
      'src',
      'scripts',
      'docs/src',
      'docs/astro.config.ts',
    ],
  },
  {
    about: 'the finalizer, the model and the CSS helper',
    label: 'unit',
    run: ['run', 'test:run'],
  },
  {
    about: 'the theme maps still resolve',
    label: 'theme',
    run: ['run', 'theme:map'],
  },
  {
    about: 'the byte snapshot, over two frozen corpora',
    label: 'css',
    run: ['run', 'css:check'],
  },
  {
    about: 'a phrase takes the bypass, a scalar keeps the host type check',
    label: 'phrase',
    run: ['run', 'phrase:check'],
  },
  {
    about: 'incremental builds stay correct and local',
    label: 'incremental',
    run: ['run', 'incremental:check'],
  },
  {
    about: 'a real browser resolves a real carrier',
    label: 'behaviour',
    run: ['run', 'behaviour:check'],
  },
  {
    about:
      'new effects and SVG dash routes match native references in the engines this host can launch',
    label: 'effects',
    run: ['run', 'effects:check'],
  },
  {
    about: 'the emitted view transition actually travels',
    label: 'view-transition',
    run: ['run', 'view-transition:check'],
  },
  {
    about: 'a retargeted slot scrubs, and a range lands where it was addressed',
    label: 'scroll-driven',
    run: ['run', 'scroll-driven:check'],
  },
  {
    about: 'the Vite integration, dev and every build shape',
    label: 'vite',
    run: ['run', 'vite:check'],
  },
  {
    about: 'the PostCSS integration, in every configuration',
    label: 'postcss',
    run: ['run', 'postcss:check'],
  },
  // The only stage that asks from a consumer's position rather than from this repository's: it packs, lists
  // the tarball, installs it into a clean fixture, and compiles and runs consumers against what the manifest
  // publishes. It exists because all eighteen other stages stayed green while a `require`-side consumer of the
  // packed artifact could not compile at all — the map named one `types` per entry, so the `.d.cts` files that
  // shipped were never referenced — and `nodenext` alone cannot see it, since it models a Node that can
  // `require` ESM. Nothing else in the gate reads the export map, `files`, an installed tree, or a
  // published source map.
  {
    about:
      'the packed artifact holds for a consumer: entry points, declarations and maps',
    label: 'consumer',
    run: ['run', 'consumer:check'],
  },
  {
    about: 'no carrier class in a shipped surface',
    label: 'legacy',
    run: ['run', 'legacy:check'],
  },
  {
    about: 'every effect the Storybook names is one Jumi ships',
    label: 'stories',
    run: ['run', 'stories:check'],
  },
  // Last, and the only stage that needs the *site* rather than the library: `studio:check` is
  // `docs:build && node scripts/studio-check.mjs`, so it bundles, prepares and runs `astro build`
  // before it starts. Measured 2026-09-15: 18 s end to end, the site build 2.75 s of it.
  //
  // It is the only stage that carries the whole loop rather than one link of it: Studio authors a
  // scene in a real browser, the export is recompiled by a **separate** Tailwind instance in Node
  // against the shipped bundle, replayed in a second page with Studio's own stylesheet replaced, and
  // sampled at eight times against the editor's own frames. Every other stage here checks the library
  // against fixtures Jumi's authors wrote; this one checks it against what an editor derived from it,
  // so a failure means either Studio's model or Jumi's serialization has drifted — which no other
  // stage would notice, because nothing else exports and reads back.
  {
    about:
      'an authored scene survives export, an independent compile and a replay',
    label: 'studio',
    run: ['run', 'studio:check'],
  },
]

/**
 * A **subset** by label, for the inner loop — with the prerequisites always included.
 *
 * The gate is ~2.5 minutes of stage work and roughly twice that of wall clock, and 4½ of those five
 * minutes are stages that cannot observe a change to one file: the site build (`studio`, 28s), the
 * View Transition replay (20s), and `lint` over the whole repository (11s). So `node scripts/check.mjs
 * css behaviour` runs those two stages instead of nineteen, and `bundle` and `prepare` come along
 * because every stage below them loads `dist/` and fails with `Cannot find module` without them —
 * which is the reason they are stages here at all.
 *
 * It is deliberately **not** a quiet mode. A subset prints its own summary and never claims the gate:
 * the label list is the only way in, the count says how much of the gate ran, and the closing line
 * says plainly that this is not it. The default — no arguments — is unchanged, stage for stage.
 */
const args = process.argv.slice(2)
const flags = args.filter(argument => argument.startsWith('-'))
const requested = args.filter(argument => !argument.startsWith('-'))
const prerequisites = ['bundle', 'prepare']
const known = STAGES.map(stage => stage.label)

if (requested.length) {
  const unknown = requested.filter(label => !known.includes(label))

  if (unknown.length) {
    console.error(
      `\n✗ no such stage${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}\n` +
        `  labels: ${known.join(' ')}\n`,
    )
    process.exit(1)
  }
}

const selected = requested.length
  ? STAGES.filter(
      stage =>
        prerequisites.includes(stage.label) || requested.includes(stage.label),
    )
  : STAGES

const results = selected.map(stage => ({
  ...stage,
  seconds: 0,
  status: 'not run',
}))

/**
 * How many stages run at once.
 *
 * Measured on a 10-core machine, over the whole gate: `--serial` 2m10s of wall clock, four jobs 1m01s, and the
 * stage *work* rises with the pool (170s at four jobs against 130s alone) because every stage is in a browser or
 * a bundler — so the default is a compromise rather than the maximum, and the flag is there for the machine that
 * disagrees. `--serial` is the old behaviour exactly, for a bisect or a flaky browser.
 */
const jobs = (() => {
  const asked = Number(
    flags.find(argument => argument.startsWith('--jobs'))?.split('=')[1],
  )

  if (Number.isFinite(asked) && asked > 0) return asked
  if (flags.includes('--serial')) return 1

  return Math.max(1, Math.min(4, cpus().length - 2))
})()

/**
 * The prerequisites, which every other stage reads the tree through, and the rest, which are independent of
 * each other once those two have run.
 */
const roots = results.filter(result => prerequisites.includes(result.label))
const pooled = results.filter(result => !prerequisites.includes(result.label))

let failures = 0
let inFlightOnFailure = 0

/**
 * What `dist/` looks like, file by file, so the pool can tell whether it was written while it ran.
 *
 * The stages below are readers of a directory that only the `bundle` stage above them writes. That is the
 * pool's whole premise, and it was wrong for three days — nine of the stages bundle, `tsup` is `clean: true`,
 * and nothing noticed because the gate had been green and a green run never overlapped the window. It
 * surfaced on the first run of the pool that did overlap, as `Can't resolve '../../dist/index.js'` in
 * `behaviour`, which passes alone and always did.
 *
 * So the premise is checked instead of documented. `mtimeMs` alone would not do it: `tsup` rewrites the same
 * names, and a rebuild that produces identical bytes is still a rebuild that deleted them first.
 */
const fingerprintOf = directory =>
  !existsSync(directory)
    ? null
    : readdirSync(directory)
        .sort()
        .map(name => {
          const { mtimeMs, size } = statSync(path.join(directory, name))

          return `${name}:${size}:${mtimeMs}`
        })
        .join('|')

const banner = result =>
  `\n${'─'.repeat(72)}\n· ${result.label} — ${result.about}\n${'─'.repeat(72)}\n`

const timed = result => {
  result.seconds = Math.round((performance.now() - result.startedAt) / 100) / 10
}

// The roots, alone and streaming: their logs are the ones worth watching live, and nothing else can start
// until they are done.
for (const result of roots) {
  result.startedAt = performance.now()
  process.stdout.write(banner(result))

  try {
    execFileSync('pnpm', result.run, { cwd: root, stdio: 'inherit' })
    result.status = 'passed'
  } catch (error) {
    result.status = 'FAILED'
    result.code = error.signal ?? error.status ?? 'unknown'
    failures += 1
  }

  timed(result)

  if (failures) break
}

// Taken after the roots and before the first pooled stage: from here on, nothing may write `dist/`.
const built = fingerprintOf(path.join(root, 'dist'))

/**
 * One stage, with its output captured rather than inherited.
 *
 * The buffer is the reason a pooled run stays readable: seventeen streams writing to one terminal interleave, and
 * the line that explains a failure is exactly the line that would be lost between two others.
 */
const run = result =>
  new Promise(resolve => {
    result.startedAt = performance.now()
    process.stdout.write(banner(result))

    // `JUMI_BUNDLE=prebuilt` is the whole of the handover: it says "the build is already mine", so
    // `ensureBundle()` inside the stage — and inside anything the stage shells out to, `docs:build`
    // included — returns without touching `dist/`. Without it each of these stages rebuilds the artifact
    // its peers are reading, which is how the pool's first real run failed.
    const child = spawn('pnpm', result.run, {
      cwd: root,
      env: { ...process.env, JUMI_BUNDLE: 'prebuilt' },
      stdio: 'pipe',
    })
    let output = ''

    child.stdout.on('data', chunk => (output += chunk))
    child.stderr.on('data', chunk => (output += chunk))
    child.on('close', (code, signal) => {
      if (output.trim()) process.stdout.write(output.replace(/^/gm, '  '))

      timed(result)
      result.status = code === 0 ? 'passed' : 'FAILED'

      if (code !== 0) {
        result.code = signal ?? code ?? 'unknown'
        failures += 1
      }

      resolve(result)
    })
  })

if (!failures && pooled.length) {
  const queue = [...pooled]
  const running = new Set()
  let captured = false

  // The exit condition is the whole contract in one line, and it is not the same as *draining*: a queued stage
  // is only started while nothing has failed, but a stage already running is always waited out, because it
  // cannot be un-run and its verdict is still worth reporting. The first version of this loop asked only
  // `queue.length || running.size`, so the moment a stage failed the admission loop below stopped taking work
  // and the outer loop spun forever on the queue it could no longer admit — a hung gate in place of the one
  // report it exists to produce. Found by injecting a failure rather than by reading it: every run until then
  // had been green, and green never enters this path.
  while ((queue.length && !failures) || running.size) {
    while (!failures && queue.length && running.size < jobs) {
      // Captured before the shift: `queue[0]` after it is the *next* stage, which is how this bookkeeping first
      // deleted the wrong in-flight entry and left the pool waiting on a promise nobody was tracking.
      const result = queue.shift()

      running.add({ promise: run(result), result })
    }

    // `run` resolves with the result it was given, so the finished entry is the one whose result came back.
    if (running.size) {
      const done = await Promise.race([...running].map(entry => entry.promise))
      const [entry] = [...running].filter(
        candidate => candidate.result === done,
      )

      if (entry) running.delete(entry)
    }

    // Captured when the failure is seen rather than after draining: the point is how many stages were already
    // running when the gate stopped, not how many eventually finished.
    if (failures && !captured) {
      inFlightOnFailure = running.size
      captured = true
    }
  }
}

// The premise, checked rather than assumed: the stages above read `dist/`, so none of them may write it. A
// stage that bundles re-enters `tsup` with `clean: true` and empties the directory every other stage is
// resolving `../dist/index.js` out of. That has no symptom while one stage runs at a time and is a race the
// moment two overlap, which is the failure this assertion exists to make impossible to reintroduce quietly.
if (built !== null && fingerprintOf(path.join(root, 'dist')) !== built) {
  console.log(
    '\n✗ the pool wrote `dist/` — a stage bundled while its peers were reading it.\n' +
      '  `tsup` is configured with `clean: true`, so that deletes the artifact every stage loads: the\n' +
      '  build belongs to the `bundle` stage above and the stages below it only read it. Anything they\n' +
      '  shell out to must respect the same handover — `ensureBundle()` from `scripts/bundle.mjs`, which\n' +
      '  `JUMI_BUNDLE=prebuilt` (exported to every stage this gate pools) turns into a no-op.\n',
  )
  process.exit(1)
}

const width = Math.max(...results.map(result => result.label.length))

console.log(
  `\n${'═'.repeat(72)}\n  ${requested.length ? 'a subset — this is NOT the gate' : 'the gate'}\n${'═'.repeat(72)}`,
)

for (const result of results) {
  const mark =
    result.status === 'passed' ? '✓' : result.status === 'FAILED' ? '✗' : '·'
  const time = result.status === 'passed' ? `${result.seconds}s` : ''

  console.log(
    `  ${mark} ${result.label.padEnd(width)}  ${result.status}${time ? `  ${time}` : ''}`,
  )
}

const stageWork = results.reduce(
  (total, result) => total + (result.status === 'passed' ? result.seconds : 0),
  0,
)

if (failures) {
  const skipped = results.filter(result => result.status === 'not run').length

  console.log(
    `\n✗ ${results.find(result => result.status === 'FAILED').label} failed` +
      `${skipped ? ` — the ${skipped} stage${skipped === 1 ? '' : 's'} that had not started did not run` : ''}.`,
  )
  console.log(
    '  Nothing that had not started has been checked, whether or not it looks quiet.' +
      (inFlightOnFailure
        ? ` ${inFlightOnFailure} stage${inFlightOnFailure === 1 ? ' was' : 's were'} already running and finished above.`
        : '') +
      '\n',
  )
  process.exit(1)
}

console.log(
  `  ${stageWork.toFixed(1)}s of stage work${jobs > 1 ? ` across ${jobs} job${jobs === 1 ? '' : 's'}` : ''}.`,
)

if (requested.length)
  console.log(
    `\n✓ ${results.length - prerequisites.length} selected stage${
      requested.length === 1 ? '' : 's'
    } passed, prerequisites included — ` +
      `**${STAGES.length - results.length} stages did not run** and nothing here says they would.\n`,
  )
else console.log(`\n✓ all ${results.length} stages passed.\n`)
