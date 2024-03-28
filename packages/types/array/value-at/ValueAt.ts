import { Fn, IndexAt } from "@ibnlanre/types";

export type ValueAt<Array extends any[], Index extends number> = IndexAt<
  Array,
  Index
> extends infer Index
  ? Index extends number
    ? Array[Index]
    : never
  : never;

export interface TValueAt<
  Index extends number | void = void,
  Array extends unknown[] | void = void
> extends Fn {
  slot: [Index, Array];
  data: ValueAt<this[1], this[0]>;
}
