#!/usr/bin/env node
/**
 * SPIKE — can the aggregate be published incrementally, instead of re-emitting
 * the whole list on every registration?
 *
 * The bridge publishes the accumulated list each time a slot registers, which is
 * O(n²) overall: 96% of a real build (examples/output.css, 60 slots) is repeated
 * bookkeeping. A chain of custom properties
 *
 *   --jumi-7: var(--jumi-6), entry-7
 *   --jumi-aggregate-animation-name: var(--jumi-7)
 *
 * would publish O(1) per registration — *if* a new slot always belongs at the end.
 * A chain is append-only: it can add to the tail, and it can replace an entry with
 * `none` to vacate a position, but it cannot insert into the middle.
 *
 * So this reads the publications a real build already contains and asks, for every
 * registration: was the new slot appended, or did it land mid-list? If the answer
 * is "mid-list" often, the ordering model — not the publication mechanism — is what
 * forces global reconstruction.
 *
 * Run: node scripts/spike-aggregate-order.mjs [file]
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const file = process.argv[2] ?? 'examples/output.css'
const css = readFileSync(path.join(root, file), 'utf8')

/** Every publication of the aggregate name list, in the order they were emitted. */
const publications = [...css.matchAll(/--jumi-aggregate-animation-name:\s*([^;]+);/g)]
  .map(match => match[1].trim())

/** The slots one list names, as `attribute/hash` keys. */
const slots = list => [...list.matchAll(/var\(--jumi-([\w-]+?)-animation-name/g)]
  .map(match => match[1])

const lists = publications.map(slots)
const last = lists.at(-1) ?? []

console.log(`${file}`)
console.log(`  publications: ${lists.length}, slots in the last one: ${last.length}`)

if (lists.length < 2) {
  console.log('  nothing to compare — need at least two publications')
  process.exit(0)
}

let appended = 0
let inserted = 0
let vacatedOnly = 0
const offenders = []

for (let i = 1; i < lists.length; i += 1) {
  const before = lists[i - 1]
  const after = lists[i]
  const known = new Set(before)
  const fresh = after.filter(slot => !known.has(slot))
  const gone = before.filter(slot => !after.includes(slot))

  if (!fresh.length && !gone.length) {
    // A re-publication that only moved something: measure it as a reorder.
    const moved = before.some((slot, index) => after[index] !== slot)
    if (moved) vacatedOnly += 1
    continue
  }

  // Where did the new slots land? Everything before the first new slot must have
  // kept its position for this to be an append.
  const firstNew = after.findIndex(slot => !known.has(slot))
  const prefixStable = after.slice(0, firstNew).every((slot, index) => slot === before[index])
  const appendedHere = prefixStable && before.every((slot, index) => after[index] === slot)

  if (appendedHere) appended += 1
  else {
    inserted += 1
    if (offenders.length < 5) {
      offenders.push({
        fresh,
        index: firstNew,
        size: after.length,
        stablePrefix: prefixStable ? 'stable' : 'changed',
      })
    }
  }
}

console.log(`\nregistrations that only appended to the tail: ${appended}`)
console.log(`registrations that inserted or reordered:     ${inserted}`)
console.log(`re-publications with no membership change:    ${vacatedOnly}`)

if (offenders.length) {
  console.log('\nfirst insertions:')
  for (const offender of offenders) {
    console.log(`  + ${offender.fresh.join(', ')} landed at position ${offender.index + 1}/${offender.size} (prefix ${offender.stablePrefix})`)
  }
}

console.log(`\nverdict: an append-only chain ${inserted ? 'cannot' : 'can'} reproduce this order`)
