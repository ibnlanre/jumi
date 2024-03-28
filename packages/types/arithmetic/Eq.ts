import { Fn } from "@ibnlanre/types";
import { Eq } from "ts-arithmetic";

export interface TEq<
  Left extends number | void = void,
  Right extends number | void = void
> extends Fn {
  slot: [Left, Right];
  data: Eq<this[0], this[1]>;
}
