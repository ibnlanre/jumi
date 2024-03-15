import { Keys } from "@ibnlanre/types";
import { Subtract } from "ts-arithmetic";

type PathsHelper<
  ObjectType extends Record<string, any>,
  Key extends string | number,
  Delimiter extends string,
  Level extends number
> = Level extends 0
  ? `${Key}`
  : Level extends -1
  ? `${Key}` | `${Key}${Delimiter}${Paths<ObjectType, Delimiter>}`
  :
      | `${Key}`
      | `${Key}${Delimiter}${Paths<ObjectType, Delimiter, Subtract<Level, 1>>}`;

/**
 * Get all the possible paths of an object
 *
 * @param ObjectType - The object to get the paths from
 * @param [Delimiter = "."] - The delimiter to use to separate the keys
 * @param [Level = -1] - The level to stop the recursion
 */
export type Paths<
  ObjectType extends Record<string, any>,
  Delimiter extends string = ".",
  Level extends number = -1
> = ObjectType extends Record<string, any>
  ? {
      [Key in Keys<ObjectType>]: Key extends string | number
        ? ObjectType[Key] extends infer ObjectType
          ? ObjectType extends Record<string, any>
            ? PathsHelper<ObjectType, Key, Delimiter, Level>
            : `${Key}`
          : never
        : never;
    }[Keys<ObjectType>]
  : never;
