import { Keys, Paths } from "@ibnlanre/types";

export type IncludeKeys<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = Extract<Keys<ObjectType>, PathType>;
