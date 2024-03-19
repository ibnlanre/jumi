export type Intersect<T> = {
  [K in keyof T]: T[K];
} & {};
