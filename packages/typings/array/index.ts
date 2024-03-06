import type { String } from "@ibnlanre/typings";
import type { SpliceHelper } from "./SpliceHelper";

export declare namespace Array {
  export {};

  export type IndexAt<
    Spread extends string[],
    T extends number,
    Length extends string[] = []
  > = `${T}` extends `-${infer N extends number}`
    ? Spread["length"] extends N
      ? Length["length"]
      : Spread extends [
          infer Part extends string,
          ...infer Rest extends string[]
        ]
      ? IndexAt<Rest, T, [...Length, Part]>
      : never
    : T;

  export type Splice<
    T extends string[],
    Start extends number,
    End extends number
  > = SpliceHelper<T, IndexAt<T, Start>, IndexAt<T, End>>;

  export type Reverse<T extends any[]> = T extends [infer F, ...infer R]
    ? [...Reverse<R>, F]
    : [];

  export type Join<
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

  export type Push<T extends any[], V> = [...T, V];
}
