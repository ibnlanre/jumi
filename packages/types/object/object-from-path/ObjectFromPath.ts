export type ObjectFromPath<
  T extends string,
  Value,
  Delimiter extends string = "."
> = T extends `${infer Head}${Delimiter}${infer Tail}`
  ? { [K in Head]: ObjectFromPath<Tail, Value> }
  : { [K in T]: Value };
