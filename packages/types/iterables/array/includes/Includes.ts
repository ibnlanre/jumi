import { Is } from "../../../conditionals";

export type Includes<T extends any[], U> = T extends [infer Head, ...infer Rest]
  ? Is<Head, U> extends 1
    ? 1
    : Includes<Rest, U>
  : 0;
