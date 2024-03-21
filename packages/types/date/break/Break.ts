import type { Extend } from "@ibnlanre/types";

import type { Separator } from "../Separator";
import type { UnixTimestamp } from "../unix-timestamp";
import { PeriodBreak } from "./period-break";

type BreakHelper<
  Token extends string = "",
  Date extends string = "",
  Output extends Record<string, any> = {},
  Result extends string = ""
> = PeriodBreak<Token, Output> extends infer Output
  ? Output extends Record<string, any>
    ? Breaker<Date, Output, Result>
    : Output
  : never;

type Breaker<
  Date extends string,
  Output extends Record<string, any> = {},
  Result extends string = ""
> = Date extends `${infer Token}${infer Date}`
  ? Token extends Separator
    ? BreakHelper<`${Result}${Token}`, Date, Output, Token>
    : Breaker<Date, Output, `${Result}${Token}`>
  : Date extends ""
  ? PeriodBreak<Result, Output> extends infer Output
    ? Output extends Record<string, any>
      ? Extend<Output, { timestamp: UnixTimestamp<Output> }>
      : Output
    : never
  : never;

export type Break<Date extends string> = Breaker<Date>;
