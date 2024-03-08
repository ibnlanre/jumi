import { Array, Object, String } from "@ibnlanre/typings";
import {
  Abs,
  Add,
  Divide,
  Gt,
  IsPositive,
  Lt,
  Mod,
  Pow,
  Subtract,
} from "ts-arithmetic";

type Integers = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Diff<T extends number, U extends number, Len extends number> = Pow<
  10,
  Subtract<Len, U>
> extends infer R extends number
  ? Divide<T, R>
  : never;

type ParseIntHelper<
  T extends string,
  Pos extends number = 0,
  Length extends number = String.Length<T>
> = T extends `${infer R extends number}`
  ? And<Gt<Pos, 0>, Lt<Pos, Length>> extends 1
    ? Diff<R, Pos, Length>
    : R
  : never;

type ToNumberHelper<
  T extends string,
  U extends string = "",
  Pos extends number = 0
> = T extends `${infer R}${infer N}`
  ? R extends Integers
    ? U extends "0"
      ? ToNumberHelper<N, R, Pos>
      : ToNumberHelper<N, `${U}${R}`, Pos>
    : R extends "."
    ? ToNumberHelper<N, U, String.Length<U>>
    : ToNumberHelper<N, U, Pos>
  : ParseIntHelper<U, Pos>;

type ToNumber<T extends any> = T extends string
  ? ToNumberHelper<T>
  : T extends true
  ? 1
  : T extends false
  ? 0
  : T extends any[]
  ? ToNumber<Array.Join<T, "">>
  : T extends number
  ? T
  : never;

type ParseInt<
  T extends string | number,
  N extends string = T extends string ? T : `${T}`,
  U extends number = ToNumber<String.TrimStart<N>>
> = `${U}` extends `${infer R extends number}.${string}` ? R : U;

type And<T extends number, U extends number> = T extends 1
  ? U extends 1
    ? 1
    : 0
  : 0;

type Suffixes = ["th", "st", "nd", "rd"];

type OrdinalHelper<
  V extends number,
  WithinRange extends number = Lt<V, String.Length<Suffixes>>,
  NotNegative extends number = IsPositive<V>
> = And<WithinRange, NotNegative> extends 1
  ? Object.ValueAt<Suffixes, V>
  : never;

type Ordinal<
  T extends number,
  U extends number = Mod<Abs<T>, 100>,
  V extends number = Mod<Subtract<U, 20>, 10>
> = Array.Includes<Suffixes, OrdinalHelper<V>> extends 1
  ? String.Concat<T, OrdinalHelper<V>>
  : Array.Includes<Suffixes, OrdinalHelper<U>> extends 1
  ? String.Concat<T, OrdinalHelper<U>>
  : String.Concat<T, Object.ValueAt<Suffixes, 0>>;

type IsEqual<T, U> = T extends U ? (U extends T ? 1 : 0) : 0;

type Floor<T extends number, U extends number> = Subtract<T, Mod<T, U>>;
type Ceil<T extends number, U extends number> = Add<Floor<T, U>, U>;

export declare namespace Number {
  export { ToNumber, ParseInt, And, Ordinal, IsEqual, Floor, Ceil };
}
