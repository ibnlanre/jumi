import { Fn, unset } from "@ibnlanre/types";
import { Bit } from "ts-arithmetic";

export type If<
  Condition extends Bit | boolean,
  Then,
  Else = never
> = Condition extends 1 | true ? Then : Else;

export interface TIf<
  Then extends unset = unset,
  Else extends unset = unset,
  Condition extends Bit | boolean | unset = unset
> extends Fn {
  slot: [Then, Else, Condition];
  data: If<this[2], this[0], this[1]>;
}
