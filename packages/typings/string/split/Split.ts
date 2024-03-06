export type Split<
  S extends string,
  Delimiter extends string = ""
> = S extends ""
  ? []
  : S extends `${infer T}${Delimiter}${infer U}`
  ? [T, ...Split<U, Delimiter>]
  : [S];
