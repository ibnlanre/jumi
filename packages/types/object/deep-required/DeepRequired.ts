import { Intersect } from "../../transforms";
import { Derivatives } from "../derivatives";
import { IncludeKeys } from "../include-keys";
import { Indexable } from "../indexable";
import { OptionalKeys } from "../optional-keys";
import { Paths } from "../paths";
import { RequiredKeys } from "../required-keys";
import { SplitDelimitedKeys } from "../split-delimited-keys";
import { Structures } from "../structures";

type DeepRequiredHelper<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never,
  Key extends keyof ObjectType = keyof ObjectType
> = ObjectType[Key] extends infer ObjectType
  ? ObjectType extends Record<string, any>
    ? [PathType] extends [never]
      ? DeepRequired<ObjectType>
      : DeepRequired<ObjectType, SplitDelimitedKeys<PathType, Key>>
    : ObjectType
  : never;

export type DeepRequired<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = ObjectType extends Indexable | Structures | Derivatives
  ? ObjectType
  : [PathType] extends [never]
  ? {
      [Key in keyof ObjectType]-?: DeepRequiredHelper<
        ObjectType,
        PathType,
        Key
      >;
    }
  : Intersect<
      {
        [Key in Exclude<
          RequiredKeys<ObjectType>,
          PathType
        >]: DeepRequiredHelper<ObjectType, PathType, Key>;
      } & {
        [Key in Exclude<
          OptionalKeys<ObjectType>,
          PathType
        >]?: DeepRequiredHelper<ObjectType, PathType, Key>;
      } & {
        [Key in IncludeKeys<ObjectType, PathType>]-?: DeepRequiredHelper<
          ObjectType,
          PathType,
          Key
        >;
      }
    >;
