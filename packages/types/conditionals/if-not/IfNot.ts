import { Fn, unset } from "@ibnlanre/types";
import { Bit } from "ts-arithmetic";

export type IfNot<
  Condition extends Bit | boolean,
  Then,
  Else = never
> = Condition extends 0 | false ? Then : Else;

export interface TIfNot<
  Then extends unset = unset,
  Else extends unset = unset,
  Condition extends Bit | boolean | unset = unset
> extends Fn {
  slot: [Then, Else, Condition];
  data: IfNot<this[2], this[0], this[1]>;
}
