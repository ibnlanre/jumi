export { Slice } from "./Slice";

import { IndexAt } from "../array/index-at";
import { Split } from "../string/split";

type SliceHelper<
  Rest extends string[],
  Start extends number,
  End extends number,
  StartArray extends string[] = [],
  EndArray extends string[] = [],
  Stream extends string = ""
> = StartArray["length"] extends Start
  ? EndArray["length"] extends End
    ? Stream
    : Rest extends [infer Part extends string, ...infer Rest extends string[]]
    ? SliceHelper<
        Rest,
        Start,
        End,
        StartArray,
        [...EndArray, Part],
        `${Stream}${Part}`
      >
    : "end exceeds the length of the string"
  : Rest extends [infer Part extends string, ...infer Rest extends string[]]
  ? SliceHelper<
      Rest,
      Start,
      End,
      [...StartArray, Part],
      [...EndArray, Part],
      Stream
    >
  : "start is not a valid index";

export type Slice<
  Value extends string,
  Start extends number,
  End extends number
> = SliceHelper<Split<Value>, Start, End>;
