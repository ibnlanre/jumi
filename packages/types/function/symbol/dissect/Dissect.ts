import { Dictionary, LastOfUnion } from "@ibnlanre/types";

export type Dissect<
  ObjectType extends Dictionary,
  ParamsType extends any[] = []
> = LastOfUnion<keyof ObjectType> extends infer Key
  ? [Key] extends [never]
    ? ParamsType
    : Key extends keyof ObjectType
    ? Dissect<Omit<ObjectType, Key>, [ObjectType[Key], ...ParamsType]>
    : never
  : ParamsType;
