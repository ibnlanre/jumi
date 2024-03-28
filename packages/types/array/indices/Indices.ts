import { Fn, unset } from "@ibnlanre/types";

export type Indices<List extends any[]> = Exclude<
  keyof List,
  keyof any[]
> extends `${infer R extends number}`
  ? R
  : never;

export interface TIndices<List extends any[] | unset = unset> extends Fn {
  slot: [List];
  data: Indices<this[0]>;
}
