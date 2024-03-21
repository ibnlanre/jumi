import { SetValue } from "@ibnlanre/types";
import { IsMonth } from "../../checks/is-month";

export type MonthBreak<
  Token extends string,
  Output extends Record<string, any> = {}
> = IsMonth<Token> extends 1
  ? Token extends `-${infer M}-`
    ? SetValue<Output, "month", M>
    : Token extends `-${infer M}`
    ? SetValue<Output, "month", M>
    : never
  : "The token provided is not a valid month.";
