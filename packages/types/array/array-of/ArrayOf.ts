import { Fn } from "@ibnlanre/types";

type ArrayOfHelper<
  Length extends number,
  Value extends unknown,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : ArrayOfHelper<Length, Value, [Value, ...Result]>;

export type ArrayOf<
  Length extends number,
  Value extends unknown = any
> = ArrayOfHelper<Length, Value>;

export interface TArrayOf<
  Length extends number | void = void,
  Value extends unknown | void = void
> extends Fn<{
    0: number;
    1: unknown;
  }> {
  slot: [Length, Value];
  data: ArrayOf<this[0], this[1]>;
}
