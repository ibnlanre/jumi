import { Subtract } from "ts-arithmetic";

type TrimStartHelper<
  T extends string,
  Count extends number,
  Letter extends string = "0"
> = T extends `${Letter}${infer U}`
  ? TrimStart<U, Subtract<Count, 1>, Letter>
  : T;

export type TrimStart<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = Count extends -1
  ? T extends `${Letter}${infer U}`
    ? TrimStartHelper<U, Count, Letter>
    : T
  : Count extends 0
  ? T
  : TrimStartHelper<T, Count, Letter>;
