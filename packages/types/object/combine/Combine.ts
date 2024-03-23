import { Merge } from "@ibnlanre/types";

type CombineHelper<
  Source extends Record<string, any>[] | Record<string, any>,
  Result extends Record<string, any> = {}
> = Source extends [
  ...infer Rest extends Record<string, any>[],
  infer Tail extends Record<string, any>
]
  ? CombineHelper<Rest, Merge<Result, Tail>>
  : Source extends []
  ? Result
  : Merge<Result, Source>;

export type Combine<
  Source extends Record<string, any>[] | Record<string, any>
> = CombineHelper<Source>;
