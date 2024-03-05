import type { Add } from "../add";
import type { TimezoneBreak } from "./TimezoneBreak";

export type MillisecondBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, string> = {}
> = Part extends `${infer ms}Z`
  ? Add<Out, "millisecond", ms>
  : Part extends `${infer ms}-`
  ? TimezoneBreak<In, Add<Out, "millisecond", ms>, "-">
  : Part extends `${infer ms}+`
  ? TimezoneBreak<In, Add<Out, "millisecond", ms>>
  : never;
