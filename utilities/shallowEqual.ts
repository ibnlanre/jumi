/**
 * A function that compares two values shallowly.
 *
 * @param {any} a The first value to compare.
 * @param {any} b The second value to compare.
 *
 * @returns {boolean} Whether the two values are equal shallowly.
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}
