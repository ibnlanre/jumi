import { CookieOptions } from "@/definition";

/**
 * Formats the provided cookie options into a string format compatible with the document.cookie API.
 *
 * @param {CookieOptions} [options] The cookie options to format.
 * @returns {string} The formatted cookie options as a string.
 */
export function formatCookieOptions(options?: CookieOptions): string {
  if (!options) return "; path=/";

  let optionsString = `; path=${options.path ?? "/"}`;
  if (options.domain) optionsString += `; domain=${options.domain}`;
  if (options.secure || options.httpOnly) optionsString += "; secure";
  if (options.expires) {
    const expires =
      options.expires instanceof Date
        ? options.expires.toUTCString()
        : options.expires;
    optionsString += `; expires=${expires}`;
  }
  if (options.sameSite) optionsString += `; samesite=${options.sameSite}`;
  if (options.maxAge) optionsString += `; max-age=${options.maxAge}`;
  if (options.httpOnly) optionsString += "; httpOnly";
  if (options.partitioned) optionsString += "; partitioned";

  return optionsString;
}
