import { Dictionary } from "@ibnlanre/types";

export type Values<ObjectType extends Dictionary> =
  ObjectType[keyof ObjectType];
