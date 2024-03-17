import type { Set } from "@ibnlanre/types";
import type { Split } from "./Split";

export type DayBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = ""
> = Part extends `${infer D}T`
  ? Split<In, Set<Out, "day", D>, Stream>
  : Part extends `${infer D}`
  ? Split<In, Set<Out, "day", D>, Stream>
  : never;
