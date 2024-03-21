export type IsNever<T> = [T] extends [never] ? 1 : 0;
