import type { Prettify } from "../prettify";

export type SelectivePartial<
  T extends Record<string, any>,
  K extends keyof T
> = Prettify<Partial<T> & Omit<T, K>>;
