import { Apply, Fn, Inspect } from "@ibnlanre/types";

export type Every<
  Callback extends Fn,
  List extends Inspect<Callback>[]
> = List extends []
  ? 1
  : List extends [infer Element, ...infer Rest extends Inspect<Callback>[]]
  ? Element extends Inspect<Callback>
    ? Apply<Callback, Element> extends 1
      ? Every<Callback, Rest>
      : 0
    : 0
  : 0;

export interface TEvery<
  Callback extends Fn | void = void,
  List extends Inspect<Exclude<Callback, void>>[] | void = void
> extends Fn<{
    0: Fn;
    1: Inspect<Exclude<Callback, void>>[];
  }> {
  slot: [Callback, List];
  data: Every<this[0], this[1]>;
}
