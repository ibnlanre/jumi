/**
 * Removes a cookie with the specified name.
 *
 * @param {string} name The name of the cookie to be removed.
 * @param {string} [path] Optional path of the cookie to be removed.
 * @returns {void}
 */
export function removeCookieValue(name: string, path: string = "/") {
  try {
    if (typeof document === "undefined") return;

    // The formal UNIX time count began on Thursday, January 1st 1970 at midnight GMT.
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  } catch (error) {
    console.error(
      `Error occurred while removing ${name} from document.cookie`,
      error
    );
  }
}
