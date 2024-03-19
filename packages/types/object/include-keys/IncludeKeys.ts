import { Keys, Paths } from "@ibnlanre/types";

export type IncludeKeys<
  ObjectType extends Record<string, any>,
  PathType extends (string & {}) | Paths<ObjectType> = never
> = Extract<Keys<ObjectType>, PathType>;

// type HasAtLeastOneKey<T extends Record<string, any>> = keyof T extends never
//   ? false
//   : true;

// type HasAtLeastOneKey<T = never> = [T] extends [never] ? true : false;
// type HasAtLeastOneKey<T extends Record<string, any>> = keyof T extends never
//   ? false
//   : true;
// type HasAtLeastOneKey<T = never> = T extends never ? true : false;
type HasAtLeastOneKey<T = never> = [T];

type Test = HasAtLeastOneKey;
