import { Serializable } from "@ibnlanre/types";

export type EndsWith<
  T extends string,
  U extends Serializable
> = T extends `${string}${U}` ? 1 : 0;
