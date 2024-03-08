import type { Add } from "../add";

export type TimeZoneBreak<
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = "+"
> = Add<Out, "timezone", `${Stream}${In}`>;
