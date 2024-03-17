import type {
  Get,
  Ordinal,
  PadStart,
  ParseInt,
  Stringify,
  Substring,
} from "@ibnlanre/types";

import type { DateFormat } from "../DateFormat";
import type { HourOfDay } from "../hour-of-day";
import type { QuarterOfYear } from "../quarter-of-year";
import type { TimeZones } from "../TimeZones";
import type { WeekOfYear } from "../week-of-year";

export type AdvancedFormatSymbols =
  | "Q"
  | "Do"
  | "k"
  | "kk"
  | "X"
  | "x"
  | "w"
  | "ww"
  | "W"
  | "WW"
  | "wo"
  | "gggg"
  | "GGGG"
  | "z"
  | "zz";

type ZoneData = {
  abbr: string;
  name: string;
};

export type AdvancedFormat<
  In extends string,
  Out extends DateFormat,
  Year extends string = Get<Out, "year">,
  Month extends string = Get<Out, "month">,
  Hour extends string = Get<Out, "hour">,
  Day extends string = Get<Out, "day">,
  HourOfTheDay extends string = Stringify<HourOfDay<Hour>>,
  WeekOfTheYear extends number = WeekOfYear<Year, Month, Day>,
  TimeZone extends ZoneData = Get<
    TimeZones,
    Get<Out, "timezone">,
    { abbr: ""; name: "" }
  >
> = In extends "Q"
  ? Stringify<QuarterOfYear<Get<Out, "month">>>
  : In extends "Do"
  ? Stringify<Ordinal<ParseInt<Get<Out, "day">>>>
  : In extends "k"
  ? HourOfTheDay
  : In extends "kk"
  ? PadStart<HourOfTheDay, 2>
  : In extends "X"
  ? Stringify<Get<Out, "timestamp">>
  : In extends "x"
  ? Substring<Stringify<Get<Out, "timestamp">>, 0, 10>
  : In extends "w"
  ? Stringify<WeekOfTheYear>
  : In extends "ww"
  ? PadStart<Stringify<WeekOfTheYear>, 2>
  : In extends "W"
  ? Stringify<WeekOfTheYear>
  : In extends "WW"
  ? PadStart<Stringify<WeekOfTheYear>, 2>
  : In extends "wo"
  ? Stringify<Ordinal<WeekOfTheYear>>
  : In extends "gggg"
  ? Year
  : In extends "GGGG"
  ? Year
  : In extends "z"
  ? Get<TimeZone, "abbr">
  : In extends "zz"
  ? Get<TimeZone, "name">
  : never;
