import { Gt, Lt, Subtract } from "ts-arithmetic";

import { ArrayOfLength } from "../array-of-length";
import { Size } from "../size";

type SliceToHelper<
  Array extends unknown[],
  End extends number
> = Array extends [...infer Rest, ...ArrayOfLength<Subtract<Size<Array>, End>>]
  ? Rest
  : never;

export type SliceTo<
  Array extends unknown[],
  End extends number = Size<Array>
> = Gt<End, Size<Array>> extends 1
  ? SliceToHelper<Array, Size<Array>>
  : Lt<End, 0> extends 1
  ? []
  : SliceToHelper<Array, End>;
