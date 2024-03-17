import type { Get, ParseInt } from "@ibnlanre/types";
import type { Add, Multiply, Subtract } from "ts-arithmetic";

import type { DateFormat } from "./DateFormat";
import type { DayOfYear } from "./day-of-year";
import type { IsLeapYear } from "./IsLeapYear";

type DaysToMs<Days extends number> = Multiply<Days, 86400000>;
type HoursToMs<Hours extends number> = Multiply<Hours, 3600000>;
type MinutesToMs<Minutes extends number> = Multiply<Minutes, 60000>;
type SecondsToMs<Seconds extends number> = Multiply<Seconds, 1000>;

type LeapYearsSinceHelper<
  Year extends number,
  Period extends number,
  Stream extends number = 0
> = Year extends Period
  ? Stream
  : LeapYearsSinceHelper<
      Subtract<Year, 1>,
      Period,
      IsLeapYear<Year> extends 1 ? Add<Stream, 1> : Stream
    >;

type LeapYearsSince<
  Year extends number,
  Period extends number = 1970
> = LeapYearsSinceHelper<Subtract<Year, 1>, Period> extends infer R
  ? R extends number
    ? R
    : never
  : never;

type EpochToDateInMs<
  Days extends number,
  Hours extends number,
  Minutes extends number,
  Seconds extends number,
  Milliseconds extends number
> = Add<Add<Add<Add<Days, Hours>, Minutes>, Seconds>, Milliseconds>;

type UnixTimestampHelper<
  T extends DateFormat,
  Year extends number = ParseInt<Get<T, "year">>,
  Month extends number = ParseInt<Get<T, "month">>,
  Day extends number = ParseInt<Get<T, "day">>,
  Hour extends number = ParseInt<Get<T, "hour">>,
  Minutes extends number = ParseInt<Get<T, "minute">>,
  Seconds extends number = ParseInt<Get<T, "second">>,
  Milliseconds extends number = ParseInt<Get<T, "millisecond">>,
  Epoch extends number = Subtract<Year, 1970>,
  LeapYears extends number = LeapYearsSince<Year>,
  DaysOfPeriod extends number = DayOfYear<Year, Month, Day>,
  NonLeapYears extends number = Subtract<Epoch, LeapYears>,
  EpochDays extends number = Add<
    Multiply<NonLeapYears, 365>,
    Multiply<LeapYears, 366>
  >,
  Days extends number = Add<EpochDays, Subtract<DaysOfPeriod, 1>>,
  Hours extends number = Subtract<Hour, 1>
> = EpochToDateInMs<
  DaysToMs<Days>,
  HoursToMs<Hours>,
  MinutesToMs<Minutes>,
  SecondsToMs<Seconds>,
  Milliseconds
>;

export type UnixTimestamp<T extends DateFormat> = UnixTimestampHelper<T>;

type Test = UnixTimestamp<{
  year: "2019";
  month: "08";
  day: "05";
  hour: "12";
  minute: "00";
  second: "00";
  millisecond: "000";
  timezone: "+00:00";
  timestamp: 0;
}>;
