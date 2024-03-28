import { Fn } from "@ibnlanre/types";
import { GtOrEq } from "ts-arithmetic";

export interface TGtOrEq<
  Right extends number | void = void,
  Left extends number | void = void
> extends Fn {
  slot: [Right, Left];
  data: GtOrEq<this[1], this[0]>;
}
