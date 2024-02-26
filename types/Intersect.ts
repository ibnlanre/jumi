/**
 * Pretty prints a type.
 * @template T The type to pretty print.
 */
export type Intersect<T> = {
  [K in keyof T]: T[K];
} & {};
