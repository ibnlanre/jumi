import type { AdvancedFormat, AdvancedFormatSymbols } from "./AdvancedFormat";
import type { DateFormat } from "./DateFormat";
import type {
  LocalizedFormat,
  LocalizedFormatSymbols,
} from "./LocalizedFormat";
import type { Sign } from "./Sign";
import type { SimpleFormat, SimpleFormatSymbols } from "./SimpleFormat";
import type { Split } from "./Split";

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
    : Stream extends AdvancedFormatSymbols
    ? FormatDateHelper<
        Date,
        Format,
        `${Value}${AdvancedFormat<Stream, Date>}${Part}`
      >
    : Stream extends SimpleFormatSymbols
    ? FormatDateHelper<
        Date,
        Format,
        `${Value}${SimpleFormat<Stream, Date>}${Part}`
      >
    : FormatDateHelper<Date, Format, `${Value}${Part}`>
  : Format extends ""
  ? Stream extends AdvancedFormatSymbols
    ? `${Value}${AdvancedFormat<Stream, Date>}`
    : Stream extends SimpleFormatSymbols
    ? `${Value}${SimpleFormat<Stream, Date>}`
    : Value
  : never;

type FormatDate<
  Date extends string,
  Format extends string = ""
> = FormatDateHelper<Split<Date>, Format>;
