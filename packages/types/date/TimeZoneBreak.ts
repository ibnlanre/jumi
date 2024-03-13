import type { Insert } from "../object/set";

export type TimeZoneBreak<
  In extends string,
  Out extends Record<string, string> = {},
  Stream extends string = "+"
> = Insert<Out, "timezone", `${Stream}${In}`>;
