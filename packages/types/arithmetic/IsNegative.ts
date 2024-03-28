import { Fn } from "@ibnlanre/types";
import { IsNegative } from "ts-arithmetic";

export interface TIsNegative<Number extends number | void = void> extends Fn {
  slot: [Number];
  data: IsNegative<this[0]>;
}
