import { Dictionary, LastOfUnion } from "@ibnlanre/types";

type ValuesAsTupleHelper<
  ObjectType extends Dictionary,
  Values extends any[] = []
> = LastOfUnion<keyof ObjectType> extends infer Key
  ? [Key] extends [never]
    ? Values
    : Key extends keyof ObjectType
    ? ValuesAsTupleHelper<Omit<ObjectType, Key>, [ObjectType[Key], ...Values]>
    : never
  : Values;

export type ValuesAsTuple<ObjectType extends Dictionary> =
  ValuesAsTupleHelper<ObjectType>;
