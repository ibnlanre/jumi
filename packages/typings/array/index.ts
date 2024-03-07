import type { String, Number } from "@ibnlanre/typings";
import type { SpliceHelper } from "./SpliceHelper";

type IndexAt<
  Spread extends string[],
  T extends number,
  Length extends string[] = []
> = `${T}` extends `-${infer N extends number}`
  ? Spread["length"] extends N
    ? Length["length"]
    : Spread extends [infer Part extends string, ...infer Rest extends string[]]
    ? IndexAt<Rest, T, [...Length, Part]>
    : never
  : T;

type Splice<
  T extends string[],
  Start extends number,
  End extends number
> = SpliceHelper<T, IndexAt<T, Start>, IndexAt<T, End>>;

type Reverse<T extends any[]> = T extends [infer F, ...infer R]
  ? [...Reverse<R>, F]
  : [];

type Join<
  T extends any[],
  Delimiter extends string = ",",
  U extends string = ""
> = T extends [infer Head extends string, ...infer Tail extends any[]]
  ? Join<
      Tail,
      Delimiter,
      U extends ""
        ? String.ToString<Head>
        : `${U}${Delimiter}${String.ToString<Head>}`
    >
  : U;

type Push<T extends any[], V> = [...T, V];

type Includes<T extends any[], U> = T extends [T[0], ...infer Rest]
  ? Number.IsEqual<T[0], U> extends 1
    ? 1
    : Includes<Rest, U>
  : 0;

export declare namespace Array {
  export { Splice, Reverse, Join, Push, Includes };
}
