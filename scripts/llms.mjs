#!/usr/bin/env node
/**
 * The site's `llms.txt` and `llms-full.txt`.
 *
 * The convention (llmstxt.org) is a markdown file at the root of a website: an index of what the site
 * holds, written for a model rather than for a browser. `llms-full.txt` is the same corpus with the
 * pages inlined, for a reader that would rather fetch once.
 *
 * Both are **rendered from the sources they describe**, never written by hand, for the reason this
 * repository gives everything else it generates: a hand-kept index is a second copy of the site, and
 * the copy is what goes stale. The guide list is therefore taken from the pages that exist, ordered by
 * the site's own sidebar, so a page cannot be missing from the index of the site it is on.
 *
 * Written by `pnpm docs:prepare`, which the `prepare` stage and every `docs:build` run.
 *
 * Run: pnpm llms
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const root = new URL('../', import.meta.url)
const read = file => readFile(new URL(file, root), 'utf8')

/**
 * The site's own address, read out of the Astro config rather than repeated here: `llms.txt` is a list
 * of absolute URLs, and a second copy of the domain is a second place to forget. A config that has not
 * declared `site` fails loudly, because the alternative is a file full of relative links that a crawler
 * cannot attribute.
 */
const config = await read('docs/astro.config.ts')
const site = config.match(/^\s{2}site:\s*'([^']+)'/m)?.[1]

if (!site)
  throw new Error(
    "docs/astro.config.ts declares no `site`, and llms.txt needs absolute URLs. Add `site: 'https://…'` to defineConfig.",
  )

/** The vocabulary counts, from the sources rather than from a number kept in prose. */
const effects = [
  ...(await read('src/keyframes/effects.ts')).matchAll(
    /'@keyframes jumi-([^']+)'/g,
  ),
].map(match => match[1])
const stems = [
  ...new Set(
    [
      ...(await read('src/properties/tween.ts')).matchAll(
        /'animate-[a-z0-9-]+'/g,
      ),
    ].map(match => match[0].slice(1, -1)),
  ),
].sort()

/**
 * The pages, and the site's order for them.
 *
 * The sidebar is the site's reading order and its labels, and it is the one place that already knows
 * both, so the index is built from it. Anything the sidebar has not been told about is still listed,
 * after the ordered pages, so adding a page to the site never drops it from the index of the site.
 */
const pageRoot = path.join(fileURLToPath(root), 'docs/src/pages/docs')
const frontmatter = source => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/)

  return match ? match[1] : ''
}
const field = (block, name) =>
  block.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim()

const pages = new Map()

for (const name of (await readdir(pageRoot))
  .filter(name => name.endsWith('.md'))
  .sort()) {
  const source = await readFile(path.join(pageRoot, name), 'utf8')
  const block = frontmatter(source)
  const href =
    name === 'index.md' ? '/docs/' : `/docs/${name.replace(/\.md$/, '')}/`

  pages.set(href, {
    body: source.replace(/^---\n[\s\S]*?\n---\n/, '').trim(),
    description: field(block, 'description'),
    href,
    title: field(block, 'title'),
  })
}

const links = await read('docs/src/layouts/Docs.astro')
const sidebar = [...links.matchAll(/\['([^']+)',\s*'([^']+)'\]/g)].map(
  ([, href, label]) => ({ href, label }),
)

if (sidebar.length < 5)
  throw new Error(
    'docs/src/layouts/Docs.astro: could not read the sidebar, so the guide order is unknown.',
  )

const ordered = sidebar
  .map(entry => ({ ...entry, page: pages.get(entry.href) }))
  .filter(entry => entry.page)
const unlisted = [...pages.values()].filter(
  page => !ordered.some(entry => entry.href === page.href),
)

/** The skill, which is the densest description of the library that exists. */
const skill = (await read('SKILL.md'))
  .replace(/^---\n[\s\S]*?\n---\n/, '')
  .trim()
const { version } = JSON.parse(await read('package.json'))
const repository = 'https://github.com/ibnlanre/jumi'

const wrap = (text, indent = '') => {
  const words = text.split(/\s+/)
  const lines = []
  let line = indent

  for (const word of words) {
    if (line.length + word.length + 1 > 100 && line.trim()) {
      lines.push(line.trimEnd())
      line = indent
    }

    line += `${word} `
  }

  if (line.trim()) lines.push(line.trimEnd())

  return lines.join('\n')
}

const summary =
  `Jumi writes CSS animations through Tailwind CSS v4. ${effects.length} effects, ${stems.length} ` +
  'property targets, keyframes written inside a class name, per-property timing, a stagger, ' +
  'scroll-driven timelines and view transitions, all generated at build time with no runtime in the ' +
  'browser.'

const orientation =
  'Jumi is a Tailwind plugin plus an integration, and the two are not interchangeable: the plugin ' +
  'teaches Tailwind the utilities, and the integration completes the stylesheet once every ' +
  '`animate-*` class has been compiled. Wiring only the plugin compiles the utilities, animates ' +
  'nothing and warns about nothing, which is why the guides start there.'

const index = [
  '# Jumi',
  '',
  `> ${summary}`,
  '',
  wrap(orientation),
  '',
  '## Guides',
  '',
  ...ordered.map(
    entry =>
      `- [${entry.label}](${site}${entry.href}): ${entry.page.description ?? entry.page.title}`,
  ),
  ...unlisted.map(page =>
    `- [${page.title}](${site}${page.href}): ${page.description ?? ''}`.trimEnd(),
  ),
  '',
  '## Reference',
  '',
  `- [The effect catalog](${site}/effects/): every one of the ${effects.length} effects, searchable, with a preview for each.`,
  `- [llms-full.txt](${site}/llms-full.txt): every guide, plus the agent skill, in one file.`,
  `- [The agent skill](${repository.replace('github.com', 'raw.githubusercontent.com')}/main/SKILL.md): the whole vocabulary as one markdown file, written for a coding agent, including all ${effects.length} effect names and all ${stems.length} property utilities.`,
  `- [npm package](https://www.npmjs.com/package/@ibnlanre/jumi): version ${version}.`,
  `- [Source](${repository}).`,
  '',
  '## Optional',
  '',
  `- [Release notes](${repository}/blob/main/CHANGELOG.md): every change, newest first.`,
  `- [Contributing](${repository}/blob/main/CONTRIBUTING.md): how the library is built, and the rules its code follows.`,
  `- [How it works](${repository}/tree/main/engineering): the architecture, decisions and measurements behind the emission model.`,
  '',
].join('\n')

/**
 * The full corpus: the summary, then every guide whole, then the skill.
 *
 * Each section is headed by the name the site's own navigation gives it, so the two files agree on what a
 * page is called, and carries its title, description and source URL beneath: a reader that arrived here
 * rather than at the index can still attribute what it read.
 */
const sections = [
  ...ordered.map(entry => ({ ...entry.page, label: entry.label })),
  ...unlisted.map(page => ({ ...page, label: page.title })),
]

const full = [
  '# Jumi, in full',
  '',
  `> ${summary}`,
  '',
  wrap(
    `Every guide on ${site.replace(/^https?:\/\//, '')} in reading order, followed by the agent skill. ` +
      'Generated from the repository by `scripts/llms.mjs`, so do not edit it here: change the page it ' +
      'came from.',
  ),
  '',
  ...sections.flatMap(section => [
    '---',
    '',
    `# ${section.label}`,
    '',
    [section.title, section.description].filter(Boolean).join(' '),
    '',
    `Source: ${site}${section.href}`,
    '',
    section.body,
    '',
  ]),
  '---',
  '',
  '# The agent skill',
  '',
  `Source: ${repository.replace('github.com', 'raw.githubusercontent.com')}/main/SKILL.md`,
  '',
  skill,
  '',
].join('\n')

for (const [file, content] of [
  ['docs/public/llms.txt', index],
  ['docs/public/llms-full.txt', full],
]) {
  await writeFile(new URL(file, root), content)
}

console.log(
  `Wrote llms.txt (${ordered.length + unlisted.length} guides, ${(index.length / 1024).toFixed(1)} KB) and llms-full.txt ` +
    `(${(full.length / 1024).toFixed(1)} KB, including the ${skill.split('\n').length}-line skill) for ${site}.`,
)
