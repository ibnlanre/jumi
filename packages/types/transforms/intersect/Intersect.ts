import { Dictionary } from "@ibnlanre/types";

export type Intersect<T> = {
  [K in keyof T]: T[K] extends Dictionary ? Intersect<T[K]> : T[K];
} & {};
