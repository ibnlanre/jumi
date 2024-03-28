import { Fn, unset } from "@ibnlanre/types";
import { And, GtOrEq, LtOrEq } from "ts-arithmetic";

export type IsBetween<
  Input extends number,
  LowerBound extends number,
  UpperBound extends number
> = And<GtOrEq<Input, LowerBound>, LtOrEq<Input, UpperBound>>;

export interface TIsBetween<
  LowerBound extends number | unset = unset,
  UpperBound extends number | unset = unset,
  Input extends number | unset = unset
> extends Fn {
  slot: [LowerBound, UpperBound, Input];
  data: IsBetween<this[2], this[0], this[1]>;
}
