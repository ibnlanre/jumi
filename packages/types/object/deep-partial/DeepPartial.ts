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

type DeepPartialHelper<
  ObjectType extends Record<string, any>,
  PathType extends string,
  Key extends string
> = [PathType] extends [never]
  ? DeepPartial<ObjectType[Key]>
  : PathType extends `${Key}.${infer Tail}`
  ? DeepPartial<ObjectType[Key], Tail>
  : DeepPartial<ObjectType[Key], "">;

export type DeepPartial<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = ObjectType extends Primitives | Indexable | Structures | Derivatives
  ? ObjectType
  : [PathType] extends [never]
  ? {
      [Key in Keys<ObjectType>]?: DeepPartialHelper<ObjectType, PathType, Key>;
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

type Test1 = { a: { b?: { c: string } } };
type Test = DeepPartial<{ a: { b: { c: string } } }, "a.b">;

// extends infer R
//   ? [R] extends [never]
//     ? undefined
//     : R
//   : never;
