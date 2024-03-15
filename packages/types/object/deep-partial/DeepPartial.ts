import type { Intersect } from "../../transforms";
import type { IncludeKeys } from "../include-keys";

import type { OptionalKeys } from "../optional-keys";
import type { Paths } from "../paths";
import type { RequiredKeys } from "../required-keys";

import type { Derivatives } from "../derivatives";
import type { Indexable } from "../indexable";
import type { SplitDelimitedKeys } from "../split-delimited-keys";
import type { Structures } from "../structures";

type DeepPartialHelper<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never,
  Key extends keyof ObjectType = keyof ObjectType
> = ObjectType[Key] extends infer ObjectType
  ? ObjectType extends Record<string, any>
    ? [PathType] extends [never]
      ? DeepPartial<ObjectType>
      : DeepPartial<ObjectType, SplitDelimitedKeys<PathType, Key>>
    : ObjectType
  : never;

export type DeepPartial<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = ObjectType extends Indexable | Structures | Derivatives
  ? ObjectType
  : [PathType] extends [never]
  ? {
      [Key in keyof ObjectType]?: DeepPartialHelper<ObjectType, PathType, Key>;
    }
  : Intersect<
      {
        [Key in Exclude<RequiredKeys<ObjectType>, PathType>]: DeepPartialHelper<
          ObjectType,
          PathType,
          Key
        >;
      } & {
        [Key in Exclude<
          OptionalKeys<ObjectType>,
          PathType
        >]?: DeepPartialHelper<ObjectType, PathType, Key>;
      } & {
        [Key in IncludeKeys<ObjectType, PathType>]?: DeepPartialHelper<
          ObjectType,
          PathType,
          Key
        >;
      }
    >;
