import { SetStateAction } from "react";
import { isSetStateFunction } from "./isSetStateFunction";

/**
 * Gets the actual state value from the provided initial state.
 * @template State The type of the initial state value.
 * @param {State | ((prevState: State) => State)} initialState The initial state value or a function that returns the initial state.
 * @returns {State} The actual state value.
 */
export function getComputedState<State>(
  initialState: SetStateAction<State>,
  previousState: State
): State {
  if (isSetStateFunction(initialState)) return initialState(previousState);
  return initialState;
}
