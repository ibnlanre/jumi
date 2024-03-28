import { Fn } from "@ibnlanre/types";
import { Bit, Xor } from "ts-arithmetic";

export interface TXor<
  Right extends Bit | void = void,
  Left extends Bit | void = void
> extends Fn {
  slot: [Right, Left];
  data: Xor<this[1], this[0]>;
}
