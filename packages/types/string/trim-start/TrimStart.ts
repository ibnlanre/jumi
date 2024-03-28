import { Fn } from "@ibnlanre/types";
import { Subtract } from "ts-arithmetic";

type TrimStartHelper<
  Text extends string,
  Count extends number,
  Letter extends string = "0"
> = Text extends `${Letter}${infer U}`
  ? TrimStart<U, Subtract<Count, 1>, Letter>
  : Text;

export type TrimStart<
  Text extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = Count extends -1
  ? Text extends `${Letter}${infer U}`
    ? TrimStartHelper<U, Count, Letter>
    : Text
  : Count extends 0
  ? Text
  : TrimStartHelper<Text, Count, Letter>;

export interface TTrimStart<
  Text extends string | void = void,
  Count extends number | void = -1,
  Letter extends string | void = "0"
> extends Fn {
  slot: [Text, Count, Letter];
  data: TrimStart<this[0], this[1], this[2]>;
}
