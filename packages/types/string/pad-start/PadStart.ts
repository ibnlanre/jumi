import { Concat } from "../../array/merge";
import { Length } from "../length";

export type PadStart<
  Value extends string,
  Len extends number,
  Letter extends string = "0"
> = Length<Value> extends Len
  ? Value
  : PadStart<Concat<Letter, Value>, Len, Letter>;
