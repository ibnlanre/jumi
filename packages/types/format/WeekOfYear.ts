import type { Number } from "@ibnlanre/types";
import type { Add, Divide } from "ts-arithmetic";

import type { DayOfWeek } from "./DayOfWeek";
import type { DayOfYear } from "./DayOfYear";

type GregorianWeekOfYearHelper<
  Year extends string,
  Month extends string,
  Day extends string,
  DayOfTheYear extends number = DayOfYear<
    Number.ToNumber<Year>,
    Number.ToNumber<Month>,
    Number.ToNumber<Day>
  >
> = Number.Ceil<Divide<DayOfTheYear, 7>>;

type GregorianWeekOfYear<
  Year extends string,
  Month extends string,
  Day extends string
> = GregorianWeekOfYearHelper<Year, Month, Day>;

type ISOWeekOfYearHelper<
  Year extends string,
  Month extends string,
  Day extends string,
  DayOfTheWeek extends number = Add<
    DayOfWeek<Year, Month, Day, "Gregorian">,
    5
  >,
  DayOfTheYear extends number = DayOfYear<
    Number.ToNumber<Year>,
    Number.ToNumber<Month>,
    Number.ToNumber<Day>
  >
> = Number.Floor<Divide<Add<DayOfTheYear, DayOfTheWeek>, 7>>;

type ISOWeekOfYear<
  Year extends string,
  Month extends string,
  Day extends string
> = ISOWeekOfYearHelper<Year, Month, Day>;

export type WeekOfYear<
  Year extends string,
  Month extends string,
  Day extends string,
  Calendar extends "Gregorian" | "ISO" = "Gregorian"
> = Calendar extends "Gregorian"
  ? GregorianWeekOfYear<Year, Month, Day>
  : ISOWeekOfYear<Year, Month, Day>;

type Test = WeekOfYear<"2019", "08", "05", "ISO">;
