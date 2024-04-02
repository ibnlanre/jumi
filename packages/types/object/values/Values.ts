import { Dictionary, LastOfUnion } from "@ibnlanre/types";

type ValuesHelper<
  ObjectType extends Dictionary,
  Values extends any[] = []
> = LastOfUnion<keyof ObjectType> extends infer Key
  ? [Key] extends [never]
    ? Values
    : Key extends keyof ObjectType
    ? ValuesHelper<Omit<ObjectType, Key>, [ObjectType[Key], ...Values]>
    : never
  : Values;

export type Values<ObjectType extends Dictionary> = ValuesHelper<ObjectType>;
