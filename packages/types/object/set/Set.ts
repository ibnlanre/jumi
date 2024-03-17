import {
  Derivatives,
  Indexable,
  Intersect,
  ObjectFromPath,
  OptionalKeys,
  Paths,
  Primitives,
  RequiredKeys,
  Structures,
} from "@ibnlanre/types";

type SetHelper<
  ObjectType extends Record<string, any>,
  PathType extends string,
  Key extends string,
  ValueType = never
> = PathType extends `${Key}.${infer Tail}`
  ? ObjectType[Key] extends infer ObjectType
    ? ObjectType extends Record<string, any>
      ? Set<ObjectType, Tail, ValueType>
      : Set<ObjectFromPath<Tail, ValueType>>
    : never
  : PathType extends Key
  ? ValueType
  : Set<ObjectType[Key]>;

export type Set<
  ObjectType extends Record<string, any>,
  PathType extends Paths<ObjectType> | (string & {}) = "",
  ValueType = never
> = ObjectType extends Primitives | Indexable | Structures | Derivatives
  ? ObjectType
  : Intersect<
      {
        [Key in RequiredKeys<ObjectType> as [ValueType] extends [never]
          ? Exclude<Key, PathType>
          : Key]: SetHelper<ObjectType, PathType, Key, ValueType>;
      } & {
        [Key in OptionalKeys<ObjectType> as [ValueType] extends [never]
          ? Exclude<Key, PathType>
          : Key]?: SetHelper<ObjectType, PathType, Key, ValueType>;
      }
    >;
