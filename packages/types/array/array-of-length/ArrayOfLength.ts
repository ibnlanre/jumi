import { data, Fn, slot, unset } from "@ibnlanre/types";

type ArrayOfLengthHelper<
  Length extends number,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : ArrayOfLengthHelper<Length, [any, ...Result]>;

export type ArrayOfLength<Length extends number> = ArrayOfLengthHelper<Length>;

export interface IArrayOfLength<Length extends number | unset = unset>
  extends Fn {
  [slot]: [Length];
  [data]: [this[0]] extends [never] ? [] : ArrayOfLength<this[0]>;
}
