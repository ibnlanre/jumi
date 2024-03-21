import { And, GtOrEq, LtOrEq } from "ts-arithmetic";

export type IsBetween<
  Input extends number,
  LowerBound extends number,
  UpperBound extends number
> = And<GtOrEq<Input, LowerBound>, LtOrEq<Input, UpperBound>>;
