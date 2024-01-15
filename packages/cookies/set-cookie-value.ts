import { formatCookieOptions } from "./format-cookie-options";
import type { CookieOptions } from "@/definition";

/**
 * Sets a cookie with the specified name and value.
 *
 * @param {string} name The name of the cookie.
 * @param {string} value The value to be set for the cookie.
 * @param {CookieOptions} [options] Optional cookie options.
 * @returns {void}
 */
export function setCookieValue(
  name: string,
  value: string,
  options?: CookieOptions
) {
  try {
    if (typeof value !== "string") {
      if (process.env.NODE_ENV === "development") {
        console.warn("Cookie value should be a string:", value);
      }
      return;
    }

    if (typeof document !== "undefined") {
      // Format the cookie options string
      const cookieOptionsString = formatCookieOptions(options);

      // Set the cookie with the provided name, value, and options
      document.cookie = `${name}=${value}${cookieOptionsString}`;
    }
  } catch (error) {
    console.error("Error occurred while setting cookie:", error);
  }
}
