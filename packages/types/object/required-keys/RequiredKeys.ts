import { IsPartial } from "../../conditionals";
import { Keys } from "../keys";

export type RequiredKeys<ObjectType extends Record<string, any>> = {
  [Key in Keys<ObjectType>]: IsPartial<ObjectType[Key]> extends 1 ? never : Key;
}[Keys<ObjectType>];
