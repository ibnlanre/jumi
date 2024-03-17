import type {
  Get,
  PadStart,
  Replace,
  Stringify,
  Substring,
  TrimStart,
} from "@ibnlanre/types";

import type { AmPm } from "./AmPm";
import type { DateFormat } from "./DateFormat";
import type { DayOfWeek } from "./day-of-week";
import type { Days } from "./Days";
import type { HourOfDay } from "./hour-of-day";
import type { Months } from "./Months";

export type SimpleFormatSymbols =
  | "YY"
  | "YYYY"
  | "M"
  | "MM"
  | "MMM"
  | "MMMM"
  | "D"
  | "DD"
  | "d"
  | "dd"
  | "ddd"
  | "dddd"
  | "H"
  | "HH"
  | "h"
  | "hh"
  | "m"
  | "mm"
  | "s"
  | "ss"
  | "SSS"
  | "Z"
  | "ZZ"
  | "A"
  | "a";

export type SimpleFormat<
  In extends string,
  Out extends DateFormat,
  Year extends string = Get<Out, "year">,
  Month extends string = Get<Out, "month">,
  Day extends string = Get<Out, "day">,
  DayOfTheWeek extends string = Stringify<DayOfWeek<Year, Month, Day>>
> = In extends "YY"
  ? Substring<Year, 2, 4>
  : In extends "YYYY"
  ? Year
  : In extends "M"
  ? TrimStart<Month>
  : In extends "MM"
  ? Month
  : In extends "MMM"
  ? Substring<Get<Months, Month>, 0, 3>
  : In extends "MMMM"
  ? Get<Months, Month>
  : In extends "D"
  ? TrimStart<Day>
  : In extends "DD"
  ? Day
  : In extends "d"
  ? DayOfTheWeek
  : In extends "dd"
  ? Substring<Get<Days, DayOfTheWeek>, 0, 2>
  : In extends "ddd"
  ? Substring<Get<Days, DayOfTheWeek>, 0, 3>
  : In extends "dddd"
  ? Get<Days, DayOfTheWeek>
  : In extends "H"
  ? TrimStart<Get<Out, "hour">, 1>
  : In extends "HH"
  ? Get<Out, "hour">
  : In extends "h"
  ? HourOfDay<Get<Out, "hour">>
  : In extends "hh"
  ? PadStart<Stringify<HourOfDay<Get<Out, "hour">>>, 2>
  : In extends "m"
  ? TrimStart<Get<Out, "minute">, 1>
  : In extends "mm"
  ? Get<Out, "minute">
  : In extends "s"
  ? TrimStart<Get<Out, "second">, 1>
  : In extends "ss"
  ? Get<Out, "second">
  : In extends "SSS"
  ? Get<Out, "millisecond">
  : In extends "Z"
  ? Get<Out, "timezone">
  : In extends "ZZ"
  ? Replace<Get<Out, "timezone">, ":", "">
  : In extends "A"
  ? AmPm<Get<Out, "hour">>
  : In extends "a"
  ? Lowercase<AmPm<Get<Out, "hour">>>
  : never;
