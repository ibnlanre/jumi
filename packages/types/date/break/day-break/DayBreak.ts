import type {
  IsBetween,
  Length,
  PadStart,
  ParseInt,
  SetValue,
} from "@ibnlanre/types";
import { And } from "ts-arithmetic";

import { IsDay } from "../../checks";

type DayHelper<D extends string, Output extends Record<string, any> = {}> = And<
  IsBetween<Length<D>, 1, 2>,
  IsBetween<ParseInt<D>, 1, 31>
> extends 1
  ? SetValue<Output, "day", PadStart<D, 2>>
  : "Invalid Date";

export type DayBreak<
  Token extends string,
  Output extends Record<string, string> = {}
> = IsDay<Token> extends 1
  ? Token extends `-${infer D}Z`
    ? DayHelper<D, Output>
    : Token extends `-${infer D}T`
    ? DayHelper<D, Output>
    : Token extends `-${infer D}`
    ? DayHelper<D, Output>
    : never
  : "The token provided is not a valid day.";
