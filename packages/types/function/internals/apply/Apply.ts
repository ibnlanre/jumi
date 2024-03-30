import { Fn, Inspect, Select } from "@ibnlanre/types";

export type Apply<
  Callback extends Fn,
  List extends Inspect<Callback>
> = (Callback & {
  args: List extends Inspect<Callback>
    ? Select<Callback["slot"], List extends unknown[] ? List : [List]>
    : never;
})["data"];

export interface TApply<
  Callback extends Fn,
  List extends Inspect<Callback> | void = void
> extends Fn {
  slot: [Callback, List];
  data: Apply<this[0], this[1]>;
}
