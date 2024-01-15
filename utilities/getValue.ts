import { GetValueByPath, Paths } from "@/definition";

/**
 * Retrieve the value of an object at the specified path.
 *
 * @template Store The type of the store.
 * @template Path The type of the path.
 * @template Value The type of the value.
 *
 * @param {Store} object The object to retrieve the value from.
 * @param {Path} path The path to the value.
 *
 * @returns {Value} The value at the specified path.
 */
export function getValue<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  Value extends GetValueByPath<Store, Path>
>(object: Store, path: Path, delimiter = ".") {
  let value = object;
  const paths = path.split(delimiter);
  for (const key of paths) value = value[key];
  return value as unknown as Value;
}
