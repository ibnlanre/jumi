import {
  Derivatives,
  Indexable,
  Intersect,
  OptionalKeys,
  Paths,
  Primitives,
  RequiredKeys,
  Structures,
} from "@ibnlanre/types";

type OmitPathHelper<
  ObjectType extends Record<string, any>,
  PathType extends string,
  Key extends string
> = PathType extends `${Key}.${infer Tail}`
  ? OmitPath<ObjectType[Key], Tail>
  : OmitPath<ObjectType[Key]>;

export type OmitPath<
  ObjectType extends Record<string, any>,
  PathType extends Paths<ObjectType> | (string & {}) = ""
> = ObjectType extends Primitives | Indexable | Structures | Derivatives
  ? ObjectType
  : Intersect<
      {
        [Key in Exclude<RequiredKeys<ObjectType>, PathType>]: OmitPathHelper<
          ObjectType,
          PathType,
          Key
        >;
      } & {
        [Key in Exclude<OptionalKeys<ObjectType>, PathType>]?: OmitPathHelper<
          ObjectType,
          PathType,
          Key
        >;
      }
    >;
