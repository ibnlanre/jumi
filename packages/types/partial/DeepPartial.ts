import type { Intersect } from "../transforms/intersect";
import type { Derivatives } from "./Derivatives";
import type { Indexable } from "./Indexable";
import type { Structures } from "./Structures";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any>
    ? T[K] extends Indexable | Structures | Derivatives
      ? T[K]
      : Intersect<DeepPartial<T[K]>>
    : T[K];
};
