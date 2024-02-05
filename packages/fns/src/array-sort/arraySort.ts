/**
 * Deeply sorts an array.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 *
 * @returns The result of the comparison.
 */
export function arraySort(a: any, b: any): number {
  if (typeof a === "object" && typeof b === "object") {
    if (a === b) return 0;

    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    if (aKeys.length !== bKeys.length) {
      return aKeys.length - bKeys.length;
    }

    for (let i = 0; i < aKeys.length; i++) {
      const key = aKeys[i];
      const result = arraySort(a[key], b[key]);
      if (result !== 0) {
        return result;
      }
    }

    return 0;
  } else {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
}
