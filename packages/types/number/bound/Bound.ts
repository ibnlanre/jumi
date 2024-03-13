import { GtOrEq, LtOrEq } from "ts-arithmetic";

export type Bound<
  LowerBound extends number,
  UpperBound extends number,
  Value extends number
> = UpperBound extends number
  ? LtOrEq<Value, UpperBound> extends 1
    ? Value
    : LowerBound extends number
    ? GtOrEq<Value, LowerBound> extends 1
      ? Value
      : LowerBound
    : UpperBound
  : never;
