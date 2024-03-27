import { Fn } from "../fn";
import { Reset } from "../reset";

import { args, data, slot, unset } from "../symbol";

export interface IFilter<fn extends Fn, list extends unknown[]> extends Fn {
  [slot]: [fn, list];
  [data]: this[1] extends [infer head, ...infer rest]
    ? [
        Apply<this[0], [head]> extends 1 ? head : never,
        ...Call<IFilter<this[0], rest>>
      ]
    : [];
}

export { Apply, TApply } from "./apply";
export { Call, TCall } from "./call";
export { Map, TMap } from "./map";
export { Pipe, TPipe } from "./pipe";
