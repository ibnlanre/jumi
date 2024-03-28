import { Fn, Reset, unset } from "@ibnlanre/types";

export type Call<Callback extends Fn> = (Callback & {
  args: Reset<Callback["slot"]>;
})["data"];

export interface TCall<Callback extends Fn | unset = unset> extends Fn {
  slot: [Callback];
  data: Call<this[0]>;
}
