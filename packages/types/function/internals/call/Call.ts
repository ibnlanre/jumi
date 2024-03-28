import { Fn, Reset } from "@ibnlanre/types";

export type Call<Callback extends Fn> = (Callback & {
  args: Callback["slot"];
})["data"];

export interface TCall<Callback extends Fn | void = void> extends Fn {
  slot: [Callback];
  data: Call<this[0]>;
}
