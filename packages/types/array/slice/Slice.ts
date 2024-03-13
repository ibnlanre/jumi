import { Gt, Subtract } from "ts-arithmetic";

import { Bound } from "../../number/bound";
import { Size } from "../size";
import { SliceFrom } from "../slice-from";
import { SliceTo } from "../slice-to";

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

type Test = Slice<[1, 2, 3, 4, 5], 0>; // [2, 3]
