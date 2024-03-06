import { Array } from "@ibnlanre/typings";
import { Subtract } from "ts-arithmetic";

type ToNumber<T extends any> = T extends string
  ? ParseInt<T>
  : T extends true
  ? 1
  : T extends false
  ? 0
  : T extends any[]
  ? Number.ToNumber<Array.Join<T, "">>
  : T extends number
  ? T
  : never;

type ParseInt<
  T extends string,
  U extends string = ""
> = T extends `${infer R}${infer N}`
  ? R extends "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    ? ParseInt<N, `${U}${R}`>
    : ParseInt<N, U>
  : U extends `${infer R extends number}`
  ? R
  : never;

type StripZeroHelper<
  T extends string,
  Count extends number
> = T extends `0${infer U}` ? StripZero<U, Subtract<Count, 1>> : T;

type StripZero<T extends string, Count extends number = -1> = Count extends -1
  ? T extends `0${infer U}`
    ? StripZeroHelper<U, Count>
    : T
  : Count extends 0
  ? T
  : StripZeroHelper<T, Count>;

export declare namespace Number {
  export { ToNumber, ParseInt, StripZero };
}
