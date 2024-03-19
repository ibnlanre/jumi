import {
  Derivatives,
  Indexable,
  Intersect,
  OptionalKeys,
  Primitives,
  Structures,
} from "@ibnlanre/types";

export type OmitRequiredValues<ObjectType extends Record<string, any>> =
  ObjectType extends Primitives | Indexable | Structures | Derivatives
    ? ObjectType
    : Intersect<{
        [K in OptionalKeys<ObjectType>]: ObjectType[K] extends infer T
          ? T extends Record<string, any>
            ? OmitRequiredValues<T>
            : T
          : never;
      }>;
