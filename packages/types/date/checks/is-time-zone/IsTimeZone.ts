import { Pattern } from "@ibnlanre/types";

export type IsTimeZone<T extends string> = Pattern<
  T,
  ":" | "",
  `${"+" | "-"}${number}`,
  number
>;
