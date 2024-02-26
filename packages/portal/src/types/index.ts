
import { Dimension, Portal } from "@/portal/Portal";













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
