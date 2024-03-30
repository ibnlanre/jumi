import { Dictionary, IsPartial, Keys } from "@ibnlanre/types";

export type RequiredKeys<ObjectType extends Dictionary> = {
  [Key in Keys<ObjectType>]: IsPartial<ObjectType[Key]> extends 1 ? never : Key;
}[Keys<ObjectType>];
