import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

/**
 * The docs site is a real Jumi consumer, so it needs the same two pieces a user does: the Tailwind
 * plugin (registered in CSS via `@plugin`) and the integration (`jumi()`, in the Vite config).
 * Both are vendored from `dist/` because the docs are not a package in this workspace and cannot
 * resolve `jumi/vite`. Without the second one the carriers receive no aggregate and every
 * documented effect animates nothing — silently, since a carrier that resolves `none` looks like a
 * carrier with no slots.
 */
const root = new URL('../', import.meta.url)
const effects = await readFile(new URL('src/keyframes/effects.ts', root), 'utf8')
const names = [...effects.matchAll(/'@keyframes jumi-([^']+)'/g)].map(match => match[1])
await mkdir(new URL('docs/src/data/', root), { recursive: true })
await mkdir(new URL('docs/vendor/', root), { recursive: true })
await writeFile(new URL('docs/src/data/effects.json', root), JSON.stringify(names.map(name => ({ className: `animate-${name}`, name })), null, 2) + '\n')
await copyFile(new URL('dist/index.js', root), new URL('docs/vendor/jumi.js', root))
await copyFile(new URL('dist/vite.js', root), new URL('docs/vendor/jumi-vite.js', root))
console.log(`Prepared Jumi plugin, finalizer and ${names.length} effects for documentation.`)
