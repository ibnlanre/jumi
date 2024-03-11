import type { Object } from "@ibnlanre/types";
import type { Separator } from "./Separator";

import type { Break } from "./Break";
import type { BaseDateFormat } from "./DateFormat";
import type { UnixTimestamp } from "./UnixTimestamp";

type SplitHelper<
  Part extends string = "",
  In extends string = "",
  Out extends Record<string, any> = {},
  Stream extends string = ""
> = Break<Part, In, Out, Stream> extends infer R extends Record<string, any>
  ? Object.Merge<
      { timestamp: UnixTimestamp<R> },
      Object.Merge<R, BaseDateFormat>
    >
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
