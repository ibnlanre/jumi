import { Fn } from "@ibnlanre/types";
import { Add } from "ts-arithmetic";

import { SliceFrom } from "../slice-from";
import { SliceTo } from "../slice-to";

export type With<List extends any[], Index extends number, Item> = [
  ...SliceTo<List, Index>,
  Item,
  ...SliceFrom<List, Add<Index, 1>>
];

export interface TWith<
  Index extends number | void = void,
  Item extends unknown | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Index, Item, List];
  data: With<this[2], this[0], this[1]>;
}
