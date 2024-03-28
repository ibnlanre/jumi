import { Fn, Map } from "@ibnlanre/types";
import { And, Bit } from "ts-arithmetic";

export type Every<List extends Bit[]> = List extends []
  ? 1
  : List extends [infer Head extends Bit, ...infer Tail extends Bit[]]
  ? And<Head, Every<Tail>>
  : 0;

export interface TEvery<
  Callback extends Fn | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Callback, List];
  data: Map<this[0], this[1]> extends infer List
    ? List extends Bit[]
      ? Every<List>
      : never
    : never;
}
