import { Apply, Fn, Inspect } from "@ibnlanre/types";

export type Some<
  Callback extends Fn,
  List extends Inspect<Callback>[]
> = List extends []
  ? 0
  : List extends [infer Element, ...infer Rest extends Inspect<Callback>[]]
  ? Element extends Inspect<Callback>
    ? Apply<Callback, Element> extends 1
      ? 1
      : Some<Callback, Rest>
    : 0
  : 0;

export interface TSome<
  Callback extends Fn | void = void,
  List extends Inspect<Exclude<Callback, void>> | void = void
> extends Fn<{
    0: Fn;
    1: Inspect<Exclude<Callback, void>>;
  }> {
  slot: [Callback, List];
  data: Some<this[0], this[1]>;
}
