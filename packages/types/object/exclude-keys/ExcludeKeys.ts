import { Keys } from "../keys";
import { Paths } from "../paths";

export type ExcludeKeys<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = Exclude<Keys<ObjectType>, PathType>;
