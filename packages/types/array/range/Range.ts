import { Fn } from "@ibnlanre/types";
import { Add } from "ts-arithmetic";

export type Range<From extends number, To extends number> = From extends To
  ? [From]
  : [From, ...Range<Add<From, 1>, To>];

export interface TRange<
  From extends number | void = void,
  To extends number | void = void
> extends Fn {
  slot: [From, To];
  data: Range<this[0], this[1]>;
}
