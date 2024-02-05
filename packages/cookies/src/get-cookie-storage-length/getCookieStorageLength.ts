/**
 * Get the length of cookieStorage (the number of individual cookies).
 * @returns {number} The number of cookies in cookieStorage.
 */
export function getCookieStorageLength() {
  try {
    if (typeof document === "undefined") return 0;

    const cookies = document.cookie.split(";");

    // Remove any leading/trailing white spaces and empty cookies
    const validCookies = cookies.filter((cookie) => cookie.trim() !== "");

    // Return the number of valid cookies
    return validCookies.length;
  } catch (error) {
    console.error("Error occurred while getting cookieStorage length:", error);
    return 0;
  }
}
