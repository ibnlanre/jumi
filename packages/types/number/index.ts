import { Array, Object, String } from "@ibnlanre/types";
import {
  Abs,
  Divide,
  Gt,
  IsPositive,
  Lt,
  Mod,
  Multiply,
  Pow,
  Subtract,
} from "ts-arithmetic";
import { Ceil } from "./ceil";
import { Floor } from "./floor";

type Integers = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Diff<T extends number, U extends number, Len extends number> = Pow<
  10,
  Subtract<Len, U>
> extends infer R extends number
  ? Divide<T, R>
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
  : U extends `${infer R extends number}`
  ? And<Gt<Pos, 0>, Lt<Pos, String.Length<U>>> extends 1
    ? Diff<R, Pos, String.Length<U>>
    : R
  : never;

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

export declare namespace Number {
  export { ToNumber, ParseInt, And, Ordinal, Floor, Ceil };
}
