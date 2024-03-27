import { Fn, Reset, unset } from "@ibnlanre/types";

export type Call<fn extends Fn> = (fn & {
  args: Reset<fn["slot"]>;
})["data"];

export interface TCall<fn extends Fn | unset = unset> extends Fn {
  slot: [fn];
  data: fn extends Fn ? Call<this[0]> : never;
}
