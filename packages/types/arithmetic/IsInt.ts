import { Fn } from "@ibnlanre/types";
import { IsInt } from "ts-arithmetic";

export interface TIsInt<Number extends number | void = void>
  extends Fn<{
    0: number;
  }> {
  slot: [Number];
  data: IsInt<this[0]>;
}
