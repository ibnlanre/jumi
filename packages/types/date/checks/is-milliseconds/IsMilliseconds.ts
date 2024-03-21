import { EndsWith, Pattern } from "@ibnlanre/types";
import { And, Not } from "ts-arithmetic";

export type IsMilliseconds<T extends string> = And<
  Pattern<T, number, ".", "Z" | "+" | "-" | "">,
  Not<EndsWith<T, ".">>
>;
