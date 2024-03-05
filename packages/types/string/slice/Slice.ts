import type { AbsIndex } from "../../array";
import type { Split } from "../split";
import type { SliceHelper } from "./SliceHelper";

export type Slice<
  T extends string,
  Start extends number,
  End extends number,
  Spread extends string[] = Split<T>
> = SliceHelper<Spread, AbsIndex<Spread, Start>, AbsIndex<Spread, End>>;
