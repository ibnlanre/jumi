import { Serializable } from "@ibnlanre/types";

export type Pattern<
  T extends string,
  Content extends Serializable = T,
  StartsWith extends Serializable = "",
  EndsWith extends Serializable = ""
> = T extends `${StartsWith}${Content}${EndsWith}` ? 1 : 0;
