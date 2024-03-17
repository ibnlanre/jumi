import type { Set } from "@ibnlanre/types";

import type { BaseDateFormat } from "../DateFormat";
import type { DayBreak } from "./DayBreak";
import type { Split } from "./Split";
import type { TimeBreak } from "./TimeBreak";

export type PeriodBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, any> = BaseDateFormat,
  Stream extends string = ""
> = Part extends `-${infer M}-`
  ? Split<In, Set<Out, "month", M>, Stream>
  : Part extends `${infer Y}-`
  ? Split<In, Set<Out, "year", Y>, Stream>
  : Part extends `-${infer Part}`
  ? DayBreak<Part, In, Out, Stream>
  : TimeBreak<Part, In, Out, Stream>;
