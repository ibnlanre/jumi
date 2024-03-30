import { ArrayOf, Fn, Size } from "@ibnlanre/types";
import { Gt, Lt } from "ts-arithmetic";

type SliceFromHelper<
  Array extends unknown[],
  Start extends number
> = Array extends [...ArrayOf<Start>, ...infer Rest] ? Rest : never;

export type SliceFrom<Array extends unknown[], Start extends number> = Gt<
  Start,
  Size<Array>
> extends 1
  ? SliceFromHelper<Array, Size<Array>>
  : Lt<Start, 0> extends 1
  ? SliceFromHelper<Array, 0>
  : SliceFromHelper<Array, Start>;

export interface TSliceFrom<
  Start extends number | void = void,
  Array extends unknown[] | void = void
> extends Fn {
  slot: [Start, Array];
  data: SliceFrom<this[1], this[0]>;
}
