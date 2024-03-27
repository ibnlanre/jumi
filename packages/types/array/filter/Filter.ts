import { IsExactType } from "@ibnlanre/types";

export type Filter<T extends any[], U> = T extends [infer Head, ...infer Rest]
  ? IsExactType<Head, U> extends 1
    ? [Head, ...Filter<Rest, U>]
    : Filter<Rest, U>
  : [];
