import { Fn, unset } from "@ibnlanre/types";
import { Add } from "ts-arithmetic";

import { SliceFrom } from "../slice-from";
import { SliceTo } from "../slice-to";

export type With<List extends any[], Index extends number, Item> = [
  ...SliceTo<List, Index>,
  Item,
  ...SliceFrom<List, Add<Index, 1>>
];

export interface TWith<
  Index extends number | unset = unset,
  Item extends unknown | unset = unset,
  List extends unknown[] | unset = unset
> extends Fn {
  slot: [Index, Item, List];
  data: With<this[2], this[0], this[1]>;
}
