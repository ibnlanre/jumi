type Primitives = string | number | bigint | boolean | null | undefined;
type ToString<T> = T extends Primitives ? `${T}` : Extract<T, string>;

type ArrayToString<T extends any[]> = T extends [infer First, ...infer Rest]
  ? `${ToString<First>}${Rest extends [] ? "" : ","}${ArrayToString<Rest>}`
  : "";

type UnionToIntersection<U> = (
  U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
  ? I
  : never;

type UnionToTuple<T> = UnionToIntersection<
  T extends never ? never : (t: T) => T
> extends (_: never) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

type Construct<K extends keyof T, T> = ObjectToStringKey<T[K]> extends infer U
  ? U extends ""
    ? `${ToString<K>}`
    : `${ToString<K>}:${ToString<U>}`
  : never;

type Flat<K, T> = UnionToTuple<K> extends [infer First, ...infer Rest]
  ? First extends keyof T
    ? `${Construct<First, T>}${Rest extends [] ? "" : ";"}${Flat<
        Exclude<keyof T, First>,
        T
      >}`
    : never
  : never;

type ObjectToString<T> = keyof T extends never
  ? ""
  : Extract<keyof T, string> extends infer K
  ? Flat<K, T>
  : never;

type ObjectToStringKey<T> = T extends string
  ? T
  : T extends any[]
  ? ArrayToString<T>
  : T extends object
  ? ObjectToString<T>
  : ToString<T>;

/**
 * Converts a reference type to a string representation that can be used as a key.
 *
 * @param {any} value The value to convert.
 * @returns {string} The string representation of the value.
 */
export function objectToStringKey<T>(value: T): string {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      const arrayString = value.map(objectToStringKey).join(",");
      return `[${arrayString}]`;
    } else {
      const objectString = Object.entries(value)
        .map(([key, val]) => `${key}:${objectToStringKey(val)}`)
        .join(";");
      return `{${objectString}}`;
    }
  } else {
    return JSON.stringify(value);
  }
}

export function stringKeyToObject<T extends string>(key: T): any {
  if (key.startsWith("{")) {
    const objectString = key.slice(1, -1);
    const entries = objectString.split(";");
    const object = entries.reduce((acc, entry) => {
      const [key, value] = entry.split(":") as [string, string];
      return { ...acc, [key]: stringKeyToObject(value) };
    }, {});
    return object;
  } else if (key.startsWith("[")) {
    const arrayString = key.slice(1, -1);
    const array = arrayString.split(",").map(stringKeyToObject);
    return array;
  } else {
    return JSON.parse(key);
  }
}
