type ArrayOfLengthHelper<
  Length extends number,
  Result extends unknown[] = []
> = Result["length"] extends Length
  ? Result
  : ArrayOfLengthHelper<Length, [any, ...Result]>;

export type ArrayOfLength<Length extends number> = ArrayOfLengthHelper<Length>;
