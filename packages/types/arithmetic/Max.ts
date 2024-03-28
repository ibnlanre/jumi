import { Fn } from "@ibnlanre/types";
import { Max } from "ts-arithmetic";

export interface TMax<
  Right extends number | void = void,
  Left extends number | void = void
> extends Fn {
  slot: [Right, Left];
  data: Max<this[1], this[0]>;
}
