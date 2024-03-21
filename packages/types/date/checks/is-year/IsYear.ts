import { Pattern, StartsWith } from "@ibnlanre/types";
import { And, Not } from "ts-arithmetic";

export type IsYear<T extends string> = And<
  Pattern<T, number, "", "-" | "">,
  Not<StartsWith<T, "-">>
>;
