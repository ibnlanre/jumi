import { Serializable } from "@ibnlanre/types";

export type Pattern<
  Content extends Serializable,
  StartsWith extends Serializable = "",
  EndsWith extends Serializable = ""
> = `${StartsWith}${Content}${EndsWith}`;
