import type {
  Derivatives,
  IncludeKeys,
  Indexable,
  Intersect,
  IsUnion,
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

type RequireValue<ObjectType extends Record<string, any>> =
  IsUnion<ObjectType> extends 0 ? ObjectType : Exclude<ObjectType, undefined>;

export type DeepRequired<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = ObjectType extends Primitives | Indexable | Structures | Derivatives
  ? ObjectType
  : [PathType] extends [never]
  ? {
      [Key in Keys<ObjectType>]: RequireValue<
        DeepRequiredHelper<ObjectType, PathType, Key>
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
        [Key in IncludeKeys<ObjectType, PathType>]: RequireValue<
          DeepRequiredHelper<ObjectType, PathType, Key>
        >;
      }
    >;
