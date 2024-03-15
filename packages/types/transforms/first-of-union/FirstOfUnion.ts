import { UnionToIntersection } from "@ibnlanre/types";

export type FirstOfUnion<U, N = keyof U> = UnionToIntersection<
  U extends any ? () => U : never
> extends () => infer I
  ? FirstOfUnion<Exclude<U, I>, I>
  : N;
