import type { Intersect } from "../transforms/intersect";
import type { Paths } from "./Paths";
import type { Value } from "./Value";

export type SelectiveDeepPartial<
  T extends Record<string, any>,
  Path extends Paths<T, Delimiter> | (string & {}),
  Delimiter extends string = "."
> = Intersect<
  {
    [K in Exclude<keyof T, Path>]: Value<T, K, Path, Delimiter>;
  } & {
    [K in Extract<keyof T, Path>]?: Value<T, K, Path, Delimiter>;
  }
>;
