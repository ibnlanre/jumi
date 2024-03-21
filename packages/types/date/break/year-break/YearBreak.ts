import { SetValue } from "@ibnlanre/types";
import { IsYear } from "../../checks/is-year";

export type YearBreak<
  Token extends string,
  Output extends Record<string, any> = {}
> = IsYear<Token> extends 1
  ? Token extends `${infer Y}-`
    ? SetValue<Output, "year", Y>
    : Token extends `${infer Y}`
    ? SetValue<Output, "year", Y>
    : never
  : "The token provided is not a valid year.";
