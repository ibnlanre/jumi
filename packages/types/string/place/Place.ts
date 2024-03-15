import { Length, Substring } from "@ibnlanre/types";

export type Place<
  T extends string,
  U extends string,
  Index extends number
> = `${Substring<T, 0, Index>}${U}${Substring<T, Index, Length<T>>}`;
