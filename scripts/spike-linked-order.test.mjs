import { describe, expect, it, vi } from 'vitest'

import { getCreator } from '../src/helpers/create'
import { splitTopLevel } from './lib/css.mjs'
import { createLinkedAggregate } from './lib/linked-aggregate.mjs'

/**
 * SPIKE — order equivalence for the linked aggregate.
 *
 * The correctness kill-switch before any representation work: feed the *same*
 * registration history into today's aggregation and into the linked one and require
 * all ten lists to be **identical**, not merely equal in slot count.
 *
 * The histories include the mutations that make this hard: a value, a phrase (its own
 * category), an effect (a third category, sorted alphabetically), a *re-registration*
 * of an existing value — which moves its slot within its group rather than appending
 * it — and further attributes.
 *
 * It also checks the invariant the precedence test made necessary: every logical slot
 * appears exactly once, in all ten chains at the same position, because under
 * `animation-composition: add` a duplicate sums twice and a misalignment between
 * `animation-name` and `animation-duration` would be worse.
 *
 * Run: pnpm exec vitest run scripts/spike-linked-order.test.mjs
 */
const PARTS = [
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-composition',
  'animation-direction',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-play-state',
  'animation-timeline',
  'animation-timing-function',
]

const setup = () => getCreator({
  addBase: vi.fn(),
  addComponents: vi.fn(),
  addUtilities: vi.fn(),
  addVariant: vi.fn(),
  config: vi.fn(),
  matchComponents: vi.fn(),
  matchUtilities: vi.fn(),
  matchVariant: vi.fn(),
  prefix: vi.fn(),
  theme: vi.fn(),
})

/** The ten lists, read exactly as the carrier would. */
const readLists = creator =>
  Object.fromEntries(
    Object.entries(creator.animations).filter(([part, value]) =>
      part.startsWith('animation-') && typeof value === 'string'),
  )

/**
 * Slot identity comes from `animation-name`: one entry per slot, and no two slots can
 * share a name variable. The other nine lists are positional and must agree with it.
 */
const identify = lists =>
  splitTopLevel(lists['animation-name']).map((entry) => {
    const name = /^var\((--jumi-[\w-]+)-animation-name/.exec(entry.trim())

    return name ? name[1] : entry.trim()
  })

/**
 * The aggregate's own operations, applied to reach `target` from the current order.
 * Returns how many node operations that took — the O(1) claim, in node terms.
 */
const applyPlan = (aggregate, target) => {
  let operations = 0
  let after = null

  for (const id of target) {
    const order = aggregate.order()
    const index = order.indexOf(id)

    if (index === -1) {
      aggregate.insertAfter(id, after)
      operations += 1
    }
    else {
      const successor = after === null ? order[0] : order[order.indexOf(after) + 1]

      if (successor !== id) {
        aggregate.moveAfter(id, after)
        operations += 1
      }
    }

    after = id
  }

  for (const id of aggregate.order()) {
    if (target.includes(id)) continue

    aggregate.remove(id)
    operations += 1
  }

  return operations
}

const histories = {
  'a re-registered value, which moves within its group': [
    creator => creator.property('opacity')('50', { modifier: null }),
    creator => creator.property('opacity')('25', { modifier: null }),
    creator => creator.property('opacity')('50', { modifier: null }),
  ],
  'a second attribute, a third, and a labelled phrase': [
    creator => creator.property('opacity')('50', { modifier: null }),
    creator => creator.property('rotate')('0:0deg,20:-8deg,100:-8deg', { modifier: 'flick' }),
    creator => creator.property('scale')('110', { modifier: null }),
    creator => creator.property('background-color')('red-500', { modifier: null }),
  ],
  'a value, a phrase, an effect': [
    creator => creator.property('opacity')('50', { modifier: null }),
    creator => creator.property('rotate')('0:16deg,58:0deg', { modifier: null }),
    creator => creator.effect('bounce-in'),
  ],
  'effects arriving in reverse alphabetical order': [
    creator => creator.property('opacity')('50', { modifier: null }),
    creator => creator.effect('zoom-in'),
    creator => creator.effect('bounce-in'),
    creator => creator.effect('arc-in-left'),
  ],
}

describe('the linked aggregate materialises today\u2019s order', () => {
  const cases = Object.entries(histories)

  it.each(cases)('%s', (_name, steps) => {
    const creator = setup()
    const aggregate = createLinkedAggregate(PARTS)

    for (const step of steps) {
      step(creator)

      const lists = readLists(creator)
      const parts = Object.keys(lists)
      const ids = identify(lists)

      // Exactly once: no slot may appear twice, or vanish, in any chain.
      expect(new Set(ids).size).toBe(ids.length)

      // Parallel: every chain has the same length, in the same slot order.
      for (const part of parts) {
        expect(splitTopLevel(lists[part]).length).toBe(ids.length)
      }

      // One node per slot, carrying every longhand's entry positionally.
      ids.forEach((id, position) => {
        aggregate.upsert(id, Object.fromEntries(
          parts.map(part => [part, splitTopLevel(lists[part])[position]]),
        ))
      })

      const operations = applyPlan(aggregate, ids)

      // The claim: identical, all ten, after every mutation.
      expect(aggregate.lists()).toEqual(lists)

      // …and local: a mutation touches a bounded number of nodes.
      expect(operations).toBeLessThanOrEqual(2)
      expect(aggregate.size).toBe(ids.length)
    }
  })
})
