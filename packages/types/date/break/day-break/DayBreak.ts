import type { SetValue } from "@ibnlanre/types";
import { IsDay } from "../../checks/is-day";

export type DayBreak<
  Token extends string,
  Output extends Record<string, string> = {}
> = IsDay<Token> extends 1
  ? Token extends `-${infer D}T`
    ? SetValue<Output, "day", D>
    : Token extends `-${infer D}`
    ? SetValue<Output, "day", D>
    : never
  : "The token provided is not a valid day.";
