import { Fn, UnionToTuple, unset } from "@ibnlanre/types";

export type IsUnion<Value> = [Value] extends UnionToTuple<Value> ? 0 : 1;

export interface TIsUnion<Value extends unknown | unset = unset> extends Fn {
  slot: [Value];
  data: IsUnion<this[0]>;
}
