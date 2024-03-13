import type { Intersect } from "../../transforms/intersect";
import type { Keys } from "../keys";
import type { Paths } from "../paths";
import type { Derivatives } from "./Derivatives";
import type { Indexable } from "./Indexable";
import type { SplitDelimitedKeys } from "./SplitDelimitedKeys";
import type { Structures } from "./Structures";

export type Helper<
  T extends Record<string, any>,
  Key extends keyof T,
  Path extends Paths<T, Delimiter> | (string & {}),
  Delimiter extends string
> = T[Key] extends Record<string, any>
  ? T[Key] extends Indexable | Structures | Derivatives
    ? T[Key]
    : SelectiveDeepPartial<
        T[Key],
        SplitDelimitedKeys<Path, Key, Delimiter>,
        Delimiter
      >
  : T[Key];

export type SelectiveDeepPartial<
  T extends Record<string, any>,
  Path extends Paths<T, Delimiter> | (string & {}),
  Delimiter extends string = "."
> = Intersect<
  {
    [K in Exclude<Keys<T>, Path>]: Helper<T, K, Path, Delimiter>;
  } & {
    [K in Extract<Keys<T>, Path>]?: Helper<T, K, Path, Delimiter>;
  }
>;
