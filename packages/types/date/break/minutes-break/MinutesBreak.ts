import { SetValue } from "@ibnlanre/types";
import { IsMinutes } from "../../checks";

export type MinutesBreak<
  Token extends string,
  Output extends Record<string, string> = {}
> = IsMinutes<Token> extends 1
  ? Token extends `:${infer m}Z`
    ? SetValue<Output, "minutes", m>
    : Token extends `:${infer m}:`
    ? SetValue<Output, "minutes", m>
    : Token extends `:${infer m}`
    ? SetValue<Output, "minutes", m>
    : never
  : "The token provided is not a valid minute.";
