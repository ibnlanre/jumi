import { Fn, unset } from "@ibnlanre/types";

export type Reverse<List extends any[]> = List extends [
  infer Head,
  ...infer Rest
]
  ? [...Reverse<Rest>, Head]
  : [];

export interface TReverse<List extends any[] | unset = unset> extends Fn {
  slot: [List];
  data: Reverse<this[0]>;
}
