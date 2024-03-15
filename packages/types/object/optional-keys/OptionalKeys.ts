import { IsPartial } from "../../conditionals";
import { Keys } from "../keys";

export type OptionalKeys<ObjectType extends Record<string, any>> = {
  [Key in Keys<ObjectType>]: IsPartial<ObjectType[Key]> extends 1 ? Key : never;
}[Keys<ObjectType>];
