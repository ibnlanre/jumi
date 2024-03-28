import { Fn, unset } from "@ibnlanre/types";

export type IsReadonly<Value> = Readonly<Value> extends Value ? true : false;

export interface TIsReadonly<Value extends unknown | unset = unset> extends Fn {
  slot: [Value];
  data: IsReadonly<this[0]>;
}
