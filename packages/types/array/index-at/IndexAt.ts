import { ArrayOfLength, If, Indices, Size } from "@ibnlanre/types";
import { GtOrEq, Subtract } from "ts-arithmetic";

type IndexAtHelper<
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

export type IndexAt<
  Array extends any[] | number,
  Index extends number
> = Array extends any[]
  ? IndexAtHelper<Array, Index>
  : Array extends number
  ? IndexAtHelper<ArrayOfLength<Array>, Index>
  : never;
