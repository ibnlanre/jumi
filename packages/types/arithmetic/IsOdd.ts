import { Fn } from "@ibnlanre/types";
import { IsOdd } from "ts-arithmetic";

export interface TIsOdd<Number extends number | void = void> extends Fn {
  slot: [Number];
  data: IsOdd<this[0]>;
}
