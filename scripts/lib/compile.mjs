#!/usr/bin/env node
/**
 * Compiling a corpus the way a real build does: Tailwind emits, Jumi finalizes.
 *
 * No harness here can stop at the CLI. The carrier is identified by a marker in the utility body,
 * and the aggregate is injected into every marked rule *after* the stylesheet exists — a
 * post-build step Jumi owns. So the CLI emits, and this completes: `corpus()` runs the CLI over a
 * frozen fixture and finalizes what it produced, which is the same two steps a build runs.
 *
 * `finalize` comes from `dist/`, not from `src/`, for the same reason: the harness should exercise
 * the artifact. Callers therefore **bundle first**, then import this module.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { compile } from 'tailwindcss'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

export const root = path.join(here, '..', '..')

/** The corpora, and the fixture each one scans. */
export const snapshot = path.join(root, 'scripts', 'css-snapshot')

const tailwind = path.join(root, 'node_modules', 'tailwindcss', 'index.css')

/** The finalizer that ships, read out of the bundle. */
export const { finalize } = await import(path.join(root, 'dist', 'index.js'))

/**
 * The post-build step, which is the whole of Jumi's side of this: read the aggregate out of the
 * stylesheet, write it into every carrier, delete the staging.
 */
export const complete = css => ({ raw: css, ...finalize(css) })

/**
 * Compile one stylesheet.
 *
 * `@plugin` and `@source` resolve relative to `base`, which is what the CLI does; used where the
 * candidates are supplied by the harness rather than scanned from files.
 */
export const compiler = (css, base) => compile(css, {
  base,
  loadModule: async (id, from) => {
    const resolved = path.resolve(from, id)
    const loaded = await import(resolved)

    // tsup's CJS output puts the plugin object (`{ handler, config }`) on `default`.
    return { base: from, module: loaded.default ?? loaded, path: resolved }
  },
  loadStylesheet: async (id, from) => {
    if (id !== 'tailwindcss') throw new Error(`unexpected stylesheet: ${id}`)

    return {
      base: path.dirname(tailwind),
      content: readFileSync(tailwind, 'utf8'),
      path: tailwind,
    }
  },
  onDependency() {},
})

/**
 * A build on a compiler instance: Tailwind emits with these candidates, then the post-build step
 * completes the carriers. What comes back is a finished stylesheet — every carrier holds the
 * aggregate, and no staging remains.
 */
export const build = (instance, candidates) => complete(instance.build(candidates))

/**
 * A corpus from `scripts/css-snapshot`, emitted by the CLI and then completed.
 *
 * The CLI is the reference emission — it is what a build runs — and it owns candidate discovery,
 * so a corpus does not have to restate its inputs. A hand-rolled scanner here would not do
 * instead: reading candidates out of `class="…"` also reads them out of HTML comments and prose,
 * and it measurably disagrees with Tailwind — 179,618 bytes emitted for `variant.css` against the
 * CLI's 177,793.
 */
export const corpus = (name) => {
  const entry = path.join(snapshot, name)
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'jumi-cli-')), path.basename(entry))

  execFileSync('pnpm', ['exec', 'tailwindcss', '-i', entry, '-o', out], { cwd: root, stdio: 'pipe' })

  return complete(readFileSync(out, 'utf8'))
}
