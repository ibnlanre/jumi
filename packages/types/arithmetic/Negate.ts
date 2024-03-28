import { Fn } from "@ibnlanre/types";
import { Negate } from "ts-arithmetic";

export interface TNegate<Number extends number | void = void> extends Fn {
  slot: [Number];
  data: Negate<this[0]>;
}
