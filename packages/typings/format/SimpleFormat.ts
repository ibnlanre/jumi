import type { Object, String } from "@ibnlanre/typings";

import type { AmPm } from "./AmPm";
import type { DateFormat } from "./DateFormat";
import type { DayOfWeek } from "./DayOfWeek";
import type { Days } from "./Days";
import type { HourOfDay } from "./HourOfDay";
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
  Year extends string = Object.Retrieve<Out, "year">,
  Month extends string = Object.Retrieve<Out, "month">,
  Day extends string = Object.Retrieve<Out, "day">,
  DayOfTheWeek extends string = String.ToString<DayOfWeek<Year, Month, Day>>
> = In extends "YY"
  ? String.Slice<Year, 2, 4>
  : In extends "YYYY"
  ? Year
  : In extends "M"
  ? String.TrimStart<Month>
  : In extends "MM"
  ? Month
  : In extends "MMM"
  ? String.Slice<Object.Retrieve<Months, Month>, 0, 3>
  : In extends "MMMM"
  ? Object.Retrieve<Months, Month>
  : In extends "D"
  ? String.TrimStart<Day>
  : In extends "DD"
  ? Day
  : In extends "d"
  ? DayOfTheWeek
  : In extends "dd"
  ? String.Slice<Object.Retrieve<Days, DayOfTheWeek>, 0, 2>
  : In extends "ddd"
  ? String.Slice<Object.Retrieve<Days, DayOfTheWeek>, 0, 3>
  : In extends "dddd"
  ? Object.Retrieve<Days, DayOfTheWeek>
  : In extends "H"
  ? String.TrimStart<Object.Retrieve<Out, "hour">, 1>
  : In extends "HH"
  ? Object.Retrieve<Out, "hour">
  : In extends "h"
  ? HourOfDay<Object.Retrieve<Out, "hour">>
  : In extends "hh"
  ? String.PadStart<String.ToString<HourOfDay<Object.Retrieve<Out, "hour">>>, 2>
  : In extends "m"
  ?"P"// String.TrimStart<Object.Retrieve<Out, "minute">, 1>
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
