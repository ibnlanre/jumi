export type SplitDelimitedKeys<
  T extends string,
  K extends string | number | symbol,
  Delimiter extends string = "."
> = T extends `${K extends string | number ? K : never}${Delimiter}${infer R}`
  ? R
  : T;
