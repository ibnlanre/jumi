import { Array, Set } from "@ibnlanre/typings";
import {
  Abs,
  And,
  IsNegative,
  IsPositive,
  Lt,
  LtOrEq,
  Mod,
  Subtract,
} from "ts-arithmetic";

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

type Length<T extends string | string[]> = T extends string
  ? Split<T>["length"]
  : T["length"];

type Concat<T, U extends string> = T extends string
  ? `${T}${U}`
  : T extends never
  ? U
  : Concat<String.ToString<T>, U>;

type ValueAt<T extends object, U extends number> = U extends keyof T
  ? T[U]
  : never;

type OrdinalHelper = ["th", "st", "nd", "rd"];

type Ordinal<
  T extends number,
  U extends number = Mod<Abs<T>, 100>,
  V extends number = Mod<Subtract<U, 20>, 10>,
  UWithinRange = Lt<U, Length<OrdinalHelper>>,
  VWithinRange = Lt<V, Length<OrdinalHelper>>
> = And<VWithinRange, IsPositive<V>> extends 1
  ? V //Concat<T, ValueAt<OrdinalHelper, V>>
  : UWithinRange extends 1
  ? Concat<T, ValueAt<OrdinalHelper, U>>
  : Concat<T, ValueAt<OrdinalHelper, 0>>;

type XI = Ordinal<11>;

export declare namespace String {
  export { Slice, Split, ToString, Length, Replace };
}
