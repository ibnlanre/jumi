import type { Extend } from "@ibnlanre/types";

import type { PeriodBreak } from "../break";
import type { Separator } from "../Separator";
import type { UnixTimestamp } from "../unix-timestamp";

type ParseDateHelper<
  Token extends string = "",
  Date extends string = "",
  Output extends Record<string, any> = {},
  Result extends string = ""
> = Token extends `Z${string}` | `T${string}Z`
  ? "Invalid Date"
  : Token extends `${"+" | "-"}` | `${"+" | "-"}${number}:`
  ? Parser<Date, Output, Token>
  : PeriodBreak<Token, Output> extends infer Output
  ? Output extends Record<string, any>
    ? Parser<Date, Output, Result>
    : Output
  : never;

type Parser<
  Date extends string,
  Output extends Record<string, any> = {},
  Result extends string = ""
> = Date extends `${infer Token}${infer Date}`
  ? Token extends Separator
    ? ParseDateHelper<`${Result}${Token}`, Date, Output, Token>
    : Parser<Date, Output, `${Result}${Token}`>
  : Date extends ""
  ? PeriodBreak<Result, Output> extends infer Output
    ? Output extends Record<string, any>
      ? Extend<Output, { timestamp: UnixTimestamp<Output> }>
      : Output
    : never
  : never;

export type ParseDate<Date extends string> = Parser<Date>;
