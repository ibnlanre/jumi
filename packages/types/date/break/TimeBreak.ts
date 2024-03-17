import type { Set } from "@ibnlanre/types";
import type { Split } from "./Split";

export type TimeBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = ""
> = Part extends `T${infer H}:`
  ? Split<In, Set<Out, "hour", H>, Stream>
  : Part extends `:${infer m}:`
  ? Split<In, Set<Out, "minute", m>, Stream>
  : Part extends `:${infer s}.`
  ? Split<In, Set<Out, "second", s>, Stream>
  : Out;
