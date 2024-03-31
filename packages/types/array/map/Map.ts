import { Apply, Fn, Inspect } from "@ibnlanre/types";

export type Map<
  Callback extends Fn,
  List extends Inspect<Callback>[]
> = List extends [infer Element, ...infer Rest extends Inspect<Callback>[]]
  ? Element extends Inspect<Callback>
    ? [Apply<Callback, [Element]>, ...Map<Callback, Rest>]
    : [never, ...Map<Callback, Rest>]
  : [];

export interface TMap<
  Callback extends Fn | void = void,
  List extends Inspect<Exclude<Callback, void>> | void = void
> extends Fn<{
    0: Fn;
    1: Inspect<Exclude<Callback, void>>;
  }> {
  slot: [Callback, List];
  data: Map<this[0], this[1]>;
}
