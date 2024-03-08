import type { Add, Subtract } from "ts-arithmetic";
import type { DaysInMonth } from "./DaysInMonth";

type DayOfYearHelper<
  Year extends number,
  Month extends number,
  Stream extends number
> = Month extends 0
  ? Stream
  : DayOfYearHelper<
      Year,
      Subtract<Month, 1>,
      Add<Stream, DaysInMonth<Month, Year>>
    >;

export type DayOfYear<
  Year extends number,
  Month extends number,
  Day extends number
> = DayOfYearHelper<Year, Subtract<Month, 1>, Day>;
