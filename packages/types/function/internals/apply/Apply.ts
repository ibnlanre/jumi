import { Fn } from "@ibnlanre/types";
import { Inspect, Select } from "../../symbol";

export type Apply<
  Callback extends Fn,
  List extends Inspect<Callback>
> = (Callback & {
  args: List extends Inspect<Callback>
    ? Select<Callback["slot"], List>
    : "Invalid argument type";
})["data"];

export interface TApply<
  Callback extends Fn,
  List extends Inspect<Callback> | void = void
> extends Fn {
  slot: [Callback, List];
  data: Apply<this[0], this[1]>;
}
