import { IsPartial, Keys } from "@ibnlanre/types";

export type RequiredKeys<ObjectType extends Record<string, any>> = {
  [Key in Keys<ObjectType>]: IsPartial<ObjectType[Key]> extends 1 ? never : Key;
}[Keys<ObjectType>];
