type SplitHelper<
  S extends string,
  Delimiter extends string,
  Result extends string[] = []
> = S extends `${infer T}${Delimiter}${infer U}`
  ? SplitHelper<U, Delimiter, [...Result, T]>
  : Result;

export type Split<
  S extends string,
  Delimiter extends string = ""
> = S extends "" ? [] : SplitHelper<S, Delimiter>;
