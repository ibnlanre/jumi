import type { Insert } from "../object/set";
import type { BaseDateFormat } from "./DateFormat";
import type { TimeZoneBreak } from "./TimeZoneBreak";

export type MillisecondBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, any> = BaseDateFormat
> = Part extends `${infer ms}Z`
  ? Insert<Out, "millisecond", ms>
  : Part extends `${infer ms}-`
  ? TimeZoneBreak<In, Insert<Out, "millisecond", ms>, "-">
  : Part extends `${infer ms}+`
  ? TimeZoneBreak<In, Insert<Out, "millisecond", ms>>
  : never;
