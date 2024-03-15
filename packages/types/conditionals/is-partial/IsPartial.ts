export type IsPartial<T> = undefined extends T
  ? [T] extends [undefined]
    ? 0
    : 1
  : 0;
