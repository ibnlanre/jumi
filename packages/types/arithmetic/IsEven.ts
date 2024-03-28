import { Fn } from "@ibnlanre/types";
import { IsEven } from "ts-arithmetic";

export interface TIsEven<Number extends number | void = void> extends Fn {
  slot: [Number];
  data: IsEven<this[0]>;
}
