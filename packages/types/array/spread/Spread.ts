type SpreadHelper<
  T extends unknown[][],
  Result extends unknown[] = []
> = T extends [infer Head extends unknown[], ...infer Tail extends unknown[][]]
  ? SpreadHelper<Tail, [...Result, ...Head]>
  : Result;

export type Spread<T extends unknown[][]> = SpreadHelper<T>;
