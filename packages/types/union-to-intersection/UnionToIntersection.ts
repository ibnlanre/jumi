import type { Prettify } from "../prettify";

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I extends Record<string, any>) => void
  ? Prettify<I>
  : never;
