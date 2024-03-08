import type { Number, Object, String } from "@ibnlanre/typings";

import { Add, Divide, Mod, Subtract } from "ts-arithmetic";

import type { DateFormat } from "./DateFormat";
import type { DayOfYear } from "./DayOfYear";
import { HourOfDay } from "./HourOfDay";
import type { Quarter } from "./Quarter";
import type { WeekOfYear } from "./WeekOfYear";

type AdvancedFormat<
  In extends string,
  Out extends DateFormat,
  Year extends string = Object.Retrieve<Out, "year">,
  Month extends string = Object.Retrieve<Out, "month">,
  Hour extends string = Object.Retrieve<Out, "hour">,
  Day extends string = Object.Retrieve<Out, "day">,
  HourOfTheDay extends number = HourOfDay<Hour>,
  WeekOfTheYear extends number = WeekOfYear<
    Number.ToNumber<Year>,
    Number.ToNumber<Month>,
    Number.ToNumber<Day>
  >
> = In extends "Q"
  ? Quarter<Object.Retrieve<Out, "month">>
  : In extends "Do"
  ? Number.Ordinal<Number.ToNumber<Object.Retrieve<Out, "day">>>
  : In extends "k"
  ? HourOfTheDay
  : In extends "kk"
  ? String.PadStart<String.ToString<HourOfTheDay>, 2>
  : In extends "X"
  ? String.ToString<Object.Retrieve<Out, "timestamp">>
  : In extends "x"
  ? String.Slice<String.ToString<Object.Retrieve<Out, "timestamp">>, 0, 10>
  : In extends "w"
  ? String.ToString<WeekOfTheYear>
  : In extends "ww"
  ? String.PadStart<String.ToString<WeekOfTheYear>, 2>
  : In extends "W"
  ? String.ToString<Add<WeekOfTheYear, 1>>
  : In extends "WW"
  ? String.PadStart<String.ToString<Add<WeekOfTheYear, 1>>, 2>
  : In extends "wo"
  ? Number.Ordinal<Add<WeekOfTheYear, 1>>
  : never;
