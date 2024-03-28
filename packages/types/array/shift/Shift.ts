import { Fn, unset } from "@ibnlanre/types";

export type Shift<List extends any[]> = List extends [any, ...infer Rest]
  ? Rest
  : never;

export interface TShift<List extends unknown[] | unset = unset> extends Fn {
  slot: [List];
  data: Shift<this[0]>;
}
