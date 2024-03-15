import { IsPartial, Keys } from "@ibnlanre/types";

export type OptionalKeys<ObjectType extends Record<string, any>> = {
  [Key in Keys<ObjectType>]: IsPartial<ObjectType[Key]> extends 1 ? Key : never;
}[Keys<ObjectType>];
