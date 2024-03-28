import { Fn, unset } from "@ibnlanre/types";

export type Size<List extends any[]> = List["length"];

export interface TSize<List extends unknown[] | unset = unset> extends Fn {
  slot: [List];
  data: Size<this[0]>;
}
