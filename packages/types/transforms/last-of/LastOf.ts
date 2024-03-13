import { UnionToIntersection } from "../union-to-intersection";

export type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;
