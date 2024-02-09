import { KeyBuilder } from "./KeyBuilder";

/**
 * Represents a builder for a store.
 * @template T The type of the store.
 * @template P The type of the path.
 */
export type Builder<T extends Record<string, any>, P extends string[] = []> = {
  use: () => T;
  get: () => P;
  typeof: T;
} & KeyBuilder<T, P>;
