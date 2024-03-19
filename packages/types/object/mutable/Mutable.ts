import {
  Derivatives,
  Indexable,
  Intersect,
  Primitives,
  Structures,
} from "@ibnlanre/types";

export type Mutable<T> = T extends
  | Primitives
  | Indexable
  | Structures
  | Derivatives
  ? T
  : Intersect<{
      -readonly [K in keyof T]: T[K] extends Record<string, any>
        ? Mutable<T[K]>
        : T[K];
    }>;
