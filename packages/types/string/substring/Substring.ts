import { Join, Slice, Split } from "@ibnlanre/types";

export type Substring<
  Value extends string,
  Start extends number,
  End extends number
> = Join<Slice<Split<Value>, Start, End>>;
