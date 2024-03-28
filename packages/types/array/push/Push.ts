import { Fn, unset } from "@ibnlanre/types";

export type Push<List extends any[], Item> = [...List, Item];

export interface TPush<
  Item extends unknown | unset = unset,
  List extends unknown[] | unset = unset
> extends Fn {
  slot: [Item, List];
  data: Push<this[1], this[0]>;
}
