import { Fn } from "@ibnlanre/types";

export type IsNever<Value> = [Value] extends [never] ? 1 : 0;

export interface TIsNever<Value extends unknown | void = void> extends Fn {
  slot: [Value];
  data: IsNever<this[0]>;
}
