import { Pattern } from "@ibnlanre/types";

export type IsYear<T extends string> = Pattern<
  T,
  number,
  "-" | "",
  "Z" | "-" | ""
>;
