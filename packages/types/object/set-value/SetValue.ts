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

type SetValueHelper<
  ObjectType extends Record<string, any>,
  PathType extends string,
  Key extends string,
  ValueType = never
> = PathType extends `${Key}.${infer Tail}`
  ? ObjectType[Key] extends infer ObjectType
    ? ObjectType extends Record<string, any>
      ? SetValue<ObjectType, Tail, ValueType>
      : SetValue<ObjectFromPath<Tail, ValueType>>
    : never
  : PathType extends Key
  ? ValueType
  : SetValue<ObjectType[Key]>;

type Setter<
  ObjectType extends Record<string, any>,
  PathType extends string,
  ValueType = never
> = Intersect<
  {
    [Key in RequiredKeys<ObjectType> as [ValueType] extends [never]
      ? Exclude<Key, PathType>
      : Key]: SetValueHelper<ObjectType, PathType, Key, ValueType>;
  } & {
    [Key in OptionalKeys<ObjectType> as [ValueType] extends [never]
      ? Exclude<Key, PathType>
      : Key]?: SetValueHelper<ObjectType, PathType, Key, ValueType>;
  }
>;

export type SetValue<
  ObjectType extends Record<string, any>,
  PathType extends Paths<ObjectType> | (string & {}) = "",
  ValueType = never
> = ObjectType extends Primitives | Indexable | Structures | Derivatives
  ? ObjectType
  : PathType extends keyof ObjectType | `${infer Head}.${string}` | ""
  ? Head extends keyof ObjectType
    ? Setter<ObjectType, PathType, ValueType>
    : Intersect<
        Setter<ObjectType, PathType, ValueType> &
          ObjectFromPath<PathType, ValueType>
      >
  : [ValueType] extends [never]
  ? Setter<ObjectType, PathType>
  : {
      [Key in keyof ObjectType | PathType]: Key extends keyof ObjectType
        ? ObjectType[Key]
        : ValueType;
    };
