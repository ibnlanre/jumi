import { Fn, unset } from "@ibnlanre/types";

export type Unshift<List extends any[], Item> = [Item, ...List];

export interface TUnshift<
  Item extends unknown | unset = unset,
  List extends unknown[] | unset = unset
> extends Fn {
  slot: [Item, List];
  data: Unshift<this[1], this[0]>;
}
