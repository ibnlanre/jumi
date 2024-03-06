import { Array } from "@ibnlanre/typings";

export declare namespace Set {
  export {};

  export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type LastOf<T> = UnionToIntersection<
    T extends any ? () => T : never
  > extends () => infer R
    ? R
    : never;

  export type UnionToTuple<T, L = LastOf<T>, N = Exclude<T, L>> = [L] extends [
    never
  ]
    ? []
    : Array.Push<UnionToTuple<N>, L>;

  export type Intersect<T extends Record<string, any>> = {
    [K in keyof T]: T[K];
  } & {};
}
