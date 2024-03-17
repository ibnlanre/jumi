import { ArbitraryKey, Keys, Paths, Stringify } from "@ibnlanre/types";

/**
 * Represents the value at a path in an object.
 *
 * @template ObjectType The type of the object.
 * @template Path The type of the path.
 * @template Delimiter The type of the delimiter.
 */
export type Get<
  ObjectType extends Record<string, any>,
  Path extends Paths<ObjectType, Delimiter> | ArbitraryKey,
  FallBack = never,
  Delimiter extends string = "."
> = Path extends `${infer Key}${Delimiter}${infer Rest}`
  ? Get<ObjectType[Key], Rest, FallBack>
  : Stringify<Path> extends Keys<ObjectType>
  ? ObjectType[Stringify<Path>]
  : FallBack;
