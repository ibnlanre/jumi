import { Fn } from "@ibnlanre/types";
import { IsNotInt } from "ts-arithmetic";

export interface TIsNotInt<Number extends number | void = void>
  extends Fn<{
    0: number;
  }> {
  slot: [Number];
  data: IsNotInt<this[0]>;
}
