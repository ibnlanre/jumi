import { Keys } from "../keys";
import { Paths } from "../paths";

export type IncludeKeys<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = Extract<Keys<ObjectType>, PathType>;
