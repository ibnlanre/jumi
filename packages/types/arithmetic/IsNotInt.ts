import { Fn } from "@ibnlanre/types";
import { IsNotInt } from "ts-arithmetic";

export interface TIsNotInt<Number extends number | void = void> extends Fn {
  slot: [Number];
  data: IsNotInt<this[0]>;
}
