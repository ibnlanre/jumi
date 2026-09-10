import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const effects = await readFile(new URL('src/keyframes/effects.ts', root), 'utf8')
const names = [...effects.matchAll(/'@keyframes jumi-([^']+)'/g)].map(match => match[1])
await mkdir(new URL('docs/src/data/', root), { recursive: true })
await mkdir(new URL('docs/vendor/', root), { recursive: true })
await writeFile(new URL('docs/src/data/effects.json', root), JSON.stringify(names.map(name => ({ className: `animate-${name}`, name })), null, 2) + '\n')
await copyFile(new URL('dist/index.js', root), new URL('docs/vendor/jumi.js', root))
console.log(`Prepared Jumi plugin and ${names.length} effects for documentation.`)
