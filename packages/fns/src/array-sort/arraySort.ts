/**
 * Deeply sorts an array.
 *
 * @param left - The first value to compare.
 * @param right - The second value to compare.
 *
 * @returns The result of the comparison.
 */
export function arraySort(left: any, right: any): number {
  if (typeof left === "object" && typeof right === "object") {
    if (left === right) return 0;

    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();

    if (leftKeys.length !== rightKeys.length) {
      return leftKeys.length - rightKeys.length;
    }

    for (let i = 0; i < leftKeys.length; i++) {
      const key = leftKeys[i];
      const result = arraySort(left[key], right[key]);
      if (result !== 0) {
        return result;
      }
    }

    return 0;
  } else {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  }
}
