import type { GetState } from "./GetState";
import type { SetStore } from "./SetStore";

/**
 * Represents the options for the portal.
 */
export type PortalOptions<State, Data> = {
  /**
   * The initial value of the portal.
   *
   * @description
   * - This value is only used when the `path` is not defined within the portal.
   * - This value will be overidden if the `get` method is defined.
   * - It uses the `useState` hook internally.
   */
  state?: State | (() => State);

  /**
   * Select the required data from the state.
   *
   * @default (value: State) => Data
   * @param value The state value.
   *
   * @returns The selected data.
   */
  select?: (value: State) => Data;

  /**
   * Callback to run after the state is initialized or updated.
   *
   * @summary
   * - when the state is initialized or updated.
   * - if the state is updated by the `get` method.
   */
  set?: SetStore<State>;

  /**
   * Method to get the initial value.
   *
   * @description
   * - This method is only called when the `path` is not defined within the portal.
   * - It uses the `useEffect` hook internally.
   */
  get?: GetState<State>;
};
