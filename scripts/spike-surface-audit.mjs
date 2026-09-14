#!/usr/bin/env node
/**
 * The public surface, audited from both directions before it is frozen.
 *
 * Two questions, each measured rather than recalled:
 *
 *   1. **Is the naming model coherent?** `animate-transform-origin-*` exists. Does its sibling
 *      `animate-perspective-origin-*`? And is `perspective` reachable as its own motion, or only as a
 *      composition part? A property that is reachable one way and not the other is fine *if the asymmetry is
 *      deliberate*, and a gap if it is not — so every spelling is tried and the declarations it writes are
 *      read back.
 *   2. **Does Jumi duplicate the host?** For every utility Jumi registers outside the tween family, what does
 *      it actually write — `--jumi-*` slot variables (a motion mechanism the host cannot express, so its own
 *      vocabulary is earned) or a plain declaration the host already provides (duplicate vocabulary and
 *      duplicate maintenance)? Each candidate is built twice, with and without the plugin, so the answer
 *      names who owns it.
 *
 * Run: pnpm spike:surface-audit
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const { build, compiler, root: project } = await import('./lib/compile.mjs')
const entry = `
@import "tailwindcss";
@plugin "${path.join(project, 'dist', 'index.js')}";
`
const hostEntry = '@import "tailwindcss";\n'

const jumiBaseline = build(await compiler(entry, project), []).css
const hostBaseline = build(await compiler(hostEntry, project), []).css
const jumi = async candidate => (await build(await compiler(entry, project), [candidate])).css
const host = async candidate => (await build(await compiler(hostEntry, project), [candidate])).css

const line = (label, value) => console.log(`  ${label.padEnd(44)} ${value}`)

/**
 * The declarations the candidate itself produced: the rules whose selector carries its stem, so the rest of
 * the framework does not drown the reading. Staging names are excluded — they are the transport, not the
 * output.
 */
const writes = (css, stem) => {
  const found = []

  postcss.parse(css).walkRules((rule) => {
    if (!rule.selector.includes(stem)) return

    for (const node of rule.nodes ?? []) {
      if (node.type === 'decl' && !node.prop.startsWith('--jumi-staging')) {
        found.push(`${node.prop}: ${node.value.replace(/\s+/g, ' ').slice(0, 46)}`)
      }
    }
  })

  return [...new Set(found)]
}

// ── 1 · is the naming model coherent? ────────────────────────────────────────────────────────────────
const SPELLINGS = [
  'animate-rotate-45',
  'animate-translate-x-[10px]',
  'animate-transform-origin-center',
  'animate-transform-origin-[50%_50%]',
  'animate-perspective-400',
  'animate-perspective-[400px]',
  'animate-transform-[perspective(400px)]',
  'animate-perspective-origin-center',
  'animate-perspective-origin-[50%_50%]',
  'animate-transform-origin-x-center',
  'animate-backface-visibility-hidden',
  'animate-transform-box-fill-box',
]

console.log('\n1 · the transform family, spelling by spelling')
console.log('─'.repeat(100))

for (const candidate of SPELLINGS) {
  const css = await jumi(candidate)
  const wentToHost = await host(candidate)

  if (css === jumiBaseline) {
    line(candidate, wentToHost === hostBaseline ? 'refused' : 'refused by Jumi — the host has this name')
    continue
  }

  const declared = writes(css, candidate.split('[')[0])

  line(candidate, declared.length ? declared.join('; ') : 'emitted a rule, wrote no declaration')
}

// ── 2 · does Jumi duplicate the host? ────────────────────────────────────────────────────────────────
const controls = readFileSync(path.join(root, 'src', 'properties', 'controls.ts'), 'utf8')
const names = [...controls.matchAll(/^\s{4}'([a-z-]+)':\s*\{/gm)].map(match => match[1])
const SUFFIXES = ['0', '300', 'normal', 'auto', 'block', 'both', 'linear', 'allow-discrete', 'entry', 'infinite']

console.log('\n2 · every non-tween utility Jumi registers: what it writes, and who else has the name')
console.log('─'.repeat(100))

const duplicates = []

for (const name of names) {
  let emitted = null

  for (const suffix of SUFFIXES) {
    const candidate = `${name}-${suffix}`
    const css = await jumi(candidate)

    if (css !== jumiBaseline) {
      emitted = { candidate, css, hostHas: (await host(candidate)) !== hostBaseline }
      break
    }
  }

  if (!emitted) {
    line(name, 'no candidate in the sampled suffixes was accepted')
    continue
  }

  const declared = writes(emitted.css, emitted.candidate.split('[')[0])
  // Only a real property is evidence of overlap: everything else a Jumi utility writes is a `--jumi-*` slot
  // variable, including the carrier scaffolding every one of them emits, so the filter is what makes the
  // question askable at all.
  const real = declared.filter(declaration => !declaration.startsWith('--jumi-'))
  const verdict = real.length
    ? `writes ${real.map(declaration => declaration.split(':')[0]).join(', ')}`
    : 'slot configuration only, no declaration of its own'

  if (real.length && emitted.hostHas) duplicates.push({ candidate: emitted.candidate, declared: real, name })

  line(name, `${emitted.candidate.padEnd(34)} ${verdict}${emitted.hostHas ? ' · the host also has this name' : ''}`)
}

console.log(`\nJumi utilities that write a declaration the host also provides: ${duplicates.length}`)
for (const duplicate of duplicates) {
  console.log(`  ${duplicate.candidate}: ${duplicate.declared.join('; ')}`)
}

// The specific claim to check: does Jumi register anything for `will-change`, which the host owns?
console.log('\n3 · the overlap the inventory claimed, checked directly')
console.log('─'.repeat(100))

for (const candidate of ['will-change-[transform]', 'animate-will-change-[transform]', 'will-change-transform']) {
  const inJumi = (await jumi(candidate)) !== jumiBaseline
  const inHost = (await host(candidate)) !== hostBaseline

  line(candidate, `Jumi: ${inJumi ? 'emits' : 'nothing'} · host: ${inHost ? 'emits' : 'nothing'}`)
}

console.log('')
