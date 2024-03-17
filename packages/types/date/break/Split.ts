import type { Extend } from "@ibnlanre/types";

import type { BaseDateFormat, DateFormat } from "../DateFormat";
import type { Separator } from "../Separator";
import type { UnixTimestamp } from "../UnixTimestamp";
import type { Break } from "./Break";

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
