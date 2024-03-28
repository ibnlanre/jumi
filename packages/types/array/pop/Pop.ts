import { Fn, unset } from "@ibnlanre/types";

export type Pop<List extends any[]> = List extends [...any, infer Tail]
  ? Tail
  : never;

export interface TPop<List extends any[] | unset = unset> extends Fn {
  slot: [List];
  data: Pop<this[0]>;
}
