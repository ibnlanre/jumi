import { Apply, Call, Fn, TModulo } from "@ibnlanre/types";
import { Inspect } from "../../symbol";

export type Map<Callback extends Fn, List extends Inspect<Callback>[]> = (Fn & {
  data: {
    [K in keyof List]: List[K] extends Inspect<Callback>
      ? Apply<Callback, List[K]>
      : "Invalid argument type";
  };
})["data"];

export interface TMap<
  Callback extends Fn | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Callback, List];
  data: Map<this[0], this[1]>;
}

type Test = Call<TMap<TModulo, [[2, 3], [3]]>>;
