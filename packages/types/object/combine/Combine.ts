import { Merge, Paths } from "@ibnlanre/types";

type CombineHelper<
  Source extends Record<string, any>[] | Record<string, any>,
  Result extends Record<string, any> = {}
> = Source extends [
  infer Head extends Record<string, any>,
  ...infer Rest extends Record<string, any>[]
]
  ? CombineHelper<Rest, Merge<Result, Head>>
  : Source extends []
  ? Result
  : Merge<Result, Source>;

export type Combine<
  Source extends Record<string, any>[] | Record<string, any>
> = CombineHelper<Source>;
