import { Append, Fn, Length } from "@ibnlanre/types";

export type PadEnd<
  Text extends string,
  Size extends number,
  Suffix extends string = "0"
> = Length<Text> extends Size
  ? Text
  : PadEnd<Append<Text, Suffix>, Size, Suffix>;

export interface TPadEnd<
  Size extends number | void = void,
  Text extends string | void = void,
  Suffix extends string | void = "0"
> extends Fn {
  slot: [Size, Text, Suffix];
  data: PadEnd<this[1], this[0], this[2]>;
}
