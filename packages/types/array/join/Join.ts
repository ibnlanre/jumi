import { Fn, Stringify } from "@ibnlanre/types";

export type Join<T extends any[], Separator extends string = ""> = T extends [
  infer Head,
  ...infer Rest
]
  ? Rest extends []
    ? Head
    : `${Stringify<Head>}${Separator}${Join<Rest, Separator>}`
  : "";

export interface TJoin<
  Separator extends string | void = void,
  List extends unknown[] | void = void
> extends Fn {
  slot: [Separator, List];
  data: Join<this[1], this[0]>;
}
