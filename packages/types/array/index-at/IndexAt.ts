import { If } from "@ibnlanre/types";
import { GtOrEq, Subtract } from "ts-arithmetic";

import { Indices } from "../indices";
import { Size } from "../size";

export type IndexAt<
  Array extends any[],
  Index extends number
> = `${Index}` extends `-${infer Index extends number}`
  ? Subtract<Size<Array>, Index> extends infer Index
    ? Index extends number
      ? If<GtOrEq<Index, 0>, Index, never>
      : never
    : never
  : Indices<Array> extends infer Keys
  ? Index extends Keys
    ? Index
    : never
  : never;
