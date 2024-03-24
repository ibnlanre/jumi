export type ExtractNestedKeys<
  T extends string,
  Delimiter extends string = "."
> = T extends `${string}${Delimiter}${infer R}` ? R : T;
