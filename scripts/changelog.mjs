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
 * ## Why this is not `conventional-changelog`
 *
 * It was, until the record was checked against the history it claims to describe. The stock preset reads a
 * fixed type list and **drops everything else** — measured against this repository, 107 of 324 subjects
 * matched no prefix and vanished from the output, including all 25 of the most recent commits. A release whose
 * commits were written as sentences would have produced an empty section, silently.
 *
 * So the accepted set below is this repository's own vocabulary, measured from its history rather than
 * adopted from a specification: `research` earned a section with 23 commits, and `style` with 6, neither of
 * which the stock preset shows. Two rules follow from that measurement:
 *
 *   1. **Sectioning is deterministic from commit intent.** The order below is fixed and does not depend on
 *      how many commits a section holds, so two releases are laid out the same way.
 *   2. **Nothing is dropped.** A subject that matches no accepted prefix is listed verbatim under
 *      `Other changes`: the explicit behaviour for free-form commits is to record them, not to reclassify
 *      them silently and not to discard them. Prefixes are a convenience for the reader, not a tax on the
 *      writer.
 *
 * `--preview` renders the section to stdout and writes nothing, which is how the output is inspected and how
 * its reproducibility is checked. Without it the section is inserted above the first `## ` heading, below the
 * document's preamble, and everything already written is left exactly as it was.
 *
 * Run: `pnpm run changelog` · `pnpm run changelog -- --preview`
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const changelog = path.join(root, 'CHANGELOG.md')

/**
 * The accepted prefixes, in the order their sections are written.
 *
 * Every entry here is a type this repository actually uses — the counts in the note above are why the list is
 * not the specification's. A type that is accepted but absent from a release's commits writes no heading at
 * all, so a fixed order costs nothing when part of it is unused.
 */
const ACCEPTED = [
  { heading: 'Features', type: 'feat' },
  { heading: 'Bug Fixes', type: 'fix' },
  { heading: 'Performance Improvements', type: 'perf' },
  { heading: 'Refactoring', type: 'refactor' },
  { heading: 'Research', type: 'research' },
  { heading: 'Documentation', type: 'docs' },
  { heading: 'Tests', type: 'test' },
  { heading: 'Build', type: 'build' },
  { heading: 'Style', type: 'style' },
  { heading: 'Chores', type: 'chore' },
]
const OTHER = { heading: 'Other changes' }
const BREAKING = { heading: '⚠ BREAKING CHANGES' }

const preview = process.argv.slice(2).includes('--preview')

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
      'Everything already in CHANGELOG.md is left exactly as it is — the curated notes, and the one generated\n' +
      'block kept for the never-published 1.0.0-beta.1 line. Tag the boundary first — the release the curated\n' +
      'notes end at — and generation will begin after it:\n' +
      '\n' +
      '  git tag v0.1.0 <the release commit>\n',
  )
  process.exit(1)
}

const version = JSON.parse(
  readFileSync(path.join(root, 'package.json'), 'utf8'),
).version
const before = readFileSync(changelog, 'utf8')

/* ---------------------------------------------------------------------------- the commits */

const FIELD = '\u001f'
const RECORD = '\u001e'

const commits = run('git', [
  'log',
  `--format=%H${FIELD}%s${FIELD}%b${RECORD}`,
  `${tag}..HEAD`,
])
  .split(RECORD)
  .map(entry => entry.replace(/^\n+/, ''))
  .filter(Boolean)
  .map(entry => {
    const [hash, subject, body = ''] = entry.split(FIELD)
    const match = /^([a-z]+)(?:\(([^)]*)\))?(!)?: (.*)$/.exec(subject)

    return {
      body,
      // `!` on the subject and an explicit footer are the two ways a breaking change is declared. The
      // footer is preferred for the entry's own text, because it says *what* broke.
      breaking: Boolean(match?.[3]) || /^BREAKING[ -]CHANGE:/m.test(body),
      hash,
      kind: match ? match[1] : null,
      scope: match?.[2] ?? null,
      subject,
      text: match ? match[4] : subject,
    }
  })

const breakingOf = commit => {
  const declared = /\n?BREAKING[ -]CHANGE:\s*([\s\S]*)/.exec(commit.body)

  return declared ? declared[1].trim().replace(/\s*\n\s*/g, ' ') : commit.text
}

/* ---------------------------------------------------------------------------- the section */

const repository = (
  JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).repository
    ?.url ?? ''
)
  .replace(/^git\+/, '')
  .replace(/\.git$/, '')
const link = hash => `([${hash.slice(0, 7)}](${repository}/commit/${hash}))`
const line = commit =>
  `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.text} ${link(commit.hash)}`

const sections = []
const breaking = commits.filter(commit => commit.breaking)

if (breaking.length)
  sections.push(
    `${BREAKING.heading}\n\n${breaking.map(commit => `* ${breakingOf(commit)} ${link(commit.hash)}`).join('\n')}`,
  )

for (const { heading, type } of ACCEPTED) {
  const matching = commits.filter(commit => commit.kind === type)

  if (matching.length)
    sections.push(`${heading}\n\n${matching.map(line).join('\n')}`)
}

// Verbatim, and last, so a free-form subject is visibly recorded rather than quietly reclassified. A commit
// that already appears above because it broke something is not repeated here.
const other = commits.filter(
  commit =>
    !ACCEPTED.some(({ type }) => type === commit.kind) && !commit.breaking,
)

if (other.length)
  sections.push(
    `${OTHER.heading}\n\n${other.map(commit => `* ${commit.subject} ${link(commit.hash)}`).join('\n')}`,
  )

const date = new Date().toISOString().slice(0, 10)
const rendered = sections.length
  ? `## ${version} (${date})\n\n${sections.map(section => `### ${section}`).join('\n\n')}\n`
  : ''

/* ----------------------------------------------------------------------------- the report */

const counts = [
  ...(breaking.length ? [`${breaking.length} breaking`] : []),
  ...ACCEPTED.map(({ heading, type }) => {
    const count = commits.filter(commit => commit.kind === type).length

    return count ? `${count} ${heading.toLowerCase()}` : null
  }).filter(Boolean),
  ...(other.length ? [`${other.length} other`] : []),
]

console.log(`boundary:   ${tag}`)
console.log(
  `version:    ${version} — from package.json, so decide the bump before running this`,
)
console.log(`commits:    ${commits.length} since the boundary`)
console.log(`sections:   ${counts.length ? counts.join(', ') : 'none'}`)

if (other.length)
  console.log(
    `note:       ${other.length} subject${other.length === 1 ? '' : 's'} matched no accepted prefix and ` +
      `${other.length === 1 ? 'is' : 'are'} listed verbatim under "${OTHER.heading}"`,
  )

if (!commits.length) {
  console.log(
    '\nthere is nothing since the boundary, so no section was written.',
  )
  process.exit(0)
}

if (preview) {
  process.stdout.write(`\n${rendered}`)
  console.log('\n--preview: nothing was written.')
  process.exit(0)
}

/* ------------------------------------------------------------------------------ the write */

if (new RegExp(`^## ${version.replace(/\./g, '\\.')}[ (]`, 'm').test(before)) {
  console.error(
    `\nCHANGELOG.md already carries a "## ${version}" section — generation would add a second one.\n` +
      'Decide the next bump with `pnpm version <bump> --no-git-tag-version`, or inspect this output with\n' +
      '`pnpm run changelog -- --preview`.',
  )
  process.exit(1)
}

// Above the first release heading and below the preamble, so the document keeps its title and its note while
// the newest release sits where a reader looks for it.
const lines = before.split('\n')
const first = lines.findIndex(entry => entry.startsWith('## '))
const at = first === -1 ? lines.length : first
const after = [
  ...lines.slice(0, at),
  ...rendered.split('\n'),
  '',
  ...lines.slice(at),
].join('\n')

writeFileSync(changelog, after)

const header =
  after.split('\n').find(entry => entry.startsWith('## ')) ?? '(no header)'
console.log(`header:     ${header}`)
console.log(`added:      ${after.split('\n').length - lines.length} line(s)`)
