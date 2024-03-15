import { TrimEnd, TrimStart } from "@ibnlanre/types";

export type Trim<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = TrimStart<TrimEnd<T, Count, Letter>, Count, Letter>;
