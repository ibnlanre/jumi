import { Fn, IsExactType } from "@ibnlanre/types";

export type Includes<List extends any[], Item> = List extends []
  ? 0
  : List extends [infer Head, ...infer Rest]
  ? IsExactType<Head, Item> extends 1
    ? 1
    : Includes<Rest, Item>
  : 0;

export interface TIncludes<
  Item extends unknown | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Item, List];
  data: Includes<this[1], this[0]>;
}
