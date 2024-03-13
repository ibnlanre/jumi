import { UnionToIntersection } from "../union-to-intersection";

export type LastOfUnion<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;
