import { Apply, Fn, Inspect } from "@ibnlanre/types";

export type Pipe<Item extends unknown, List extends Fn[]> = List extends [
  infer Callback extends Fn,
  ...infer Rest extends Fn[]
]
  ? Pipe<Apply<Callback, Item extends Inspect<Callback> ? Item : never>, Rest>
  : Item;

export interface TPipe<
  List extends Fn[] | void = void,
  Item extends unknown | void = void
> extends Fn {
  slot: [List, Item];
  data: Pipe<this[1], this[0]>;
}
