import { Apply, Fn } from "@ibnlanre/types";

export type Pipe<Item extends unknown, List extends Fn[]> = (Fn & {
  data: List extends [infer Head extends Fn, ...infer Rest extends Fn[]]
    ? Pipe<Apply<Head, [Item]>, Rest>
    : Item;
})["data"];

export interface TPipe<
  List extends Fn[] | void = void,
  Item extends unknown | void = void
> extends Fn {
  slot: [List, Item];
  data: Pipe<this[1], this[0]>;
}
