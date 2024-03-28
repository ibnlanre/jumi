import { Fn } from "@ibnlanre/types";
import { Subtract } from "ts-arithmetic";

type TrimEndHelper<
  Text extends string,
  Count extends number,
  Letter extends string = "0"
> = Text extends `${infer U}${Letter}`
  ? TrimEnd<U, Subtract<Count, 1>, Letter>
  : Text;

export type TrimEnd<
  Text extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = Count extends -1
  ? Text extends `${infer U}${Letter}`
    ? TrimEndHelper<U, Count, Letter>
    : Text
  : Count extends 0
  ? Text
  : TrimEndHelper<Text, Count, Letter>;

export interface TTrimEnd<
  Text extends string | void = void,
  Count extends number | void = -1,
  Letter extends string | void = "0"
> extends Fn {
  slot: [Text, Count, Letter];
  data: TrimEnd<this[0], this[1], this[2]>;
}
