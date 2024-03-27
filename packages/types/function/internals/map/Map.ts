import { Apply, Call, Fn, unset } from "@ibnlanre/types";

export type Map<fn extends Fn, list extends unknown[]> = (Fn & {
  data: {
    [K in keyof list]: Apply<fn, [list[K]]>;
  };
})["data"];

export interface TMap<
  fn extends Fn | unset = unset,
  list extends unknown[] | unset = unset
> extends Fn {
  slot: [fn, list];
  data: this[1] extends [
    infer head extends unknown,
    ...infer rest extends unknown[]
  ]
    ? [Apply<this[0], [head]>, ...Call<TMap<this[0], rest>>]
    : [];
}
