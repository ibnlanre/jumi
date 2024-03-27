import { Fn, Reset, unset } from "@ibnlanre/types";

export type Apply<fn extends Fn, args extends unknown> = (fn & {
  args: Reset<fn["slot"], args>;
})["data"];

export interface TApply<
  fn extends Fn | unset = unset,
  args extends unknown | unset = unset
> extends Fn {
  slot: [fn, args];
  data: fn extends Fn ? Apply<this[0], this[1]> : never;
}
