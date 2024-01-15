import { removeCookieValue } from "./remove-cookie-value";

/**
 * Clears all cookies from cookieStorage.
 * @returns {void}
 */
export function clearCookieStorage() {
  try {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const [name, _] = cookie.split("=");
        removeCookieValue(name as string);
      });
    }
  } catch (error) {
    console.error("Error occurred while clearing cookieStorage:", error);
  }
}
