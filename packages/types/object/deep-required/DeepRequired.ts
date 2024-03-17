import type {
  Derivatives,
  IncludeKeys,
  Indexable,
  Intersect,
  Keys,
  OptionalKeys,
  Paths,
  Primitives,
  RequiredKeys,
  Structures,
} from "@ibnlanre/types";

type DeepRequiredHelper<
  ObjectType extends Record<string, any>,
  PathType extends string,
  Key extends string
> = [PathType] extends [never]
  ? DeepRequired<ObjectType[Key]>
  : PathType extends `${Key}.${infer Tail}`
  ? DeepRequired<ObjectType[Key], Tail>
  : DeepRequired<ObjectType[Key], "">;

export type DeepRequired<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = ObjectType extends Primitives | Indexable | Structures | Derivatives
  ? ObjectType
  : [PathType] extends [never]
  ? {
      [Key in Keys<ObjectType>]: Exclude<
        DeepRequiredHelper<ObjectType, PathType, Key>,
        undefined
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
        [Key in IncludeKeys<ObjectType, PathType>]: Exclude<
          DeepRequiredHelper<ObjectType, PathType, Key>,
          undefined
        >;
      }
    >;
