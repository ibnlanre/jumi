import type { Add, Subtract } from "ts-arithmetic";
import type { DaysInMonth } from "./DaysInMonth";

type YearToDateHelper<
  Year extends number,
  Month extends number,
  Stream extends number
> = Month extends 0
  ? Stream
  : YearToDateHelper<
      Year,
      Subtract<Month, 1>,
      Add<Stream, DaysInMonth<Month, Year>>
    >;

export type YearToDate<
  Year extends number,
  Month extends number,
  Day extends number
> = YearToDateHelper<Year, Subtract<Month, 1>, Day>;
