import { Fn, unset } from "@ibnlanre/types";

export type Retrieve<
  List extends unknown,
  Index extends number = 0
> = List extends {
  [K in Index]: infer Head;
}
  ? Head
  : never;

export interface TRetrieve<
  Index extends number | unset = unset,
  List extends unknown | unset = unset
> extends Fn {
  slot: [Index, List];
  data: Retrieve<this[1], this[0]>;
}
