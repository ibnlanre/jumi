import { Fn } from "@ibnlanre/types";
import { Abs } from "ts-arithmetic";

export interface TAbs<Number extends number | void = void> extends Fn {
  slot: [Number];
  data: Abs<this[0]>;
}
