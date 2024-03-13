import { Join, Slice } from "../../array";
import { Split } from "../split";

export type Substring<
  Value extends string,
  Start extends number,
  End extends number
> = Join<Slice<Split<Value>, Start, End>>;
