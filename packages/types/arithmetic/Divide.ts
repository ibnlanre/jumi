import { Fn } from "@ibnlanre/types";
import { Divide } from "ts-arithmetic";

export interface TDivide<
  Divisor extends number | void = void,
  Dividend extends number | void = void
> extends Fn {
  slot: [Divisor, Dividend];
  data: Divide<this[1], this[0]>;
}
