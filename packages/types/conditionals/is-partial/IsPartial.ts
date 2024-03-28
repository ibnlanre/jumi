import { Fn, unset } from "@ibnlanre/types";

export type IsPartial<Value> = undefined extends Value
  ? [Value] extends [undefined]
    ? 0
    : 1
  : 0;

export interface TIsPartial<Value extends unknown | unset = unset> extends Fn {
  slot: [Value];
  data: IsPartial<this[0]>;
}
