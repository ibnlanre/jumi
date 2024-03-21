import { Pattern } from "@ibnlanre/types";

export type IsSeconds<T extends string> = Pattern<
  T,
  number,
  ":",
  "Z" | "." | ""
>;
