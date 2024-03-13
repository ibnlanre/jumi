type Suffixes = ["th", "st", "nd", "rd"];

type Coordinate<
  Digit extends number,
  WithinRange extends number = Lt<Digit, String.Length<Suffixes>>,
  NotNegative extends number = IsPositive<Digit>
> = And<WithinRange, NotNegative> extends 1
  ? Object.ValueAt<Suffixes, Digit>
  : never;

type OrdinalHelper<
  NumberToOrdinal extends number,
  TensDigit extends number = Mod<Abs<NumberToOrdinal>, 100>,
  UnitsDigit extends number = Mod<Subtract<TensDigit, 20>, 10>
> = Array.Includes<Suffixes, Coordinate<UnitsDigit>> extends 1
  ? String.Concat<NumberToOrdinal, Coordinate<UnitsDigit>>
  : Array.Includes<Suffixes, Coordinate<TensDigit>> extends 1
  ? String.Concat<NumberToOrdinal, Coordinate<TensDigit>>
  : String.Concat<NumberToOrdinal, Object.ValueAt<Suffixes, 0>>;

type Ordinal<T extends number> = OrdinalHelper<T>;
