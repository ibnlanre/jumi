export type ExtractNestedKeys<
  T extends string,
  Delimiter extends string = "."
> = T extends `${string}${Delimiter}${infer R}` ? R : T;

export type ExtractRootKey<
  T extends string,
  Delimiter extends string = "."
> = T extends `${infer R}${Delimiter}${string}` ? R : T;

// type Test = ObjectsFromPaths<"a.b.c", number>;
