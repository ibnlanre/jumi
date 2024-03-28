import { Fn } from "@ibnlanre/types";

export type Unshift<List extends any[], Item> = [Item, ...List];

export interface TUnshift<
  Item extends unknown | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Item, List];
  data: Unshift<this[1], this[0]>;
}
