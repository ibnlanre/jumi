export type ExtractRootKey<
  T extends string,
  Delimiter extends string = "."
> = T extends `${infer R}${Delimiter}${string}` ? R : T;
