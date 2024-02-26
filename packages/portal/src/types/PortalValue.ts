import type { Dimension } from "..";

import type { GetState } from "./GetState";
import type { SetStore } from "./SetStore";

/**
 * Represents the value of a portal entry.
 *
 * @template State The type of the state.
 */
export type PortalValue<State> = {
  /**
   * The BehaviorSubject that contains the current value of the store.
   */
  observable: Dimension<State>;
  /**
   * The method to set the value of the store.
   */
  set?: SetStore<State>;
  /**
   * The method to get the value of the store.
   */
  get?: GetState<State>;
};
