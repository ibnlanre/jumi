#!/usr/bin/env node
/**
 * The build, and the **only** place it happens.
 *
 * `dist/` is not a stage's private scratch space. Every stage loads the finalizer out of it
 * (`scripts/lib/compile.mjs`), and `tsup.config.ts` is configured with `clean: true`, so a stage that
 * bundles while another stage is compiling **deletes the artifact out from under it**. That is not a
 * hypothetical: it is how `behaviour` failed with
 *
 *     Error: Can't resolve '../../dist/index.js' in '.../scripts/css-snapshot'
 *
 * on the first gate run that used the concurrent pool — after two full gate runs that were green,
 * because the windows simply never overlapped. `behaviour` passes alone, and did before and after.
 *
 * The build therefore has one owner and two ways to reach it, which are this same file:
 *
 *   `pnpm run bundle`   runs this file. Bundles, always.
 *   `ensureBundle()`    bundles **unless** `JUMI_BUNDLE=prebuilt`, which is what `scripts/check.mjs`
 *                       exports to the stages it runs after its own `bundle` stage has finished. Under
 *                       the gate the build is the gate's, the stages below it are readers, and nine
 *                       concurrent bundles become one: 9 × ~4.8 s of duplicated work leaves every run,
 *                       and the race leaves with it.
 *
 * Standalone — `pnpm behaviour:check`, `pnpm css:snapshot`, `pnpm vite:check` — nothing sets that
 * variable, so the call still bundles. That half is deliberate and older than the pool: a harness that
 * reads whatever was last built once reported a bug that had already been fixed, which is why every
 * stage script bundled unconditionally in the first place. What was missing was never the bundling.
 * It was the statement of **who owns it**, and the gate had no way to make that true or to notice when
 * it was not; `check.mjs` now asserts it (the `dist/` fingerprint around the pool).
 *
 * Run: `pnpm bundle` · or import `ensureBundle` from a stage.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Whether a caller has already built `dist/` and owns it for the rest of this run.
 *
 * Read from the environment rather than inferred from `dist/`'s timestamps, and that is the point: a
 * freshness guess would be a second opinion about whether the artifact is current, and the only thing
 * worse than two bundles is two *definitions* of "already built". The variable is set by the one
 * process that actually knows — the gate — and means exactly "I bundled, before you existed".
 */
export const bundleIsOwned = () => process.env.JUMI_BUNDLE === 'prebuilt'

/**
 * Publish the maps without the source text they embed.
 *
 * Measured 2026-09-19, on the packed artifact: the eight maps were 792,966 of the tarball's 1,070,498
 * bytes — 74% — and 2,978,204 bytes of that was `sourcesContent`. What a consumer does with a map is
 * read a stack trace, and that reading is carried by the mappings alone: under `node
 * --enable-source-maps` a failing call through the installed package names
 * `src/helpers/carriers/index.ts:1355` whether the embedded text is there or not. A Vite consumer's
 * composed map came out identical three ways — with the text, without it, and with no maps at all —
 * because bundlers do not compose a dependency's maps, so the embedded text was not buying browser
 * DevTools fidelity in the path consumers actually take. Ruled as B: publish the maps, strip the text.
 *
 * Only that one key is removed. `version`, `file`, `sources`, `names` and `mappings` are left exactly
 * as `tsup` wrote them, and every shipped file keeps its `sourceMappingURL` reference, so the maps
 * still resolve — they just no longer carry a copy of the source.
 */
const stripSourcesContent = () =>
  readdirSync(path.join(root, 'dist'))
    .filter(name => name.endsWith('.map'))
    .reduce((stripped, name) => {
      const file = path.join(root, 'dist', name)
      const map = JSON.parse(readFileSync(file, 'utf8'))

      if (!('sourcesContent' in map)) return stripped

      delete map.sourcesContent
      writeFileSync(file, JSON.stringify(map))

      return stripped + 1
    }, 0)

/**
 * Bundle `dist/`, unless the caller already did.
 *
 * Returns whether it built, so a caller can say so. The announcement is here rather than at the call
 * sites because it is the *absence* of a rebuild that a reader of a gate log needs to see: `· bundling`
 * appearing nine times across four jobs is precisely how this duplication stayed invisible.
 *
 * `tsup` is invoked directly rather than through `pnpm run bundle` — which is now this file — so that
 * the two entry points cannot recurse into each other.
 */
export const ensureBundle = ({ announce = true } = {}) => {
  if (bundleIsOwned()) return false

  if (announce) console.log('· bundling')
  execFileSync('pnpm', ['exec', 'tsup'], { cwd: root, stdio: 'pipe' })
  stripSourcesContent()

  return true
}

// `pnpm run bundle` is this file, run rather than imported. `pathToFileURL` rather than string
// concatenation, because the workspace path is a real path and may not be URL-safe.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  ensureBundle()
