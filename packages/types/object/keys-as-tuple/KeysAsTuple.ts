import { Dictionary, LastOfUnion } from "@ibnlanre/types";

type KeysAsTupleHelper<
  ObjectType extends Dictionary,
  Keys extends any[] = []
> = LastOfUnion<keyof ObjectType> extends infer Key
  ? [Key] extends [never]
    ? Keys
    : Key extends keyof ObjectType
    ? KeysAsTupleHelper<Omit<ObjectType, Key>, [Key, ...Keys]>
    : never
  : Keys;

export type KeysAsTuple<ObjectType extends Dictionary> =
  KeysAsTupleHelper<ObjectType>;
