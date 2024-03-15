import { UnionToTuple } from "@ibnlanre/types";

export type ToEntries<T extends Record<string, any>> = UnionToTuple<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;
