import { Fn, IndexAt, unset } from "@ibnlanre/types";

export type ValueAt<Array extends any[], Index extends number> = IndexAt<
  Array,
  Index
> extends infer Index
  ? Index extends number
    ? Array[Index]
    : never
  : never;

export interface TValueAt<
  Index extends number | unset = unset,
  Array extends unknown[] | unset = unset
> extends Fn {
  slot: [Index, Array];
  data: ValueAt<this[1], this[0]>;
}
