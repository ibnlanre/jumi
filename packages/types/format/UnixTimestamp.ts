import type { Number, Object } from "@ibnlanre/types";
import type { Add, Multiply, Subtract } from "ts-arithmetic";

import type { DateFormat } from "./DateFormat";
import type { IsLeapYear } from "./IsLeapYear";
import type { YearToDate } from "./YearToDate";

type LeapYearsSinceHelper<
  Year extends number,
  Period extends number,
  Stream extends number = 0
> = Year extends Period
  ? Stream
  : IsLeapYear<Year> extends 1
  ? LeapYearsSinceHelper<Subtract<Year, 1>, Period, Add<Stream, 1>>
  : LeapYearsSinceHelper<Subtract<Year, 1>, Period, Stream>;

type LeapYearsSince<
  Year extends number,
  Period extends number = 1970
> = LeapYearsSinceHelper<Subtract<Year, 1>, Period>;

export type UnixTimestamp<
  T extends Partial<DateFormat>,
  Epoch extends number = Subtract<
    Number.ToNumber<Object.Retrieve<T, "year">>,
    1970
  >,
  LeapYears extends number = LeapYearsSince<
    Number.ToNumber<Object.Retrieve<T, "year">>
  >,
  NonLeapYears extends number = Subtract<Epoch, LeapYears>,
  EpochDays extends number = Add<
    Multiply<NonLeapYears, 365>,
    Multiply<LeapYears, 366>
  >,
  DaysOfPeriod extends number = YearToDate<
    Number.ToNumber<Object.Retrieve<T, "year">>,
    Number.ToNumber<Object.Retrieve<T, "month">>,
    Number.ToNumber<Object.Retrieve<T, "day">>
  >,
  Days extends number = Add<EpochDays, Subtract<DaysOfPeriod, 1>>,
  Hours extends number = Subtract<
    Number.ToNumber<Object.Retrieve<T, "hour">>,
    1
  >,
  DaysToMilliseconds extends number = Multiply<Days, 86400000>,
  HoursToMilliseconds extends number = Add<
    DaysToMilliseconds,
    Multiply<Hours, 3600000>
  >,
  MinutesToMilliseconds extends number = Add<
    HoursToMilliseconds,
    Multiply<Number.ToNumber<Object.Retrieve<T, "minute">>, 60000>
  >,
  SecondsToMilliseconds extends number = Add<
    MinutesToMilliseconds,
    Multiply<Number.ToNumber<Object.Retrieve<T, "second">>, 1000>
  >,
  EpochToDate extends number = Add<
    SecondsToMilliseconds,
    Number.ToNumber<Object.Retrieve<T, "millisecond">>
  >
> = EpochToDate;
