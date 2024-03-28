import { Fn } from "@ibnlanre/types";

export type Push<List extends any[], Item> = [...List, Item];

export interface TPush<
  Item extends unknown | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Item, List];
  data: Push<this[1], this[0]>;
}
