import { Subtract } from "ts-arithmetic";

type TrimEndHelper<
  T extends string,
  Count extends number,
  Letter extends string = "0"
> = T extends `${infer U}${Letter}`
  ? TrimEnd<U, Subtract<Count, 1>, Letter>
  : T;

export type TrimEnd<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = Count extends -1
  ? T extends `${infer U}${Letter}`
    ? TrimEndHelper<U, Count, Letter>
    : T
  : Count extends 0
  ? T
  : TrimEndHelper<T, Count, Letter>;
