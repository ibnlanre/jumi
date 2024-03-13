import { Gt, Lt } from "ts-arithmetic";

import { ArrayOfLength } from "../array-of-length";
import { Size } from "../size";

type SliceFromHelper<
  Array extends unknown[],
  Start extends number
> = Array extends [...ArrayOfLength<Start>, ...infer Rest] ? Rest : never;

export type SliceFrom<Array extends unknown[], Start extends number> = Gt<
  Start,
  Size<Array>
> extends 1
  ? SliceFromHelper<Array, Size<Array>>
  : Lt<Start, 0> extends 1
  ? SliceFromHelper<Array, 0>
  : SliceFromHelper<Array, Start>;
