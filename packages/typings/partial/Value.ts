import type { Derivatives } from "./Derivatives";
import type { Indexable } from "./Indexable";
import type { Paths } from "./Paths";
import type { SelectiveDeepPartial } from "./SelectiveDeepPartial";
import type { Shear } from "./Shear";
import type { Structures } from "./Structures";

export type Value<
  T extends Record<string, any>,
  Key extends keyof T,
  Path extends Paths<T, Delimiter> | (string & {}),
  Delimiter extends string
> = T[Key] extends Record<string, any>
  ? T[Key] extends Indexable | Structures | Derivatives
    ? T[Key]
    : SelectiveDeepPartial<T[Key], Shear<Path, Key, Delimiter>, Delimiter>
  : T[Key];
