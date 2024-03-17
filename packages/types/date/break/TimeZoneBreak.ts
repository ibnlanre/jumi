import type { Set } from "@ibnlanre/types";

export type TimeZoneBreak<
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = "+"
> = Set<Out, "timezone", `${Stream}${In}`>;
