import { Concat } from "../../array/concat";
import { Length } from "../../length";

export type PadEnd<
  Value extends string,
  Size extends number,
  Letter extends string = "0"
> = Length<Value> extends Size
  ? Value
  : PadEnd<Concat<Value, Letter>, Size, Letter>;
