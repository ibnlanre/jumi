import { Fn, Serializable } from "@ibnlanre/types";

export type Pattern<
  Text extends Serializable,
  StartsWith extends Serializable = "",
  EndsWith extends Serializable = ""
> = `${StartsWith}${Text}${EndsWith}`;

export interface TPattern<
  Text extends Serializable | void = void,
  StartsWith extends Serializable | void = "",
  EndsWith extends Serializable | void = ""
> extends Fn {
  slot: [Text, StartsWith, EndsWith];
  data: Pattern<this[0], this[1], this[2]>;
}
