import type { Set } from "@ibnlanre/types";

import type { BaseDateFormat } from "../DateFormat";
import type { TimeZoneBreak } from "./TimeZoneBreak";

export type MillisecondBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, any> = BaseDateFormat
> = Part extends `${infer ms}Z`
  ? Set<Out, "millisecond", ms>
  : Part extends `${infer ms}-`
  ? TimeZoneBreak<In, Set<Out, "millisecond", ms>, "-">
  : Part extends `${infer ms}+`
  ? TimeZoneBreak<In, Set<Out, "millisecond", ms>>
  : never;
