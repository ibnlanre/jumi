import type { Add } from "../add";
import type { Split } from "./Split";

export type TimeBreak<
  Part extends string,
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = ""
> = Part extends `T${infer H}:`
  ? Split<In, Add<Out, "hour", H>, Stream>
  : Part extends `:${infer m}:`
  ? Split<In, Add<Out, "minute", m>, Stream>
  : Part extends `:${infer s}.`
  ? Split<In, Add<Out, "second", s>, Stream>
  : Out;
