import { Apply, Fn } from "@ibnlanre/types";

export type Map<Callback extends Fn, List extends unknown[]> = (Fn & {
  data: {
    [K in keyof List]: Apply<Callback, [List[K]]>;
  };
})["data"];

export interface TMap<
  Callback extends Fn | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Callback, List];
  data: Map<this[0], this[1]>;
}
