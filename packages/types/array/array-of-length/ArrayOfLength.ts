import { Fn } from "@ibnlanre/types";

type ArrayOfLengthHelper<
  Length extends number,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : ArrayOfLengthHelper<Length, [any, ...Result]>;

export type ArrayOfLength<Length extends number> = ArrayOfLengthHelper<Length>;

export interface TArrayOfLength<Length extends number | void = void>
  extends Fn {
  slot: [Length];
  data: [this[0]] extends [never] ? [] : ArrayOfLength<this[0]>;
}
