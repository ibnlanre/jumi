import type { Replace, Stringify } from "@ibnlanre/types";

import type { BuddhistEra, BuddhistEraSymbols } from "./BuddhistEra";
import type { DateFormat } from "./DateFormat";
import type {
  LocalizedFormat,
  LocalizedFormatSymbols,
} from "./LocalizedFormat";
import type { Sign } from "./Sign";
import type { SimpleFormat, SimpleFormatSymbols } from "./SimpleFormat";
import type { AdvancedFormat, AdvancedFormatSymbols } from "./advanced-format";
import type { Split } from "./break/Split";

type Symbols = AdvancedFormatSymbols | BuddhistEraSymbols | SimpleFormatSymbols;

type Formatter<
  Stream extends string,
  Date extends DateFormat
> = Stream extends LocalizedFormatSymbols
  ? FormatDateHelper<Date, LocalizedFormat<Stream>>
  : Stream extends BuddhistEraSymbols
  ? BuddhistEra<Stream, Date>
  : Stream extends AdvancedFormatSymbols
  ? AdvancedFormat<Stream, Date>
  : Stream extends SimpleFormatSymbols
  ? SimpleFormat<Stream, Date>
  : Stream;

type FormatterHelper<
  Date extends DateFormat,
  Format extends string,
  Value extends string = "",
  Stream extends string = "",
  Part extends string = ""
> = Stream extends LocalizedFormatSymbols
  ? FormatDateHelper<
      Date,
      Replace<Format, Stream, LocalizedFormat<Stream>>,
      Value,
      Stream
    >
  : Stream extends Symbols
  ? Formatter<Stream, Date> extends infer P
    ? FormatDateHelper<Date, Format, `${Value}${Stringify<P>}${Part}`>
    : never
  : FormatDateHelper<Date, Format, `${Value}${Stream}${Part}`>;

type FormatDateHelper<
  Date extends DateFormat,
  Format extends string,
  Value extends string = "",
  Stream extends string = ""
> = Format extends `${infer Part}${infer Format}`
  ? Part extends Sign
    ? FormatDateHelper<Date, Format, Value, `${Stream}${Part}`>
    : FormatterHelper<Date, Format, Value, Stream, Part>
  : Format extends ""
  ? `${Value}${Formatter<Stream, Date>}`
  : never;

export type FormatDate<
  Date extends string,
  Format extends string = ""
> = FormatDateHelper<Split<Date>, Format>;
