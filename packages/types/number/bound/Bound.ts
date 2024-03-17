import { GtOrEq, LtOrEq } from "ts-arithmetic";

export type Bound<
  LowerBound extends number,
  UpperBound extends number,
  Value extends number
> = GtOrEq<Value, UpperBound> extends 1
  ? UpperBound
  : LtOrEq<Value, LowerBound> extends 1
  ? LowerBound
  : Value;
