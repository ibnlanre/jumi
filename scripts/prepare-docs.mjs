import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

/**
 * The docs site is a real Jumi consumer, so it needs the same pieces a user does: the Tailwind plugin
 * (registered in CSS via `@plugin`), the integration (`jumi()`, in the Vite config), and the runtime the
 * demo's script imports. All three are vendored from `dist/` because the docs are not a package in this
 * workspace and cannot resolve `jumi/vite`. Without the integration the carriers receive no aggregate and
 * every documented effect animates nothing — silently, since a carrier that resolves `none` looks like a
 * carrier with no slots.
 */
const root = new URL('../', import.meta.url)
const effects = await readFile(
  new URL('src/keyframes/effects.ts', root),
  'utf8',
)
const names = [...effects.matchAll(/'@keyframes jumi-([^']+)'/g)].map(
  match => match[1],
)
// The sidebar badge, from the same manifest npm publishes: a version written into the site by hand
// is a version that goes stale silently.
const { version } = JSON.parse(
  await readFile(new URL('package.json', root), 'utf8'),
)
await mkdir(new URL('docs/src/data/', root), { recursive: true })
await mkdir(new URL('docs/vendor/', root), { recursive: true })
await writeFile(
  new URL('docs/src/data/effects.json', root),
  JSON.stringify(
    names.map(name => ({ className: `animate-${name}`, name })),
    null,
    2,
  ) + '\n',
)
await writeFile(
  new URL('docs/src/data/version.json', root),
  JSON.stringify({ version }, null, 2) + '\n',
)
/**
 * The modules the site imports, under the names it imports them by — each copied **with its declaration**.
 *
 * The distinction is not cosmetic. A module vendored without one is *inferred* from the bundle, and that
 * inference accepts whatever shape the bundle happens to have: with the runtime vendored as a lone `.js`,
 * `runViewTransition(async () => …)` compiled in the demo and any spelling of `concurrency` compiled with it,
 * which is the whole contract of both. This is the only place that contract is exercised, so the declaration
 * comes along — from the same build, so a copy that goes stale goes stale *with* the code it describes.
 *
 * The name matters as much as the file: `x.js` resolves to `x.d.ts` beside it, so `dist/index.js` becoming
 * `jumi.js` means its declaration has to be `jumi.d.ts`, not `index.d.ts`. The `.d.cts` files in `dist` are
 * for the package's CommonJS consumers and have no counterpart here, because the site imports ESM.
 *
 * The source map comes along for the same reason, and it is the one piece that cannot simply be copied.
 * `tsup` writes the reference into the file it belongs to — `vite.js` ends with
 * `//# sourceMappingURL=vite.js.map`, naming the file in `dist` — and Vite resolves that comment against
 * the file that carries it, not against `dist`. Copying the `.js` alone therefore points the site at a
 * `docs/vendor/vite.js.map` that no step creates, and every docs build printed the ENOENT for it. So the
 * map is copied under the name the copy has here, and the reference is rewritten to match.
 */
const vendored = [
  ['dist/index.js', 'docs/vendor/jumi.js'],
  ['dist/vite.js', 'docs/vendor/jumi-vite.js'],
  ['dist/view-transition.js', 'docs/vendor/jumi-view-transition.js'],
]

for (const [from, to] of vendored) {
  const file = to.slice(to.lastIndexOf('/') + 1)
  const source = await readFile(new URL(from, root), 'utf8')

  await writeFile(
    new URL(to, root),
    source.replace(
      /\/\/# sourceMappingURL=\S+/,
      `//# sourceMappingURL=${file}.map`,
    ),
  )
  // Unconditional: `sourcemap: true` in `tsup.config.ts` is what the reference above depends on, so a
  // build that stopped emitting maps should fail here, naming the map it could not find, rather than
  // leave the site with a reference nothing resolves.
  await copyFile(new URL(`${from}.map`, root), new URL(`${to}.map`, root))
  await copyFile(
    new URL(from.replace(/\.js$/, '.d.ts'), root),
    new URL(to.replace(/\.js$/, '.d.ts'), root),
  )
}

console.log(
  `Prepared ${vendored.length} Jumi modules with their declarations, version ${version} and ${names.length} effects for documentation.`,
)
