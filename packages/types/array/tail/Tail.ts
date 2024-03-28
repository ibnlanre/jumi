import { Fn } from "@ibnlanre/types";

export type Tail<T extends string | any[]> = T extends [any, ...infer Tail]
  ? Tail
  : never;

export interface TTail<T extends string | unknown[] | void = void> extends Fn {
  slot: [T];
  data: Tail<this[0]>;
}
