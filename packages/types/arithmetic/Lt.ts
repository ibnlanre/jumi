import { Fn } from "@ibnlanre/types";
import { Lt } from "ts-arithmetic";

export interface TLt<
  Right extends number | void = void,
  Left extends number | void = void
> extends Fn {
  slot: [Right, Left];
  data: Lt<this[1], this[0]>;
}
