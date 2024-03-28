import { Fn, unset } from "@ibnlanre/types";

export type IsVoid<T> = [T] extends [void] ? 1 : 0;

export interface TIsVoid<T extends unknown | unset = unset> extends Fn {
  slot: [T];
  data: IsVoid<this[0]>;
}
