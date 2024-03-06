import type { MillisecondBreak } from "./MillisecondBreak";
import type { PeriodBreak } from "./PeriodBreak";

export type Break<
  Part extends string,
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = ""
> = Part extends `.${infer Part}`
  ? MillisecondBreak<Part, In, Out>
  : PeriodBreak<Part, In, Out, Stream>;
