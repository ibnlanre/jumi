import type {
  IncludeKeys,
  Intersect,
  OptionalKeys,
  Paths,
  RequiredKeys,
} from "@ibnlanre/types";

import type { Derivatives } from "../derivatives";
import type { ExtractNestedKeys } from "../extract-nested-keys";
import type { Indexable } from "../indexable";
import type { Structures } from "../structures";

type DeepRequiredHelper<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never,
  Key extends keyof ObjectType = keyof ObjectType
> = ObjectType[Key] extends infer ObjectType
  ? ObjectType extends Record<string, any>
    ? [PathType] extends [never]
      ? DeepRequired<ObjectType>
      : DeepRequired<ObjectType, ExtractNestedKeys<PathType, Key>>
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
