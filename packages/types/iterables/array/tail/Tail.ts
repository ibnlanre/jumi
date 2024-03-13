export type Tail<T extends string | any[]> = T extends [any, ...infer Tail]
  ? Tail
  : never;
