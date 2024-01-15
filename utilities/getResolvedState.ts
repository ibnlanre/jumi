import { isFunction } from "./isFunction";

/**
 * Gets the actual state value from the provided initial state.
 * @template State The type of the initial state value.
 * @param {State | (() => State)} initialState The initial state value or a function that returns the initial state.
 * @returns {State} The actual state value.
 */
export function getResolvedState<State>(
  initialState?: State | (() => State)
): State {
  if (isFunction(initialState)) return initialState();
  return initialState as State;
}
