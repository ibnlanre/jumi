import type { SetStateAction, Dispatch } from "react";

import { CookieOptions } from "./cookie";
import { Dimension, Portal } from "@/portal";

/**
 * Represents the method to get the portal's initial value.
 * @template State The type of the state.
 */
export type GetState<State> = (state: State) => State;

/**
 * Represents the method to set the value of the store.
 * @template State The type of the state.
 */
export type SetStore<State> = (value: State) => void;

/**
 * Represents the options for the portal.
 */
export type PortalOptions<State, Data> = {
  /**
   * The initial value of the portal.
   *
   * @description
   * - This value is only used when the `path` is not defined within the portal.
   * - This value will be overidden if the `get` method is defined.
   * - It uses the `useState` hook internally.
   */
  state?: State | (() => State);

  /**
   * Select the required data from the state.
   *
   * @default (value: State) => Data
   * @param value The state value.
   *
   * @returns The selected data.
   */
  select?: (value: State) => Data;

  /**
   * Callback to run after the state is initialized or updated.
   *
   * @summary
   * - when the state is initialized or updated.
   * - if the state is updated by the `get` method.
   */
  set?: SetStore<State>;

  /**
   * Method to get the initial value.
   *
   * @description
   * - This method is only called when the `path` is not defined within the portal.
   * - It uses the `useEffect` hook internally.
   */
  get?: GetState<State>;
};

/**
 * Represents the config for the portal.
 *
 * @template State The type of the state.
 * @template Data The type of the data.
 */
export interface Config<State, Data>
  extends Omit<PortalOptions<State, Data>, "set" | "get"> {
  /**
   * The key to use in the storage.
   * @default path
   */
  key?: string;

  /**
   * Set the value in the storage.
   *
   * @default (value: State) => JSON.stringify(value)
   *
   * @param value The value from the portal.
   * @returns The value to be stored.
   */
  set?: (value: State) => string;

  /**
   * Get the value from the storage.
   *
   * @default (value: string) => JSON.parse(value)
   *
   * @param value The value from the portal.
   * @returns The value to set the portal to.
   */
  get?: (value: string) => State;
}

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

/**
 * Represents the value of a portal entry.
 *
 * @template State The type of the state.
 */
export type PortalValue<State> = {
  /**
   * The BehaviorSubject that contains the current value of the store.
   */
  observable: Dimension<State>;
  /**
   * The method to set the value of the store.
   */
  set?: SetStore<State>;
  /**
   * The method to get the value of the store.
   */
  get?: GetState<State>;
};

/**
 * Represents a map of keys and values in the portal entries.
 * @template State The type of the state.
 * @template Path The type of the path.
 */
export type PortalMap<State, Path> = Map<Path, PortalValue<State>>;

/**
 * Represents the result of the usePortal hook.
 * @template State The type of the state.
 */
export type PortalState<State, Data = State> = [
  Data,
  Dispatch<SetStateAction<State>>
];

/**
 * Represents the path to a value in a store.
 *
 * @description
 * Do not modify this type, without taking into consideration the following:
 * 1. Methods defined within the Record values.
 * 2. Number and Array types.
 *
 * @summary
 * 1. It is a string literal type.
 * 2. It is a union of all the possible paths in the store.
 */
export type Paths<Base, Delimiter extends string = "."> = Base extends Record<
  infer Keys extends string | number,
  infer Value
>
  ? {
      [Key in Keys]: Key extends string | number
        ? Extract<Value, Base[Key]> extends Record<string, any>
          ? `${Key}` | `${Key}${Delimiter}${Paths<Base[Key], Delimiter>}`
          : `${Keys}`
        : never;
    }[Keys]
  : never;

/**
 * Represents the value of a key in a store.
 *
 * @template Key The type of the key.
 */
export type ParseAsNumber<Key extends string | number> =
  Key extends `${infer Value extends number}` ? Value : Key;

/**
 * Represents the value at a path in a store.
 *
 * @template T The type of the store.
 * @template Path The type of the path.
 * @template Delimiter The type of the delimiter.
 *
 * @description It is a union of all the possible values in the store.
 */
export type GetValueByPath<
  T,
  Path extends string | number,
  Delimiter extends string = "."
> = ParseAsNumber<Path> extends keyof T
  ? T[ParseAsNumber<Path>]
  : Path extends `${infer Key}${Delimiter}${infer Rest}`
  ? ParseAsNumber<Key> extends keyof T
    ? GetValueByPath<T[ParseAsNumber<Key>], Rest>
    : never
  : never;

/**
 * Represents the properties of the `usePortal` hook.
 *
 * @template State The type of the state.
 * @template Path The type of the path.
 * @template Store The type of the store.
 * @template Data The type of the data.
 */
export interface UsePortal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  store: Portal;
  initialState?: State;
  options?: PortalOptions<State, Data>;
}

/**
 * Represents the properties of the `useLocal` hook.
 *
 * @template State The type of the state.
 * @template Path The type of the path.
 * @template Store The type of the store.
 * @template Data The type of the data.
 */
export interface UseLocal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  store: Portal;
  config?: Config<State, Data>;
  initialState: State;
}

/**
 * Represents the properties of the `useSession` hook.
 *
 * @template State The type of the state.
 * @template Path The type of the path.
 * @template Store The type of the store.
 * @template Data The type of the data.
 */
export interface UseSession<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  store: Portal;
  initialState: State;
  config?: Config<State, Data>;
}

/**
 * Represents the properties of the `useCookie` hook.
 *
 * @template Store The type of the store.
 * @template Path The type of the path.
 * @template State The type of the state.
 * @template Data The type of the data.
 */
export interface UseCookie<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  store: Portal;
  initialState: State;
  config?: CookieConfig<State, Data>;
}

/**
 * Represents the type of a subscription to a `Subject`.
 */
export type Subscription = {
  /**
   * Unsubscribes the callback from receiving further updates.
   */
  unsubscribe: () => void;
};

/**
 * Represents a storage type.
 * @typedef {"local" | "session" | "cookie"} StorageType
 */
export type StorageType = "local" | "session" | "cookie";
