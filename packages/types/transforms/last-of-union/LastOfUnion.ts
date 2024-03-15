import { UnionToIntersection } from "@ibnlanre/types";

export type LastOfUnion<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;
