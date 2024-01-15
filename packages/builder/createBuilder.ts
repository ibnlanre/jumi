import type { Builder, KeyBuilder } from "@/definition";

/**
 * Returns a builder object that represents the nested keys of the provided object.
 *
 * @template T The type of the object.
 *
 * @param {T} register The object to traverse and retrieve the nested keys.
 * @param {string[]} [prefix=[]] An optional prefix to prepend to keys array in the builder object.
 *
 * @returns {Builder<T>} A builder object with callable functions representing the nested keys.
 *
 * @summary By using the createBuilder function, you can define nested keys and associated values, allowing you to build complex key structures for various purposes.
 * @description The builder object can be used to enforce type safety and provide auto-completion support when working with the defined keys.
 */
export function createBuilder<
  T extends Record<string, any>,
  P extends readonly string[] = []
>(register: T, ...prefix: P): Builder<T, P> {
  const keys = Object.keys(register) as Array<keyof T>;

  const builder = keys.reduce((acc, key) => {
    const value = register[key];
    const newPath = prefix ? prefix.concat([key as string]) : [key as string];

    if (typeof value === "function") {
      return {
        ...acc,
        [key]: {
          use: (...args: Parameters<typeof value>) => [...newPath, ...args],
          get: (...args: any[]) => [...newPath, ...args],
        },
      };
    }

    if (typeof value === "object" && value !== null) {
      return {
        ...acc,
        [key]: Object.assign(
          {
            use: () => newPath,
            get: (...args: any[]) => [...newPath, ...args],
          },
          createBuilder(value, ...newPath)
        ),
      };
    }

    return {
      ...acc,
      [key]: {
        use: () => newPath,
        get: (...args: any[]) => [...newPath, ...args],
      },
    };
  }, {} as KeyBuilder<T>);

  return Object.assign({
    use: () => register,
    get: () => prefix,
  }, builder) as Builder<T, P>;
}
