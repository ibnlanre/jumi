import type { Extend, Set } from "@ibnlanre/types";

import type { BaseDateFormat, DateFormat } from "../DateFormat";
import type { Separator } from "../Separator";
import type { UnixTimestamp } from "../unix-timestamp/UnixTimestamp";
import { TimeZoneBreak } from "./TimeZoneBreak";

export type Break<
  Part extends string,
  In extends string,
  Out extends Record<string, any> = BaseDateFormat,
  Stream extends string = ""
> = Part extends `.${infer Part}`
  ? Part extends `${infer ms}Z`
    ? Set<Out, "millisecond", ms>
    : Part extends `${infer ms}-`
    ? Set<Set<Out, "millisecond", ms>, "timezone", `-${In}`>
    : Part extends `${infer ms}+`
    ? Set<Set<Out, "millisecond", ms>, "timezone", `+${In}`>
    : Part extends `-${infer M}-`
    ? Split<In, Set<Out, "month", M>, Stream>
    : Part extends `${infer Y}-`
    ? Split<In, Set<Out, "year", Y>, Stream>
    : Part extends `-${infer Part}`
    ? Part extends `${infer D}T`
      ? Split<In, Set<Out, "day", D>, Stream>
      : Part extends `${infer D}`
      ? Split<In, Set<Out, "day", D>, Stream>
      : Part extends `T${infer H}:`
      ? Split<In, Set<Out, "hour", H>, Stream>
      : Part extends `:${infer m}:`
      ? Split<In, Set<Out, "minute", m>, Stream>
      : Part extends `:${infer s}.`
      ? Split<In, Set<Out, "second", s>, Stream>
      : Out
    : never
  : never;

type SplitHelper<
  Part extends string = "",
  In extends string = "",
  Out extends Record<string, any> = {},
  Stream extends string = ""
> = Break<Part, In, Out, Stream> extends infer R
  ? R extends DateFormat
    ? Extend<{ timestamp: UnixTimestamp<R> }, Extend<R, BaseDateFormat>>
    : never
  : never;

export type Split<
  In extends string,
  Out extends Record<string, any> = {},
  Stream extends string = ""
> = In extends `${infer Part}${infer In}`
  ? Part extends Separator
    ? SplitHelper<`${Stream}${Part}`, In, Out, Part>
    : Split<In, Out, `${Stream}${Part}`>
  : In extends ""
  ? SplitHelper<Stream, In, Out, In>
  : never;
