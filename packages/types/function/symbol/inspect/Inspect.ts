import { ArrayOf, Fn } from "@ibnlanre/types";
import { Subtract } from "ts-arithmetic";

type SingleOut<List extends unknown[]> = List extends [infer Value]
  ? Value
  : List;

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

export type Inspect<Callback extends Fn> = Callback["params"] extends unknown[]
  ? Callback["slot"] extends unknown[]
    ? Callback["params"] extends [
        ...infer List,
        ...ArrayOf<
          Subtract<Callback["params"]["length"], Callback["slot"]["length"]>
        >
      ]
      ? SingleOut<MarkOut<Callback["slot"], List>>
      : never
    : never
  : never;
