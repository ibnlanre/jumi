/**
 * Represents the options for setting a cookie.
 */
export type CookieOptions = {
  /**
   * The path for which the cookie is valid.
   */
  path?: string;

  /**
   * The domain for which the cookie is valid.
   */
  domain?: string;

  /**
   * The expiration date or duration for the cookie.
   * It can be a number representing the number of seconds until expiration,
   * or a Date object specifying the exact expiration date and time.
   */
  expires?: number | Date;

  /**
   * Specifies if the cookie should only be transmitted over secure (HTTPS) connections.
   */
  secure?: boolean;

  /**
   * Specifies the SameSite attribute for the cookie.
   * It can be one of the following values: "strict", "lax", or "none".
   */
  sameSite?: "strict" | "lax" | "none";

  /**
   * The maximum age of the cookie in seconds.
   */
  maxAge?: number;

  /**
   * Specifies if the cookie should be accessible only through HTTP requests and not through JavaScript code.
   */
  httpOnly?: boolean;

  /**
   * Specifies if the cookie should be partitioned.
   */
  partitioned?: boolean;
};
