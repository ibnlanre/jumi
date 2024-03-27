import { Apply, data, Fn, slot, unset } from "@ibnlanre/types";
import { And, Bit } from "ts-arithmetic";
import { Call, TMap } from "@ibnlanre/types";
import { TIncludes } from "../includes/Includes";

export type Every<List extends Bit[]> = List extends []
  ? 1
  : List extends [infer Head extends Bit, ...infer Tail extends Bit[]]
  ? And<Head, Every<Tail>>
  : 0;

export interface TEvery<
  fn extends Fn | unset = unset,
  List extends unknown[] | unset = unset
> extends Fn {
  [slot]: [fn, List];
  [data]: this[0] extends Fn
    ? this[1] extends unknown[]
      ? Apply<TMap<this[0]>, [this[1]]> extends infer Result
        ? Result extends Bit[]
          ? Every<Result>
          : never
        : never
      : never
    : never;
}

type Test = Call<TEvery<TIncludes<"a">, [["a", "b"], ["k", "a"]]>>;
type Test1 = Apply<TIncludes<"a">, [["a", "b"]]>;
type Test2 = Call<TMap<TIncludes<"a">, [["a", "b"], ["j", "o"], ["k", "a"]]>>;
