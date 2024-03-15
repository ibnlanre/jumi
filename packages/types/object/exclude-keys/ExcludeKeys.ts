import { Keys, Paths } from "@ibnlanre/types";

export type ExcludeKeys<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = Exclude<Keys<ObjectType>, PathType>;
