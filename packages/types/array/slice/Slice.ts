import { Bound, Fn, Size, SliceFrom, SliceTo } from "@ibnlanre/types";
import { Subtract } from "ts-arithmetic";

export type Slice<
  Array extends unknown[],
  Start extends number = 0,
  End extends number = Size<Array>
> = Bound<0, Size<Array>, Start> extends infer Start
  ? Start extends number
    ? Bound<0, Size<Array>, End> extends infer End
      ? End extends number
        ? SliceTo<SliceFrom<Array, Start>, Subtract<End, Start>>
        : never
      : never
    : never
  : never;

export interface TSlice<
  Start extends number | void = void,
  End extends number | void = void,
  Array extends unknown[] | void = void
> extends Fn {
  slot: [Start, End, Array];
  data: Slice<this[2], this[0], this[1]>;
}
