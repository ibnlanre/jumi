import { Concat, Length } from "@ibnlanre/types";

export type PadEnd<
  Value extends string,
  Size extends number,
  Letter extends string = "0"
> = Length<Value> extends Size
  ? Value
  : PadEnd<Concat<Value, Letter>, Size, Letter>;
