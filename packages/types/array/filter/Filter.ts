import { Apply, Fn, Inspect } from "@ibnlanre/types";

export type Filter<Callback extends Fn, List extends any[]> = List extends [
  infer Element,
  ...infer Rest
]
  ? [Element] extends Inspect<Callback>
    ? Apply<Callback, [Element]> extends 1
      ? [Element, ...Filter<Callback, Rest>]
      : Filter<Callback, Rest>
    : []
  : [];

export interface TFilter<
  Callback extends Fn | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Callback, List];
  data: Filter<this[0], this[1]>;
}
