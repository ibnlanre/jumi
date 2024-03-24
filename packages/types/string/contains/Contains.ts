import { Serializable } from "@ibnlanre/types";

export type Contains<
  Words extends string,
  Substring extends Serializable
> = Words extends `${string}${Substring}${string}` ? 1 : 0;
