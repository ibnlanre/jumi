import type { LastOfUnion } from "../last-of-union";

type UnionToTupleHelper<T, L = LastOfUnion<T>, N = Exclude<T, L>> = [
  L
] extends [never]
  ? []
  : [...UnionToTupleHelper<N>, L];

export type UnionToTuple<T> = UnionToTupleHelper<T>;
