import { IsSubType } from "@ibnlanre/types";

export type Filter<T extends any[], U> = T extends [infer Head, ...infer Rest]
  ? IsSubType<Head, U> extends 1
    ? [Head, ...Filter<Rest, U>]
    : Filter<Rest, U>
  : [];
