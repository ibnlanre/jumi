import { IsSubType } from "@ibnlanre/types";

export type Includes<T extends any[], U> = T extends [infer Head, ...infer Rest]
  ? IsSubType<Head, U> extends 1
    ? 1
    : Includes<Rest, U>
  : 0;
