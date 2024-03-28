import { Fn } from "@ibnlanre/types";

export type IsPartial<Value> = undefined extends Value
  ? [Value] extends [undefined]
    ? 0
    : 1
  : 0;

export interface TIsPartial<Value extends unknown | void = void> extends Fn {
  slot: [Value];
  data: IsPartial<this[0]>;
}
