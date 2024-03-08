import type { Number, Object, String } from "@ibnlanre/typings";

import type { DateFormat } from "./DateFormat";
import type { HourOfDay } from "./HourOfDay";
import type { Quarter } from "./Quarter";
import type { TimeZones } from "./TimeZones";
import type { WeekOfYear } from "./WeekOfYear";

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
  Year extends string = Object.Retrieve<Out, "year">,
  Month extends string = Object.Retrieve<Out, "month">,
  Hour extends string = Object.Retrieve<Out, "hour">,
  Day extends string = Object.Retrieve<Out, "day">,
  HourOfTheDay extends string = String.ToString<HourOfDay<Hour>>,
  WeekOfTheYear extends number = WeekOfYear<
    Number.ToNumber<Year>,
    Number.ToNumber<Month>,
    Number.ToNumber<Day>
  >,
  TimeZone extends ZoneData = Object.Retrieve<
    TimeZones,
    Object.Retrieve<Out, "timezone">,
    { abbr: ""; name: "" }
  >
> = In extends "Q"
  ? String.ToString<Quarter<Object.Retrieve<Out, "month">>>
  : In extends "Do"
  ? String.ToString<
      Number.Ordinal<Number.ToNumber<Object.Retrieve<Out, "day">>>
    >
  : In extends "k"
  ? HourOfTheDay
  : In extends "kk"
  ? String.PadStart<HourOfTheDay, 2>
  : In extends "X"
  ? String.ToString<Object.Retrieve<Out, "timestamp">>
  : In extends "x"
  ? String.Slice<String.ToString<Object.Retrieve<Out, "timestamp">>, 0, 10>
  : In extends "w"
  ? String.ToString<WeekOfTheYear>
  : In extends "ww"
  ? String.PadStart<String.ToString<WeekOfTheYear>, 2>
  : In extends "W"
  ? String.ToString<WeekOfTheYear>
  : In extends "WW"
  ? String.PadStart<String.ToString<WeekOfTheYear>, 2>
  : In extends "wo"
  ? String.ToString<Number.Ordinal<WeekOfTheYear>>
  : In extends "gggg"
  ? Year
  : In extends "GGGG"
  ? Year
  : In extends "z"
  ? Object.Retrieve<TimeZone, "abbr">
  : In extends "zz"
  ? Object.Retrieve<TimeZone, "name">
  : never;
