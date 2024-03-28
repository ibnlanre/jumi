import { Apply, Call, Fn, IsExactType } from "@ibnlanre/types";

export type Filter<Left extends any[], Right> = Left extends [
  infer Head,
  ...infer Rest
]
  ? IsExactType<Head, Right> extends 1
    ? [Head, ...Filter<Rest, Right>]
    : Filter<Rest, Right>
  : [];

export interface TFilter<
  Callback extends Fn | void = void,
  list extends unknown[] | void = void
> extends Fn {
  slot: [Callback, list];
  data: this[1] extends [infer head, ...infer rest]
    ? Apply<this[0], [head]> extends 1
      ? [head, ...Call<TFilter<this[0], rest>>]
      : Call<TFilter<this[0], rest>>
    : [];
}
