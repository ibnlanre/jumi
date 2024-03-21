import type { SetValue } from "@ibnlanre/types";
import { IsTimeZone } from "../../checks";

export type TimeZoneBreak<
  Token extends string,
  Output extends Record<string, string> = {}
> = IsTimeZone<Token> extends 1
  ? Token extends infer z
    ? SetValue<Output, "timezone", z>
    : never
  : "The token provided is not a valid timezone.";
