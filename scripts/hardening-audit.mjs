#!/usr/bin/env node
/**
 * Release hardening: the mechanical surface, measured.
 *
 * Feature work is closed, so this audits the things a 1.0 can fail on without any of them being a bug in a
 * motion: whether the package resolves the way it claims, whether tracked generated artifacts are current,
 * whether every script the manifest names exists and every script on disk is reachable, whether the
 * documentation names the families Jumi registers, and whether the research records claim classes that resolve.
 *
 * It reports; it does not fix. The sections are ordered by how much a failure would cost a user.
 *
 * Run: pnpm hardening:audit
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import postcss from 'postcss'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const line = (label, value) => console.log(`  ${label.padEnd(46)} ${value}`)
const heading = (text) => { console.log(`\n${text}`); console.log('─'.repeat(100)) }
const failures = []

const walk = (dir) => readdirSync(dir).flatMap((child) => {
  const full = path.join(dir, child)

  return statSync(full).isDirectory() ? walk(full) : [full]
})

// ── A · the package resolves the way it claims ───────────────────────────────────────────────────────
heading('A · package entry points and published files')

for (const field of ['main', 'module', 'types']) {
  if (!manifest[field]) continue

  const target = path.join(root, manifest[field])
  line(`${field} → ${manifest[field]}`, existsSync(target) ? 'exists' : 'MISSING')
  if (!existsSync(target)) failures.push(`package.json ${field} points at ${manifest[field]}, which does not exist`)
}

const requireFrom = createRequire(import.meta.url)

for (const [subpath, entry] of Object.entries(manifest.exports)) {
  const problems = []

  for (const kind of ['types', 'import', 'require']) {
    if (entry[kind] && !existsSync(path.join(root, entry[kind]))) problems.push(`${kind} ${entry[kind]} missing`)
  }

  if (!problems.length) {
    try {
      const loaded = await import(path.join(root, entry.import))
      const required = requireFrom(path.join(root, entry.require))

      if (!Object.keys(loaded).length && !Object.keys(required).length) problems.push('imports and requires, but exports nothing')
      else problems.push(`ok — ${Object.keys(loaded).length} named export(s), ${Object.keys(required).length} on require`)
    }
    catch (error) {
      problems.push(`does not load: ${error.message.split('\n')[0]}`)
    }
  }

  line(subpath, problems.join('; '))
  if (problems.some(problem => problem !== 'ok' && !problem.startsWith('ok'))) failures.push(`exports["${subpath}"]: ${problems.join('; ')}`)
}

for (const entry of manifest.files ?? []) {
  line(`files: ${entry}`, existsSync(path.join(root, entry)) ? 'exists' : 'MISSING')
  if (!existsSync(path.join(root, entry))) failures.push(`package.json files lists ${entry}, which does not exist`)
}

// ── B · the scripts the manifest names, and the scripts on disk ───────────────────────────────────────
heading('B · scripts: every named file exists, every file is reachable')

const scriptFiles = Object.entries(manifest.scripts)
  .map(([name, command]) => [name, /node\s+(\S+\.(?:mjs|js))/.exec(command)?.[1]])
  .filter(([, file]) => file)

for (const [name, file] of scriptFiles) {
  if (!existsSync(path.join(root, file))) failures.push(`script "${name}" runs ${file}, which does not exist`)
}

line('scripts naming a node file', `${scriptFiles.length} / ${Object.keys(manifest.scripts).length}`)

// Tracked files only, so the ignore rules decide what is scratch. A `walk` would report the harness temp
// directories `.gitignore` already covers (`scripts/tmp-*`, `scripts/.*-*/`) as unreachable code.
const onDisk = execFileSync('git', ['ls-files', 'scripts'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(file => /\.(mjs|js)$/.test(file))
  .filter(file => !/^scripts\/(lib|phrase-check|named-timelines|spike-scroll-driven|spike-view-transitions|view-transition-check|css-snapshot)\//.test(file))
const registered = new Set(scriptFiles.map(([, file]) => file))
const unregistered = onDisk.filter(file => !registered.has(file))

line('tracked node files (fixtures excluded)', `${onDisk.length}, unregistered: ${unregistered.length}`)

for (const file of unregistered) {
  const base = path.basename(file)
  const referenced = execFileSync('git', ['grep', '-l', base], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(entry => entry && entry !== file)

  line(`  ${file}`, referenced.length ? `not a script, but referenced by ${referenced[0]}` : 'unreachable — nothing references it')
}

// ── C · tracked generated artifacts are current ───────────────────────────────────────────────────────
heading('C · tracked generated artifacts')

const generated = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(file => /^(docs\/vendor\/|examples\/|scripts\/css-snapshot\/|stories\/)/.test(file) && /\.(js|css|d\.ts|json)$/.test(file))

line('tracked artifacts a build can regenerate', String(generated.length))

for (const [label, command] of [['docs:prepare', ['run', 'docs:prepare']], ['examples:build', ['run', 'examples:build']]]) {
  try {
    execFileSync('pnpm', command, { cwd: root, stdio: 'pipe' })
  }
  catch (error) {
    failures.push(`${label} failed: ${String(error.message).split('\n')[0]}`)
  }
}

const dirty = execFileSync('git', ['status', '--porcelain', '--', ...generated], { cwd: root, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean)

line('artifacts that changed after regenerating', dirty.length ? `${dirty.length} STALE` : 'none — all current')
for (const entry of dirty) console.log(`      ${entry}`)
if (dirty.length) failures.push(`${dirty.length} tracked artifacts were stale and have been regenerated`)

// ── D · the documentation names what the docs are for ────────────────────────────────────────────────
heading('D · documentation coverage')

const tweenSource = readFileSync(path.join(root, 'src', 'properties', 'tween.ts'), 'utf8')
const controlSource = readFileSync(path.join(root, 'src', 'properties', 'controls.ts'), 'utf8')
const properties = [...new Set([
  ...[...tweenSource.matchAll(/^    'animate-([a-z-]+)':\s*\{/gm)].map(match => match[1]),
  ...[...tweenSource.matchAll(/^      fn: property\('([a-z-]+)'/gm)].map(match => match[1]),
])]
const controls = [...new Set([...controlSource.matchAll(/^    '([a-z-]+)':\s*\{/gm)].map(match => match[1]))]
const effects = [...new Set([...readFileSync(path.join(root, 'src', 'keyframes', 'effects.ts'), 'utf8')
  .matchAll(/^  '([a-z-]+)':\s*\{/gm)].map(match => match[1]))]

const docs = walk(path.join(root, 'docs', 'src')).filter(file => /\.(md|astro|ts|json)$/.test(file)).map(file => readFileSync(file, 'utf8')).join('\n')

// Effects and controls are the two bounded sets the documentation is expected to cover completely: they are
// the features an author chooses between. Property utilities are a different thing — the docs teach them by
// category and by example, so a count is reported and the families are not demanded one by one.
const missingEffects = effects.filter(effect => !docs.includes(effect))
const missingControls = controls.filter(control => !docs.includes(control))
const unnamedProperties = properties.filter(property => !docs.includes(property))

line('effects', `${effects.length} shipped, ${missingEffects.length} never named`)
if (missingEffects.length) console.log(`      ${missingEffects.join(', ')}`)
line('controls', `${controls.length} shipped, ${missingControls.length} never named`)
if (missingControls.length) console.log(`      ${missingControls.join(', ')}`)
line('property utilities', `${properties.length} shipped, ${unnamedProperties.length} never named (docs teach by category)`)

if (missingEffects.length || missingControls.length) {
  failures.push(`documentation never names ${missingEffects.length} effect(s) and ${missingControls.length} control(s)`)
}

// ── E · classes the research records claim, for eyeballing ────────────────────────────────────────────
heading('E · class-like tokens in the records that resolve to nothing (report only)')

const records = walk(path.join(root, 'engineering'))
  .filter(file => file.endsWith('.md'))
  .map(file => readFileSync(file, 'utf8'))
  .join('\n')
const propertyNames = new Set([...readFileSync(path.join(root, 'src', 'variables', 'property.ts'), 'utf8')
  .matchAll(/^  '([a-z0-9-]+)':\s*\{/gm)].map(match => match[1]))

// Only backticked spans that are *entirely* a class-like token, so prose that merely contains one
// (`animation-side`, `the animation`) is not mistaken for a claim that a class exists.
const backticked = [...records.matchAll(/`([^`\n]+)`/g)].map(match => match[1])
const tokens = [...new Set(backticked.flatMap(span => [...span.matchAll(/^(?:animate|animation|transition|interpolate-size|view-transition)[a-z0-9-]*(?:\[[^\]\s]+\])?(?:\/[a-z-]+)?$/g)].map(match => match[0])))]
  .filter(token => token.length > 8 && !token.endsWith('-'))
  // A bare property name is not a class claim: `transition-property` alone is never a candidate, and the
  // records name properties in prose constantly. A control name is the same thing said differently.
  .filter(token => !propertyNames.has(token) && !controls.includes(token))

// A record naming a family without a value (`animate-rotate`, `animate-block-size`) is not a claim that the
// bare candidate resolves — it never can, because a motion needs a value. Those are separated out so the
// list to eyeball is only the tokens that look like a finished example.
const familyOnly = (token) => {
  const bare = /^(?:animate|animation|transition)-(.+)$/.exec(token)
  if (!bare || token.includes('[') || token.includes('/')) return false

  return properties.includes(bare[1]) || controls.includes(token)
}
const claims = tokens.filter(token => !familyOnly(token))
const families = tokens.filter(familyOnly)

// Words that merely start like a class: plurals, the event name, the at-rule prefix, and the past tense of
// "transition" as used in prose. They are not claims that anything resolves, and reporting them buries the
// handful of tokens that are.
const PROSE = new Set(['animations', 'animationstart', 'transitions', 'transitioned', 'view-transition'])

const { build, compiler, root: project } = await import('./lib/compile.mjs')
const entry = `
@import "tailwindcss";
@plugin "${path.join(project, 'dist', 'index.js')}";
`
const baseline = build(await compiler(entry, project), []).css
const batch = build(await compiler(entry, project), claims).css
const unresolved = []

for (const token of claims) {
  if (PROSE.has(token)) continue

  // A token that produced no rule at all in the batch is confirmed alone, because the batch can only say
  // "somewhere in this stylesheet" and a prefix match would otherwise hide it.
  const escaped = token.replace(/[[\]()/.%]/g, character => `\\${character}`)

  if (new RegExp(`\\.${escaped}[\\s,{:.]`).test(batch)) continue

  const alone = build(await compiler(entry, project), [token]).css
  if (alone === baseline) unresolved.push(token)
}

line('class-like spans extracted', `${claims.length} finished claims, ${families.length} family mentions`)
line('claims no Jumi build resolves', `${unresolved.length} (of ${claims.length - [...claims].filter(token => PROSE.has(token)).length} prose-filtered)`)
for (const token of unresolved) console.log(`      ${token}`)

// ── G · what a browser without the modern features would do ───────────────────────────────────────────
heading('G · modern-only features Jumi emits, and what holds if the browser lacks them')

/**
 * A representative build that exercises each feature, rather than the whole corpus: the question is whether a
 * feature is emitted at all and whether a fallback travels with it, and one candidate per feature answers both.
 */
const FEATURE_CANDIDATES = [
  'animate-fade-in',
  'animate-stagger-forward-100',
  'animate-stagger-forward-100/5',
  'animate-width-auto',
  'interpolate-size-allow-keywords',
  'animate-fade-in animation-timeline-scroll',
  'animation-range-entry:animate-fade-in',
  'transition-property/opacity',
  'transition-behavior-allow-discrete',
  'animate-ease-out-back',
]

/**
 * Each feature with the reading that decides whether its absence is graceful. `fallback` is what the stylesheet
 * or the runtime is expected to supply; `guarded` is whether the emitted CSS carries an `@supports` path for it.
 */
const FEATURES = [
  { fallback: 'keyframes write real properties, so the values interpolate anyway', guarded: false, marker: '@property' },
  { fallback: 'emits :nth-child enumeration inside @supports not (…)', guarded: true, marker: 'sibling-index()' },
  { fallback: 'falls back to the document timeline; supports-[…] is the strict form', guarded: false, marker: 'animation-timeline' },
  { fallback: 'a dropped range leaves the motion on the default range', guarded: false, marker: 'animation-range' },
  { fallback: 'the keyword change becomes discrete rather than interpolated', guarded: false, marker: 'interpolate-size' },
  { fallback: 'a discrete property does not transition at all without it', guarded: false, marker: 'transition-behavior' },
  { fallback: 'an unsupported easing function leaves the animation on its initial easing', guarded: false, marker: 'linear(' },
  { fallback: 'the runtime reports unsupported and performs the update anyway', guarded: false, marker: '@view-transition' },
]

const featureCss = build(await compiler(entry, project), FEATURE_CANDIDATES).css
const sheet = postcss.parse(featureCss)

/**
 * Whether the marker appears **inside** an `@supports` block, asked of the parsed tree rather than matched in
 * the text. A regex over the whole stylesheet cannot answer it: `@supports … {` followed by anything up to the
 * marker spans other rules, and reported four features as guarded that are not.
 */
const guardedIn = (marker) => {
  let found = false

  sheet.walkAtRules('supports', (rule) => {
    if (rule.toString().includes(marker)) found = true
  })

  return found
}

for (const feature of FEATURES) {
  const emitted = featureCss.includes(feature.marker)

  if (!emitted) {
    line(feature.marker, 'not emitted by this build — nothing to degrade')
    continue
  }

  const supports = guardedIn(feature.marker)
  const reading = supports ? 'guarded by @supports in the same stylesheet' : feature.fallback

  line(feature.marker, reading)
  if (feature.guarded && !supports) failures.push(`${feature.marker}: expected an @supports guard and found none`)
}

// ── report ────────────────────────────────────────────────────────────────────────────────────────────
heading('findings')

if (!failures.length) console.log('  nothing to fix in A, B or C.')
for (const failure of failures) console.log(`  ✗ ${failure}`)

console.log('')
