import { useState, useEffect } from "react";

import type {
  UsePortal,
  GetValueByPath,
  Paths,
  PortalState,
  Subscription,
} from "@/definition";

/**
 * Internal function to handle state and subscriptions for the `usePortal` hook.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param {UsePortal<Store, Path, State, Data>} properties
 *
 * @property {Path} path The path of the portal's state
 * @property {Portal} [portal] The portal to be used
 * @property {Config<State>} [config] The config of the portal's state
 * @property {State} initialState The initial state of the portal
 *
 * @returns {PortalState<State, Data>} A tuple containing the current state and a function to update the state.
 */
export function usePortal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(properties: UsePortal<Store, Path, State, Data>): PortalState<State, Data> {
  const { path, store, options, initialState } = properties;
  const {
    select = (value: State) => value as unknown as Data,
    state = initialState as State,
    ...events
  } = { ...options };

  /**
   * Retrieve the stored state from the specified storage or use the initial state if not found.
   * @type {State}
   */
  const [resolvedState, setResolvedState] = useState(state);

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {PortalValue<State>}
   */
  const { observable, set, get } = store.insertItem(
    path,
    resolvedState,
    events
  );

  /**
   * Subscribe to state changes and update the component's state accordingly.
   */
  useEffect(() => {
    let persistence: Subscription | undefined;

    /**
     * Subscribe the component's state to the current value of the portal.
     * @type {Subscription}
     */
    const subscriber = observable.subscribe(setResolvedState);

    /**
     * Get the stored value from the `get` method and update the portal's state.
     */
    const storedValue = get?.(observable.value);
    if (typeof storedValue !== "undefined") {
      observable.set(storedValue);
    }

    /**
     * Subscribe the `set` method to the current value of the portal.
     */
    if (typeof set !== "undefined") {
      persistence = observable.subscribe(set);
    }

    /**
     * Unsubscribe from state changes when the component is unmounted.
     * @returns {void}
     */
    return () => {
      subscriber.unsubscribe();
      persistence?.unsubscribe();
    };
  }, [observable]);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<State, Data>}
   */
  return [select(observable.value), observable.set];
}
