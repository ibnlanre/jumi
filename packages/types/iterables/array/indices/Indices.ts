export type Indices<T extends any[]> = Exclude<
  keyof T,
  keyof any[]
> extends `${infer R extends number}`
  ? R
  : never;
