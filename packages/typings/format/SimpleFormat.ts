import { Number, Object, String } from "@ibnlanre/typings";

import { AmPm } from "./AmPm";
import { DateFormat } from "./DateFormat";
import { DayOfTheWeek } from "./DayOfTheWeek";
import { HourClock } from "./HourClock";
import { Month } from "./Month";

export type SimpleFormat<
  In extends string,
  Out extends DateFormat,
  IYear extends string = Object.Retrieve<Out, "year">,
  IMonth extends string = Object.Retrieve<Out, "month">,
  IDay extends string = Object.Retrieve<Out, "day">,
  WeekDay extends string = DayOfTheWeek<IYear, IMonth, IDay>
> = In extends "YY"
  ? String.Slice<IYear, 2, 4>
  : In extends "YYYY"
  ? IYear
  : In extends "M"
  ? String.TrimStart<IMonth>
  : In extends "MM"
  ? IMonth
  : In extends "MMM"
  ? String.Slice<Object.Retrieve<Month, IMonth>, 0, 3>
  : In extends "MMMM"
  ? Object.Retrieve<Month, IMonth>
  : In extends "D"
  ? String.TrimStart<IDay>
  : In extends "DD"
  ? IDay
  : In extends "d"
  ? WeekDay
  : In extends "dd"
  ? String.Slice<Object.Retrieve<Month, WeekDay>, 0, 2>
  : In extends "ddd"
  ? String.Slice<Object.Retrieve<Month, WeekDay>, 0, 3>
  : In extends "dddd"
  ? Object.Retrieve<Month, WeekDay>
  : In extends "H"
  ? String.TrimStart<Object.Retrieve<Out, "hour">, 1>
  : In extends "HH"
  ? Object.Retrieve<Out, "hour">
  : In extends "h"
  ? String.TrimStart<
      Object.Retrieve<HourClock, Object.Retrieve<Out, "hour">>,
      1
    >
  : In extends "hh"
  ? Object.Retrieve<HourClock, Object.Retrieve<Out, "hour">>
  : In extends "m"
  ? String.TrimStart<Object.Retrieve<Out, "minute">, 1>
  : In extends "mm"
  ? Object.Retrieve<Out, "minute">
  : In extends "s"
  ? String.TrimStart<Object.Retrieve<Out, "second">, 1>
  : In extends "ss"
  ? Object.Retrieve<Out, "second">
  : In extends "SSS"
  ? Object.Retrieve<Out, "millisecond">
  : In extends "Z"
  ? Object.Retrieve<Out, "timezone">
  : In extends "ZZ"
  ? String.Replace<Object.Retrieve<Out, "timezone">, ":", "">
  : In extends "A"
  ? AmPm<Object.Retrieve<Out, "hour">>
  : In extends "a"
  ? Lowercase<AmPm<Object.Retrieve<Out, "hour">>>
  : never;
