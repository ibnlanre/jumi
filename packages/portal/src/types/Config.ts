import type { PortalOptions } from "./PortalOptions";

/**
 * Represents the config for the portal.
 *
 * @template State The type of the state.
 * @template Data The type of the data.
 */
export interface Config<State, Data>
  extends Omit<PortalOptions<State, Data>, "set" | "get"> {
  /**
   * The key to use in the storage.
   * @default path
   */
  key?: string;

  /**
   * Set the value in the storage.
   *
   * @default (value: State) => JSON.stringify(value)
   *
   * @param value The value from the portal.
   * @returns The value to be stored.
   */
  set?: (value: State) => string;

  /**
   * Get the value from the storage.
   *
   * @default (value: string) => JSON.parse(value)
   *
   * @param value The value from the portal.
   * @returns The value to set the portal to.
   */
  get?: (value: string) => State;
}
