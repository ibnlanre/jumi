import { Serializable } from "@ibnlanre/types";

export type StartsWith<
  T extends string,
  U extends Serializable
> = T extends `${U}${string}` ? 1 : 0;
