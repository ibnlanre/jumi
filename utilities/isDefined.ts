/**
 * Check if the provided value is undefined.
 *
 * @param {T} v Value to be checked.
 * @returns {boolean} `true` if the value is undefined, `false` otherwise.
 */
export const isDefined = <T>(v: T): v is T => typeof v !== "undefined";
