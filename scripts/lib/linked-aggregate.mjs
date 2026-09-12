/**
 * SPIKE — a linked aggregate.
 *
 * The current aggregate materialises every ordered list on every change, which is
 * O(n²) overall. This is the alternative under test: **one node per logical slot**,
 * with ten parallel payloads (one per longhand), and the order carried by
 * predecessor links rather than by list position:
 *
 *   --jumi-<id>-part: var(--jumi-<predecessorId>-part), <entry>
 *
 * Names only have to be *stable*, not ordered — the graph establishes order — so
 * there is no gap allocation to exhaust and no renumbering to perform.
 *
 * A node holds all ten payloads, which is what makes the parallel chains impossible
 * to misalign by construction: a mutation moves one node, and every longhand moves
 * with it. The browser test (`scripts/spike-precedence.html`) showed why that matters
 * — under `animation-composition: add` a duplicated slot sums twice, and a
 * misalignment between `animation-name` and `animation-duration` would be worse.
 *
 * The four operations the aggregate needs, each O(1) in nodes touched:
 *
 *   insertAfter(id, after)   emit one node, relink its successor
 *   remove(id)               relink the successor around it
 *   moveAfter(id, after)     remove, then insert after the new predecessor
 *   (move to tail is moveAfter(id, null))
 */
export function createLinkedAggregate(parts) {
  const nodes = new Map()
  let head = null
  let tail = null

  const link = (id, after) => {
    const node = nodes.get(id)

    node.previous = after
    node.next = after === null ? head : nodes.get(after).next

    if (node.previous === null) head = id
    else nodes.get(node.previous).next = id

    if (node.next === null) tail = id
    else nodes.get(node.next).previous = id
  }

  const unlink = (id) => {
    const node = nodes.get(id)

    if (node.previous === null) head = node.next
    else nodes.get(node.previous).next = node.next

    if (node.next === null) tail = node.previous
    else nodes.get(node.next).previous = node.previous
  }

  return {
    insertAfter(id, after) {
      link(id, after)
    },

    /** Materialise the ten lists the way the carrier would read them. */
    lists() {
      return Object.fromEntries(parts.map(part => [
        part,
        this.order().map(id => nodes.get(id).entries[part]).join(', '),
      ]))
    },

    moveAfter(id, after) {
      if (id === after) return
      unlink(id)
      link(id, after)
    },

    /** The slot order the links currently express. */
    order() {
      const ids = []

      for (let id = head; id !== null; id = nodes.get(id).next) ids.push(id)

      return ids
    },

    remove(id) {
      unlink(id)
    },

    get size() {
      return this.order().length
    },

    /** One node per logical slot, carrying every longhand's entry. */
    upsert(id, entries) {
      const existing = nodes.get(id)

      if (existing) existing.entries = entries
      else nodes.set(id, { entries, id, next: null, previous: null })
    },
  }
}
