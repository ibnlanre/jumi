import { Fn } from "@ibnlanre/types";
import { Bit, Not } from "ts-arithmetic";

export interface TNot<Number extends Bit | void = void> extends Fn {
  slot: [Number];
  data: Not<this[0]>;
}
