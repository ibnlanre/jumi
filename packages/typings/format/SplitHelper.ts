import type { Object } from "@ibnlanre/typings";

import type { Break } from "./Break";
import type { BaseDateFormat } from "./DateFormat";
import type { UnixTimestamp } from "./UnixTimestamp";

export type SplitHelper<
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
