import { Number, String } from "@ibnlanre/typings";
import { Add, Mod, Subtract } from "ts-arithmetic";

import { CenturyCode } from "./CenturyCode";
import { DayCode } from "./DayCode";
import { LeapYearCode } from "./LeapYearCode";
import { MonthCode } from "./MonthCode";
import { YearCode } from "./YearCode";

type DayOfWeekHelper<
  Year extends number,
  Month extends number,
  Day extends number,
  Century extends number,
  LeapYear extends number
> = Mod<Subtract<Add<Add<Add<Year, Month>, Day>, Century>, LeapYear>, 7>;

export type DayOfWeek<
  Year extends string,
  Month extends string,
  Day extends string
> = String.ToString<
  DayOfWeekHelper<
    Number.ToNumber<YearCode<String.Slice<Year, 2, 4>>>,
    Number.ToNumber<MonthCode<Month>>,
    Number.ToNumber<DayCode<Day>>,
    Number.ToNumber<CenturyCode<String.Slice<Year, 0, 2>>>,
    Number.ToNumber<LeapYearCode<String.Slice<Year, 2, 4>>>
  >
>;
