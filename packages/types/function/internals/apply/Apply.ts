import { Fn, Inspect, Select } from "@ibnlanre/types";

export type Apply<
  Callback extends Fn,
  List extends Inspect<Callback>[]
> = (Callback & {
  args: List extends Inspect<Callback>[]
    ? Select<Callback["slot"], List>
    : never;
})["data"];

export interface TApply<
  Callback extends Fn | void = void,
  List extends Inspect<Exclude<Callback, void>> | void = void
> extends Fn<{
    0: Fn;
    1: Inspect<Exclude<Callback, void>>;
  }> {
  slot: [Callback, List];
  data: Apply<this[0], this[1]>;
}
