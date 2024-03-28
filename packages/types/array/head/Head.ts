import { Fn, unset } from "@ibnlanre/types";

export type Head<T extends any[]> = T extends [infer Head, ...any[]]
  ? Head
  : never;

export interface THead<T extends unknown[] | unset = unset> extends Fn {
  slot: [T];
  data: this[0] extends [infer Head, ...any] ? Head : never;
}
