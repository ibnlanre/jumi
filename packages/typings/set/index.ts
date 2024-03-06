import { Array } from "@ibnlanre/typings";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

type UnionToTuple<T, L = LastOf<T>, N = Exclude<T, L>> = [L] extends [never]
  ? []
  : Array.Push<UnionToTuple<N>, L>;

type Intersect<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
} & {};
export declare namespace Set {
  export { Intersect, LastOf, UnionToIntersection, UnionToTuple };
}
