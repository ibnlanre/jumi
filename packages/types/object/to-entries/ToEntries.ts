import { UnionToTuple } from "../../transforms";

export type ToEntries<T extends Record<string, any>> = UnionToTuple<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;
