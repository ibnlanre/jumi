import { SetValue } from "@ibnlanre/types";
import { IsSeconds } from "../../checks";

export type SecondsBreak<
  Token extends string,
  Output extends Record<string, string> = {}
> = IsSeconds<Token> extends 1
  ? Token extends `:${infer s}.`
    ? SetValue<Output, "seconds", s>
    : never
  : "The token provided is not a valid minute.";
