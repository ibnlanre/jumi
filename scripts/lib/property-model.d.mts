/**
 * The reader's surface, for the one TypeScript consumer: `src/variables/reach.test.ts` imports `bucketOf` and
 * `readPropertyEntries`, and the reader itself is a plain Node module (`allowJs: false`, so a `.mjs` import
 * needs a declaration beside it).
 *
 * Only what is used is declared, and it is declared as what the reader *guarantees* rather than as what a
 * caller might hope: an entry's `value` is the **source text**, which for a helper-composed entry is the
 * identifier that names it. Anything that needs the expression should ask `readExpressions`, and this type is
 * where that distinction is visible.
 */

/** One `propertyVariables` entry, read from the source. */
export interface PropertyEntry {
  /** Whether the entry declares `dependencies`, i.e. composes parts of its own. */
  composite: boolean
  /** The slots this entry composes. Empty for a leaf. */
  deps: string[]
  /** The `--jumi-*` variable the entry owns, when it declares one. */
  name: string | undefined
  /** The entry's key: the slot's public name. */
  slot: string
  /** The entry's `value:` **as written** — a quoted literal, an identifier, or a call. */
  value: string | null
  variable: string | undefined
}

/** One candidate-table entry. */
export interface Candidate {
  attribute: string | null
  file: string
  name: string
  parts: string[]
  types: string[]
}

export declare const root: string

export declare const readPropertyEntries: () => PropertyEntry[]
export declare const readCandidates: () => Candidate[]
export declare const readCompositions: () => Map<string, string>
export declare const readExpressions: () => Map<string, string | null>
export declare const expressions: () => Map<string, string | null>
export declare const readTypedLeaves: () => Map<
  string,
  { family: string; initialValue: string | null; syntax: string | null }
>

export declare const FUNCTION: RegExp
export declare const MACHINERY: RegExp

export declare const depthOf: (
  expression: unknown,
  component: string,
) => number | null

export declare const bucketOf: (
  parent: string,
  component: string,
) => 'keyword' | 'machinery' | 'reshape' | 'value'
