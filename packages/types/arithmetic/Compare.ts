import { Fn } from "@ibnlanre/types";
import { Compare } from "ts-arithmetic";

export interface TCompare<
  Left extends number | void = void,
  Right extends number | void = void
> extends Fn {
  slot: [Left, Right];
  data: Compare<this[0], this[1]>;
}
