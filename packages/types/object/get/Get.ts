import { Keys, Paths } from "@ibnlanre/types";

/**
 * Represents the value at a path in a store.
 *
 * @template T The type of the store.
 * @template Path The type of the path.
 * @template Delimiter The type of the delimiter.
 *
 * @description It is a union of all the possible values in the store.
 */
export type Get<
  ObjectType extends Record<string, any>,
  Path extends Paths<ObjectType, Delimiter> | (string & {}),
  FallBack = never,
  Delimiter extends string = "."
> = Path extends `${infer Key}${Delimiter}${infer Rest}`
  ? Get<ObjectType[Key], Rest, FallBack>
  : Path extends Keys<ObjectType>
  ? ObjectType[Path]
  : FallBack;
