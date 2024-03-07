import { Array, Set } from "@ibnlanre/typings";
import { Subtract } from "ts-arithmetic";

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
  : Result;

type Split<S extends string, Delimiter extends string = ""> = S extends ""
  ? []
  : SplitHelper<S, Delimiter>;

export type Replace<
  S extends string,
  Find extends string,
  Replace extends string
> = S extends `${infer T}${Find}${infer U}` ? `${T}${Replace}${U}` : S;

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

type Concat<T, U extends string> = T extends string
  ? `${T}${U}`
  : T extends never
  ? U
  : Concat<String.ToString<T>, U>;

type Length<T extends string | string[]> = T extends string
  ? Split<T>["length"]
  : T["length"];

type Contains<
  T extends string,
  U extends string
> = T extends `${string}${U}${string}` ? 1 : 0;

type InsertAt<
  T extends string,
  U extends string,
  Index extends number
> = `${Slice<T, 0, Index>}${U}${Slice<T, Index, Length<T>>}`;

type StartsWith<T extends string, U extends string> = T extends `${U}${string}`
  ? 1
  : 0;

type TrimStartHelper<
  T extends string,
  Count extends number,
  Letter extends string = "0"
> = T extends `${Letter}${infer U}`
  ? TrimStart<U, Subtract<Count, 1>, Letter>
  : T;

type TrimStart<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = Count extends -1
  ? T extends `${Letter}${infer U}`
    ? TrimStartHelper<U, Count, Letter>
    : T
  : Count extends 0
  ? T
  : TrimStartHelper<T, Count, Letter>;

type TrimEndHelper<
  T extends string,
  Count extends number,
  Letter extends string = "0"
> = T extends `${infer U}${Letter}`
  ? TrimEnd<U, Subtract<Count, 1>, Letter>
  : T;

type TrimEnd<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = Count extends -1
  ? T extends `${infer U}${Letter}`
    ? TrimEndHelper<U, Count, Letter>
    : T
  : Count extends 0
  ? T
  : TrimEndHelper<T, Count, Letter>;

type Trim<
  T extends string,
  Count extends number = -1,
  Letter extends string = "0"
> = TrimStart<TrimEnd<T, Count, Letter>, Count, Letter>;

type EndsWith<T extends string, U extends string> = T extends `${string}${U}`
  ? 1
  : 0;

export declare namespace String {
  export {
    Slice,
    Split,
    ToString,
    Length,
    Replace,
    Concat,
    Contains,
    StartsWith,
    EndsWith,
    InsertAt,
    TrimStart,
    TrimEnd,
    Trim,
  };
}
