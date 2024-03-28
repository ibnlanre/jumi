import { Fn } from "@ibnlanre/types";
import { Add } from "ts-arithmetic";

export interface TAdd<
  Left extends number | void = void,
  Right extends number | void = void
> extends Fn {
  slot: [Left, Right];
  data: Add<this[0], this[1]>;
}
