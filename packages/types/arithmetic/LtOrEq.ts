import { Fn } from "@ibnlanre/types";
import { LtOrEq } from "ts-arithmetic";

export interface TLtOrEq<
  Right extends number | void = void,
  Left extends number | void = void
> extends Fn {
  slot: [Right, Left];
  data: LtOrEq<this[1], this[0]>;
}
