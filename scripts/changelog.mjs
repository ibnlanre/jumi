#!/usr/bin/env node
/**
 * Generate the release notes from the commit history, behind a boundary.
 *
 * The boundary is a **tag**, and it is not optional. Everything before the first tag is already written in
 * `CHANGELOG.md` — the curated `0.1.0` notes, plus one generated block kept for the never-published
 * `1.0.0-beta.1` line — and it is the reason the research records exist at all. Everything after it is
 * generated from Conventional Commits. The generator has no notion of "the beginning of time": with no tags
 * it happily regenerates the entire history, which would demote curated notes to commit summaries. So this
 * refuses to run until there is a tag to start from.
 *
 * The **version is not decided here**. `pnpm version <bump> --no-git-tag-version` writes it to `package.json`
 * first and the generator stamps the release header from that, so how big a release is stays an explicit
 * judgement rather than something inferred from a commit prefix.
 *
 * Two modes are deliberately not offered. `-r 0` **overwrites the whole file** rather than prepending to it,
 * which is how a stray inspection run destroyed the hand-written notes in `CHANGELOG.md` once already — measured,
 * and the reason this wrapper only ever lets the CLI prepend. And `--stdout` is not exposed here: inspecting
 * output is a debugging act, not a release step, and it belongs at a terminal rather than in a script.
 *
 * Run: pnpm run changelog
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const changelog = path.join(root, 'CHANGELOG.md')

const run = (command, args) =>
  execFileSync(command, args, { cwd: root, encoding: 'utf8' })
const attempt = (command, args) => {
  try {
    return run(command, args).trim()
  } catch {
    return ''
  }
}

const tag = attempt('git', ['describe', '--tags', '--abbrev=0'])

if (!tag) {
  console.error(
    'no tag to start from, so there is nothing to stop the generator at the beginning of the repository.\n' +
      '\n' +
      'Everything written in CHANGELOG.md so far is curated by hand, and it is the history for the releases it\n' +
      'describes. Tag the boundary first — the release the curated notes end at — and generation will begin after\n' +
      'it:\n' +
      '\n' +
      '  git tag v0.1.0 <the release commit>\n',
  )
  process.exit(1)
}

const version = JSON.parse(
  readFileSync(path.join(root, 'package.json'), 'utf8'),
).version
const before = readFileSync(changelog, 'utf8')

run('pnpm', [
  'exec',
  'conventional-changelog',
  '-p',
  'conventionalcommits',
  '-i',
  changelog,
  '-o',
  changelog,
])

const after = readFileSync(changelog, 'utf8')
const header =
  after.split('\n').find(line => line.startsWith('## ')) ??
  '(no release header was written)'
const added = after.split('\n').length - before.split('\n').length

console.log(`boundary:   ${tag}`)
console.log(
  `version:    ${version} — from package.json, so decide the bump before running this`,
)
console.log(`header:     ${header}`)
console.log(`added:      ${added} line(s)`)

if (
  !/^\s*##\s+\S/.test(after) ||
  (after.split('\n')[0] === before.split('\n')[0] && added === 0)
) {
  console.warn(
    '\nthe changelog did not change — there is nothing since the boundary, or the header already exists.',
  )
}
