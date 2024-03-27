import { args, data, Fn, IsExactType, slot, unset } from "@ibnlanre/types";

export type Includes<List extends any[], Element> = List extends []
  ? 0
  : List extends [infer Head, ...infer Rest]
  ? IsExactType<Head, Element> extends 1
    ? 1
    : Includes<Rest, Element>
  : 0;

export interface TIncludes<
  Element extends unknown | unset = unset,
  List extends unknown[] | unset = unset
> extends Fn {
  [slot]: [Element, List];
  [data]: this[0] extends unknown
    ? this[1] extends unknown[]
      ? Includes<this[1], this[0]>
      : never
    : never;
}
