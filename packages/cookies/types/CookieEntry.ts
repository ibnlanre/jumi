import type { CookieOptions } from "./CookieOptions";

/**
 * Represents a cookie entry in the cookie storage.
 */
export type CookieEntry = CookieOptions & {
  /**
   * The value of the cookie entry, which is of type `string`.
   */
  value: string;
};
