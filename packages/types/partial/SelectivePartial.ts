import type { Intersect } from "../transforms/intersect";

export type SelectivePartial<
  T extends Record<string, any>,
  K extends keyof T
> = Intersect<Partial<T> & Omit<T, K>>;
