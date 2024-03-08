import type { DateFormat } from "./DateFormat";
import type {
  LocalizedFormat,
  LocalizedFormatSymbols,
} from "./LocalizedFormat";
import type { Sign } from "./Sign";
import type { SimpleFormat, SimpleFormatSymbols } from "./SimpleFormat";
import type { Split } from "./Split";

import { Array, Number } from "@ibnlanre/typings";




type FormatDateHelper<
  Date extends DateFormat,
  Format extends string,
  Value extends string = "",
  Stream extends string = ""
> = Format extends LocalizedFormatSymbols
  ? FormatDateHelper<Date, LocalizedFormat<Format>>
  : Format extends `${infer Part}${infer Format}`
  ? Part extends Sign
    ? FormatDateHelper<Date, Format, Value, `${Stream}${Part}`>
    : Stream extends SimpleFormatSymbols
    ? FormatDateHelper<
        Date,
        Format,
        `${Value}${SimpleFormat<Stream, Date>}${Part}`
      >
    : FormatDateHelper<Date, Format, `${Value}${Part}`>
  : Format extends ""
  ? Stream extends SimpleFormatSymbols
    ? `${Value}${SimpleFormat<Stream, Date>}`
    : Value
  : never;

// type AdvancedFormat<Stream extends string, Date extends DateFormat> = never;

// type LocalizedFormat<Stream extends string, Date extends DateFormat> = never;

type FormatterType = "simple" | "advanced" | "localized";

type FormatDate<
  Date extends string,
  Format extends string = ""
> = FormatDateHelper<Split<Date>, Format>;

type A = FormatDate<"2022-01-01", "YYYY-MM-[DD]Thh:mm:ss.sTZZ">;
//   ^?

type B = FormatDate<"2022-01-01", "l">;
//   ^?
