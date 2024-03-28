import { Fn, TrimEnd, TrimStart } from "@ibnlanre/types";

export type Trim<
  Text extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = TrimStart<TrimEnd<Text, Count, Letter>, Count, Letter>;

export interface TTrim<
  Text extends string | void = void,
  Count extends number | void = -1,
  Letter extends string | void = "0"
> extends Fn {
  slot: [Text, Count, Letter];
  data: Trim<this[0], this[1], this[2]>;
}
