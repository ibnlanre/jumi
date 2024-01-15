import { AtomState } from "@/definition";

/**
 * Type guard that checks if a value is a function taking a properties parameter and returning a State.
 *
 * @param {State | ((properties: Properties) => State)} value The value to check.
 * @returns {value is (properties: Properties) => State} True if the value is a valid set state function, false otherwise.
 */
export function isAtomStateFunction<State, Properties>(
  value: AtomState<State, Properties>
): value is (properties: Properties) => State {
  // Check if the value is a function by examining its type
  return typeof value === "function";
}
