import { Concat, Length } from "@ibnlanre/types";

export type PadStart<
  Value extends string,
  Len extends number,
  Letter extends string = "0"
> = Length<Value> extends Len
  ? Value
  : PadStart<Concat<Letter, Value>, Len, Letter>;
