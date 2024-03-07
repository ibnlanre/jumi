import { DateFormat } from "./DateFormat";
import { Sign } from "./Sign";
import { SimpleFormat, SimpleFormatSymbols } from "./SimpleFormat";
import { Split } from "./Split";

type DayJSFormat =
  | "LLL"
  | "LL"
  | "L"
  | "LT"
  | "LTS"
  | "LTSO"
  | "LTZ"
  | "LZ"
  | "LLL"
  | "LLL"
  | "LLLT"
  | "LLLL"
  | "LLLLL";

type ExplicitFormat<T extends string> = T extends "LLL"
  ? "MMM. DD, YYYY"
  : T extends "LL"
  ? "MMM. DD, YYYY"
  : T extends "L"
  ? "MM/DD/YYYY"
  : T extends "LT"
  ? "h:mm A"
  : T extends "LTS"
  ? "h:mm:ss A"
  : T extends "LTSO"
  ? "h:mm:ss A"
  : T extends "LTZ"
  ? "h:mm:ss A"
  : T extends "LZ"
  ? "h:mm:ss A"
  : T extends "LLL"
  ? "MMM. DD, YYYY"
  : T extends "LLL"
  ? "MMM. DD, YYYY"
  : T extends "LLLT"
  ? "MMM. DD, YYYY h:mm A"
  : T extends "LLLL"
  ? "MMMM DD, YYYY h:mm A"
  : T extends "LLLLL"
  ? "MMMM DD, YYYY h:mm A"
  : never;

import { Array, Number } from "@ibnlanre/typings";

type FormatDateHelper<
  Date extends DateFormat,
  Format extends string,
  Formatters extends Array<FormatterType>,
  Value extends string = "",
  Stream extends string = "",
  Simple extends number = Number.And<
    Array.Includes<Formatters, "simple">,
    Stream extends SimpleFormatSymbols ? 1 : 0
  >,
  Advanced extends number = Number.And<
    Array.Includes<Formatters, "advanced">,
    Stream extends SimpleFormatSymbols ? 1 : 0
  >,
  Localized extends number = Number.And<
    Array.Includes<Formatters, "localized">,
    Stream extends SimpleFormatSymbols ? 1 : 0
  >
> = Format extends `${infer Part}${infer Format}`
  ? Part extends Sign
    ? FormatDateHelper<Date, Format, Formatters, Value, `${Stream}${Part}`>
    : Simple extends 1
    ? FormatDateHelper<
        Date,
        Format,
        Formatters,
        `${Value}${SimpleFormat<Stream, Date>}${Part}`
      >
    : Advanced extends 1
    ? FormatDateHelper<
        Date,
        Format,
        Formatters,
        `${Value}${AdvancedFormat<Stream, Date>}${Part}`
      >
    : Localized extends 1
    ? FormatDateHelper<
        Date,
        Format,
        Formatters,
        `${Value}${LocalizedFormat<Stream, Date>}${Part}`
      >
    : FormatDateHelper<Date, Format, Formatters, `${Value}${Part}`>
  : Format extends ""
  ? Simple extends 1
    ? `${Value}${SimpleFormat<Stream, Date>}`
    : Advanced extends 1
    ? `${Value}${AdvancedFormat<Stream, Date>}`
    : Localized extends 1
    ? `${Value}${LocalizedFormat<Stream, Date>}`
    : Value
  : never;

type AdvancedFormat<Stream extends string, Date extends DateFormat> = never;

type LocalizedFormat<Stream extends string, Date extends DateFormat> = never;

type FormatterType = "simple" | "advanced" | "localized";

type FormatDate<
  Date extends string,
  Format extends string = "",
  Formatters extends Array<FormatterType> = ["simple"]
> = FormatDateHelper<Split<Date>, Format, Formatters>;

type A = FormatDate<"2022-01-01", "YYYY-MM-[DD]Thh:mm:ss.sTZZ">;
//   ^?
