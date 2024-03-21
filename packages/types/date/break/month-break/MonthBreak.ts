import {
  IsBetween,
  Length,
  PadStart,
  ParseInt,
  SetValue,
} from "@ibnlanre/types";
import { And } from "ts-arithmetic";

import { IsMonth } from "../../checks";

type MonthHelper<
  M extends string,
  Output extends Record<string, any> = {}
> = And<IsBetween<Length<M>, 1, 2>, IsBetween<ParseInt<M>, 1, 12>> extends 1
  ? SetValue<Output, "month", PadStart<M, 2>>
  : "Invalid Date";

export type MonthBreak<
  Token extends string,
  Output extends Record<string, any> = {}
> = IsMonth<Token> extends 1
  ? Token extends `-${infer M}Z`
    ? MonthHelper<M, Output>
    : Token extends `-${infer M}-`
    ? MonthHelper<M, Output>
    : Token extends `-${infer M}`
    ? MonthHelper<M, Output>
    : never
  : "The token provided is not a valid month.";
