import { Abs, And, Bit, IsPositive, Lt, Mod, Subtract } from "ts-arithmetic";
import { Includes, Size, ValueAt } from "../../array";
import { Concat, Stringify } from "../../string";

type Suffixes = ["th", "st", "nd", "rd"];

type Coordinate<
  Digit extends number,
  WithinRange extends Bit = Lt<Digit, Size<Suffixes>>,
  NotNegative extends Bit = IsPositive<Digit>
> = And<WithinRange, NotNegative> extends 1 ? ValueAt<Suffixes, Digit> : never;

type OrdinalHelper<
  NumberToOrdinal extends number,
  TensDigit extends number = Mod<Abs<NumberToOrdinal>, 100>,
  UnitsDigit extends number = Mod<Subtract<TensDigit, 20>, 10>
> = Stringify<NumberToOrdinal> extends infer R
  ? R extends string
    ? Includes<Suffixes, Coordinate<UnitsDigit>> extends 1
      ? Concat<R, Coordinate<UnitsDigit>>
      : Includes<Suffixes, Coordinate<TensDigit>> extends 1
      ? Concat<R, Coordinate<TensDigit>>
      : Concat<R, ValueAt<Suffixes, 0>>
    : never
  : never;

export type Ordinal<T extends number> = OrdinalHelper<T>;
