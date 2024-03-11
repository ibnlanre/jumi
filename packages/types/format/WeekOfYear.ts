import type { Number } from "@ibnlanre/types";
import type { Add, Divide, Mod, Subtract } from "ts-arithmetic";
import { DayOfWeek } from "./DayOfWeek";
import type { IsLeapYear } from "./IsLeapYear";
import type { YearToDate } from "./YearToDate";

export type WeekOfYear<
  Year extends string,
  Month extends string,
  Day extends string
> = Divide<
  YearToDate<
    Number.ToNumber<Year>,
    Number.ToNumber<Month>,
    Number.ToNumber<Day>
  >,
  7
> extends infer R extends number
  ? Number.Floor<Mod<Add<R, 1>, 53>> extends infer P
    ? P extends 0
      ? IsLeapYear<Number.ToNumber<Year>> extends 1
        ? 53
        : 52
      : P
    : never
  : never;

export type ISOWeekOfYear<
  Year extends string,
  Month extends string,
  Day extends string,
  ZYear extends number = Number.ToNumber<Year>,
  WeekDay extends number = Number.ToNumber<DayOfWeek<Year, Month, Day>>,
  OrdinalDate extends number = YearToDate<
    Number.ToNumber<Year>,
    Number.ToNumber<Month>,
    Number.ToNumber<Day>
  >
> = Number.Floor<
  Divide<Subtract<OrdinalDate, WeekDay>, 7>
> extends infer R extends number
  ? IsLeapYear<ZYear> extends 1
    ? Add<53, R>
    : R
  : never;

type Test = ISOWeekOfYear<"2020", "01", "01">;

type X = Number.Floor<Divide<1, 7>>;
