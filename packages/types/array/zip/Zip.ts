import { Fn, unset } from "@ibnlanre/types";

export type Zip<Left extends any[], Right extends any[]> = Left extends [
  infer HeadA,
  ...infer RestA
]
  ? Right extends [infer HeadB, ...infer RestB]
    ? [[HeadA, HeadB], ...Zip<RestA, RestB>]
    : []
  : [];

export interface TZip<
  Left extends unknown[] | unset = unset,
  Right extends unknown[] | unset = unset
> extends Fn {
  slot: [Left, Right];
  data: Zip<this[0], this[1]>;
}
