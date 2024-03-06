import type { Array } from "@ibnlanre/typings";
import type { Split } from "../split";

export type Slice<
  T extends string,
  Start extends number,
  End extends number
> = Array.Splice<Split<T>, Start, End>;
