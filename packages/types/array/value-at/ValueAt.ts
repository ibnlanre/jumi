import { IndexAt } from "@ibnlanre/types";

export type ValueAt<Array extends any[], Index extends number> = IndexAt<
  Array,
  Index
> extends infer Index
  ? Index extends number
    ? Array[Index]
    : never
  : never;
