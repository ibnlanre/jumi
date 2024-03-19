import { DeepRequired, OmitOptionalValues } from "@ibnlanre/types";
import { KeyBuilder } from "./KeyBuilder";

/**
 * Represents a builder for a store.
 * @template T The type of the store.
 * @template P The type of the path.
 */
export type Builder<T extends Record<string, any>, P extends string[] = []> = {
  map: DeepRequired<T>;
  use: () => OmitOptionalValues<T>;
  get: () => P;
} & KeyBuilder<T, P>;
