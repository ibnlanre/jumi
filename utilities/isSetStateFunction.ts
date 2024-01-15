import { SetStateAction } from "react";

/**
 * Type guard to check if a value is a SetStateAction function.
 *
 * @template State The type of the state.
 * @param {SetStateAction<State>} value The value to be checked.
 * @returns {boolean} `true` if the value is a SetStateAction function, otherwise `false`.
 */
export function isSetStateFunction<State>(
  value: SetStateAction<State>
): value is (prevState: State) => State {
  return typeof value === "function";
}
