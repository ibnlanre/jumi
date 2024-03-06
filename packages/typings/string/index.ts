import { Array, Set } from "@ibnlanre/typings";

type Slice<
  T extends string,
  Start extends number,
  End extends number
> = Array.Splice<Split<T>, Start, End>;

type SplitHelper<
  S extends string,
  Delimiter extends string,
  Result extends string[] = []
> = S extends `${infer T}${Delimiter}${infer U}`
  ? SplitHelper<U, Delimiter, Array.Push<Result, T>>
  : Array.Push<Result, S>;

type Split<S extends string, Delimiter extends string = ""> = S extends ""
  ? []
  : SplitHelper<S, Delimiter>;

// type Split<S extends string, Delimiter extends string = ""> = S extends ""
//   ? []
//   : S extends `${infer T}${Delimiter}${infer U}`
//   ? [T, ...Split<U, Delimiter>]
//   : [S];

type Stringable =
  | string
  | number
  | boolean
  | any[]
  | Record<string, any>
  | null;

type ToObjectString<T extends Record<string, any>> = Array.Join<
  Set.UnionToTuple<
    {
      [K in keyof T]: `${ToString<K>}: ${ToString<T[K]>}`;
    }[keyof T]
  >,
  ", "
>;

type ToString<T> = T extends string
  ? T
  : T extends number
  ? `${T}`
  : T extends boolean
  ? `${T}`
  : T extends any[]
  ? `[${Array.Join<T>}]`
  : T extends Record<string, any>
  ? ToObjectString<T>
  : T extends null
  ? "null"
  : never;

type Length<T extends string> = Split<T>["length"];

type XI = Length<"fjhbvfilughlafisudbkhofuiagukbuguoiglhdfsauglafd">;

export declare namespace String {
  export { Slice, Split, Stringable, ToObjectString, ToString };
}
