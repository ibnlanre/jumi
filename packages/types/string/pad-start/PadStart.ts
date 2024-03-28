import { Fn, Length, Prepend } from "@ibnlanre/types";

export type PadStart<
  Text extends string,
  Size extends number,
  Prefix extends string = "0"
> = Length<Text> extends Size
  ? Text
  : PadStart<Prepend<Text, Prefix>, Size, Prefix>;

export interface TPadStart<
  Size extends number | void = void,
  Text extends string | void = void,
  Prefix extends string | void = "0"
> extends Fn {
  slot: [Size, Text, Prefix];
  data: PadStart<this[1], this[0], this[2]>;
}
