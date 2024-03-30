import { ArrayOfLength, Fn } from "@ibnlanre/types";
import { Subtract } from "ts-arithmetic";

type Chunk<T extends unknown[], V extends unknown> = V extends unknown[]
  ? T extends [...infer L, ...ArrayOfLength<Subtract<T["length"], V["length"]>>]
    ? MarkOut<V, L>
    : never
  : never;

type MarkOut<List extends unknown[], Types> = List extends [
  ...infer Ls,
  infer Lv
]
  ? Types extends [...infer Ts, infer Tv]
    ? [void] extends [Lv]
      ? [...MarkOut<Ls, Ts>, Tv]
      : MarkOut<Ls, Ts>
    : []
  : [];

export type Inspect<Callback extends Fn> = Chunk<
  Callback["params"],
  Callback["slot"]
>;
