import { Fn, Reset } from "@ibnlanre/types";

export type Apply<CallBack extends Fn, List extends unknown> = (CallBack & {
  args: Reset<CallBack["slot"], List>;
})["data"];

export interface TApply<
  CallBack extends Fn | void = void,
  List extends unknown | void = void
> extends Fn {
  slot: [CallBack, List];
  data: Apply<this[0], this[1]>;
}
