import { Fn, Map } from "@ibnlanre/types";
import { Bit, Or } from "ts-arithmetic";

export type Some<Values extends Bit[]> = Values extends []
  ? 0
  : Values extends [infer Head extends Bit, ...infer Tail extends Bit[]]
  ? Or<Head, Some<Tail>>
  : 0;

export interface TSome<
  Callback extends Fn | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Callback, List];
  data: Map<this[0], this[1]> extends infer List
    ? List extends Bit[]
      ? Some<List>
      : never
    : never;
}
