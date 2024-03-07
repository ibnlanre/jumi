import type { BaseDateFormat } from "./DateFormat";
import type { MillisecondBreak } from "./MillisecondBreak";
import type { PeriodBreak } from "./PeriodBreak";

import { Object } from "@ibnlanre/typings";

export type Break<
  Part extends string,
  In extends string,
  Out extends Record<string, any> = BaseDateFormat,
  Stream extends string = ""
> = Part extends `.${infer Part}`
  ? MillisecondBreak<Part, In, Out>
  : PeriodBreak<Part, In, Out, Stream>;
