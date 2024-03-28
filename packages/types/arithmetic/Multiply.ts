import { Fn } from "@ibnlanre/types";
import { Multiply } from "ts-arithmetic";

export interface TMultiply<
  Right extends number | void = void,
  Left extends number | void = void
> extends Fn {
  slot: [Right, Left];
  data: Multiply<this[1], this[0]>;
}
