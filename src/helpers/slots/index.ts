/**
 * The syntax of a **composition slot** — a read of one Jumi variable inside a
 * property's composed value, stated once for the whole library.
 *
 * `var(<name>)`, or `var(<name>, <fallback>)` where the fallback nests at most
 * one level. Jumi builds every one of these in `src/composition`, so the depth is
 * a fact about this repository rather than a guess about CSS.
 *
 * The name is `[\w-]+` and greedy, so a slot belonging to a different component
 * is not mistaken for a shorter one: `var(--jumi-matrix-3d)` captures
 * `--jumi-matrix-3d`, which is not `--jumi-matrix`.
 *
 * The lookahead on `[,)]` is what makes the two shapes distinguishable without
 * matching the fallback's contents, and it is load-bearing rather than tidy: a
 * pattern that permitted anything after the name would read the `,` of a
 * fallback as part of the name.
 */
const SLOT = /var\((--jumi-[\w-]+)(?=[,)])((?:[^()]|\([^()]*\))*)\)/g

/** One read of a Jumi variable: its name, and the fallback text that follows it. */
export type CompositionSlot = {
  /** The text after the name's comma, **including** the comma. Empty when the read carries none. */
  fallback: string
  /** The variable name, `--jumi-` and all. */
  name: string
}

/**
 * Every composition slot in a value, in the order the value reads them.
 *
 * A slot nested inside another slot's fallback is **not** reported separately:
 * `var(--jumi-box-shadow-inset, var(--jumi-box-shadow-outset))` is one read of
 * `inset`, and `outset` is its fallback text. That is deliberate and it is the
 * fact the addressability edges depend on — a dependency reachable only through
 * another read's fallback is not reachable as a slot of its own.
 *
 * `matchAll` clones the pattern, so the shared `SLOT` keeps no state across calls.
 */
export const readSlots = (value: string): CompositionSlot[] =>
  [...value.matchAll(SLOT)].map(match => ({
    fallback: match[2] ?? '',
    name: match[1] ?? '',
  }))

/**
 * Rewrite every composition slot, leaving the ones the replacer returns unchanged
 * alone.
 *
 * The **whole slot** is handed to the replacer rather than the name, because a
 * name-only rewrite cannot preserve a fallback: consuming `var(<name>` but not its
 * `)` leaves a paren to close, so any replacement closes one of the two reads
 * wrongly. Handing over the slot makes each replacement self-contained.
 */
export const replaceSlots = (
  value: string,
  replacer: (match: string, name: string, fallback: string) => string,
): string => value.replaceAll(SLOT, replacer)
