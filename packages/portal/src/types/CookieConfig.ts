import type { CookieOptions } from "@/packages/cookies/types";
import { Config } from "./Config";

/**
 * Represents the config for the cookie portal.
 *
 * @template State The type of the state.
 * @template Data The type of the data.
 */
export interface CookieConfig<State, Data> extends Config<State, Data> {
  /**
   * The options for the cookie.
   */
  cookieOptions?: CookieOptions;
}
