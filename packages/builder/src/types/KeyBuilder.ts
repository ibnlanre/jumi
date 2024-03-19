import { RequiredKeys } from "@ibnlanre/types";
import { Key } from "./Key";

/**
 * Represents a builder for a store key.
 * @template T The type of the store.
 * @template P The type of the path.
 */
export type KeyBuilder<
  T extends Record<string, any>,
  P extends readonly string[] = []
> = {
  [K in RequiredKeys<T>]: T[K] extends (...args: infer R) => infer U
    ? {
        get: <Y extends any[]>(...args: Y) => [...P, Extract<K, string>, ...Y];
        use: (...args: Parameters<T[K]>) => [...P, Extract<K, string>, ...R];
      }
    : T[K] extends Record<string, any>
    ? Key<K, P> & KeyBuilder<T[K], [...P, Extract<K, string>]>
    : Key<K, P>;
};
