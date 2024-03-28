import { Fn } from "@ibnlanre/types";

type FlatHelper<
  T extends unknown[][],
  Result extends unknown[] = []
> = T extends [infer Head extends unknown[], ...infer Tail extends unknown[][]]
  ? FlatHelper<Tail, [...Result, ...Head]>
  : Result;

export type Flat<T extends unknown[][]> = FlatHelper<T>;

export interface TFlat<List extends unknown[][] | void = void> extends Fn {
  slot: [List];
  data: Flat<this[0]>;
}
