import {
  Derivatives,
  Indexable,
  Intersect,
  Primitives,
  RequiredKeys,
  Structures,
} from "@ibnlanre/types";

export type OmitOptionalValues<ObjectType extends Record<string, any>> =
  ObjectType extends Primitives | Indexable | Structures | Derivatives
    ? ObjectType
    : Intersect<{
        [K in RequiredKeys<ObjectType>]: ObjectType[K] extends infer T
          ? T extends Record<string, any>
            ? OmitOptionalValues<T>
            : T
          : never;
      }>;
